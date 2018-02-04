const computestyle = require('./computestyle');

module.exports = function JSXOpeningElement(babel, path, state) {
  const t = babel.types;
  let styleExpressionValue; // what goes in the style=* bits
  if (path.node.attributes) {
    path.node.attributes.forEach(attribute => {
      if (attribute.name && attribute.name.type === 'JSXIdentifier') {
        switch (attribute.name.name) {
          case 'className':

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

            break;
          case 'style':
            break;
          default:
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
};
