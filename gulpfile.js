
const autoprefixer = require('gulp-autoprefixer');
const babel = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
// const clean = require('gulp-clean');
const concat = require('gulp-concat-util');
const cssmin = require('gulp-cssmin');
// const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const inject = require('gulp-inject');
const less = require('gulp-less');
const livereload = require('gulp-livereload');
// const open = require('gulp-open');
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');

const config = {
	environmentProd: 'prod',
};

const env = process.env.NODE_ENV || config.environmentProd;
console.log('Running build for environment: ' + env);

const isProd = () => {
	return (env === config.environmentProd);
}

// gulp.task('clean', () => {
// 	return gulp.src([
// 			'./build/js',
// 			'./build/css',
// 			'./build/img',
// 		], {read: false})
// 		.pipe(clean());
// });

gulp.task('css', () => {
	const prod = isProd ();
	return gulp.src('./src/less/main.less')
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['> 1%'],
			cascade: false
		}))
		.pipe(gulpif(prod, cssmin()))
		.pipe(gulpif(prod, concat('all.min.css')))
		.pipe(gulp.dest('./build/css'));
});

gulp.task('static', () => {
	return gulp.src('./src/img/**/*')
		.pipe(gulp.dest('./build/img'));
});

gulp.task('js', () => {
	const prod = isProd ();
	return browserify('./src/js/main.js')
		.transform(babel.configure({
	        presets: ["@babel/preset-env"]
	    }))
	    .bundle()
	    .pipe(source('bundle.js'))
	    .pipe(gulpif(prod, buffer()))
		.pipe(gulpif(prod, uglify()))
	    .pipe(gulp.dest('./build/js/'));
});

// gulp.task('html', ['css', 'js'], () => {
gulp.task('html', () => {
	return gulp.src('./src/index.html')
		.pipe(inject(gulp.src([
			// './build/js/tools.js',
			// './build/js/Widget.js',
			'./build/js/**/*.js',
			// './build/js/main.js',
			'./build/css/**/*.css',
		], {read: false}), {
			ignorePath: 'build',
			transform: function (filepath, file, i, length) {
				if (filepath.slice(-2) === 'js') {
					return '<script src="' + filepath.substr(1) + '"></script>';
				} else if (filepath.slice(-3) === 'css') {
					return '<link rel="stylesheet" href="' + filepath.substr(1) + '">';
				}
			}
		}))
		.pipe(gulp.dest('./build'))
		.pipe(livereload());
});

// gulp.task('default', ['html', 'css', 'js', 'static'], () => {
// });

gulp.task('default', gulp.parallel('html', 'css', 'js', 'static'));

// gulp.task('default', ['build'], () => {
// 	livereload.listen({ basePath: 'build' });
// 	gulp.watch([
// 		'./src/index.html',
// 		'./src/js/**/*.js',
// 		'./src/less/**/*.less',
// 	], ['build']);
// 	gulp.src('./build/index.html')
// 	.pipe(open({uri: 'http://localhost:8000'}));
// });
