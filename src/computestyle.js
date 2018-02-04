function computeStyle(classnames, stylesheets) { // eslint-disable-line no-unused-vars
  const styles = {};
  stylesheets.forEach((stylesheet) => {
    stylesheet.forEach((declarationBlock) => {
      const selector = declarationBlock[0];
      const declarations = declarationBlock[1];
      classnames.split(' ').forEach((classname) => {
        if (classname === selector) {
          declarations.forEach((declaration) => {
            const property = declaration[0];
            const value = declaration[1];
            styles[property] = value;
          });
        }
      });
    });
  });
  return styles;
}
