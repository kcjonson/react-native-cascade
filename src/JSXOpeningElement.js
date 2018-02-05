const computestyle = require('./computestyle');

module.exports = function JSXOpeningElement(babel, path, state) {

  const t = babel.types;
  let styleExpressionValue; // what goes in the style=* bits
  let existingStyleAttribute;
  if (path.node.attributes) {
    path.node.attributes.forEach(attribute => {
      if (attribute.name && attribute.name.type === 'JSXIdentifier') {
        switch (attribute.name.name) {

          // <* className=*>
          // A className attribute exists on the node, lets parse it!
          case 'className': {
            switch (attribute.value.type) {

              // <* className="foo">
              //
              // If the className declaration is astring we can write the output
              // inline into the component at build time and reduce some JS overhead at runtime
              // writing everything inline will increase the file size due to the
              // style being duplicated, but thats a lesser evil than the
              // overhead of running the cascade algorithm for every node
              // encountered at runtime.

              case 'StringLiteral': {
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
                break;
              }

              // <* className={*}>
              //
              // This case the className identifier is assumed to be dynamic so we
              // won't write the styles inline. Instead we'll include a copy of the
              // cascade resolver and call it at runtime with any variables that are set
              case 'JSXExpressionContainer': {

                // <* className={foo}>
                if (attribute.value.expression.type === 'Identifier') {
                  styleExpressionValue = attribute.value.expression;
                  state.set('computestyleRuntimeRequired', true);
                }

                // TODO: <* className={'foo'}>
                // TODO: <* className={`foo`}>
                // TODO: <* className={`foo ${baz}`}>
                // Note: classNamee={['foo', 'bar']} and className={['foo', baz]} actually
                //      dont work nicely, but they do compile React appears to be calling `toString`
                //      on the array so you'll end up with class="foo,bar" post render. Thats silly,
                //      but it means that we don't have to handle it here!
                break;
              }

              default:
                console.warn('Encountered a className attribute that was neither a string or a expression. Doing nothing ... aparently.');
            }
            break;
          }


          // <* style=*>
          // An existing style declaration is on the node, lets make sure not to blow it away
          case 'style': {

            // <* style={*}>  => <* style={[STYLE, *]}>
            // The style tag ovrides left to right, so the existing styles take priority
            switch (attribute.value.type) {
              case 'JSXExpressionContainer': {
                existingStyleAttribute = attribute;

                // This code isn't needed at the moment, but its left here in case we
                // need special handling for various types in the future.

                // eslint-disable-next-line prefer-destructuring
                // const expression = attribute.value.expression;
                // switch (expression.type) {
                //
                //   // <* className=* style={foo}>
                //   // transpiles into <* className=** style={[**, foo]}
                //   case 'Identifier': {
                //     break;
                //   }
                //
                //   // <* style={{*}}>
                //   case 'ObjectExpression': {
                //     break;
                //   }
                //
                //   // <* style={[*, *, ...]} >
                //   case 'ArrayExpression': {
                //     break;
                //   }
                //
                //   // <* style={"foo"}> Not actually sure what this does, but it
                //   // does transpile so it might appear somewhere.
                //   case 'StringLiteral':
                //   default:
                // }
                //
                // break;
              }

              case 'SequenceExpression': // <* style={foo, bar} > (is this valid?)
              case 'StringLiteral': // <* style="foo">
              default:
                // Perhaps this should be an error. Babel will transpile this, but
                // it will cause a runtime error.
                console.warn('Encountered a style attribute that was not an expression');
            }

            break;
          }

          // There are many other valid attributes on nodes, do nothing
          default:
        }
      }

    });
  }

  if (styleExpressionValue) {
    let styleExpression;

    if (t.isObjectExpression(styleExpressionValue)) {
      styleExpression = styleExpressionValue;
    }

    if (t.isIdentifier(styleExpressionValue)) {
      styleExpression = t.CallExpression(t.Identifier('computeStyle'), [styleExpressionValue, state.get('stylesheetsVariable')]);
    }

    if (!existingStyleAttribute) {
      const styleAttributeIdentifier = t.JSXIdentifier('style');
      const expressionContainer = t.JSXExpressionContainer(styleExpression);
      const styleAttribute = t.JSXAttribute(styleAttributeIdentifier, expressionContainer);
      path.node.attributes.push(styleAttribute);
    } else {
      existingStyleAttribute.value.expression = t.ArrayExpression([
        styleExpression,
        existingStyleAttribute.value.expression,
      ]);
    }
  }
};
