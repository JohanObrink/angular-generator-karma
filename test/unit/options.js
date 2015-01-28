var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire'),
  path = require('path');

describe('lib/options', function () {

  var options, fs, inquirer;

  beforeEach(function () {
    fs = {
      readFileSync: sinon.stub().returns('{}'),
      writeFileSync: sinon.stub(),
      statSync: sinon.stub()
    };
    inquirer = {
      prompt: sinon.stub()
    };
    options = proxyquire(process.cwd() + '/lib/options', {
      'fs': fs,
      'q': sinonPromise.Q,
      'inquirer': inquirer
    });
  });

  describe('#exist', function () {
    it('calls statSync on the given path', function () {
      options.exist();
      expect(fs.statSync).calledOnce.calledWith(process.cwd() + '/.generatorrc');
    });
    it('returns true if file exists', function () {
      fs.statSync.returns();
      expect(options.exist()).to.be.true;
    });
    it('returns false if file doesn\'t exist', function () {
      fs.statSync.throws();
      expect(options.exist()).to.be.false;
    });
    it('caches result', function () {
      options.exist();
      options.exist();
      expect(fs.statSync).calledOnce;
    });
  });
  describe('#get', function () {
    it('calls getFileSync for .generatorrc if options exist', function () {
      fs.statSync.returns();
      options.get();
      expect(fs.readFileSync).calledOnce.calledWith(path.join(process.cwd(), '.generatorrc'));
    });
    it('does not call getFileSync for .generatorrc if options do not exist', function () {
      fs.statSync.throws();
      options.get();
      expect(fs.readFileSync).not.called;
    });
    it('stores options when read', function () {
      fs.statSync.returns();
      var opts1 = options.get();
      var opts2 = options.get();
      expect(fs.readFileSync).calledOnce;
      expect(opts1).to.eql({});
      expect(opts2).to.equal(opts1);
    });
    it('returns default options if options do not exist', function () {
      fs.statSync.throws();
      var opts = options.get();
      expect(opts).to.eql({
        module: 'angular-generator-karma',
        sourceFolder: 'src',
        testFolder: 'test',
        templatesFolder: 'templates',
        buildScriptsFolder: 'build',
        buildFolder: 'dist',
        cssPrecompiler: 'less'
      });
    });
  });
  describe('#save', function () {
    var opts;
    beforeEach(function () {
      opts = {
        module: 'foo-bar',
        sourceFolder: 'client',
        testFolder: 'tests',
        templatesFolder: 'my-templates',
        buildScriptsFolder: '_build',
        buildFolder: '.out',
        cssPrecompiler: 'sass'
      };
    });
    it('calls writeFileSync with the correct parameters', function () {
      options.save(opts);
      var expectedPath = process.cwd() + '/.generatorrc';
      var expectedData = JSON.stringify(opts, null, 2);
      expect(fs.writeFileSync).calledOnce.calledWith(expectedPath, expectedData);
    });
    it('caches options on save', function () {
      options.save(opts);
      var opts2 = options.get();
      expect(fs.readFileSync).not.called;
      expect(opts2).to.equal(opts);
    });
  });
  describe('#build', function () {
    it('calls inquirer.prompt', function () {
      options.build();
      expect(inquirer.prompt).calledOnce;
    });
    it('calls inquirer.prompt with the correct questions', function () {
      fs.statSync.throws();
      options.build();
      var questions = [
        {
          type: 'input',
          name: 'module',
          message: 'What is the name of your Angular module?',
          default: 'angular-generator-karma'
        },
        {
          type: 'input',
          name: 'sourceFolder',
          message: 'Which folder will be your source folder for client side js?',
          default: 'src'
        },
        {
          type: 'input',
          name: 'testFolder',
          message: 'Which folder will be your source folder for client side tests?',
          default: 'test'
        },
        {
          type: 'input',
          name: 'templatesFolder',
          message: 'Which folder should be used for templates?',
          default: 'templates'
        },
        {
          type: 'input',
          name: 'buildScriptsFolder',
          message: 'Name your build scripts folder',
          default: 'build'
        },
        {
          type: 'input',
          name: 'buildFolder',
          message: 'Name your build output folder',
          default: 'dist'
        },
        {
          type: 'list',
          name: 'cssPrecompiler',
          message: 'What css precompiler do you want to use?',
          choices: ['less', 'sass', 'stylus', 'plain css'],
          default: 'less'
        }
      ];
      expect(inquirer.prompt).calledWith(questions);
    });
    it('resolves the promise with the given answers', function () {
      var success = sinon.spy();
      var fail = sinon.spy();
      options.build().then(success).catch(fail);
      var answers = {
        module: 'foo-bar'
      }
      inquirer.prompt.yield(answers);
      expect(fail).not.called;
      expect(success).calledOnce.calledWith(answers);
    });
    it('writes the updated options to disk', function () {
      options.build();
      var answers = {
        module: 'foo-bar'
      };
      var expectedPath = process.cwd() + '/.generatorrc';
      var expectedData = JSON.stringify(answers, null, 2);
      inquirer.prompt.yield(answers);
      expect(fs.writeFileSync).calledOnce.calledWith(expectedPath, expectedData);
    });
  });
});