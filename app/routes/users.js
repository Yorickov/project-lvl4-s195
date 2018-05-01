import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../../db/models';

import logger from '../lib/logger';

export default (router) => {
  router
    .get('users', '/users', async (ctx) => {
      const users = await User.findAll();
      logger.user(`users id: ${Object.keys(users)}`);
      ctx.render('users', { users });
    })
    .get('newUser', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { formElement: buildFormObj(user) });
    })
    .get('profile', '/users/:id', async (ctx) => {
      const user = await User.findById(ctx.params.id);
      if (!user) {
        ctx.flash.set('Not such a user');
        ctx.redirect(router.url('root'));
        return;
      }
      logger.sett(`GET /settings: email: ${user.email}`);
      ctx.render('settings/profile', { formElement: buildFormObj(user) });
    })
    .post('users', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      if (form.confirmedPassword !== form.password) {
        const err = { errors: [{ path: 'password', message: 'Passwords are not equal, try again' }] };
        ctx.status = 422;
        ctx.render('users/new', { formElement: buildFormObj(form, err) });
      }
      const user = User.build(form);
      // logger.user(`add user: ${user.email}/${user.password}`);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
        return;
      } catch (e) {
        ctx.status = 422;
        ctx.render('users/new', { formElement: buildFormObj(user, e) });
      }
    });
};

const err = { errors: [{ path: 'password', message: 'Wrong email or password' }] };
