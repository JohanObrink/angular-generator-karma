var fs = require('fs'),
  path = require('path'),
  options = require('./options'),
  template = require('./template');

function resolveProjectPath() {
  var paths = Array.prototype.slice.call(arguments);
  paths.unshift(process.cwd());
  return path.join.apply(path, paths);
}

function resolveModulePath() {
  var paths = Array.prototype.slice.call(arguments);
  paths.unshift(__dirname);
  return path.join.apply(path, paths);
}

function read(filePath, data) {
  var content = fs.readFileSync(filePath, {encoding:'utf-8'});
  return (data) ? template.render(content, data) : content;
}

function readTemplate(type, fileName, data) {
  var opts = options.get();
  try {
    // try project path first
    return read(resolveProjectPath(opts.templates, type, fileName), data);
  } catch(err) {
    // fallback to module path
    return read(resolveModulePath('../templates', type, fileName), data);
  }
}

module.exports = {
  read: read,
  readTemplate: readTemplate,
  resolveProjectPath: resolveProjectPath,
  resolveModulePath: resolveModulePath
};