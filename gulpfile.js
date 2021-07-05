/*
npm install -g gulp-cli
npm install gulp --save-dev
npm install gulp-concat --save-dev
npm install gulp-uglify --save-dev
npm install gulp-uglifycss --save-dev
*/

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');

function concatmainjs() {
  return gulp.src([
    './js/lib/masonry.pkgd.js',
    './js/lib/pell.js',
    './js/lib/purify.js',
    './js/script.js'])
    .pipe(concat('bida.pkgd.min.js'))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(gulp.dest('./build/'));
}

function concatd3js() {
  return gulp.src([
    './js/lib/d3.js',
    './js/lib/maptopojson.js'])
    .pipe(concat('bida-ddd.pkgd.min.js'))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(gulp.dest('./build/'));
}

function concatbbjs() {
  return gulp.src([
    './js/lib/nbillboard.js'])
    .pipe(concat('bida-chart.pkgd.min.js'))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(gulp.dest('./build/'));
}

function concatcaljs() {
  return gulp.src([
    './js/lib/fullCalendar.js',
    './js/lib/fullCalendarLocales.js'])
    .pipe(concat('bida-calendar.pkgd.min.js'))
    .pipe(uglify().on('error', function (e) { console.log(e); }))
    .pipe(gulp.dest('./build/'));
}

function concatcss() {
  return gulp.src('./css/*.css')
    .pipe(concat({ path: 'bida.pkgd.min.css' }))
    .pipe(uglifycss({ "uglyComments": true }))
    .pipe(gulp.dest('./build/'))
}

exports.concatmainjs = concatmainjs;
exports.concatd3js = concatd3js;
exports.concatbbjs = concatbbjs;
exports.concatcaljs = concatcaljs;
exports.concatcss = concatcss;