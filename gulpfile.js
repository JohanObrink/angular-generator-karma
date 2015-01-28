var gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  mocha = require('gulp-mocha'),
  runSequence = require('run-sequence');

gulp.task('jshint', function () {
  return gulp.src(['./*.js', './lib/**/*.js', './test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('mocha', function () {
  return gulp.src(['./test/**/*.js'])
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('test', function (cb) {
  runSequence('jshint', 'mocha', function () { cb(); });
});

gulp.task('watch', function () {
  gulp.watch(['./*.js'], ['jshint']);
  gulp.watch(['./lib/**/*.js', './test/**/*.js'], ['test']);
});

gulp.task('default', ['test', 'watch']);