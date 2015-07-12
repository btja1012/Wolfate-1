var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    watch = require('gulp-watch');

/* PATHS */
var paths = {
  css: './public/themes/default/css/**/*.styl',
  base: './public/themes/default/css/_style.styl',
  dest: './public/themes/default/css/'
};

/* CSS COMPILATION */
gulp.task('css', function () {
  gulp.src(paths.base)
    .pipe(stylus())
    .on('error', function (err) {
      console.error('Error', err.message);
    })
    .pipe(gulp.dest(paths.dest));
});

/* DEFAULT AND WATCH FUNCION */
gulp.task('default', ['css'], function(){
  watch(paths.css, function(){
    gulp.src(paths.base)
    .pipe(stylus())
    .on('error', function (err) {
      console.error('Error', err.message);
    })
    .pipe(gulp.dest(paths.dest));
  });
});
