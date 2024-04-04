'use strict'

const postcss = require('gulp-postcss')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
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
    .pipe(
      postcss([
        require('postcss-focus'),
        require('cssnano')({
          preset: require('cssnano-preset-advanced')
        })
      ])
    )
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

module.exports.default = gulp.series(build, watch)
module.exports.build = build
module.exports.watch = watch
