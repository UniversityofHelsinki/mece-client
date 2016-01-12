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

// concatenate and minify javascript files
gulp.task('packageScripts', function(){
    return gulp.src(['js/shibboLogin.js', 'js/controller.js', 'js/initializer.js', 'js/view.js'])
        .pipe(concat('mece.client.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('mece.client.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('nunjucks', function() {
    nunjucksRender.nunjucks.configure(['./templates'], {watch: false});
    return gulp
        .src('./templates/*.+html')
        .pipe(nunjucksRender())
        .pipe(gulp.dest('./app'));
});

gulp.task("html", function() {

    gulp.src("./templates/index-staging.html")
        .pipe(preprocess({context: {env: "staging"}}))
        .pipe(gulp.dest("./"))
        .pipe(notify({ message: 'Task html::staging OK' })) ;

    gulp.src("./templates/index-testing.html")
        .pipe(preprocess({context: {env: "testing"}}))
        .pipe(gulp.dest("./"))
        .pipe(notify({ message: 'Task html::testing OK' })) ;

    gulp.src("./templates/index-production.html")
        .pipe(preprocess({context: {env: "production"}}))
        .pipe(gulp.dest("./"))
        .pipe(notify({ message: 'Task html::production OK' })) ;

    gulp.src("./templates/index-localhost.html")
        .pipe(preprocess({context: {env: "localhost"}}))
        .pipe(gulp.dest("./"))
        .pipe(notify({ message: 'Task html::localhost OK' })) ;
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

