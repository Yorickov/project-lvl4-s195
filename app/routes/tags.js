import buildFormObj from '../lib/formObjectBuilder';
import { Tag, Task, User } from '../models';

import logger from '../lib/logger';

export default (router) => {
  router
    .get('tags#new', '/tags/new', async (ctx) => {
      const tags = await Tag.findAll();
      ctx.render('tags/new', { formElement: buildFormObj(tags), tags });
    })
    .post('tags#create', '/tags', async (ctx) => {
      const { form } = ctx.request.body;
      const tagDouble = await Tag.findOne({
        where: {
          name: form.name,
        },
      });
      if (tagDouble) {
        ctx.flash.set('Tag already exist');
        ctx.redirect(router.url('tags#new'));
        return;
      }
      const tag = Tag.build(form);
      logger.user(`add tag: ${tag.name}`);
      try {
        await tag.save();
        ctx.flash.set('Tag has been added successfully');
        ctx.redirect(router.url('tasks#new'));
      } catch (e) {
        ctx.status = 422;
        ctx.render('tags/create', { formElement: buildFormObj(tag, e) });
      }
    });
};
