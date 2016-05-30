var gulp = require('gulp');

var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jasmine = require('gulp-jasmine');
var reporters = require('jasmine-reporters');
var jasmineBrowser = require('gulp-jasmine-browser');
var SpecReporter = require('jasmine-spec-reporter');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var preprocess = require('gulp-preprocess');

// check javascript syntax
gulp.task('lint', function(){
    return gulp.src('js/*.js').pipe(jshint()).pipe(jshint.reporter('default'));
});

// copy mece-client.js file to dist folder and to mece-client-app project
gulp.task('copy-mece-client', function() {
    gulp.src('./js/mece.client.js')
        .pipe(gulp.dest('../mece-client-app/public/js'))
        .pipe(gulp.dest('./dist'));
});

// concatenate and minify javascript files
gulp.task('packageScripts', function(){
    return gulp.src(['js/mece.client.js'])
        .pipe(concat('mece.client.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('mece.client.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task("html", function() {
    var envs = [ "staging", "testing", "production", "localhost" ];
    envs.forEach(function(e) {
        var t = "./templates/index-" + e + ".html";
        gulp.src(t)
            .pipe(preprocess({context: {env: e}}))
            .pipe(gulp.dest("./"))
            .on("end", function() {
                console.log(t + " .. OK");
            });
    });
});

// watch files for changes
gulp.task('watch', function(){
    gulp.watch(['js/*.js', 'spec/*.js', 'sass/**/*.scss'], ['lint', 'jasmine-phantom', 'packageScripts', 'styles']);
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

gulp.task('styles', function() {
    gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('default', ['lint', 'jasmine-phantom', 'packageScripts', 'styles', 'html', 'watch']);

