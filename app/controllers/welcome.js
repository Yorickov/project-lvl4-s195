export default (router, container) => {
  const { User, buildFormObj } = container;
  router.get('root', '/', (ctx) => {
    const user = User.build();
    ctx.render('welcome/index', { formElement: buildFormObj(user) });
  });
};
