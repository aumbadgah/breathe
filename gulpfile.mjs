import fs from "node:fs/promises";
import path from "node:path";

import * as dartSass from "sass";
import TerserPlugin from "terser-webpack-plugin";
import autoprefixer from "gulp-autoprefixer";
import browserSync from "browser-sync";
import cleanCSS from "gulp-clean-css";
import concat from "gulp-concat";
import gulp from "gulp";
import gulpif from "gulp-if";
import inject from "gulp-inject";
import log from "fancy-log";
import purgecss from "gulp-purgecss";
import rename from "gulp-rename";
import replace from "gulp-replace";
import sass from "gulp-sass";
import webpack from "webpack";
import webpackStream from "webpack-stream";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

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
      "./node_modules/@fortawesome/fontawesome-free/css/all.min.css",
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
    src: "./node_modules/@fortawesome/fontawesome-free/webfonts",
    dest: "./build/webfonts",
  },
  html: {
    src: "./src/index.html",
    dest: "./build",
  },
  favicon: {
    src: "./src/img/favicon",
  },
  manifest: {
    dest: "./build",
    name: "Breathe - Pilates Oulu",
    shortName: "Breathe",
    description: "Breathing app",
    backgroundColor: "#702929",
    themeColor: "#ffffff",
    display: "standalone",
    orientation: "any",
    scope: "/",
    startUrl: "/",
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

gulp.task("ensure-build-dir", async () => {
  try {
    await fs.mkdir(config.buildDir, { recursive: true });
    log("Build directory ensured");
  } catch (error) {
    log.error("Error ensuring build directory:", error);
  }
});

async function generateIconsArray(directory) {
  const files = await fs.readdir(directory);
  const icons = [];

  for (const file of files) {
    if (file.endsWith(".png")) {
      const filePath = path.join(directory, file);
      const fileStat = await fs.stat(filePath);

      if (fileStat.isFile()) {
        const match = file.match(/-(\d+)x(\d+)\.png/);
        if (match) {
          const size = match[1]; // Assuming square icons
          icons.push({
            src: `img/favicon/${file}`,
            sizes: `${size}x${size}`,
            type: "image/png",
          });
        }
      }
    }
  }

  return icons;
}

// Generate manifest.json
gulp.task("manifest", async () => {
  const {
    name,
    shortName: short_name,
    description,
    backgroundColor: background_color,
    themeColor: theme_color,
    display,
    orientation,
    scope,
    startUrl: start_url,
  } = config.manifest;

  const icons = await generateIconsArray(config.favicon.src);

  const manifest = {
    name,
    short_name,
    description,
    background_color,
    theme_color,
    display,
    orientation,
    scope,
    start_url,
    icons,
  };

  try {
    await fs.writeFile(
      path.join(config.manifest.dest, "manifest.json"),
      JSON.stringify(manifest, null, 2)
    );
    log("manifest.json generated");
  } catch (error) {
    log.error("Error generating manifest.json:", error);
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
    .pipe(
      gulpif(
        isProd,
        purgecss({
          content: ["src/**/*.html", "src/**/*.ts", "src/**/*.js"],
          safelist: {
            standard: [/^fa-/, /^sp-/],
            deep: [/spectrum$/],
          },
        })
      )
    )
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
                      presets: [
                        ["@babel/preset-env", { modules: false }],
                        "@babel/preset-typescript",
                      ],
                      plugins: [
                        [
                          "transform-imports",
                          {
                            lodash: {
                              transform: "lodash/${member}",
                              preventFullImport: true,
                            },
                          },
                        ],
                      ],
                    },
                  },
                ],
                exclude: /node_modules/,
              },
            ],
          },
          optimization: {
            usedExports: true,
            minimize: isProd,
            minimizer: [
              new TerserPlugin({
                terserOptions: {
                  compress: {
                    drop_console: true,
                  },
                },
              }),
            ],
            sideEffects: true,
          },
          plugins: [
            new webpack.ProvidePlugin({
              $: "jquery",
              jQuery: "jquery",
            }),
            new BundleAnalyzerPlugin({
              analyzerMode: "static",
              openAnalyzer: false,
            }),
          ],
        },
        webpack
      )
    )
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
    .pipe(replace(/img\/favicon\/img\/favicon\//g, "img/favicon/")) // Add this line
    .pipe(
      replace("</head>", '<link rel="manifest" href="/manifest.json">\n</head>')
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
  gulp.series(
    "clean",
    "ensure-build-dir",
    gulp.parallel("scss", "js", "static", "fonts", "manifest"),
    "html"
  )
);

// Default task
gulp.task("default", gulp.series("build", "watch"));
