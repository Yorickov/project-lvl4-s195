export default (router) => {
  router.get('users', '/users', (ctx) => {
    ctx.render('users/index');
  });
};
