
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


module.exports = function computeStyle(classnames, stylesheets = [], nodeType) {
  // console.log('computeStyle', classnames, stylesheets, nodeType);

  let styles = null;

  let classnamesArray = [];
  const classnameStatus = {};
  if (classnames) {
    classnamesArray = classnames.split(' ');
    classnamesArray.forEach(classname => {
      classnameStatus[classname] = false;
    });
  }

  function applyDeclarations(declarations) {
    // console.log('applying declarations', declarations)
    if (!styles) styles = {};
    declarations.forEach(declaration => {
      const property = declaration[0];
      const value = declaration[1];
      styles[property] = value;
    });
  }

  function analizeSelector(selector, declarations) {
    // console.log('analizeSelector', selector, declarations);

    // Class selector  (.foo)
    if (selector.indexOf('.') === 0 && selector.lastIndexOf('.') === 0) {
      classnamesArray.forEach(classname => {
        if (`.${classname}` === selector) {
          applyDeclarations(declarations);
          classnameStatus[classname] = true;
        }
      });


    // Mutliple class selectors (.foo.bar.baz)
    } else if (selector.indexOf('.') === 0 && selector.lastIndexOf('.') > 0) {
      let matches = 0;
      // trim leading `.` or the array is `["", "foo", "bar", "baz"]`
      const selectors = selector.substr(1).split('.');
      classnamesArray.forEach(classname => {
        if (selectors.includes(classname)) {
          matches += 1;
          classnameStatus[classname] = true;
        }
      });
      if (matches === selectors.length) {
        applyDeclarations(declarations);
      }


    // Element selector  (View)
    } else if (/^[A-Za-z][A-Za-z0-9 -]*$/.test(selector) && selector.lastIndexOf('.') === -1) {
      if (nodeType === selector) {
        applyDeclarations(declarations);
      }


    // Element with class selector (View.bar)
    } else if (/^[A-Za-z][A-Za-z0-9 -]*$/.test(selector) && selector.lastIndexOf('.') > 0) {
      // TODO
      console.warn(`selector ${selector} is not supported yet`);

    } else {
      console.warn(`unsupported selector encountered ${selector}`);
    }
  }

  stylesheets.forEach(stylesheet => {
    // console.log(stylesheet)
    if (stylesheet.forEach && stylesheet.length > 0) {
      stylesheet.forEach(declarationBlock => {
        const selectors = declarationBlock[0].split(' ');
        const declarations = declarationBlock[1];
        if (selectors.length > 1) {
          console.warn('child selectors are not supported');
        } else {
          const selector = selectors[0];
          analizeSelector(selector, declarations);
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
    // This warning is here because if a classname on a node isn't matched it
    // might mean that the dev extpected it do do something
    // console.warn(`Unmatched classnames found: ${classnamesUnmatched.join(' ')}`);
  }

  // console.log('returning styles', styles)

  return styles;
};
