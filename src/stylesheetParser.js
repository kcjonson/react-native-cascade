const cssToReactNative = require('css-to-react-native');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser')();

function transformSelector(selectorAst) {
  // TODO: Test for known selector types here.
  return selectorAst.nodes[0].toString().trim();
}

module.exports = function parseStylesheet(rawSource) {
  // console.log('parseStylesheet', rawSource)
  const source = rawSource.replace(/([\d]*\.?[\d]+)rem/g, (str, val) => (`${val * 16}px`));
  const root = postcss.parse(source);
  const rules = root.nodes.filter(node => node.type === 'rule');
  const stylesheet = [];
  rules.forEach(rule => {
    const declarationsRaw = rule.nodes.filter(node => node.type === 'decl');

    // console.log('declarationsRaw', declarationsRaw);

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

    // postcss itself doesn't return a parsed selector, so we have to do that seperately
    const selectorAst = selectorParser.astSync(rule.selector);
    if (selectorAst.nodes.length === 1) {
      stylesheet.push([transformSelector(selectorAst.nodes[0]), declarations]);
    } else if (selectorAst.nodes.length > 1) {
      selectorAst.nodes.forEach(selector => {
        stylesheet.push([transformSelector(selector), declarations]);
      });
    } else {
      throw new Error(`Unable to parse css selector: ${rule.selector}`);
    }
  });
  return stylesheet;
};
