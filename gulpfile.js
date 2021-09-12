const
    gulp    = require('gulp'),
    tsc      = require('gulp-typescript'),
    sass    = require('gulp-sass')(require('sass'));

gulp.task('sass', function() {
    return gulp
        .src('client/sass/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/assets'));
});

gulp.task('watch', function() {
    gulp.watch('client/sass/**/*.scss', gulp.series('sass'));
    gulp.watch('server/**/*.ts', gulp.series('tsc:app'));
});

gulp.task('tsc:app', function() {
    return gulp
        .src('server/**/*.ts')
        .pipe(tsc())
        .pipe(gulp.dest('app'));
});

gulp.task('build', gulp.parallel('tsc:app','sass'));