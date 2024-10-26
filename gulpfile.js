const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const cleanCSS = require("gulp-clean-css");
const gulpif = require("gulp-if");
const inject = require("gulp-inject");
const babel = require("gulp-babel");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const terser = require("gulp-terser");
const ts = require("gulp-typescript");
const browserSync = require("browser-sync").create();
const del = require("del");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const rename = require("gulp-rename");

const isProd = process.env.NODE_ENV === "production";

// Clean build folder
gulp.task("clean", () => del(["build"]));

// Process SCSS
gulp.task("css", () => {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulpif(isProd, cleanCSS()))
    .pipe(gulp.dest("./build/css"))
    .pipe(rename("bundle.css"))
    .pipe(gulp.dest("./build/css"))
    .pipe(browserSync.stream());
});

const tsProject = ts.createProject("tsconfig.json");

gulp.task("js", () => {
  return gulp
    .src("./src/js/index.ts")
    .pipe(
      webpackStream(
        {
          mode: isProd ? "production" : "development",
          devtool: isProd ? false : "source-map",
          entry: "./src/js/index.ts",
          output: {
            filename: "bundle.js",
          },
          resolve: {
            extensions: [".ts", ".js"],
          },
          module: {
            rules: [
              {
                test: /\.ts$/,
                use: [
                  {
                    loader: "babel-loader",
                    options: {
                      presets: ["@babel/preset-env"],
                    },
                  },
                  "ts-loader",
                ],
                exclude: /node_modules/,
              },
              {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
              },
              {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                  {
                    loader: "file-loader",
                    options: {
                      name: "[name].[ext]",
                      outputPath: "fonts/",
                    },
                  },
                ],
              },
            ],
          },
          plugins: [
            new MiniCssExtractPlugin({
              filename: "bundle.css",
            }),
          ],
        },
        webpack
      )
    )
    .pipe(gulpif(isProd, terser()))
    .pipe(gulp.dest("./build/js"));
});

// Copy static assets
gulp.task("static", () => {
  return gulp
    .src("./src/img/**/*")
    .pipe(gulp.dest("./build/img"))
    .pipe(browserSync.stream());
});

// Inject CSS and JS into HTML
gulp.task("html", () => {
  return gulp
    .src("./src/index.html")
    .pipe(
      inject(
        gulp.src(["./build/js/bundle.js", "./build/css/bundle.css"], {
          read: false,
        }),
        {
          ignorePath: "build",
          addRootSlash: false,
        }
      )
    )
    .pipe(gulp.dest("./build"))
    .pipe(browserSync.stream());
});

// Watch files
gulp.task("watch", () => {
  browserSync.init({
    server: "./build",
  });

  gulp.watch("./src/scss/**/*.scss", gulp.series("css"));
  gulp.watch("./src/js/**/*.ts", gulp.series("js"));
  gulp.watch("./src/img/**/*", gulp.series("static"));
  gulp.watch("./src/index.html", gulp.series("html"));
});

// Build task
gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("css", "js", "static"), "html")
);

// Default task
gulp.task("default", gulp.series("build", "watch"));
