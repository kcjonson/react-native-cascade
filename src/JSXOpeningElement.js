// const computestyle = require('./computestyle');
const computestyleExpression = require('./computestyleExpression');

module.exports = function JSXOpeningElement(babel, path, state) {

  const t = babel.types;
  let styleExpressionValue = false; // what goes in the style=* bits
  let existingStyleAttribute;
  let nodeClassNameAttribute = false;
  let nodeStyleAttribute = false;

  if (path.node.attributes) {
    path.node.attributes.forEach(attribute => {
      if (attribute.name && attribute.name.type === 'JSXIdentifier') {
        switch (attribute.name.name) {
          case 'className': {
            nodeClassNameAttribute = attribute;
            break;
          }
          case 'style': {
            nodeStyleAttribute = attribute;
            break;
          }
          default:
        }
      }
    });

  // No attributes on node, may still match type selector
  } else {
    // styleExpressionValue = computestyleExpression(babel, path, state);
  }


  // <* className=*>
  // A className attribute exists on the node, lets parse it!
  if (nodeClassNameAttribute) {
    switch (nodeClassNameAttribute.value.type) {
      // <* className="foo">
      case 'StringLiteral': {
        let classnames; // attribute is nullable so we can match node types
        if (nodeClassNameAttribute && nodeClassNameAttribute.value) {
          classnames = nodeClassNameAttribute.value.value;
        }
        styleExpressionValue = computestyleExpression(babel, path, state, classnames);
        break;
      }
      // <* className={*}>
      //
      // This case the className identifier is assumed to be dynamic so we
      // won't write the styles inline. Instead we'll include a copy of the
      // cascade resolver and call it at runtime with any variables that are set
      case 'JSXExpressionContainer': {
        // <* className={foo}>
        if (nodeClassNameAttribute.value.expression.type === 'Identifier') {
          styleExpressionValue = nodeClassNameAttribute.value.expression;
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
  } else {
    styleExpressionValue = computestyleExpression(babel, path, state);
  }


  if (nodeStyleAttribute) {

    // <* style={*}>  => <* style={[STYLE, *]}>
    // The style tag ovrides left to right, so the existing styles take priority
    switch (nodeStyleAttribute.value.type) {
      case 'JSXExpressionContainer': {
        existingStyleAttribute = nodeStyleAttribute;

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
        // console.warn('Encountered a style attribute that was not an expression');
    }

  }


  if (styleExpressionValue) {
    let styleExpression;

    // If the className declaration is a string or there were matched nodes we can write
    // the output inline into the component at build time and reduce some JS overhead at
    // runtime writing everything inline will increase the file size due to the
    // style being duplicated, but thats a lesser evil than the
    // overhead of running the cascade algorithm for every node
    // encountered at runtime.
    //
    // If the style expression is an object, its considered static.
    if (t.isObjectExpression(styleExpressionValue)) {
      styleExpression = styleExpressionValue;
    }

    // If styleExpression is a variable or other dynmaic expression then we have
    // to write in the runner
    if (t.isIdentifier(styleExpressionValue)) {
      styleExpression = t.CallExpression(t.Identifier('computeStyle'), [
        styleExpressionValue,
        state.get('stylesheetsVariable'),
        t.StringLiteral(path.node.name.name),
      ]);
    }

    console.log('existing style', !!existingStyleAttribute);

    if (!existingStyleAttribute) {
      const styleAttributeIdentifier = t.JSXIdentifier('style');
      const expressionContainer = t.JSXExpressionContainer(styleExpression);
      const styleAttribute = t.JSXAttribute(styleAttributeIdentifier, expressionContainer);
      path.node.attributes.push(styleAttribute);
    } else if (existingStyleAttribute) {
      existingStyleAttribute.value.expression = t.ArrayExpression([
        styleExpression,
        existingStyleAttribute.value.expression,
      ]);
    }
  }
};
