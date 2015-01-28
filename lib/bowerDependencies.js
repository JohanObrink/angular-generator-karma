var exec = require('child_process').exec,
  q = require('q'),
  log = require('./log'),
  Spinner = require('./spinner'),
  fs = require('fs'),
  path = require('path');

function getMainPath(modulePath) {
  var pkgFile = fs.readFileSync(path.resolve(modulePath, 'bower.json'), 'utf-8');
  var pkg = JSON.parse(pkgFile);
  return path.join(modulePath, pkg.main);
}

function getInstallPaths(log) {
  return log.split('\n')
    .filter(function (row) {
      return row.indexOf('bower') !== 0 && row.trim() !== '';
    })
    .map(function (row) {
      var moduleRoot = row.split(' ')[1];
      var mainPath = getMainPath(moduleRoot);
      return mainPath;
    });
}

function install() {
  var args = Array.prototype.slice.call(arguments);
  var cmd = ['bower', 'install'].concat(args).join(' ');

  var deferred = q.defer();

  log.info(cmd);
  var spinner = Spinner.start();
  exec(cmd, function (error, stdout, stderr) {
    spinner.stop();
    if(stdout.length) {
      log.bower(stdout, args);
    }
    if(error) {
      log.bower(error, args);
      return deferred.reject(error);
    }
    deferred.resolve(getInstallPaths(stdout));
  });

  return deferred.promise;
}

function uninstall() {
  var args = Array.prototype.slice.call(arguments);
  var cmd = ['bower', 'uninstall'].concat(args).join(' ');

  var deferred = q.defer();

  log.info(cmd);
  var spinner = Spinner.start();
  exec(cmd, function (error, stdout, stderr) {
    spinner.stop();
    if(stderr.length) { log.bower(stderr, args); }
    if(stdout.length) { log.bower(stdout, args); }
    if(error) {
      return deferred.reject(error);
    }
    deferred.resolve();
  });

  return deferred.promise;
}

module.exports = {
  install: install,
  uninstall: uninstall
};