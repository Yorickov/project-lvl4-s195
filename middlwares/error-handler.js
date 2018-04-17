import Rollbar from 'rollbar';

const rollbar = new Rollbar('a33e39b6ff16414987a4534781b869da');

export default () =>
  async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      rollbar.error(err, ctx.request);
    }
  };
