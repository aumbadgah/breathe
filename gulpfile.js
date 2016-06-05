
const autoprefixer = require('gulp-autoprefixer');
const babel = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const clean = require('gulp-clean');
const concat = require('gulp-concat-util');
const cssmin = require('gulp-cssmin');
const fs = require('fs');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const inject = require('gulp-inject');
const less = require('gulp-less');
const livereload = require('gulp-livereload');
const open = require('gulp-open');
const source = require('vinyl-source-stream')
const uglify = require('gulp-uglify');

const config = {
	environmentProd: 'prod',
};

const env = process.env.NODE_ENV || config.environmentProd;
console.log('Running build for environment: ' + env);

const isProd = () => {
	return (env === config.environmentProd);
}

gulp.task('clean', () => {
	return gulp.src([
			'./dist/js',
			'./dist/css',
			'./dist/img',
		], {read: false})
		.pipe(clean());
});

gulp.task('css', ['clean'], () => {
	const prod = isProd ();
	return gulp.src('./src/less/main.less')
		.pipe(less())
		.pipe(autoprefixer({
			browsers: ['> 1%'],
			cascade: false
		}))
		.pipe(gulpif(prod, cssmin()))
		.pipe(gulpif(prod, concat('all.min.css')))
		.pipe(gulp.dest('./dist/css'));
});

gulp.task('static', ['clean'], () => {
	return gulp.src('./src/img/**/*')
		.pipe(gulp.dest('./dist/img'));
});

gulp.task('js', ['clean'], () => {
	const prod = isProd ();
	return browserify('./src/js/main.js')
		.transform(babel.configure({
	        presets: ["es2015"]
	    }))
	    .bundle()
	    .pipe(source('bundle.js'))
	    .pipe(gulpif(prod, buffer()))
		.pipe(gulpif(prod, uglify({
			preserveComments: 'license',
		})))
	    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('html', ['clean', 'css', 'js'], () => {
	return gulp.src('./src/index.html')
		.pipe(inject(gulp.src([
			'./dist/js/tools.js',
			'./dist/js/Widget.js',
			'./dist/js/**/*.js',
			'./dist/js/main.js',
			'./dist/css/**/*.css',
		], {read: false}), {
			ignorePath: 'dist',
			transform: function (filepath, file, i, length) {
				if (filepath.slice(-2) === 'js') {
					return '<script src="' + filepath.substr(1) + '"></script>';
				} else if (filepath.slice(-3) === 'css') {
					return '<link rel="stylesheet" href="' + filepath.substr(1) + '">';
				}
			}
		}))
		.pipe(gulp.dest('./dist'))
		.pipe(livereload());
});

gulp.task('build', ['html', 'css', 'js', 'static'], () => {
});

gulp.task('default', ['build'], () => {
	livereload.listen({ basePath: 'dist' });
	gulp.watch([
		'./src/index.html',
		'./src/js/**/*.js',
		'./src/less/**/*.less',
	], ['build']);
	gulp.src('./dist/index.html')
	.pipe(open({uri: 'http://localhost:8000'}));
});
