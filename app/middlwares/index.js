import Rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: 'a33e39b6ff16414987a4534781b869da',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: { environment: 'production' },
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
      ctx.redirect(router.url('newSession'));
      return;
    }
    await next();
  };

export { errorHandler, reqAuth };
