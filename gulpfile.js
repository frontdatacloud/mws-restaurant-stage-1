const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');

const buildDir = 'dist';
const paths = {
  html: {
    src: './*.html',
    dest: `${buildDir}/`
  },
  css: {
    src: 'css/*.css',
    dest: `${buildDir}/css/`
  },
  js: {
    src: 'js/*.js',
    dest: `${buildDir}/js/`
  },
  img: {
    src: 'img/*',
    src_temp: 'img_temp',
    dest: `${buildDir}/img/`
  },
  icons: {
    src: 'img/icons/*',
    dest: `${buildDir}/img/icons/`
  },
  other: {
    src: ['./manifest.json', './service-worker.js'],
    dest: `${buildDir}/`
  }
};

/* 
  Gulp tasks
 */

const images = gulp.series(compressImg, responsiveImg, copyIcons, cleanTempImg);
gulp.task('images', images);

const build = gulp.series(clean, gulp.parallel(html, css, js, copyFiles));
gulp.task('build', build);

const watchFiles = gulp.series(build, watch);
gulp.task('watch', watchFiles);

/* 
  Utils functions
 */

function html() {
  return gulp.src(paths.html.src)
    .pipe($.htmlmin({ removeComments: true, collapseWhitespace: true }))
    .pipe(gulp.dest(paths.html.dest))
}

function css() {
  return gulp.src(paths.css.src)
    .pipe($.cleanCss())
    .pipe(gulp.dest(paths.css.dest));
}

// uglyfying JS causes errors
function js() {
  return gulp.src(paths.js.src, { sourcemaps: true })
    // .pipe($.babel({ presets: ['@babel/env'] }))
    // .pipe($.uglify())
    .pipe(gulp.dest(paths.js.dest));
}

function copyFiles() {
  return gulp.src(paths.other.src)
    .pipe(gulp.dest(paths.other.dest));
}

function copyIcons() {
  return gulp.src(paths.icons.src)
    .pipe(gulp.dest(paths.icons.dest));
}

// Images
function compressImg() {
  return gulp.src(paths.img.src)
    .pipe($.imagemin())
    .pipe(gulp.dest(paths.img.src_temp));
}

function responsiveImg() {
  const config = {
    format: 'webp',
    quality: 80
  };
  return gulp.src(`${paths.img.src_temp}/*.{jpg, png}`)
    .pipe($.responsive({
      '*': [
        {
          width: 400,
          rename: {
            suffix: '_small',
            extname: '.jpg',
          }
        }, 
        {
          width: 600,
          rename: {
            suffix: '_medium',
            extname: '.jpg',
          }
        },
        {
          width: 800,
          rename: {
            suffix: '_large',
            extname: '.jpg',
          },
        }
      ]
    }))
    .pipe(gulp.dest(paths.img.dest));
}

function cleanTempImg() {
  return del([`${paths.img.src_temp}/**`]);
}

// clean
function clean() {
  return del([`${buildDir}/**`, `!${buildDir}`, `!${buildDir}/img/**`]);
}

function watch() {
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.css.src, css);
  gulp.watch(paths.js.src, js);
  gulp.watch(paths.other.src, copyFiles);
}
