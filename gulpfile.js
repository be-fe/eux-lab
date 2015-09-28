var gulp = require('gulp');
var shell = require('gulp-shell');
var open = require('gulp-open');
var config = require('./dev/config');

var dir = __dirname;

gulp.task('project-wiki', function() {
    gulp.src('')
        .pipe(shell(['forever  --spinSleepTime 3000 -v app.js'], {
            cwd: dir,
            verbosity: 3
        }));
});

gulp.task('open-wiki', function() {
    // @todo: use a better implementation for this delay opening
    setTimeout(function() {
        gulp.src('')
            .pipe(open({uri: 'http://localhost:' + config.port}));
    }, 5000);
});

gulp.task('default', ['open-wiki', 'project-wiki']);