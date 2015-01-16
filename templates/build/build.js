var gulp = require('gulp'),
  cheerio = require('gulp-cheerio'),
  templateCache = require('gulp-angular-templatecache'),
  ngAnnotate = require('gulp-ng-annotate'),
  concat = require('gulp-concat'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  file = require('gulp-file'),
  runSequence = require('run-sequence'),<% if(cssPrecompiler === 'less') { %>
  less = require('gulp-less'),<% } %>
  minify = require('html-minifier').minify,
  q = require('q');

gulp.task('templates', function () {
  return gulp.src(['src/partials/**/*.html', 'src/directives/**/*.html'])
    .pipe(templateCache({
      module: 'spotify-web-app',
      base: process.cwd() + '/src'
    }))
    .pipe(gulp.dest('temp'));
});

function removeScripts($) {
  return q($('script[data-build="exclude"]').remove());
}

function concatjs($) {
  var scripts = $('script')
    .map(function (ix, script) { return $(script).attr('src'); })
    .get()
    .concat(['temp/templates.js']);
  return gulp.src(scripts)
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    .pipe(concat('app.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
}

function concatcss($) {
  var styles = $('link[rel="stylesheet/less"]')
    .map(function (ix, link) { return $(link).attr('href'); })
    .get();
  return gulp.src(styles)
    .pipe(sourcemaps.init())
    .pipe(less({compress:true}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
}

function cleanhtml($) {
  $('script').remove();
  $('link[rel="stylesheet/less"]').remove();
  $('head').children().append('<link rel="stylesheet" href="main.css" />');
  $('body').children().append('<script src="app.js"></script>');

  var minifyOptions = {
    removeComments: true,
    collapseWhitespace: true
  }

  return file('index.html', minify($.html(), minifyOptions)).pipe(gulp.dest('dist'));
}

gulp.task('parseAssets', function () {
  return gulp.src('src/index.html')
    .pipe(cheerio(function ($, done) {
      removeScripts($)
      q.all([concatjs($), concatcss($)])
        .then(q(cleanhtml($)))
        .then(function () { done(); })
        .catch(done);
    }));
});

module.exports = function (cb) {
  runSequence('templates', 'parseAssets', cb);
};