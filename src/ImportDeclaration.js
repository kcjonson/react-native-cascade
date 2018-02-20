/* eslint-disable global-require,import/no-dynamic-require */

const {dirname, resolve} = require('path');
const resolveDeep = require('resolve');
const fs = require('fs');
const p = require('path');
const parseStylesheet = require('./stylesheetParser');

module.exports = function ImportDeclaration(babel, path, state) {
  // console.log('ImportDeclaration')
  const t = babel.types;

  // TODO: Handle named imports

  if (path.node.source
      && path.node.source.type === 'StringLiteral'
      && path.node.source.value.endsWith('.css')) {
    const stylesheetImport = path.node.source.value;
    const importDefaultId = path.scope.generateUidIdentifier('stylesheet');
    const importDefaultSpecifier = t.ImportDefaultSpecifier(importDefaultId);
    path.node.specifiers.push(importDefaultSpecifier);
    state.get('cssImports').push(importDefaultId);

    // Next we're actually going to load the stylesheet so that if a node
    // calls for those styles we can write them inline at build time.
    // This is a runtime performance optimization that adds some complexity

    // This resolver strategy may differ from the webpack resolver.
    // In the future at this would be better to have config
    // that could set the same resolution config as webpack or the
    // react native packager (whichever poision you choose, sigh)
    // Luckily the awesome "resolve" package that we're using here has
    // very similar config options, so that door is open.

    const fileDirname = dirname(state.file.opts.filename);
    const stylesheetPath = resolveDeep.sync(stylesheetImport, {
      basedir: resolve(process.cwd(), fileDirname),
    });
    if (stylesheetPath) {
      // TODO: Implement resolvers that can be configured like webpack here.
      const rawStylesheet = fs.readFileSync(p.resolve(__dirname, stylesheetPath), 'utf8');
      const stylesheet = parseStylesheet(rawStylesheet);

      // console.log(JSON.stringify(stylesheet, null, 2));
      // const stylesheet = require(stylesheetPath);
      const stylesheets = state.get('stylesheetsIndexed');
      stylesheets[importDefaultId.name] = stylesheet;
    } else {
      throw new Error(`Cannot resolve stylesheet path: ${stylesheetImport}`);
    }
  }
};
