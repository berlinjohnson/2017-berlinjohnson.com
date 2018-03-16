var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var browserify = require('gulp-browserify');
var imagemin = require('gulp-imagemin');
var imageResize = require('gulp-image-resize');
var cache = require('gulp-cache');
var del = require('del');
var argv = require('yargs').argv;

//SASS
gulp.task('styles', function() {
    return gulp.src('app/styles/styles.scss')
                .pipe(
                  sass({ includePaths: ['node_modules'] }
                ).on('error', sass.logError))
                .pipe(gulp.dest('build/'))
                .pipe(browserSync.stream());
});

//JAVASCRIPT
gulp.task('scripts', function() {
	// Single entry point to browserify
	return gulp.src('app/scripts/main.js')
		.pipe(browserify({
		  insertGlobals : true,
		  debug : true
		}))
		.pipe(gulp.dest('build/'))
    .pipe(browserSync.stream());
});

//COPY INDEX.HTML TO BUILD DIRECTORY
gulp.task('index', function() {
    return gulp.src('app/index.html')
                .pipe(gulp.dest('build/'))
                .pipe(browserSync.stream());
});

//MAKE DUMMY RESUME AND ABOUT DIRECTORIES
gulp.task('resume', function() {
    return gulp.src('app/index.html')
                .pipe(gulp.dest('build/resume/'))
                .pipe(browserSync.stream());
});
gulp.task('about', function() {
    return gulp.src('app/index.html')
                .pipe(gulp.dest('build/about/'))
                .pipe(browserSync.stream());
});

gulp.task('clean', function() {
  return del.sync('build/');
})


gulp.task('cache:clear', function (callback) {
  return cache.clearAll(callback)
})

// DEFAULT / STATIC SERVER
gulp.task('default', ['styles', 'scripts', 'index', 'resume', 'about'], function() {
    browserSync.init({
        server: {
            baseDir: "./build/"
        },
        open: false
    });

    gulp.watch('app/*.html',['index', 'resume', 'about']);
    gulp.watch('app/styles/**/*.scss',['styles']);
    gulp.watch('app/scripts/**/*.js',['scripts']);
});

// COPY IMAGES TO BUILD DIRECTORY
// Just avatar and covers
gulp.task('moveImages', function() {
  return gulp.src('app/images/**/+(avatar|__cover|*.gif)*')
  .pipe(imagemin({
    interlaced: true
  }))
  .pipe(gulp.dest('build/images'))
  .pipe(browserSync.stream());
});
//renaming is weird tho?

// Thumbnails
gulp.task('thumbnails', function() {
  return gulp.src('app/images/projects/**/[^_]*.+(png|jpg|jpeg|svg)')
  .pipe(imageResize({
    width : 400,
    height : 400,
    crop : true,
    gravity: 'Center',
    upscale : false
  }))
  .pipe(imagemin({
    interlaced: true
  }))
  .pipe(gulp.dest('build/images/thumbnails/'))
  .pipe(browserSync.stream());
});

// Full pieces resized
gulp.task('pieces', function() {
  return gulp.src('app/images/projects/**/[^_]*.+(png|jpg|jpeg|svg)')
  .pipe(imageResize({
    width : 1634,
    crop : false,
    upscale : false
  }))
  .pipe(imagemin({
    interlaced: true
  }))
  .pipe(gulp.dest('build/images/projects/'))
  .pipe(browserSync.stream());
});

gulp.task('images', ['moveImages', 'thumbnails', 'pieces']);

// gulp resize --src app/images/**/*.png --dest lol/
gulp.task('resize', function() {
  var src = argv.src;
  var dest = argv.dest;
  if (src === undefined || dest === undefined) {
    console.log('Needs --src and --dest args. Like gulp resize --src app/images/**/*.png --dest lol/');
    return;
  }
  return gulp.src(src)
  .pipe(imageResize({
    height: 1000,
    width: 1000,
    crop: true,
    gravity: 'Center',
    upscale: false
  }))
  .pipe(imagemin({
    interlaced: true
  }))
  .pipe(gulp.dest(dest))
  .pipe(browserSync.stream());
});
