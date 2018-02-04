var fs = require('fs');
var babylon = require('babylon');

var computestyleString = fs.readFileSync('./computestyle.js', 'utf8')
var computestyleAST = babylon.parse(computestyleString)

module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
      Program: {
        enter(path, state) {
          state.set('stylesheetsVariable', path.scope.generateUidIdentifier('stylesheets'));
          state.set('cssImports', [])
        },
        exit(path, state) {
          const cssImportsArray = t.ArrayExpression(state.get('cssImports'));
          const stylesheetsVariable = state.get('stylesheetsVariable');
          const cssImportsVariableDeclarator = t.VariableDeclarator(stylesheetsVariable, cssImportsArray);
          const cssImportsVariableDeclaration = t.VariableDeclaration('const', [cssImportsVariableDeclarator]);

          path.node.body.push(cssImportsVariableDeclaration)
          path.node.body.push(computestyleAST.program.body[0])
        }
      },
      ImportDeclaration(path, state) {
        if (path.node.source
            && path.node.source.type === 'StringLiteral'
            && path.node.source.value.endsWith('.css')) {
          const importDefaultId = path.scope.generateUidIdentifier('stylesheet')
          const importDefaultSpecifier = t.ImportDefaultSpecifier(importDefaultId)
          path.node.specifiers.push(importDefaultSpecifier)
          state.get('cssImports').push(importDefaultId);

        }
      },
      JSXOpeningElement(path, state) {
        let callExpressionValue; // what goes in the computeStyle(*)
        if (path.node.attributes) {
          path.node.attributes.forEach(attribute => {

            if (attribute.name
                && attribute.name.type === 'JSXIdentifier'
                && attribute.name.name === 'className') {

              // <* className="foo">
              if (attribute.value.type ==='StringLiteral') {
                callExpressionValue = attribute.value;
              }

              // <* className={foo}>
              if (attribute.value.type ==='JSXExpressionContainer'
                  && attribute.value.expression.type === 'Identifier') {
                callExpressionValue = attribute.value.expression;
              }
            }
          })
        }

        if (callExpressionValue) {
          const callExpression = t.CallExpression(t.Identifier('computeStyle'), [callExpressionValue, state.get('stylesheetsVariable')])
          const styleAttributeIdentifier = t.JSXIdentifier('style')
          const expressionContainer = t.JSXExpressionContainer(callExpression)
          const styleAttribute = t.JSXAttribute(styleAttributeIdentifier, expressionContainer)
          path.node.attributes.push(styleAttribute)
        }
      }
    }
  };
};
