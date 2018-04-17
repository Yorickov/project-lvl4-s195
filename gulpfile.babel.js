import 'babel-polyfill';

import gulp from 'gulp';
import getServer from '.';

gulp.task('server', () => {
  getServer().listen(process.env.PORT || 3000, () =>
    console.log('server started'));
});
