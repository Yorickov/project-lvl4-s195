import buildFormObj from '../lib/formObjectBuilder';
import { reqAuth, reqModify } from '../lib/middlwares';
import logger from '../lib/logger';

const getArrTags = str => str
  .split(' ')
  .map(item => item.trim().toLowerCase())
  .filter(item => item);

const createProprtyObject = query =>
  Object.keys(query).reduce((acc, id) => {
    const prop = query[id] ? query[id] : '';
    return { ...acc, [id]: prop };
  }, {});

const createFilter = (propertyObject, model, property, as) =>
  (propertyObject[property] ?
    { model, as, where: { id: propertyObject[property] } } :
    { model, as });

export default (router, container) => {
  const {
    User,
    Task,
    Status,
    Tag,
  } = container;
  router
    .get('tasks#index', '/tasks', async (ctx) => {
      const statuses = await Status.findAll();
      const tags = await Tag.findAll({
        include: [Task],
      });
      const users = await User.findAll();
      const { query } = ctx.request;
      const propertyObject = createProprtyObject(query);
      const assignFilter = createFilter(propertyObject, User, 'assignedToId', 'assignedTo');
      const creatorFilter = createFilter(propertyObject, User, 'creatorId', 'creator');
      const statusFilter = createFilter(propertyObject, Status, 'statusId', 'status');
      const tagFilter = createFilter(propertyObject, Tag, 'tag');
      const tasks = await Task.findAll({
        include: [assignFilter, creatorFilter, statusFilter, tagFilter],
      });
      ctx.render('tasks', {
        propertyObject,
        tasks,
        users,
        statuses,
        tags,
      });
    })
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
    .get('tasks#home', '/tasks/home', reqAuth(router), async (ctx) => {
      const creatorFilter = { model: User, as: 'creator', where: { id: ctx.session.userId } };
      const assigneeFilter = { model: User, as: 'assignedTo', where: { id: ctx.session.userId } };
      const tasksCreated = await Task.findAll({
        include: ['assignedTo', creatorFilter, 'status'],
      });
      const tasksAssigned = await Task.findAll({
        include: ['creator', assigneeFilter, 'status'],
      });
      ctx.render('tasks/home', { tasksCreated, tasksAssigned });
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
        ctx.redirect(router.url('tasks#index'));
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
        ctx.redirect(router.url('tasks#index'));
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
