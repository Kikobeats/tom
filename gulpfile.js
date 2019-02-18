'use strict'

const strip = require('gulp-strip-css-comments')
const prefix = require('gulp-autoprefixer')
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const gulp = require('gulp')

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

const css = () =>
  gulp
    .src(src.css)
    .pipe(concat(`${dist.name.css}.min.css`))
    .pipe(prefix())
    .pipe(strip({ all: true }))
    .pipe(cssnano())
    .pipe(gulp.dest(dist.path))

const js = () =>
  gulp
    .src(src.js)
    .pipe(concat(`${dist.name.js}.min.js`))
    .pipe(uglify())
    .pipe(gulp.dest(dist.path))

const build = gulp.parallel(css, js)

const watch = () => {
  gulp.watch(src.css, css)
  gulp.watch(src.js, js)
}

exports.build = build
exports.css = css
exports.js = js
exports.watch = watch
exports.default = gulp.series(build, watch)
