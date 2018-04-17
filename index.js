import 'babel-polyfill';

import path from 'path';
import _ from 'lodash';

import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import serve from 'koa-static';
import bodyParser from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';

import middleware from 'koa-webpack';
import getWebpackConfig from './webpack.config.babel';

import addRoutes from './routes';
import errorHandler from './middlwares/error-handler';

// import db-var from .env
import container from './container'; // eslint-disable-line

export default () => {
  const app = new Koa();

  app.use(errorHandler());

  app.use(koaLogger());

  app.use(bodyParser());
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));
  app.use(serve(path.join(__dirname, '..', 'public')));

  if (process.env.NODE_ENV !== 'test') {
    app.use(middleware({
      config: getWebpackConfig(),
    }));
  }

  const router = new Router();
  addRoutes(router);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });

  pug.use(app);
  return app;
};
