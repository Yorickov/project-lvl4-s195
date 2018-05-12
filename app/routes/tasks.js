import buildFormObj from '../lib/formObjectBuilder';
import { Task, User, Status, Tag } from '../models';
import { reqAuth, reqModify, reqTask } from '../middlwares';
import logger from '../lib/logger';

const getArrTags = str =>
  str
    .split(' ').map(item => item.trim().toLowerCase())
    .filter(item => item);

export default (router) => {
  router
    .get('tasks#index', '/tasks', async (ctx) => {
      const statuses = await Status.findAll();
      const tags = await Tag.findAll({
        include: [Task],
      });
      const users = await User.findAll();
      const tasks = await Task.findAll({
        include: ['assignedTo', 'creator', 'status', Tag], // include all
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
    .get('tasks#show', '/tasks/:id', reqTask(router, Task), async (ctx) => {
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      ctx.render('tasks/show', { task });
    })
    .post('tasks#create', '/tasks', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const { userId: creatorId, userProfileName: creatorName } = ctx.session;
      const buildForm = { ...form, creatorId };
      const task = Task.build(buildForm);
      try {
        await task.save();
        if (form.tags) {
          const tags = getArrTags(form.tags);
          await Promise.all(tags.map(async (tag) => {
            const item = await Tag.findOne({ where: { name: tag } });
            if (item) {
              await task.addTag(item);
            } else {
              await task.createTag({ name: tag });
            }
          }));
        }
        ctx.flash.set(`Task ${task.name} has been created`);
        ctx.redirect(router.url('tasks#new'));
      } catch (e) {
        logger.task(`failure on create ${task.name}, err: ${e}`);
        const users = await User.findAll();
        ctx.status = 422;
        ctx.render('tasks/new', {
          formElement: buildFormObj(task, e),
          users,
          creatorId,
          creatorName,
        });
      }
    })
    .get('tasks#edit', '/tasks/:id/edit', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      const users = await User.findAll();
      const statuses = await Status.findAll();
      ctx.render('tasks/edit', {
        formElement: buildFormObj(task),
        users,
        statuses,
        task,
      });
    })
    .patch('tasks#update', '/tasks/:id', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const { form } = ctx.request.body;
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      try {
        await task.update(form, { where: { id: ctx.params.id } });
        if (form.tagsdel) {
          const tagsToDelete = getArrTags(form.tagsdel);
          await Promise.all(tagsToDelete.map(async (tag) => {
            const item = await Tag.findOne({ where: { name: tag } });
            task.removeTag(item);
          }));
        }
        if (form.tags) {
          const tags = getArrTags(form.tags);
          await Promise.all(tags.map(async (tag) => {
            const item = await Tag.findOne({ where: { name: tag } });
            if (item) {
              await task.addTag(item);
            } else {
              await task.createTag({ name: tag });
            }
          }));
        }
        ctx.flash.set(`Task ${task.name} updated successfully`);
        ctx.redirect(router.url('root'));
      } catch (e) {
        logger.task(`failure on update ${task.name}, err: ${e}`);
        const users = await User.findAll();
        const statuses = await Status.findAll();
        ctx.status = 422;
        ctx.render('tasks/edit', {
          formElement: buildFormObj(form, e),
          task,
          users,
          statuses,
        });
      }
    })
    .get('tasks#destroy_form', '/tasks/:id/destroy_form', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id);
      ctx.render('tasks/destroy', { formElement: buildFormObj(task), task });
    })
    .delete('tasks#destroy', '/tasks/:id/destroy', reqAuth(router), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id);
      try {
        await task.destroy();
      } catch (e) {
        logger.task(`failure on delete ${task.name}, err: ${e}`);
        ctx.flash.set(`Task ${task.name} has not deleted, try again`);
        ctx.redirect(router.url('tasks#index'));
      }
      ctx.flash.set(`Task ${task.name} deleted successfully`);
      ctx.redirect(router.url('tasks#index'));
    });
};