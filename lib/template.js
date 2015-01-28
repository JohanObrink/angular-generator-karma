var ejs = require('ejs');

function render(tmpl, data) {
  return ejs.render(tmpl, data);
}

module.exports = {
  render: render
};