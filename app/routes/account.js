export default (router, container) => {
  const {
    User,
    logDb,
    buildFormObj,
    encrypt,
    reqAuth,
  } = container;
  router
    .get('account#edit', '/account/edit', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('account/edit', { formElement: buildFormObj(user) });
    })
    .get('account/password#edit', '/account/password_edit', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('account/password_edit', { formElement: buildFormObj(user) });
    })
    .get('account/destroy#form', '/account/destroy', reqAuth(router), async (ctx) => {
      const user = await User.findById(ctx.session.userId);
      ctx.render('account/destroy', { formElement: buildFormObj(user) });
    })
    .patch('account/profile#update', '/account/profile', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const user = await User.findById(ctx.session.userId);
      try {
        await user.update(form);
        logDb(`user ${user.userId} edit email to ${form.firstName}`);
        ctx.flash.set('Profile has been changed');
        ctx.redirect(router.url('account#edit'));
      } catch (e) {
        ctx.render('account/edit', { formElement: buildFormObj(form, e) });
      }
    })
    .patch('account/email#update', '/account/email', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const user = await User.findById(ctx.session.userId);
      try {
        await user.update(form);
        logDb(`user ${user.userId} edit email to ${form.email}`);
        ctx.flash.set('Email has been changed');
        ctx.redirect(router.url('account#edit'));
      } catch (e) {
        ctx.render('account/edit', { formElement: buildFormObj(form, e) });
      }
    })
    .patch('account/password#update', '/account/password', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const { oldPassword, password, confirmedPassword } = form;
      if (confirmedPassword !== password) { // null both
        ctx.flash.set('Passwords are not equal, try again');
        ctx.redirect(router.url('account/password#edit'));
        return;
      }

      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(oldPassword)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('account/password#edit'));
        return;
      }
      try {
        await user.update({ password });
        logDb(`user ${user.userId} update password from ${oldPassword} to ${password}`);
        ctx.flash.set('Password has been changed');
        ctx.redirect(router.url('account#edit'));
      } catch (e) {
        ctx.render('account/edit', { formElement: buildFormObj(form, e) });
      }
    })
    .delete('account#destroy', '/account', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const user = await User.findById(ctx.session.userId);
      if (user.passwordDigest !== encrypt(form.password)) {
        ctx.flash.set('Wrong password');
        ctx.redirect(router.url('account#edit'));
        return;
      }
      try {
        await User.destroy({ where: { id: ctx.session.userId } });
        ctx.session = {};
        ctx.flash.set(`Buy, ${user.fullName}`);
        ctx.redirect(router.url('root'));
      } catch (e) {
        logDb(e);
        ctx.render('account/edit', { formElement: buildFormObj(form, e) });
      }
    });
};
