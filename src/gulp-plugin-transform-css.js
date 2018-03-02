/* eslint-disable no-param-reassign */
const through = require('through2');
const PluginError = require('plugin-error');
const stylesheetParser = require('./stylesheetParser');

module.exports = options => {
  options = options || {};

  return through.obj(function transformCSS(file, enc, cb) {
    // console.log('transforming css');
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new PluginError('gulp-plugin-transform-css', 'Streaming not supported'));
      return;
    }

    try {
      const transformedStylesheet = stylesheetParser(file.contents.toString(), options);
      const moduleStylesheet = `module.exports = ${JSON.stringify(transformedStylesheet)}`;
      file.contents = Buffer.from(moduleStylesheet);
      this.push(file);
      cb();
    } catch (err) {
      this.emit('error', new PluginError('gulp-plugin-transform-css', err));
      cb();
    }


  });
};
