const fs = require('fs');
const babylon = require('babylon');

const computestyleString = fs.readFileSync('./src/computestyle.js', 'utf8');
const computestyleAST = babylon.parse(computestyleString);

module.exports = function (babel) { // eslint-disable-line func-names
  const t = babel.types;
  return {
    visitor: {
      Program: {
        enter(path, state) {
          state.set('stylesheetsVariable', path.scope.generateUidIdentifier('stylesheets'));
          state.set('cssImports', []);
        },
        exit(path, state) {
          const cssImportsArray = t.ArrayExpression(state.get('cssImports'));
          const stylesheetsVariable = state.get('stylesheetsVariable');
          const varDec = t.VariableDeclarator(stylesheetsVariable, cssImportsArray);
          const varDecion = t.VariableDeclaration('const', [varDec]);
          path.node.body.push(varDecion);

          // TODO: Only write computeStyle function in if needed
          path.node.body.push(computestyleAST.program.body[0]);
        },
      },
      ImportDeclaration(path, state) {
        // TODO: Handle named imports
        if (path.node.source
            && path.node.source.type === 'StringLiteral'
            && path.node.source.value.endsWith('.css')) {
          const importDefaultId = path.scope.generateUidIdentifier('stylesheet');
          const importDefaultSpecifier = t.ImportDefaultSpecifier(importDefaultId);
          path.node.specifiers.push(importDefaultSpecifier);
          state.get('cssImports').push(importDefaultId);
        }
      },
      JSXOpeningElement(path, state) {
        let callExpressionValue; // what goes in the computeStyle(*)
        if (path.node.attributes) {
          path.node.attributes.forEach((attribute) => {
            if (attribute.name
                && attribute.name.type === 'JSXIdentifier'
                && attribute.name.name === 'className') {

              // <* className="foo">
              // TODO: If its a raw string we can write the output inline into the component
              //      at build time and reduce some JS overhead.
              if (attribute.value.type === 'StringLiteral') {
                callExpressionValue = attribute.value;
              }

              // <* className={foo}>
              if (attribute.value.type === 'JSXExpressionContainer'
                  && attribute.value.expression.type === 'Identifier') {
                callExpressionValue = attribute.value.expression;
              }
            }
          });
        }

        if (callExpressionValue) {
          // TODO: Handle the case where the style= tag already exists on the node
          const callExpression = t.CallExpression(t.Identifier('computeStyle'), [callExpressionValue, state.get('stylesheetsVariable')]);
          const styleAttributeIdentifier = t.JSXIdentifier('style');
          const expressionContainer = t.JSXExpressionContainer(callExpression);
          const styleAttribute = t.JSXAttribute(styleAttributeIdentifier, expressionContainer);
          path.node.attributes.push(styleAttribute);
        }
      },
    },
  };
};
