import Rollbar from 'rollbar';

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

export { errorHandler, reqAuth };
