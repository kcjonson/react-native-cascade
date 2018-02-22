const cssToReactNative = require('css-to-react-native');
const postcss = require('postcss');

module.exports = function parseStylesheet(rawSource) {
  // console.log('parseStylesheet', rawSource)
  const source = rawSource.replace(/(\.?[\d]+)rem/g, (str, val) => (`${val * 16}px`));
  const root = postcss.parse(source);
  let stylesheet = root.nodes.filter(node => node.type === 'rule');
  stylesheet = stylesheet.map(rule => {
    const declarationsRaw = rule.nodes.filter(node => node.type === 'decl');
    const declarations = [];
    declarationsRaw.forEach(declaration => {
      const property = cssToReactNative.getPropertyName(declaration.prop || '');
      const valuesOrProperties = cssToReactNative.getStylesForProperty(property, declaration.value);
      // this is super gross.
      // https://github.com/styled-components/css-to-react-native
      // sigh.
      Object.keys(valuesOrProperties).forEach(valueOrProperty => {
        declarations.push([valueOrProperty, valuesOrProperties[valueOrProperty]]);
      });

    });
    return [rule.selector, declarations];
  });
  return stylesheet;
};
