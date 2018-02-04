const fs = require('fs');
const babylon = require('babylon');
const JSXOpeningElement = require('./JSXOpeningElement');
const ImportDeclaration = require('./ImportDeclaration');

// This is a little odd, we want to use the computeStyle function, here at buildtime
// but we're also going to write it into the source file if need be, so we load it
// twice. This seems mildly inefficent. Also, the way we're grabbing the expression
// here is a bit fragile, if the structure changes, this will barf hard.
const computestyleString = fs.readFileSync('./src/computestyle.js', 'utf8');
const computestyleAST = babylon.parse(computestyleString).program.body[0].expression.right;

module.exports = function (babel) { // eslint-disable-line func-names
  const t = babel.types;
  return {
    visitor: {

      Program: {
        enter(path, state) {
          state.set('stylesheetsVariable', path.scope.generateUidIdentifier('stylesheets'));
          state.set('cssImports', []); // Array of imports in the order they were imported (important)
          state.set('stylesheetsIndexed', {}); // Contents of stylesheets indexed by generated id
          state.set('computestyleRuntimeRequired', false);
        },
        exit(path, state) {
          const cssImportsArray = t.ArrayExpression(state.get('cssImports'));
          const stylesheetsVariable = state.get('stylesheetsVariable');
          const varDec = t.VariableDeclarator(stylesheetsVariable, cssImportsArray);
          const varDecion = t.VariableDeclaration('const', [varDec]);
          path.node.body.push(varDecion);

          if (state.get('computestyleRuntimeRequired') === true) {
            path.node.body.push(computestyleAST);
          }
        },
      },

      JSXOpeningElement(path, state) { JSXOpeningElement(babel, path, state); },
      ImportDeclaration(path, state) { ImportDeclaration(babel, path, state); },

    },
  };
};
