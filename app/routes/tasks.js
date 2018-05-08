import buildFormObj from '../lib/formObjectBuilder';
import { Task, User, Status, Tag } from '../models';
import { reqAuth } from '../middlwares';
import logger from '../lib/logger';

export default (router) => {
  router
    .get('tasks#index', '/tasks', reqAuth(router), async (ctx) => {
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
    // .get('unoTask', '/tasks/:id', async (ctx) => {
    //   // const users = await User.findAll();
    //   // logger.user(`users id: ${Object.keys(users)}`);
    //   const { id } = ctx.params;
    //   const task = { id, title: 'a', content: 'dddddddd' };
    //   ctx.render('tasks/task', { task });
    // })
    .get('tasks#show', '/tasks/:id', reqAuth(router), async (ctx) => {
      const task = await Task.findById(ctx.params.id);
      if (!task) {
        ctx.flash.set('Not such a user');
        ctx.redirect(router.url('root'));
        return;
      }
      ctx.render('task/show', { formElement: buildFormObj(task) });
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
        await Promise.all(tagIds.map(async (tagId) => {
          const tag = await Tag.findById(tagId);
          const result = await task.addTag(tag);
          return result;
        }));
        ctx.flash.set(`Task ${task.name} has been created`);
        ctx.redirect(router.url('root'));
      } catch (e) {
        const users = await User.findAll();
        const tags2 = await Tag.findAll();
        ctx.status = 422;
        ctx.render('tasks/new', {
          formElement: buildFormObj(task, e),
          users,
          creatorId,
          creatorName,
          tags2,
        });
      }
    });
};
