var exec = require('child_process').exec,
  q = require('q'),
  log = require('./log'),
  Spinner = require('./spinner');

function install() {
  var modules = Array.prototype.slice.call(arguments);
  var cmd = ['npm', 'install'].concat(modules).join(' ');

  var deferred = q.defer();

  log.info(cmd);
  var spinner = Spinner.start();
  exec(cmd, function (error, stdout, stderr) {
    spinner.stop();
    if(stdout.length) { log.npm(stdout); }
    if(error) {
      log.npm(error);
      return deferred.reject(error);
    }
    deferred.resolve();
  });

  return deferred.promise;
}

function uninstall() {
  var modules = Array.prototype.slice.call(arguments);
  var cmd = ['npm', 'uninstall'].concat(modules).join(' ');

  var deferred = q.defer();

  log.info(cmd);
  var spinner = Spinner.start();
  exec(cmd, function (error, stdout, stderr) {
    spinner.stop();
    if(stdout.length) { log.npm(stdout); }
    if(stderr.length) { log.npm(stderr); }
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