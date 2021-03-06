import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import container from '../app/container';
import initModels from '../app/initModels';
import { initFaker, initTask, getCookieRequest } from '../app/lib/testLib';

const { User, Task, Tag } = container;
const user = initFaker();
const formAuth = {
  email: user.email,
  password: user.password,
  confirmedPassword: user.confirmedPassword,
};

const task = initTask();
const taskUpdated = initTask();

describe('task-creation', () => {
  let server;
  let cookie;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
    await initModels();
    await User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
  });

  it('GET 200 /tasks - show form tasks', async () => {
    await request.agent(server)
      .get('/tasks')
      .expect(200);
    await request.agent(server)
      .get('/tasks/new')
      .expect(302);
    await request.agent(server)
      .get('/tasks/new')
      .set('cookie', cookie)
      .expect(200);
  });

  it('GET 200 /tasks:id/ - show task', async () => {
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    await request.agent(server)
      .get('/tasks/1')
      .expect(200);
    await request.agent(server)
      .get('/tasks/1')
      .set('cookie', cookie)
      .expect(200);
  });

  it('POST 302 /tasks - add task', async () => {
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task })
      .expect(302);
    const taskDb = await Task.findById(1);
    expect(taskDb.name).toMatch(task.name);
  });

  it('POST 302 /tasks - add task with tags', async () => {
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: { ...task, tags: 'php' } })
      .expect(302);
    const tags = await Tag.findAll();
    expect(tags).toHaveLength(1);
  });

  it('POST 302 /tasks - failed add task', async () => {
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: { ...task, name: '' } })
      .expect(422);
  });

  it('GET 200 /tasks/:id/edit - show edit-form-task', async () => {
    await Task.create(task);
    await request.agent(server)
      .get('/tasks/1/edit')
      .expect(302);
    await request.agent(server)
      .get('/tasks/4/edit')
      .set('cookie', cookie)
      .expect(404);
    await request.agent(server)
      .get('/tasks/1/edit')
      .set('cookie', cookie)
      .expect(200);
  });

  it('PATCH 302 /tasks/1 - failed update task - validation', async () => {
    await Task.create(task);
    await request.agent(server)
      .patch('/tasks/1')
      .set('cookie', cookie)
      .send({ form: { ...task, name: '' } })
      .expect(422);
  });

  it('PATCH 404 /tasks/:id/edit - failed update no page', async () => {
    await Task.create(task);
    await request.agent(server)
      .patch('/tasks/4')
      .set('cookie', cookie)
      .expect(404);
  });

  it('GET 200 tasks/:id/destroy_form - show destroy-form', async () => {
    await request.agent(server)
      .get('/tasks/3/destroy_form')
      .set('cookie', cookie)
      .expect(404);
    await request.agent(server)
      .get('/tasks/1/destroy_form')
      .set('cookie', cookie)
      .expect(200);
  });

  it('PATCH 302 /tasks/1 - update task name', async () => {
    await request.agent(server)
      .patch('/tasks/1')
      .set('cookie', cookie)
      .send({ form: taskUpdated });
    const taskDb = await Task.findById(1);
    expect(taskDb.name).toMatch(taskUpdated.name);
  });

  it('PATCH 404 /tasks/1 - no update task - no page', async () => {
    await request.agent(server)
      .patch('/tasks/11')
      .set('cookie', cookie)
      .send({ form: taskUpdated })
      .expect(404);
  });

  it('PATCH 302 /tasks/1 - update tags', async () => {
    await request.agent(server)
      .patch('/tasks/1')
      .set('cookie', cookie)
      .send({ form: { ...task, tags: 'php, js' } });
    const tags = await Tag.findAll();
    expect(tags).toHaveLength(2);
  });

  it('PATCH 302 /tasks/1 - update task status', async () => {
    await request.agent(server)
      .patch('/tasks/1')
      .set('cookie', cookie)
      .send({ form: { ...task, statusId: 2 } });
    const taskDb = await Task.findById(1);
    expect(taskDb.statusId).toBe(2);
  });

  it('DELETE 302 /tasks/1/destroy - delete task', async () => {
    await request.agent(server)
      .delete('/tasks/1/destroy')
      .set('cookie', cookie);
    const isUserDel = await Task.findById(1);
    expect(isUserDel).toBeNull();
  });

  it('DELETE 302 /tasks/1/destroy - fail delete task', async () => {
    await request.agent(server)
      .delete('/tasks/1/destroy')
      .expect(302);
    const isUserDel = await Task.findById(1);
    expect(isUserDel).not.toBeNull();
  });

  it('GET 200 /tasks/?query - filter task', async () => {
    await Task.create(task);
    await request.agent(server)
      .get('/tasks?creatorId=1&assignedToId=&statusId=&tag=')
      .set('cookie', cookie)
      .expect(200);
  });

  afterEach(async () => {
    await server.close();
  });
});
