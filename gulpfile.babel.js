import 'babel-polyfill';

import gulp from 'gulp';
import getServer from '.';
import log from './lib/logger';

gulp.task('server', () => {
  log('hi');
  getServer().listen(process.env.PORT || 3000, () =>
    console.log('server started'));
});
