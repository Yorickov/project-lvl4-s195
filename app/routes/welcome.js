import buildFormObj from '../lib/formObjectBuilder';

export default (router, container) => {
  const { User } = container;
  router.get('root', '/', (ctx) => {
    const user = User.build();
    ctx.render('welcome/index', { formElement: buildFormObj(user) });
  });
};
