import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';

export default (router, container) => {
  const { User, logReq } = container;
  router
    .get('session#new', '/session/new', (ctx) => {
      const data = {};
      ctx.render('session/new', { formElement: buildFormObj(data) });
    })
    .post('session#create', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.session.userProfileName = user.fullName;
        logReq(`user sign-in: ${user.id}: ${user.fullName}`);

        ctx.redirect(router.url('root'));
        return;
      }
      ctx.status = 422;
      const err = { errors: [{ path: 'password', message: 'Wrong email or password' }] };
      ctx.render('session/new', { formElement: buildFormObj({ email }, err) });
    })
    .delete('session#destroy', '/session', (ctx) => {
      ctx.session = {};
      ctx.flash.set('Buy');
      ctx.redirect(router.url('root'));
    });
};
