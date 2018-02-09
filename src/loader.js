const cssToReactNative = require('css-to-react-native');
const postcss = require('postcss');

module.exports = function nativeCSSLoader(rawSource) {

  // convert rem to unitless -- based on 16px body font size
  // Hacks! TODO: Fix this.
  const source = rawSource.replace(/(\.?[\d]+)rem/g, (str, val) => (val * 16));
  const root = postcss.parse(source);


  let stylesheet = root.nodes.filter(node => node.type === 'rule');
  stylesheet = stylesheet.map(rule => {

    const declarationsRaw = rule.nodes.filter(node => node.type === 'decl');
    const declarations = [];
    declarationsRaw.forEach(declaration => {

      try {
        const property = cssToReactNative.getPropertyName(declaration.prop || '');
        const valuesOrProperties = cssToReactNative.getStylesForProperty(
          property,
          declaration.value,
        );
        // this is super gross.
        // https://github.com/styled-components/css-to-react-native
        // sigh.
        Object.keys(valuesOrProperties).forEach(valueOrProperty => {
          declarations.push([valueOrProperty, valuesOrProperties[valueOrProperty]]);
        });

      } catch (e) {
        console.log(e);
      }
    });


      //console.log(transform(declarations))
      //console.log('\n declsb', declarations)
    return [rule.selector, declarations];
  });


// let foo = transform([
//   ['font', 'bold 14px/16px "Helvetica"'],
//   ['margin', '5px 7px 2px'],
//   ['border-left-width', '5px'],
// ]);
//
// console.log('foo', foo)

  //stylesheet = transform(stylesheet);


  //console.log('rules', JSON.stringify(stylesheet, null, '\t'));

  const jsonOutput = JSON.stringify(stylesheet);
  return `module.exports = require('react-native').StyleSheet.create(${jsonOutput});`;
};
