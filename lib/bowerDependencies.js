var exec = require('child_process').exec,
  q = require('q'),
  log = require('./log'),
  Spinner = require('./spinner');

function install() {
  var modules = Array.prototype.slice.call(arguments);
  var cmd = ['bower', 'install'].concat(modules).join(' ');

  var deferred = q.defer();

  log.info(cmd);
  var spinner = Spinner.start();
  exec(cmd, function (error, stdout, stderr) {
    spinner.stop();
    if(stdout.length) { log.bower(stdout, modules); }
    if(error) {
      log.bower(error, modules);
      return deferred.reject(error);
    }
    deferred.resolve();
  });

  return deferred.promise;
}

function uninstall() {
  var modules = Array.prototype.slice.call(arguments);
  var cmd = ['bower', 'uninstall'].concat(modules).join(' ');

  var deferred = q.defer();

  log.info(cmd);
  var spinner = Spinner.start();
  exec(cmd, function (error, stdout, stderr) {
    spinner.stop();
    if(stderr.length) { log.bower(stderr, modules); }
    if(stdout.length) { log.bower(stdout, modules); }
    if(error) {
      return deferred.reject(error);
    }
    deferred.resolve();
  });

  return deferred.promise;
};

module.exports = {
  install: install,
  uninstall: uninstall
};