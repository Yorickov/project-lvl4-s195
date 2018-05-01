import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../../db/models';
import { encrypt } from '../lib/secure';
import logger from '../lib/logger';
import { reqAuth } from '../middlwares';

export default (router) => {
  router
    .get('settings', '/settings', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      logger.sett(`GET /settings: email: ${user.email}, ${user.id}`);
      ctx.render('settings', { formElement: buildFormObj(user) });
    })
    .get('editPassword', '/settings/password', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      logger.sett(`GET /settings/password :email: ${user.email}`);
      ctx.render('settings/password', { formElement: buildFormObj(user) });
    })
    .get('deleteAccount', '/settings/account', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('settings/account', { formElement: buildFormObj(user) });
    })
    .patch('editProfile', '/settings/profile', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      logger.sett(`uri: ${ctx.request.url}, email: ${form.email}`);

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
    .patch('editEmail', '/settings/email', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      logger.sett(`uri: ${ctx.request.url}, email: ${form.email}`);

      const user = await User.findById(ctx.session.userId);
      try {
        await user.update(form);
        ctx.flash.set('Email has been changed');
        ctx.redirect(router.url('settings'));
        return;
      } catch (e) {
        ctx.render('settings', { formElement: buildFormObj(form, e) });
      }
    })
    .patch('editPassword', '/settings/password', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const { oldPassword, password, confirmedPassword } = form;
      if (confirmedPassword !== password) {
        ctx.flash.set('Passwords are not equal, try again');
        ctx.redirect(router.url('editPassword'));
        return;
      }
      logger.sett(`${ctx.request.url}: oldPassword: ${oldPassword}, password: ${password}, confirmedPassword: ${confirmedPassword}`);

      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(oldPassword)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('editPassword'));
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
    .delete('settings', '/settings', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      logger.sett(`uri: ${ctx.request.url}, email: ${form.email}`);

      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(form.password)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('deleteAccount'));
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
