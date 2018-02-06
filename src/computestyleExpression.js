const computestyle = require('./computestyle');

module.exports = function computeStyleExpression(babel, path, state, classnames) {
  const t = babel.types;
  const stylesheetsIndexed = state.get('stylesheetsIndexed');
  const cssImports = state.get('cssImports');
  const stylesheetsOrdered = cssImports.map(cssImport => {
    return stylesheetsIndexed[cssImport.name];
  });

  const styles = computestyle(
    classnames,
    stylesheetsOrdered,
    path.node.name.name // eslint-disable-line comma-dangle
  );

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
    return t.ObjectExpression(stylesAst);
  }
  return false;
};
