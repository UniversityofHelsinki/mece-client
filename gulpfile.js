var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var jasmineBrowser = require('gulp-jasmine-browser');
var SpecReporter = require('jasmine-spec-reporter');

// check javascript syntax
gulp.task('lint', function(){
    return gulp.src('js/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

// concatenate and minify javascript files
gulp.task('packageScripts', function(){
    return gulp.src(['js/shibboLogin.js', 'js/controller.js', 'js/initializer.js', 'js/view.js'])
        .pipe(concat('mece.client.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('mece.client.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

// watch files for changes
gulp.task('watch', function(){
    gulp.watch(['js/*.js', 'spec/*.js'], ['lint', 'jasmine-phantom', 'packageScripts']);
});

// jasmine unit tests
gulp.task('jasmine', function(){
    return gulp.src('spec/*.js')
        .pipe(jasmine({
            //reporter: new reporters.JUnitXmlReporter()
            reporter: new SpecReporter()
        }));
});

gulp.task('jasmine-phantom', function() {
    return gulp.src(['js/client.js', 'spec/test.js'])
        .pipe(jasmineBrowser.specRunner({console: true}))
        .pipe(jasmineBrowser.headless())
});

gulp.task('default', ['lint', 'jasmine-phantom', 'packageScripts', 'watch']);
