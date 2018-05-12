import Rollbar from 'rollbar';
import { Task } from '../models';

const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  verbose: true,
};

const rollbar = new Rollbar(rollbarConfig);

const errorHandler = () =>
  async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  };

const reqAuth = router =>
  async (ctx, next) => {
    if (!ctx.session.userId) {
      ctx.flash.set('Session time expired, relogin please');
      ctx.redirect(router.url('session#new'));
      return;
    }
    await next();
  };

const reqModify = (router, Model, alias) =>
  async (ctx, next) => {
    const task = await Model.findById(ctx.params.id, {
      include: [alias],
    });
    if (task.creator.id !== ctx.session.userId) {
      ctx.flash.set('Yoy have no authority for operation');
      ctx.redirect(router.url('root'));
      return;
    }
    await next();
  };

const reqTask = (router, Model) =>
  async (ctx, next) => {
    const instanceDb = await Model.findById(ctx.params.id);
    if (!instanceDb) {
      ctx.flash.set('No such an entity');
      ctx.redirect(router.url('root'));
      return;
    }
    await next();
  };

export { errorHandler, reqAuth, reqModify, reqTask };
