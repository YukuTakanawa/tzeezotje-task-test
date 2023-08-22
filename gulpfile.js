const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imageMin = require('gulp-imagemin');
const del = require('del');



function browser() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        }
    });
}

function imagesCompressor() {
    return src('app/images/**/*')
        .pipe(imageMin([
            imageMin.gifsicle({ interlaced: true }),
            imageMin.mozjpeg({ quality: 75, progressive: true }),
            imageMin.optipng({ optimizationLevel: 5 }),
            imageMin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}

function scriptsBuilder() {
    return src([
        'app/js/inputmask.min.js',
        'app/js/main.js',
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browserSync.stream())
}

function stylesBuilder() {
    return src('app/scss/style.scss')
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css'))
        .pipe(browserSync.stream())
}

function cssLibsBuilder() {
    return src([
        'node_modules/reset.css/reset.css',
    ])
        .pipe(concat('_libs.scss'))
        .pipe(dest('app/scss'))
}

function watcher() {
    watch(['app/scss/**/*.scss'], stylesBuilder);
    watch(['app/js/**/*.js', '!app/js/main.min.js'], scriptsBuilder);
    watch(['app/*.html']).on('change', browserSync.reload);
}

function builder() {
    return src([
        'app/phpmailer/**/*',
        'app/mail.php',
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], { base: 'app' })
        .pipe(dest('dist'))
}


function distCleaner() {
    return del('dist')
}


exports.cssLibs = cssLibsBuilder;
exports.styles = stylesBuilder;
exports.watching = watcher;
exports.browser = browser;
exports.scripts = scriptsBuilder;
exports.images = imagesCompressor;
exports.cleanDist = distCleaner;

exports.build = series(distCleaner, imagesCompressor, builder);

exports.default = parallel(cssLibsBuilder, stylesBuilder, scriptsBuilder, browser, watcher);