/* eslint-disable global-require,import/no-dynamic-require */

const {dirname, resolve} = require('path');
const resolveDeep = require('resolve');
const fs = require('fs');
const p = require('path');
const parseStylesheet = require('./stylesheetParser');

const STYLESHEET_POSTFIX = '-styles';

const PLATFORM_POSTFIXES = [
  '.native',
  '.ios',
  '.android',
];

const STYLESHEET_EXTENSIONS = [
  '.css',
  '.less',
];

const STYLESHEET_ENDS = [
  ...STYLESHEET_EXTENSIONS,
  `${STYLESHEET_POSTFIX}.js`,
];
PLATFORM_POSTFIXES.forEach(postfix => {
  STYLESHEET_EXTENSIONS.forEach(extension => {
    STYLESHEET_ENDS.push(postfix + extension);
  });
  STYLESHEET_ENDS.push(`${STYLESHEET_POSTFIX}${postfix}.js`);
});

function isStylesheet(path) {
  let iss = false;
  STYLESHEET_ENDS.forEach(ext => {
    if (path.endsWith(ext)) { iss = true; }
  });
  return iss;
}

function rename(path) {
  const dir = p.dirname(path);
  const ext = p.extname(path);
  let basename = p.basename(path, ext);
  let platform;
  if (p.extname(basename)) { // handle platform postfixes on the basename
    platform = p.extname(basename);
    basename = p.basename(basename, platform);
  }
  return `${dir}/${basename}${STYLESHEET_POSTFIX}${platform}.js`;
}

module.exports = function ImportDeclaration(babel, path, state) {
  // console.log('ImportDeclaration')
  const t = babel.types;

  // TODO: Handle named imports

  if (path.node.source
      && path.node.source.type === 'StringLiteral'
      && isStylesheet(path.node.source.value)) {
    const stylesheetImport = rename(path.node.source.value);
    path.node.source.value = stylesheetImport; // eslint-disable-line
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
    if (false) {
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
  }
};
