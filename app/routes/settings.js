import buildFormObj from '../lib/formObjectBuilder';
import { User } from '../models';
import { encrypt } from '../lib/secure';
import logger from '../lib/logger';
import { reqAuth } from '../middlwares';

export default (router) => {
  router
    .get('settings', '/settings', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('settings', { formElement: buildFormObj(user) });
    })
    .get('editPassword', '/settings/password', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('settings/password', { formElement: buildFormObj(user) });
    })
    .get('deleteAccount', '/settings/account', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('settings/account', { formElement: buildFormObj(user) });
    })
    .patch('editProfile', '/settings/profile', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const user = await User.findById(ctx.session.userId);
      try {
        await user.update(form);
        logger.sett(`user ${user.userId} edit email to ${form.firstName}`);
        ctx.flash.set('Profile has been changed');
        ctx.redirect(router.url('settings'));
        return;
      } catch (e) {
        ctx.render('settings', { formElement: buildFormObj(form, e) });
      }
    })
    .patch('editEmail', '/settings/email', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const user = await User.findById(ctx.session.userId);
      try {
        await user.update(form);
        logger.sett(`user ${user.userId} edit email to ${form.email}`);
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

      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(oldPassword)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('editPassword'));
        return;
      }
      try {
        await user.update({ password });
        logger.sett(`user ${user.userId} update password from ${oldPassword} to ${password}`);
        ctx.flash.set('Password has been changed');
        ctx.redirect(router.url('settings'));
      } catch (e) {
        ctx.render('settings', { formElement: buildFormObj(form, e) });
      }
    })
    .delete('settings', '/settings', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
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
