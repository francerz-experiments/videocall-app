const
    gulp    = require('gulp'),
    ts      = require('gulp-typescript'),
    sass    = require('gulp-sass')(require('sass'));

gulp.task('tsc', function() {
    return gulp
        .src('client/ts/**/*.ts')
        .pipe(ts({
            outFile: 'script.js'
        }))
        .pipe(gulp.dest('public/assets'));
});

gulp.task('sass', function() {
    return gulp
        .src('client/sass/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/assets'));
});

gulp.task('watch', function() {
    gulp.watch('client/ts/**/*.ts', gulp.series('tsc'));
    gulp.watch('client/sass/**/*.scss', gulp.series('sass'));
});

gulp.task('tsc:app', function() {
    return gulp
        .src('server/**/*.ts')
        .pipe(ts({outFile: 'app.js'}))
        .pipe(gulp.dest('.'));
});

gulp.task('build', gulp.parallel('tsc:app','tsc','sass'));