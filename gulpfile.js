const autoprefixer = require("gulp-autoprefixer");
const babel = require("babelify");
const browserify = require("browserify");
const buffer = require("vinyl-buffer");
const concat = require("gulp-concat-util");
const cssmin = require("gulp-cssmin");
const gulp = require("gulp");
const gulpif = require("gulp-if");
const inject = require("gulp-inject");
const sass = require("gulp-sass")(require("sass"));
const livereload = require("gulp-livereload");
const source = require("vinyl-source-stream");
const uglify = require("gulp-uglify");

const config = {
  environmentProd: "prod",
};

const env = process.env.NODE_ENV || config.environmentProd;
console.log("Running build for environment: " + env);

const isProd = () => {
  return env === config.environmentProd;
};

gulp.task("css", () => {
  const prod = isProd();
  return gulp
    .src("./src/scss/main.scss") // Update the source file to SCSS
    .pipe(sass().on("error", sass.logError)) // Use sass() instead of less()
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulpif(prod, cssmin()))
    .pipe(gulpif(prod, concat("all.min.css")))
    .pipe(gulp.dest("./build/css"));
});

gulp.task("static", () => {
  return gulp.src("./src/img/**/*").pipe(gulp.dest("./build/img"));
});

gulp.task("js", () => {
  const prod = isProd();
  return browserify("./src/js/main.js")
    .transform(
      babel.configure({
        presets: ["@babel/preset-env"],
      })
    )
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(gulpif(prod, buffer()))
    .pipe(gulpif(prod, uglify()))
    .pipe(gulp.dest("./build/js/"));
});

gulp.task("html", () => {
  return gulp
    .src("./src/index.html")
    .pipe(
      inject(
        gulp.src(["./build/js/**/*.js", "./build/css/**/*.css"], {
          read: false,
        }),
        {
          ignorePath: "build",
          transform: function (filepath, file, i, length) {
            if (filepath.slice(-2) === "js") {
              return '<script src="' + filepath.substr(1) + '"></script>';
            } else if (filepath.slice(-3) === "css") {
              return (
                '<link rel="stylesheet" href="' + filepath.substr(1) + '">'
              );
            }
          },
        }
      )
    )
    .pipe(gulp.dest("./build"))
    .pipe(livereload());
});

gulp.task("default", gulp.parallel("html", "css", "js", "static"));
