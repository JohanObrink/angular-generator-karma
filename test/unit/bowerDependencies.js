var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('lib/bowerDependencies', function () {
  var bwd, exec, log, spinner, fs, installLog;

  beforeEach(function () {

    exec = sinon.stub();
    log = {
      info: sinon.spy(),
      bower: sinon.spy()
    };
    spinner = {
      start: sinon.stub(),
      stop: sinon.spy()
    };
    fs = {
      readFileSync: sinon.stub()
    };
    fs.readFileSync
      .withArgs(sinon.match(/bower_components\/angular\/bower.json$/))
      .returns('{"main": "./angular.js"}');
    fs.readFileSync
      .withArgs(sinon.match(/bower_components\/node-libspotify\/bower.json$/))
      .returns('{"main": "./lib/spotify.js"}');

    spinner.start.returns(spinner);

    installLog = [
      'bower angular#*                 cached git://github.com/angular/bower-angular.git#1.3.9',
      'bower angular#*               validate 1.3.9 against git://github.com/angular/bower-angular.git#*',
      'bower node-libspotify#*         cached git://github.com/JohanObrink/node-libspotify.git#0.1.0',
      'bower node-libspotify#*       validate 0.1.0 against git://github.com/JohanObrink/node-libspotify.git#*',
      'bower angular#~1.3.9           install angular#1.3.9',
      'bower node-libspotify#~0.1.0   install node-libspotify#0.1.0',
      '',
      'angular#1.3.9 bower_components/angular',
      '',
      'node-libspotify#0.1.0 bower_components/node-libspotify'
    ].join('\n');

    bwd = proxyquire(process.cwd() + '/lib/bowerDependencies', {
      'child_process': { exec: exec },
      'q': sinonPromise.Q,
      'fs': fs,
      './log': log,
      './spinner': spinner
    });
  });

  describe('#install', function () {
    var success, fail;
    beforeEach(function () {
      success = sinon.spy();
      fail = sinon.spy();
      bwd.install('-D', 'angular', 'git://github.com/JohanObrink/node-libspotify.git#0.1.0').then(success).catch(fail);
    });
    it('logs what is being installed', function () {
      expect(log.info).calledOnce.calledWith('bower install -D angular git://github.com/JohanObrink/node-libspotify.git#0.1.0');
    });
    it('starts the spinner', function () {
      expect(spinner.start).calledOnce;
    });
    it('calls exec with the correct parameters', function () {
      expect(exec).calledOnce.calledWith('bower install -D angular git://github.com/JohanObrink/node-libspotify.git#0.1.0');
    });
    it('stops spinner when install is done', function () {
      exec.yield(null, '', '');
      expect(spinner.stop).calledOnce;
    });
    it('resolves promise when exec is done without errors', function () {
      exec.yield(null, '', '');
      expect(fail).not.called;
      expect(success).calledOnce;
    });
    it('rejects promise when exec is done with errors', function () {
      exec.yield('Err!', '', '');
      expect(success).not.called;
      expect(fail).calledOnce.calledWith('Err!');
    });
    describe('resolve with path from packet', function () {
      it('tries to load bower.json', function () {
        exec.yield(null, installLog, '');
        expect(fs.readFileSync).calledTwice;
        expect(fs.readFileSync).calledWithMatch(/bower_components\/angular\/bower.json$/);
        expect(fs.readFileSync).calledWithMatch(/bower_components\/node-libspotify\/bower.json$/);
      });
      it('gets the main from bower.json', function () {
        exec.yield(null, installLog, '');
        expect(success).calledWith(['bower_components/angular/angular.js', 'bower_components/node-libspotify/lib/spotify.js']);
      });
    });
  });

});