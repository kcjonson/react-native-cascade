/* eslint-disable global-require,import/no-dynamic-require */

const fs = require('fs');
const {dirname, resolve} = require('path');
const babylon = require('babylon');
const resolveDeep = require('resolve');

// This is a little odd, we want to use the computeStyle function, here at buildtime
// but we're also going to write it into the source file if need be, so we load it
// twice. This seems mildly inefficent. Also, the way we're grabbing the expression
// here is a bit fragile, if the structure changes, this will barf hard.
const computestyle = require('./computestyle'); // eslint-disable-line import/newline-after-import
const computestyleString = fs.readFileSync('./src/computestyle.js', 'utf8');
const computestyleAST = babylon.parse(computestyleString).program.body[0].expression.right;


module.exports = function (babel) { // eslint-disable-line func-names
  const t = babel.types;
  return {
    visitor: {


      Program: {
        enter(path, state) {
          state.set('stylesheetsVariable', path.scope.generateUidIdentifier('stylesheets'));
          state.set('cssImports', []); // Array of imports in the order they were imported (important)
          state.set('stylesheetsIndexed', {}); // Contents of stylesheets indexed by generated id
          state.set('computestyleRuntimeRequired', false);
        },
        exit(path, state) {
          const cssImportsArray = t.ArrayExpression(state.get('cssImports'));
          const stylesheetsVariable = state.get('stylesheetsVariable');
          const varDec = t.VariableDeclarator(stylesheetsVariable, cssImportsArray);
          const varDecion = t.VariableDeclaration('const', [varDec]);
          path.node.body.push(varDecion);

          if (state.get('computestyleRuntimeRequired') === true) {
            path.node.body.push(computestyleAST);
          }
        },
      },


      ImportDeclaration(path, state) {
        // TODO: Handle named imports
        if (path.node.source
            && path.node.source.type === 'StringLiteral'
            && path.node.source.value.endsWith('.css')) {
          const stylesheetImport = path.node.source.value;
          const importDefaultId = path.scope.generateUidIdentifier('stylesheet');
          const importDefaultSpecifier = t.ImportDefaultSpecifier(importDefaultId);
          path.node.specifiers.push(importDefaultSpecifier);
          state.get('cssImports').push(importDefaultId);

          // Next we're actually going to load the stylesheet so that if a node
          // calls for those styles we can write them inline at build time.
          // This is a runtime performance optimization that adds some complexity

          // This resolver strategy may differ from the webpack resolver.
          // In the future at this would be better to have config
          // that could set the same resolution config as webpack or the
          // react native packager (whichever poision you choose, sigh)
          // Luckily the awesome "resolve" package that we're using here has
          // very similar config options, so that door is open.

          const fileDirname = dirname(state.file.opts.filename);
          const stylesheetPath = resolveDeep.sync(stylesheetImport, {
            basedir: resolve(process.cwd(), fileDirname),
          });
          if (stylesheetPath) {
            const stylesheet = require(stylesheetPath);
            const stylesheets = state.get('stylesheetsIndexed');
            stylesheets[importDefaultId.name] = stylesheet;
          } else {
            throw new Error(`Cannot resolve stylesheet path: ${stylesheetImport}`);
          }
        }
      },


      JSXOpeningElement(path, state) {
        let styleExpressionValue; // what goes in the style=* bits
        if (path.node.attributes) {
          path.node.attributes.forEach(attribute => {
            if (attribute.name
                && attribute.name.type === 'JSXIdentifier'
                && attribute.name.name === 'className') {

              // <* className="foo">
              //
              // If the className declaration is astring we can write the output
              // inline into the component at build time and reduce some JS overhead at runtime
              // writing everything inline will increase the file size due to the
              // style being duplicated, but thats a lesser evil than the
              // overhead of running the cascade algorithm for every node
              // encountered at runtime.

              if (attribute.value.type === 'StringLiteral') {
                const stylesheetsIndexed = state.get('stylesheetsIndexed');
                const cssImports = state.get('cssImports');
                const stylesheetsOrdered = cssImports.map(cssImport => {
                  return stylesheetsIndexed[cssImport.name];
                });
                const styles = computestyle(attribute.value.value, stylesheetsOrdered);
                const styleProperties = Object.keys(styles);
                if (styleProperties.length > 0) {
                  const stylesAst = styleProperties.map(property => {
                    let value = styles[property];
                    switch (typeof value) {
                      case 'number':
                        value = t.NumericLiteral(value);
                        break;
                      case 'string':
                        value = t.StringLiteral(value);
                        break;
                      default:
                        throw new Error(`Cannot parse css properties of type ${typeof value}`);
                    }
                    return t.ObjectProperty(t.Identifier(property), value);
                  });
                  styleExpressionValue = t.ObjectExpression(stylesAst);
                }
              }

              // <* className={foo}>
              //
              // This case the className identifier is assumed to be dynamic so we
              // won't write the styles inline. Instead we'll include a copy of the
              // cascade resolver and call it at runtime with any variables that are set

              // TODO: what about `font-medium ${foo}`??

              if (attribute.value.type === 'JSXExpressionContainer'
                  && attribute.value.expression.type === 'Identifier') {
                styleExpressionValue = attribute.value.expression;
                state.set('computestyleRuntimeRequired', true);
              }
            }
          });
        }

        if (styleExpressionValue) {
          // TODO: Handle the case where the style= tag already exists on the node
          let styleExpression;
          if (t.isObjectExpression(styleExpressionValue)) {
            styleExpression = styleExpressionValue;
          }

          if (t.isIdentifier(styleExpressionValue)) {
            styleExpression = t.CallExpression(t.Identifier('computeStyle'), [styleExpressionValue, state.get('stylesheetsVariable')]);
          }

          const styleAttributeIdentifier = t.JSXIdentifier('style');
          const expressionContainer = t.JSXExpressionContainer(styleExpression);
          const styleAttribute = t.JSXAttribute(styleAttributeIdentifier, expressionContainer);
          path.node.attributes.push(styleAttribute);
        }
      },
    },
  };
};
