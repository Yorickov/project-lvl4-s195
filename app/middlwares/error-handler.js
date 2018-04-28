import Rollbar from 'rollbar';

const rollbarConfig = {
  accessToken: 'a33e39b6ff16414987a4534781b869da',
  captureUncaught: true,
  captureUnhandledRejections: true,
  payload: { environment: 'production' },
  verbose: true,
};

const rollbar = new Rollbar(rollbarConfig);

export default () =>
  async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  };
