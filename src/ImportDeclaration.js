/* eslint-disable global-require,import/no-dynamic-require */

const {dirname, resolve} = require('path');
const template = require('@babel/template').default;
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
  let platform = '';
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


    // Two main ways to do this. Needs more thinking.
    //
    // "Normal"
    // import stylesheet_1 from './foo-styles.js'
    //
    // "importStylesheets"
    // const stylesheet_1 = [[.foo, ...]]


    const importDefaultId = path.scope.generateUidIdentifier('stylesheet');
    state.get('cssImports').push(importDefaultId);

    if (state.opts.importStylesheets !== true) {
      // Rename the inport from foo.css to foo-styles.js
      const stylesheetImport = rename(path.node.source.value);
      path.node.source.value = stylesheetImport; // eslint-disable-line
      const importDefaultSpecifier = t.ImportDefaultSpecifier(importDefaultId);
      path.node.specifiers.push(importDefaultSpecifier);

    // Next we're actually going to load the stylesheet so that if a node
    // calls for those styles we can write them inline at build time.
    // This is a runtime performance optimization that adds some complexity

    // This resolver strategy may differ from the webpack resolver.
    // In the future at this would be better to have config
    // that could set the same resolution config as webpack or the
    // react native packager (whichever poision you choose, sigh)
    // Luckily the awesome "resolve" package that we're using here has
    // very similar config options, so that door is open.

    } else {
      // console.log('importingStylesheets')
      const fileDirname = dirname(state.file.opts.filename);
      const stylesheetPath = resolveDeep.sync(path.node.source.value, {
        basedir: resolve(process.cwd(), fileDirname),
      });
      if (stylesheetPath) {
        // console.log('stylesheetFound', stylesheetPath)
        // TODO: Implement resolvers that can be configured like webpack here.
        const rawStylesheet = fs.readFileSync(p.resolve(__dirname, stylesheetPath), 'utf8');
        const stylesheet = parseStylesheet(rawStylesheet);
        // This kinda feels like cheating.
        const inlineStylesheet = template.ast`const ${importDefaultId} = ${JSON.stringify(stylesheet)}`;
        path.replaceWith(inlineStylesheet);

        // The optmization steps and the node type handler will use this to inline
        // styles that are possible, so we're going to store them. See computeStyleExpression.
        const stylesheets = state.get('stylesheetsIndexed');
        stylesheets[importDefaultId.name] = stylesheet;
      } else {
        throw new Error(`Cannot resolve stylesheet path: ${path.node.source.value}`);
      }
    }
  }
};
