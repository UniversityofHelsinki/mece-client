var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// check javascript syntax
gulp.task('lint', function(){
    return gulp.src('js/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

// concatenate and minify javascript files
gulp.task('packageScripts', function(){
    return gulp.src('js/*.js')
        .pipe(concat('mece.client.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('mece.client.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

// watch files for changes
gulp.task('watch', function(){
    gulp.watch('js/*.js', ['lint', 'packageScripts']);
});

gulp.task('default', ['lint', 'packageScripts', 'watch']);
