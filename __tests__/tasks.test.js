import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import db from '../app/models';
import createTables from '../app/createTables';
import { initFaker, initTask, getCookieRequest } from '../app/lib/testLib';

const user = initFaker();
const formAuth = {
  email: user.email,
  password: user.password,
  confirmedPassword: user.confirmedPassword,
};

const user2 = initFaker();
const formAuth2 = {
  email: user2.email,
  password: user2.password,
  confirmedPassword: user2.confirmedPassword,
};

const task = initTask();
const taskUpdated = initTask();

describe('basic operations', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
    await createTables();
  });

  it('GET 200 /tasks - show all tasks', async () => {
    const res = await request.agent(server)
      .get('/tasks')
      .expect(200);
  });

  it('GET 200 /tasks/new - failed auth - form-add-task', async () => {
    await request.agent(server)
      .get('/tasks/new')
      .expect(302);
  });

  it('GET 200 /tasks/new - show form-add-task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .get('/tasks/new')
      .set('cookie', cookie)
      .expect(200);
  });

  it('GET 200 /tasks:id/ - show task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    await request.agent(server)
      .get('/tasks/1')
      .expect(200);
  });

  it('GET 200 /tasks:id/ - now such a task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    await request.agent(server)
      .get('/tasks/3')
      .expect(404);
  });

  afterEach(async () => {
    await server.close();
  });
});

describe('task-creation', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
    await createTables();
  });

  it('POST 302 /tasks - add task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    const res = await request.agent(server) //
      .get('/tasks/new')
      .set('cookie', cookie)
      .expect(200);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task })
      .expect(302);
    await request.agent(server)
      .get('/tasks/1')
      .set('cookie', cookie)
      .expect(200);
  });

  it('POST 302 /tasks - failed add task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    const res = await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: { ...task, name: 'q' } })
      .expect(422);
  });

  // it('GET 200 /tasks - show task', async () => {
  //   await db.User.create(user);
  //   await db.Task.create(task);
  //   const auth = await request.agent(server)
  //     .post('/session')
  //     .type('form')
  //     .send({ form: formAuth });
  //   const cookie = getCookieRequest(auth);
  //   await request.agent(server)
  //     .get('/tasks/1')
  //     .set('cookie', cookie)
  //     .expect(200);
  // });

  it('GET 200 /tasks/:id/edit - no sign-in: edit-task-form', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    const res = await request.agent(server)
      .get('/tasks/1/edit')
      .expect(302);
  });

  it('GET 200 /tasks/:id/edit - 404: edit-task-form', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    const res = await request.agent(server)
      .get('/tasks/3/edit')
      .set('cookie', cookie)
      .expect(404);
  });

  it('GET 200 /tasks/:id/edit - show edit-form-task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task })
      .expect(302);
    await request.agent(server)
      .get('/tasks/1/edit')
      .set('cookie', cookie)
      .expect(200);
  });

  it('PATCH 302 /tasks/1 - failed update task - validation', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task })
      .expect(302);
    const res = await request.agent(server)
      .patch('/tasks/1')
      .set('cookie', cookie)
      .send({ form: { task, name: 'q' } })
      .expect(422);
  });

  it('PATCH 302 /tasks/1 - update task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task })
      .expect(302);
    await request.agent(server)
      .patch('/tasks/1')
      .set('cookie', cookie)
      .send({ form: taskUpdated })
      .expect(302);
  });

  // it('DELETE 302 /tasks/1 - delete task - validation', async () => {
  //   const res = await request.agent(server)
  //     .delete('/tasks/1')
  //     .set('cookie', cookie)
  //     .send({ form: { ...taskUpdated, name: 'q' } })
  //     .expect(422);
  // }); // add mw - exist!

  it('DELETE 302 /tasks/1 - delete task', async () => {
    await db.User.create(user);
    const auth = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: formAuth });
    const cookie = getCookieRequest(auth);
    await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task })
      .expect(302);
    const res = await request.agent(server)
      .delete('/tasks/1')
      .set('cookie', cookie)
      .send({ form: taskUpdated })
      .expect(302);
  });

  afterEach(async () => {
    await server.close();
  });
});

