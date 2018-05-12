import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../models';
import { reqTask } from '../middlwares';

import logger from '../lib/logger';

export default (router) => {
  router
    .get('users#index', '/users', async (ctx) => {
      const users = await User.findAll();
      logger.user(`users id: ${Object.keys(users)}`);
      ctx.render('users', { users });
    })
    .get('users#new', '/users/new', (ctx) => {
      const user = User.build();
      ctx.render('users/new', { formElement: buildFormObj(user) });
    })
    .get('users#show', '/users/:id', reqTask(router, User), async (ctx) => {
      const user = await User.findById(ctx.params.id);
      ctx.render('users/show', { formElement: buildFormObj(user) });
    })
    .post('users#create', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      if (form.confirmedPassword !== form.password) {
        ctx.flash.set('Passwords are not equal, try again');
        ctx.redirect(router.url('users#new'));
        return;
      }
      const user = User.build(form);
      logger.user(`add user: ${user.email}/${user.password}`);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.status = 422;
        ctx.render('users/new', { formElement: buildFormObj(user, e) });
      }
    });
};

// const err = { errors: [{ path: 'password', message: 'Wrong email or password' }] };
