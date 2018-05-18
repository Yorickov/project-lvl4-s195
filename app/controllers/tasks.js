const getArrTags = str => str
  .split(',')
  .map(item => item.trim().toLowerCase())
  .filter(item => item);

const createQueryMapping = models =>
  ({
    creatorId: { model: models.User, as: 'creator' },
    assignedToId: { model: models.User, as: 'assignedTo' },
    statusId: { model: models.Status, as: 'status' },
    tag: { model: models.Tag },
  });

const createFilters = (propertyObject, queryMapping) =>
  Object.keys(queryMapping).map((key) => {
    const obj = propertyObject[key] ?
      { ...queryMapping[key], where: { id: propertyObject[key] } }
      : { ...queryMapping[key] };
    return obj;
  });

export default (router, container) => {
  const {
    User,
    Task,
    Status,
    Tag,
    logDb,
    logReq,
    buildFormObj,
    reqAuth,
    reqModify,
    reqEntityExists,
  } = container;
  router
    .get('tasks#index', '/tasks', async (ctx) => {
      const statuses = await Status.findAll();
      const tags = await Tag.findAll({
        include: [Task],
      });
      const users = await User.findAll();
      const { query: propertyObject } = ctx.request;
      const queryMapping = createQueryMapping({
        User,
        Task,
        Status,
        Tag,
      });
      const taskFilters = createFilters(propertyObject, queryMapping);
      const tasks = await Task.findAll({
        include: taskFilters,
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
      logReq(`task id ${task.id} created`);
      ctx.render('tasks/new', {
        formElement: buildFormObj(task),
        users,
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
    .get('tasks#show', '/tasks/:id', reqEntityExists(router, Task), async (ctx) => {
      const task = await Task.findById(ctx.params.id, {
        include: ['assignedTo', 'creator', 'status', Tag],
      });
      ctx.render('tasks/show', { task });
    })
    .post('tasks#create', '/tasks', reqAuth(router), async (ctx) => {
      const { form } = ctx.request.body;
      const { userId: creatorId } = ctx.session;
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
        logDb(`failure on create ${task.name}, err: ${e}`);
        const users = await User.findAll();
        ctx.status = 422;
        ctx.render('tasks/new', {
          formElement: buildFormObj(task, e),
          users,
        });
      }
    })
    .get('tasks#edit', '/tasks/:id/edit', reqAuth(router), reqEntityExists(router, Task), reqModify(router, Task, 'creator'), async (ctx) => {
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
    .patch('tasks#update', '/tasks/:id', reqAuth(router), reqEntityExists(router, Task), reqModify(router, Task, 'creator'), async (ctx) => {
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
        logDb(`failure on update ${task.name}, err: ${e}`);
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
    .get('tasks#destroy_form', '/tasks/:id/destroy_form', reqAuth(router), reqEntityExists(router, Task), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id);
      ctx.render('tasks/destroy', { formElement: buildFormObj(task), task });
    })
    .delete('tasks#destroy', '/tasks/:id/destroy', reqAuth(router), reqEntityExists(router, Task), reqModify(router, Task, 'creator'), async (ctx) => {
      const task = await Task.findById(ctx.params.id);
      try {
        await task.destroy();
      } catch (e) {
        logDb(`failure on delete ${task.name}, err: ${e}`);
        ctx.flash.set(`Task ${task.name} has not deleted, try again`);
        ctx.redirect(router.url('tasks#index'));
      }
      ctx.flash.set(`Task ${task.name} deleted successfully`);
      ctx.redirect(router.url('tasks#index'));
    });
};
