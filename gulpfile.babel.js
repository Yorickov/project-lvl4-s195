import 'babel-polyfill';

import gulp from 'gulp';
import repl from 'repl';

import container from './app/container';
import getServer from './app';
import initModels from './app/initModels';

gulp.task('console', () => {
  const replServer = repl.start({
    prompt: 'Application console > ',
  });
  Object.keys(container).forEach((key) => {
    replServer.context[key] = container[key];
  });
});

gulp.task('initModels', () => {
  initModels();
});

gulp.task('development', (cb) => {
  getServer().listen(process.env.PORT || 3000, cb);
});

gulp.task('production', ['initModels'], (cb) => {
  getServer().listen(process.env.PORT || 3000, cb);
});
