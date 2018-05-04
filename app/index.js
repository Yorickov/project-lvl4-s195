import 'babel-polyfill';

import path from 'path';
import _ from 'lodash';

import Koa from 'koa';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import serve from 'koa-static';
import webpackMiddleware from 'koa-webpack';
import bodyParser from 'koa-bodyparser';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import methodOverride from 'koa-methodoverride';
import SequelizeStore from 'koa-generic-session-sequelize';

import webpackConfig from '../webpack.config';
import addRoutes from './routes';
import container from './container';
import { errorHandler } from './middlwares';
import { sequelize } from './models';

const { logger } = container;

export default () => {
  const app = new Koa();

  app.use(errorHandler());

  app.keys = ['some secret hurr'];

  if (process.env.NODE_ENV === 'production') {
    app.use(session({
      store: new SequelizeStore(sequelize, { timestamps: true }),
    }));
  }

  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      getUserId: () => ctx.session.userId,
      getUserProfileName: () => ctx.session.userProfileName,
    };
    logger.flow(`session id: ${ctx.session.userId}/user: ${ctx.session.userProfileName}`);
    await next();
  });

  app.use(bodyParser());

  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));

  app.use(serve(path.join(__dirname, '..', 'dist')));

  if (process.env.NODE_ENV !== 'test') {
    app.use(webpackMiddleware({
      config: webpackConfig,
    }));
  }

  app.use(koaLogger());

  const router = new Router();
  addRoutes(router, container);
  app.use(router.routes());
  app.use(router.allowedMethods());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: process.env.NODE_ENV === 'development',
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
