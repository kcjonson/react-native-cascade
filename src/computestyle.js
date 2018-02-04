module.exports = function computeStyle(classnames, stylesheets) {
  const styles = {};
  const classnamesArray = classnames.split(' ');
  const classnameStatus = {};
  classnamesArray.forEach(classname => {
    classnameStatus[classname] = false;
  });
  stylesheets.forEach(stylesheet => {
    stylesheet.forEach(declarationBlock => {
      const selector = declarationBlock[0];
      const declarations = declarationBlock[1];
      classnamesArray.forEach(classname => {
        if (classname === selector) {
          declarations.forEach(declaration => {
            const property = declaration[0];
            const value = declaration[1];
            styles[property] = value;
          });
          classnameStatus[classname] = true;
        }
      });
    });
  });

  const classnamesUnmatched = [];
  Object.keys(classnameStatus).forEach(classname => {
    const status = classnameStatus[classname];
    if (status === false) {
      classnamesUnmatched.push(classname);
    }
  });

  if (classnamesUnmatched.length > 0) {
    // TODO: Better output, include component name, path and code snippet.
    console.warn(`Unmatched classnames found: ${classnamesUnmatched.join(' ')}`);
  }

  return styles;
};
