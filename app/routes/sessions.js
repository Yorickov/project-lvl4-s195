import buildFormObj from '../lib/formObjectBuilder';
import { encrypt } from '../lib/secure';
import { User } from '../../db/models';

export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      const data = {};
      ctx.render('sessions/new', { formElement: buildFormObj(data) });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body.form;
      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user && user.passwordDigest === encrypt(password)) {
        ctx.session.userId = user.id;
        ctx.redirect(router.url('root'));
        return;
      }
      ctx.status = 422;
      const err = { errors: [{ path: 'password', message: 'Wrong email or password' }] };
      ctx.render('sessions/new', { formElement: buildFormObj({ email }, err) });
    })
    .delete('session', '/session', (ctx) => {
      ctx.session = {};
      ctx.flash.set('Buy');
      ctx.redirect(router.url('root'));
    });
};
