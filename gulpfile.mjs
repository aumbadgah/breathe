import gulp from "gulp";
import sass from "gulp-sass";
import * as dartSass from "sass";
import cleanCSS from "gulp-clean-css";
import gulpif from "gulp-if";
import inject from "gulp-inject";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import terser from "gulp-terser";
import browserSync from "browser-sync";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import rename from "gulp-rename";
import { rm } from "fs/promises";
import log from "fancy-log";
import fs from "fs/promises";
import path from "path";

const sassCompiler = sass(dartSass);
const bs = browserSync.create();

const isProd = process.env.NODE_ENV === "production";

// Clean build folder
gulp.task("clean", () => rm("build", { recursive: true, force: true }));

// Process SCSS
gulp.task("css", () => {
  return gulp
    .src("./src/scss/main.scss")
    .pipe(sassCompiler().on("error", sassCompiler.logError))
    .pipe(gulpif(isProd, cleanCSS()))
    .pipe(gulp.dest("./build/css"))
    .pipe(rename("bundle.css"))
    .pipe(gulp.dest("./build/css"))
    .pipe(bs.stream());
});

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
gulp.task("static", async () => {
  const sourceDir = "./src/img";
  const destDir = "./build/img";

  try {
    await fs.mkdir(destDir, { recursive: true });
    await copyDir(sourceDir, destDir);
    log("Finished copying static assets");
    bs.reload();
  } catch (error) {
    log.error("Error copying static assets:", error);
  }
});

async function copyDir(src, dest) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        log(`Copied: ${entry.name}`);
      }
    })
  );
}

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
    .pipe(bs.stream());
});

// Watch files
gulp.task("watch", () => {
  bs.init({
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
