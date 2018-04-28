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
    .post('users', '/users', async (ctx) => {
      const { form } = ctx.request.body;
      const user = User.build(form);
      // logger.user(`add user: ${user.email}/${user.password}`);
      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.render('users/new', { formElement: buildFormObj(user, e) });
      }
    });
};
