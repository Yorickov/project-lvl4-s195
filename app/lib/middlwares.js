import Rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  verbose: true,
};

const rollbar = new Rollbar(rollbarConfig);

const errorRender = (ctx, err) => {
  ctx.status = err.status || 500;
  switch (ctx.status) {
    case 404:
      ctx.render('errors/404');
      break;
    case 500:
      ctx.render('errors/500');
      break;
    default:
      rollbar.error(err, ctx.request);
  }
};

const errorHandler = () =>
  async (ctx, next) => {
    try {
      await next();
      const status = ctx.status || 404;
      if (status === 404) {
        ctx.throw(404);
      }
    } catch (err) {
      errorRender(ctx, err);
    }
  };

const reqAuth = router =>
  async (ctx, next) => {
    if (!ctx.state.currentUserId) {
      ctx.flash.set('Session time expired, relogin please');
      ctx.redirect(router.url('session#new'));
      return;
    }
    await next();
  };

const reqModify = (router, Model, alias) =>
  async (ctx, next) => {
    const instance = await Model.findById(ctx.params.id, {
      include: [alias],
    });
    if (instance.creator.id !== ctx.state.currentUserId) {
      ctx.flash.set('Yoy have no authority for operation');
      ctx.redirect(router.url('root'));
      return;
    }
    await next();
  };

const reqEntityExists = (router, Model) =>
  async (ctx, next) => {
    const instance = await Model.findById(ctx.params.id);
    if (!instance) {
      ctx.throw(404);
    }
    await next();
  };

export { errorHandler, reqAuth, reqModify, reqEntityExists };
