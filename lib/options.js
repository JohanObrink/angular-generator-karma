var fs = require('fs'),
  path = require('path'),
  q = require('q'),
  inquirer = require('inquirer'),
  pkg = require(process.cwd() + '/package.json');

var _options;
var _exists;
var defaultOptions = {
  module: pkg.name,
  sourceFolder: 'src',
  testFolder: 'test',
  templatesFolder: 'templates',
  buildScriptsFolder: 'build',
  buildFolder: 'dist',
  cssPrecompiler: 'less'
};
var filePath = path.join(process.cwd(), '/.generatorrc');

function exist() {
  if(undefined === _exists) {
    try {
      fs.statSync(filePath);
      _exists = true;
    } catch(err) {
      _exists = false;
    }
  }
  return _exists;
}

function get() {
  if(!_options) {
    if(exist()) {
      _options = JSON.parse(fs.readFileSync(filePath));    
    } else {
      return defaultOptions;
    }
  }
  return _options;
}

function save(options) {
  _options = options;
  fs.writeFileSync(filePath, JSON.stringify(options, null, 2));
}

function build() {
  var opts = get();
  var deferred = q.defer();
  var questions = [
    {
      type: 'input',
      name: 'module',
      message: 'What is the name of your Angular module?',
      default: opts.module
    },
    {
      type: 'input',
      name: 'sourceFolder',
      message: 'Which folder will be your source folder for client side js?',
      default: opts.sourceFolder
    },
    {
      type: 'input',
      name: 'testFolder',
      message: 'Which folder will be your source folder for client side tests?',
      default: opts.testFolder
    },
    {
      type: 'input',
      name: 'templatesFolder',
      message: 'Which folder should be used for templates?',
      default: opts.templatesFolder
    },
    {
      type: 'input',
      name: 'buildScriptsFolder',
      message: 'Name your build scripts folder',
      default: opts.buildScriptsFolder
    },
    {
      type: 'input',
      name: 'buildFolder',
      message: 'Name your build output folder',
      default: opts.buildFolder
    },
    {
      type: 'list',
      name: 'cssPrecompiler',
      message: 'What css precompiler do you want to use?',
      choices: ['less', 'sass', 'stylus', 'plain css'],
      default: opts.cssPrecompiler
    }
  ];
  inquirer.prompt(questions, function (answers) {
    save(answers);
    deferred.resolve(answers);
  });
  return deferred.promise;
}

module.exports = {
  exist: exist,
  get: get,
  save: save,
  build: build
};