var gulp = require('gulp');
var minify = require('gulp-minify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
//var pump = require('pump');
const shell = require('gulp-shell');
var sass = require('gulp-sass');
const imagemin = require('gulp-imagemin');
var inject = require('gulp-inject');
var runSequence = require('run-sequence');
var del = require('del');
var csso = require('gulp-csso');
var vinylPaths = require('vinyl-paths');
var remoteSrc = require('gulp-remote-src');


// BOILERPLATE CREATION //
gulp.task('create-template-struct', function(callback) {
  runSequence('directory',
              'move-normalize-grid',
			  'clean-css-template-files',
			  'download-js-files',
			  'download-grid-css-file',
			  'download-normalize-css-file',
              callback);
});

gulp.task('directory', function () {
    return gulp.src('./', {read: false})
    .pipe(shell([
      'mkdir css assets libs fonts js'
    ]));
  });
  
gulp.task('move-normalize-grid', [], function() {
	return gulp.src(["./normalize.css","./milligram.min.css"])
      .pipe(gulp.dest('css'));
});

gulp.task('clean-css-template-files', function () {
  return del([
    './normalize.css',
	'./milligram.min.css'
    // here we use a globbing pattern to match everything inside the `mobile` folder
    //'dist/mobile/**/*',
    // we don't want to clean this file though so we negate the pattern
    //'!dist/mobile/deploy.json'
  ]);
});

gulp.task('download-js-files', function() {
	return remoteSrc('lodash.min.js', {
			base: 'https://cdn.jsdelivr.net/npm/lodash@4.17.4/'
		})
    .pipe(gulp.dest('./libs/'));
});

// https://cdnjs.cloudflare.com/ajax/libs/milligram/1.3.0/milligram.min.css
gulp.task('download-grid-css-file', function() {
	return remoteSrc('milligram.min.css', {
			base: 'https://cdnjs.cloudflare.com/ajax/libs/milligram/1.3.0/'
		})
    .pipe(gulp.dest('./css/')).pipe(gulp.dest('./release/'));
});

// https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.css
gulp.task('download-normalize-css-file', function() {
	return remoteSrc('normalize.css', {
			base: 'https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/'
		})
    .pipe(gulp.dest('./css/')).pipe(gulp.dest('./release/'));
});

gulp.task('clean-js-temp', function() {
	return del([
		'./temp_js/**/*'
	]);
});

gulp.task('remove-js-temp', function(){
	return gulp.src('./temp_js/**')
		.pipe(vinylPaths(del));
});
  
//////////////////////////

/* ASSETS */
gulp.task('compress-images', () =>
	gulp.src('./assets/*')
		.pipe(imagemin([
	imagemin.gifsicle({interlaced: true}),
	imagemin.jpegtran({progressive: true}),
	imagemin.optipng({optimizationLevel: 5}),
	imagemin.svgo()
]))
		.pipe(gulp.dest('./release/assets'))
);

/* CSS */
gulp.task('compress-css', function(callback) {
    runSequence('compile-sass',
              'compile-less',
			  'minify-css',
              callback);
});

gulp.task('minify-css', function () {
    return gulp.src('./release/**/*.css')
        .pipe(csso())
        .pipe(gulp.dest('./release/'));
});

gulp.task('compile-sass', function () {
  return gulp.src('./css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./release/'));
});

gulp.task('compile-less', function() {
    return gulp.src('./css/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('./release/'));
});

/* JS */

gulp.task('compress-js', function() {
    return gulp.src(['js/**/*.js', 'libs/**/*.js'])
        .pipe(minify({
            ext: {
                src: '',
                min: '.min.js'
            },
            exclude: ['scrollmagic'],
            ignoreFiles: ['*.min.js']
        }))
        .pipe(gulp.dest('./temp_js'))
});

gulp.task('minify-js', function(){
	return gulp.src('./temp_js/**/*.min.js')
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('./release/'));
});

gulp.task('scripts', function(callback) {
	runSequence('clean-js-temp',
				'compress-js',
				'minify-js',
				'remove-js-temp',
				callback);
});

gulp.task('index-DEV', function () {
  var target = gulp.src('./index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./release/**/*.css'], {read: false});
 
  return target.pipe(inject(sources)).pipe(gulp.dest('./'));
});

gulp.task('index-PRODUCTION', function () {
  var target = gulp.src('./index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./release/all.min.js', './release/styles.css'], {read: false});
 
  return target.pipe(inject(sources))
    .pipe(gulp.dest('./'));
});

/* START OF WATCH TASKS */

/* Task to watch less changes */
gulp.task('watch-less', function() {
    gulp.watch('css/**/*.less', ['compile-less']);
});
/* Task to watch sass changes */
gulp.task('watch-sass', function () {
  gulp.watch('css/**/*.scss', ['compile-sass']);
});
/* Task to watch js changes */
gulp.task('watch-js', function() {
    gulp.watch('js/**/*.js', ['scripts']);
});
/* Task to watch when a script is minified changes and produce a finalized minified JS */
gulp.task('watch-concatScripts', function() {
    gulp.watch('temp_js/**/*.min.js', ['scripts']);
});


gulp.task('dev-watch', ['watch-less', 'watch-sass', 'compress-images']); // you possibly don't want minified JS files on dev
gulp.task('dev-watch-all', ['watch-less', 'watch-sass', 'watch-js', 'compress-images']); // run this to watch for js changes as well, will produce minified JS file
/*gulp.task('production', ['watch-less', 'watch-sass', 'watch-js', 'watch-concatScripts', 'compress-js', 'compile-less', 'compile-sass', 'compress-images', 'scripts', 'index-PRODUCTION']);*/

/* RUN THIS BEFORE GOING INTO PRODUCTION TO MINIFY EVERYTHING */
gulp.task('production-release', ['scripts', 'compress-css', 'compress-images']);
gulp.task('create-template', ['create-template-struct']);
