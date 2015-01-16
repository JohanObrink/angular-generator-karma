var chalk = require('chalk');

var prefix = chalk.blue('[generator]');

function notEmpty(txt) { return txt && txt.length; }

module.exports = {
  info: function (txt) {
    console.log(prefix, txt);
  },
  warn: function (txt) {
    console.log(prefix, chalk.orange('warn'), txt);
  },
  error: function (txt) {
    console.error(prefix, chalk.red('err'), txt);
  },
  npm: function (txt) {
    var rows = txt.split('\n')
      .filter(notEmpty)
      .map(function (row) {
        if(row.indexOf('npm') === -1) {
          return row;
        } else {
          return row.split(' ')
            .map(function (token, ix) {
              switch(ix) {
                case 0: return chalk.white(token);
                case 1: return (token === 'ERR!') ?
                  chalk.red(token) :
                  (token === 'WARN') ?
                    chalk.bgYellow(chalk.black(token)) :
                    chalk.white(token);
                case 2: return chalk.magenta(token);
                case 3: return (token === '-v' || token === 'ok') ?
                  chalk.magenta(token) :
                  chalk.white(token);
                default: return chalk.white(token);
              }
            })
            .join(' ');
        }
      });
    console.log(rows.join('\n'));
  },
  bower: function (txt, modules) {
    var rows = txt.split('\n')
      .filter(notEmpty)
      .map(function (row) {
        if(row.indexOf('bower') === -1) {
          return row;
        } else {
          return row.split(' ')
            .filter(notEmpty)
            .filter(function (word, ix) {
              return ix < 1 || !modules.reduce(function (found, module) { return found || word.indexOf(module + '#') > -1 }, false);
            })
            .map(function (token, ix) {
              switch(ix) {
                case 0: return chalk.white(token);
                case 1: return chalk.cyan(token);
                case 2: return chalk.white(token);
                default: return chalk.white(token);
              }
            })
            .filter(notEmpty)
            .join(' ');
        }
      });
    console.log(rows.join('\n'));
  }
};