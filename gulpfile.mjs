'use strict'

import strip from 'gulp-strip-css-comments'
import prefix from 'gulp-autoprefixer'
import cssnano from 'gulp-cssnano'
import uglify from 'gulp-uglify'
import concat from 'gulp-concat'
import gulp from 'gulp'

const src = {
  css: ['static/src/css/style.css'],
  js: ['static/src/js/main.js']
}

const dist = {
  path: 'static',
  name: {
    css: 'style',
    js: 'main'
  }
}

export const css = () =>
  gulp
    .src(src.css)
    .pipe(concat(`${dist.name.css}.min.css`))
    .pipe(prefix())
    .pipe(strip({ all: true }))
    .pipe(cssnano())
    .pipe(gulp.dest(dist.path))

export const js = () =>
  gulp
    .src(src.js)
    .pipe(concat(`${dist.name.js}.min.js`))
    .pipe(uglify())
    .pipe(gulp.dest(dist.path))

export const build = gulp.parallel(css, js)

export const watch = () => {
  gulp.watch(src.css, css)
  gulp.watch(src.js, js)
}

export default gulp.series(build, watch)
