var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

describe('lib/template', function () {
  var template;
  beforeEach(function () {
    template = proxyquire(process.cwd() + '/lib/template', {});
  });

  describe('#render', function () {
    it('renders the template correctly', function () {
      var tmpl = '<h1>Hello <%= name %></h1>';
      var expected = '<h1>Hello World</h1>';
      var data = {name: 'World'};
      var result = template.render(tmpl, data);
      expect(result).to.equal(expected);
    });
  });
});