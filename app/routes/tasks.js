import buildFormObj from '../lib/formObjectBuilder';
import { Task, User, Status, Tag } from '../models';
import { reqAuth, reqModify } from '../middlwares';
import logger from '../lib/logger';

export default (router) => {
  router
    .get('tasks#index', '/tasks', async (ctx) => { // reqAuth?
      const statuses = await Status.findAll();
      const tags = await Tag.findAll({
        include: [Task],
      });
      const users = await User.findAll();
      const tasks = await Task.findAll({
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      ctx.render('tasks', {
        tasks,
        users,
        statuses,
        tags,
      });
    })
    // .get('myTasks', '/tasks/home', (ctx) => {
    //   // const users = await User.findAll();
    //   ctx.render('tasks/home');
    // })
    .get('tasks#new', '/tasks/new', reqAuth(router), async (ctx) => {
      const task = await Task.build();
      const users = await User.findAll();
      const tags = await Tag.findAll();
      const { userId: creatorId, userProfileName: creatorName } = ctx.session;
      logger.task(creatorId, creatorName);
      ctx.render('tasks/new', {
        formElement: buildFormObj(task),
        users,
        creatorId,
        creatorName,
        tags,
      });
    })
    .get('tasks#show', '/tasks/:id', async (ctx) => {
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      ctx.render('tasks/show', { task });
    })
    .post('tasks#create', '/tasks', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const { userId: creatorId, userProfileName: creatorName } = ctx.session;
      const { tags: tagIds } = form;
      const buildForm = { ...form, creatorId };
      const task = Task.build(buildForm);
      try {
        await task.save();
        logger.task(`success: ${task}`);
        if (form.tags) {
          await Promise.all(tagIds.map(async (tagId) => {
            const tag = await Tag.findById(tagId);
            const result = await task.addTag(tag);
            return result;
          }));
        }
        ctx.flash.set(`Task ${task.name} has been created`);
        ctx.redirect(router.url('root'));
      } catch (e) {
        logger.task(`failure on create ${task.name}, err: ${e}`);
        const users = await User.findAll();
        const tags = await Tag.findAll();
        ctx.status = 422;
        ctx.render('tasks/new', {
          formElement: buildFormObj(task, e),
          users,
          creatorId,
          creatorName,
          tags,
        });
      }
    })
    .get('tasks#edit', '/tasks/:id/edit', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      const users = await User.findAll();
      const tags = await Tag.findAll({
        include: [Task],
      });
      const statuses = await Status.findAll();
      ctx.render('tasks/edit', {
        formElement: buildFormObj(task),
        users,
        statuses,
        task,
        tags,
      });
    })
    .patch('tasks#update', '/tasks/:id', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const { form } = ctx.request.body;
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      const { tags: tagIds } = form;
      try {
        await task.update(form, { where: { id: ctx.params.id } });
        if (tagIds) {
          await task.setTags([]);
          await Promise.all(tagIds.map(async (tagId) => {
            const tag = await Tag.findById(tagId);
            const result = await task.addTag(tag);
            return result;
          }));
        }
        ctx.flash.set(`Task ${task.name} updated successfully`);
        ctx.redirect(router.url('root'));
      } catch (err) {
        logger.task(`failure on update ${task.name}, err: ${err}`);
        const users = await User.findAll();
        const statuses = await Status.findAll();
        const tags = await Tag.findAll({
          include: [Task],
        });
        ctx.response.status = 422;
        ctx.render('tasks/edit', {
          formElement: buildFormObj({ ...form, id: ctx.params.id }, err),
          task,
          users,
          statuses,
          tags,
        });
      }
    })
    .delete('tasks#destroy', '/tasks/:id', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id);
      await task.destroy();
      ctx.flash.set(`Task ${task.name} deleted successfully`);
      ctx.redirect(router.url('root'));
    });
};
