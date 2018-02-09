
/*

supported:
.foo
Text


not supported:
*.*
* + *
* > *
Text
*/


module.exports = function computeStyle(classnames, stylesheets, nodeType) {
  const styles = {};

  let classnamesArray = false;
  const classnameStatus = {};
  if (classnames) {
    classnamesArray = classnames.split(' ');
    classnamesArray.forEach(classname => {
      classnameStatus[classname] = false;
    });
  }

  function applyDeclarations(declarations) {
    declarations.forEach(declaration => {
      const property = declaration[0];
      const value = declaration[1];
      styles[property] = value;
    });
  }

  stylesheets.forEach(stylesheet => {
    if (stylesheet.forEach && stylesheet.length > 0) {
      stylesheet.forEach(declarationBlock => {
        const selectors = declarationBlock[0].split(' ');
        const declarations = declarationBlock[1];
        if (selectors.length > 1) {
          console.warn('child selectors are not supported');
        } else {
          const selector = selectors[0];

          // Class selector
          if (selector.indexOf('.') === 0) {

            if (classnames) {
              classnamesArray.forEach(classname => {
                if (`.${classname}` === selector) {
                  applyDeclarations(declarations);
                  classnameStatus[classname] = true;
                }
              });
            }

          // Element selector
          } else if (/^[A-Za-z][A-Za-z0-9 -]*$/.test(selector)) {
            if (nodeType === selector) {
              applyDeclarations(declarations);
            }

          } else {
            console.warn(`unsupported selector encountered ${selector}`);
          }
        }
      });
    }
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
