import fs from "node:fs/promises";
import path from "node:path";

import * as dartSass from "sass";
import autoprefixer from "gulp-autoprefixer";
import browserSync from "browser-sync";
import cleanCSS from "gulp-clean-css";
import concat from "gulp-concat";
import gulp from "gulp";
import gulpif from "gulp-if";
import inject from "gulp-inject";
import log from "fancy-log";
import rename from "gulp-rename";
import replace from "gulp-replace";
import sass from "gulp-sass";
import terser from "gulp-terser";
import webpack from "webpack";
import webpackStream from "webpack-stream";

const sassCompiler = sass(dartSass);
const bs = browserSync.create();

const isProd = process.env.NODE_ENV === "production";

const config = {
  buildDir: "./build",
  srcDir: "./src",
  nodeModules: "./node_modules",
  styles: {
    src: [
      "./node_modules/modern-normalize/modern-normalize.css",
      "./node_modules/font-awesome/css/font-awesome.min.css",
      "./node_modules/spectrum-colorpicker2/dist/spectrum.css",
      "./src/scss/main.scss",
    ],
    dest: "./build/css",
  },
  scripts: {
    src: "./src/js/index.ts",
    dest: "./build/js",
  },
  images: {
    src: "./src/img",
    dest: "./build/img",
  },
  fonts: {
    src: "./node_modules/font-awesome/fonts",
    dest: "./build/css/fonts",
  },
  html: {
    src: "./src/index.html",
    dest: "./build",
  },
};

// Utility function to copy directories
async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        log(`Copied: ${entry.name}`);
      }
    }
  } catch (error) {
    log.error(`Error copying directory from ${src} to ${dest}:`, error);
  }
}

// Clean build folder
gulp.task("clean", async () => {
  try {
    await fs.rm(config.buildDir, { recursive: true, force: true });
    log("Build directory cleaned");
  } catch (error) {
    log.error("Error cleaning build directory:", error);
  }
});

// SCSS task
gulp.task("scss", () => {
  return gulp
    .src(config.styles.src)
    .pipe(
      gulpif(
        (file) => path.extname(file.path) === ".scss",
        sassCompiler().on("error", sassCompiler.logError)
      )
    )
    .pipe(autoprefixer())
    .pipe(concat("bundle.css"))
    .pipe(replace("../fonts/", "fonts/"))
    .pipe(gulpif(isProd, cleanCSS()))
    .pipe(gulp.dest(config.styles.dest))
    .pipe(rename("bundle.css"))
    .pipe(gulp.dest(config.styles.dest))
    .pipe(bs.stream());
});

// JS task
gulp.task("js", () => {
  return gulp
    .src(config.scripts.src)
    .pipe(
      webpackStream(
        {
          mode: isProd ? "production" : "development",
          devtool: isProd ? false : "source-map",
          entry: config.scripts.src,
          output: {
            filename: "bundle.js",
          },
          resolve: {
            extensions: [".ts", ".js", ".json"],
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
            ],
          },
          plugins: [
            new webpack.ProvidePlugin({
              $: "jquery",
              jQuery: "jquery",
            }),
          ],
        },
        webpack
      )
    )
    .pipe(gulpif(isProd, terser()))
    .pipe(gulp.dest(config.scripts.dest));
});

// Copy static assets
gulp.task("static", async () => {
  try {
    await copyDir(config.images.src, config.images.dest);
    log("Finished copying static assets");
    bs.reload();
  } catch (error) {
    log.error("Error copying static assets:", error);
  }
});

// Copy fonts
gulp.task("fonts", async () => {
  try {
    await copyDir(config.fonts.src, config.fonts.dest);
    log("Finished copying fonts");
    bs.reload();
  } catch (error) {
    log.error("Error copying fonts:", error);
  }
});

// Inject CSS and JS into HTML
gulp.task("html", () => {
  return gulp
    .src(config.html.src)
    .pipe(
      inject(
        gulp.src(
          [
            `${config.scripts.dest}/bundle.js`,
            `${config.styles.dest}/bundle.css`,
          ],
          {
            read: false,
          }
        ),
        {
          ignorePath: config.buildDir.slice(2),
          addRootSlash: false,
        }
      )
    )
    .pipe(gulp.dest(config.html.dest))
    .pipe(bs.stream());
});

// Watch files
gulp.task("watch", () => {
  bs.init({
    server: config.buildDir,
  });

  gulp.watch(`${config.srcDir}/scss/**/*.scss`, gulp.series("scss"));
  gulp.watch(`${config.srcDir}/js/**/*.ts`, gulp.series("js"));
  gulp.watch(`${config.images.src}/**/*`, gulp.series("static"));
  gulp.watch(config.fonts.src, gulp.series("fonts"));
  gulp.watch(config.html.src, gulp.series("html"));
});

// Build task
gulp.task(
  "build",
  gulp.series("clean", gulp.parallel("scss", "js", "static", "fonts"), "html")
);

// Default task
gulp.task("default", gulp.series("build", "watch"));
