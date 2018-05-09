import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import db from '../app/models';
import createTables from '../app/createTables';
import { initFaker, initTask, getCookieRequest } from './utils';

describe('requests', () => {
  let server;
  let user;
  let task;
  let cookie;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await createTables();
    user = initFaker()();
    await db.User.create(user);
  });

  beforeEach(async () => {
    server = app().listen();
    task = initTask();
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    cookie = getCookieRequest(res);
  });

  it('GET 200 /tasks - show all tasks', async () => {
    const res = await request.agent(server)
      .get('/tasks');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 200 /tasks/new - show form add task', async () => {
    const res = await request.agent(server)
      .get('/tasks/new')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST 302 /tasks - add task', async () => {
    const res = await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    expect(res).toHaveHTTPStatus(302);
  });

  it('GET 200 /tasks - show task', async () => {
    const res = await request.agent(server)
      .get('/tasks/1');
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach(async () => {
    await server.close();
  });
});
