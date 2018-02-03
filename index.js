var fs = require('fs');
var babylon = require('babylon');

var computestyleString = fs.readFileSync('./computestyle.js', 'utf8')
var computestyleAST = babylon.parse(computestyleString)

module.exports = function(babel) {
  var t = babel.types;
  return {
    visitor: {
      Program: {
        exit(path, state) {
          path.node.body.unshift(computestyleAST.program.body[0])
        }
      },
      JSXOpeningElement: function(path) {
        let className;
        if (path.node.attributes) {
          path.node.attributes.forEach(attribute => {
            if (attribute.name && attribute.name.name === 'className') {
              className = attribute.value.value;
            }
          })
        }
        if (className) {
          const callExpressionValue = t.StringLiteral(className);
          const callExpression = t.CallExpression(t.Identifier('computeStyle'), [callExpressionValue])
          const styleAttributeIdentifier = t.JSXIdentifier('style')
          const expressionContainer = t.JSXExpressionContainer(callExpression)
          const styleAttribute = t.JSXAttribute(styleAttributeIdentifier, expressionContainer)
          path.node.attributes.push(styleAttribute)
        }
      }
    }
  };
};
