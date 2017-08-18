var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var pump = require('pump');
var babel = require('gulp-babel');
var gap = require('gulp-append-prepend');
let cleanCSS = require('gulp-clean-css');

folder = {
	src: 'RescueEditor',
        srcJs: 'RescueEditor/js',
	build: 'minified'
};

gulp.task('javascript', function() {
 
  var jsbuild = gulp.src([
      `${folder.srcJs}/events/*.js`,
      `${folder.srcJs}/io/*.js`,
      `${folder.srcJs}/io/html/*.js`,
      `${folder.srcJs}/templating/*.js`,
      `${folder.srcJs}/templating/html/*.js`,
      `${folder.srcJs}/persistance/*.js`,
      `${folder.srcJs}/persistance/html/*.js`,
      `${folder.srcJs}/ui/*.js`
  ])
    .pipe(concat('rescueeditor.js'))
    .pipe(babel({presets: ['env']}))
    .pipe(uglify())
    .pipe(gap.prependText(`/*
        Programmed By Benoit Lanteigne
        (c) Benoit Lanteigne, all rights reserved
        Licenced under GNU Affero General Public License 
    */`));


  return jsbuild.pipe(gulp.dest(folder.build + '/' + folder.src + '/js'));
});

gulp.task('blocks', function() {
 
  var jsbuild = gulp.src([
      `${folder.src}/blocks/**/*`
  ])
   
  return jsbuild.pipe(gulp.dest(folder.build + '/' + folder.src + '/blocks'));
});

gulp.task('listsblocks', function() {
 
  var jsbuild = gulp.src([
      `${folder.src}/listsblocks/**/*`
  ])
   
  return jsbuild.pipe(gulp.dest(folder.build + '/' + folder.src + '/listsblocks'));
});

gulp.task('config', function() {
 
  var jsbuild = gulp.src([
      `${folder.src}/config.json`
  ])
   
  return jsbuild.pipe(gulp.dest(folder.build + '/' + folder.src + '/'));
});

gulp.task('css', function() {
 
  var jsbuild = gulp.src([
      `${folder.src}/css/**/*.css`
  ]).pipe(cleanCSS());
  
  return jsbuild.pipe(gulp.dest(folder.build + '/' + folder.src + '/css'));
});

gulp.task('all', ['blocks', 'listsblocks', 'config', 'css', 'javascript']);
