function Spinner() { }

Spinner.prototype.chars = ['/', '-', '\\', '|'];

Spinner.prototype.start = function() {
  clearInterval(this.interval);
  this.atIndex = 0;
  this.interval = setInterval(this.update.bind(this), 50);

  return this;
};

Spinner.prototype.update = function() {
  process.stdout.write(this.chars[this.atIndex] + '\b');
  this.atIndex = (this.atIndex + 1) % this.chars.length;

  return this;
};

Spinner.prototype.stop = function() {
  clearInterval(this.interval);

  return this;
};

Spinner.start = function () {
  return new Spinner().start();
};

module.exports = Spinner;