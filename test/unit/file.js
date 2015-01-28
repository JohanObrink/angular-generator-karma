var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire'),
  path = require('path');

describe('lib/file', function () {

  var file, fs, options, opts;

  beforeEach(function () {
    fs = {
      readFileSync: sinon.stub()
    };
    opts = {
      templates: 'tmpl'
    };
    options = {
      get: sinon.stub().returns(opts)
    };
    file = proxyquire(process.cwd() + '/lib/file', {
      'fs': fs,
      './options': options
    });
  });

  describe('#read', function () {
    it('reads and returns the requested file synchronously', function () {
      file.read('foo/bar');
      var expectedPath = path.join('foo/bar');
      expect(fs.readFileSync).calledOnce.calledWith(expectedPath);
    });
    it('renders passed in template data', function () {
      var filePath = 'my/template';
      fs.readFileSync.withArgs(filePath).returns('<h1>Hello <%= name %></h1>');
      var data = {name: 'World'};
      var expected = '<h1>Hello World</h1>';
      var result = file.read(filePath, data);
      expect(result).to.equal(expected);
    });
  });
  describe('#readTemplate', function () {
    it('tries to read from project template folder', function () {
      var projectTemplatePath = path.join(process.cwd(), 'tmpl/service/foo.js');
      fs.readFileSync.withArgs(projectTemplatePath).returns();

      file.readTemplate('service', 'foo.js');
      expect(fs.readFileSync).calledOnce.calledWith(projectTemplatePath);
    });
    it('tries to read from package if local template folder doesn\'t exist', function () {
      var projectTemplatePath = path.join(process.cwd(), 'tmpl/service/foo.js');
      fs.readFileSync.withArgs(projectTemplatePath).throws();

      var moduleTemplatePath = path.join(process.cwd(), 'templates/service/foo.js');
      fs.readFileSync.withArgs(moduleTemplatePath).returns();

      file.readTemplate('service', 'foo.js');

      expect(fs.readFileSync).calledTwice.calledWith(moduleTemplatePath);
    });
    it('renders passed in template data for project template', function () {
      var projectTemplatePath = path.join(process.cwd(), 'tmpl/service/foo.js');
      fs.readFileSync.withArgs(projectTemplatePath).returns('<h1>Hello <%= name %></h1>');

      var data = {name: 'World'};
      var expected = '<h1>Hello World</h1>';
      var result = file.readTemplate('service', 'foo.js', data);
      expect(result).to.equal(expected);
    });
    it('renders passed in template data for module template', function () {
      var projectTemplatePath = path.join(process.cwd(), 'tmpl/service/foo.js');
      fs.readFileSync.withArgs(projectTemplatePath).throws();

      var moduleTemplatePath = path.join(process.cwd(), 'templates/service/foo.js');
      fs.readFileSync.withArgs(moduleTemplatePath).returns('<h1>Hello <%= name %></h1>');

      var data = {name: 'World'};
      var expected = '<h1>Hello World</h1>';
      var result = file.readTemplate('service', 'foo.js', data);
      expect(result).to.equal(expected);
    });
  });
});