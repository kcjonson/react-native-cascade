const parseStylesheet = require('./stylesheetParser');


module.exports = function nativeCSSLoader(rawSource) {
  try {
    const stylesheet = parseStylesheet(rawSource);
    // console.log(JSON.stringify(stylesheet, null, 2));
    const jsonOutput = JSON.stringify(stylesheet);
    const jsStylesheet = `module.exports = ${jsonOutput};`;
    return jsStylesheet;
  } catch (e) {
    return rawSource;
  }
};
