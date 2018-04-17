export default (router) => {
  router.get('session', '/session', (ctx) => {
    ctx.render('sessions/index');
  });
};
