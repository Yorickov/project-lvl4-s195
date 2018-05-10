import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import db from '../app/models';
import createTables from '../app/createTables';
import { initFaker, initTask, getCookieRequest } from '../app/lib/testLib';

const user = initFaker();
const task = initTask();

describe('task operations', () => {
  let server;
  let cookie;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await createTables();
    await db.User.create(user);
  });

  beforeEach(async () => {
    server = app().listen();
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

  it('POST 302 /tasks - add task', async () => {
    const res = await request.agent(server)
      .post('/tasks')
      .set('cookie', cookie)
      .send({ form: task });
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});

// describe('task operations-2', () => {
//   let server;
//   let cookie;

//   beforeAll(async () => {
//     jasmine.addMatchers(matchers);
//     await createTables();
//     await db.User.create(user);
//   });

//   beforeEach(async () => {
//     server = app().listen();
//     const res = await request(server)
//       .post('/session')
//       .type('form')
//       .send({ form: user });
//     cookie = getCookieRequest(res);
//   });

//   it('GET 200 /tasks/new - show form add task', async () => {
//     const res1 = await request(server)
//       .get('/tasks/new')
//       .set('cookie', cookie);
//     expect(res1).toHaveHTTPStatus(200);
//   });

//   it('GET 200 /tasks - show task', async () => {
//     const res2 = await request(server)
//       .post('/tasks')
//       .set('cookie', cookie)
//       .send({ form: task });
//     const res3 = await request(server)
//       .get('/tasks/1');
//     expect(res3).toHaveHTTPStatus(200);
//   });

//   afterEach((done) => {
//     server.close();
//     done();
//   });
// });
