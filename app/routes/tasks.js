export default (router) => {
  router
    .get('tasks', '/tasks', (ctx) => {
      // const users = await User.findAll();
      // logger.user(`users id: ${Object.keys(users)}`);
      const tasks = [
        { id: 1, title: 'a', content: 'dddddddd' },
        { id: 2, title: 'b', content: 'ssssssss' },
        { id: 3, title: 'c', content: 'ggggggg' },
      ];
      ctx.render('tasks', { tasks });
    })
    .get('myTasks', '/tasks/home', (ctx) => {
      // const users = await User.findAll();
      // logger.user(`users id: ${Object.keys(users)}`);
      ctx.render('tasks/home');
    })
    .get('newTask', '/tasks/new', (ctx) => {
      // const users = await User.findAll();
      // logger.user(`users id: ${Object.keys(users)}`);
      ctx.render('tasks/new');
    })
    .get('unoTask', '/tasks/:id', async (ctx) => {
      // const users = await User.findAll();
      // logger.user(`users id: ${Object.keys(users)}`);
      const { id } = ctx.params;
      const task = { id, title: 'a', content: 'dddddddd' };
      ctx.render('tasks/task', { task });
    });
};
