const gulp = require('gulp');
const rigger = require('gulp-rigger');
const autoprefixer = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const notify = require('gulp-notify');
const rimraf = require('rimraf');
const browserSync = require('browser-sync').create();
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const cssmin = require('gulp-minify-css');

//-----------------path---------------------
const path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: 'src/js/**/main.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build/'
};
//----------------------------------------------
//----------------serve-------------------------
function server() {
    browserSync.init({
        port: 3001,
        server: {
            baseDir: "./build",
            index: "index.html"
        }
    });
}
gulp.task('server', server);
//------------------------------------------------
//-----------------html:build---------------------
function html(done) {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.stream());
    done();
}
gulp.task('html', html);
//----------------------------------------------
//-----------------css:build---------------------
function css(done) {
    gulp.src('./src/style/scss/**//**.scss')
        .pipe(plumber({
            errorHandler: notify.onError(function(error) {
                return {title: 'Styles',message: error.message};
            })
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 3 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
            cascade: false
        }))
        .pipe(cssmin())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/style'))
        .pipe(browserSync.stream());
    done();
}
gulp.task('css', css);
//-------------------------------------------------
//-----------------js:build---------------------
function js(done) {
    gulp.src(path.src.js)
        //.pipe(plumber())
        .pipe(webpackStream(webpackConfig))
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.stream());
    done();
}
gulp.task('js', js);
//---------------------------------------------------
//-----------------img:build---------------------
function img(done) {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(browserSync.stream());
    done();
}
gulp.task('img', img);
//----------------------------------------------------
//-----------------fonts:build---------------------
function fonts(done) {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(browserSync.stream());
    done();
}
gulp.task('fonts', fonts);
//-----------clean----------------------
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});
//-----------------build---------------------
gulp.task('build', gulp.parallel('css', 'js','fonts', 'img', 'html'));

//--------------watch----------------------
gulp.task('watch', watch);

function watch() {
    gulp.watch(path.watch.style, gulp.series('css'));
    gulp.watch(path.watch.js, gulp.series('js'));
    gulp.watch(path.watch.html, gulp.series('html'));
    gulp.watch(path.watch.fonts, gulp.series('fonts'));
    gulp.watch(path.watch.img, gulp.series('img'));
}
//-------------------def-------------------------
gulp.task('default', gulp.series(('build'), gulp.parallel('watch', 'server'))); //