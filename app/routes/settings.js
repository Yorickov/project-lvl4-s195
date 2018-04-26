import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../../db/models';
import { encrypt } from '../lib/secure';
import logger from '../lib/logger';

export default (router) => {
  router
    .get('settings', '/settings', async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('settings', { formElement: buildFormObj(user) });
    })
    .patch('editSettings', '/settings/edit', async (ctx) => {
      const { form } = ctx.request.body;
      logger.sett(form);
      const user = await User.findById(ctx.session.userId);
      try {
        await user.update(form);
        ctx.flash.set('Profile has been changed');
        ctx.redirect(router.url('settings'));
        return;
      } catch (e) {
        ctx.render('settings', { formElement: buildFormObj(form, e) });
      }
    })
    .patch('editPassword', '/settings/password', async (ctx) => {
      const { form } = ctx.request.body;
      const { oldPassword, password } = form;
      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(oldPassword)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('settings'));
        return;
      }
      try {
        await user.update({ password });
        ctx.flash.set('Password has been changed');
        ctx.redirect(router.url('settings'));
      } catch (e) {
        ctx.render('settings', { formElement: buildFormObj(form, e) });
      }
    })
    .delete('settings', '/settings', async (ctx) => {
      const { form } = ctx.request.body;
      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(form.password)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('settings'));
        return;
      }
      try {
        await user.destroy();
        ctx.session = {};
        ctx.flash.set(`Buy, ${user.fullName}`);
        ctx.redirect(router.url('root'));
      } catch (e) {
        ctx.render('settings', { formElement: buildFormObj(form, e) });
      }
    });
};
