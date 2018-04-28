import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import initFaker from './utils';
import { User } from '../db/models';

describe('requests', () => {
  let server;
  let createTestObject1;
  let createTestObject2;
  let password;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    createTestObject1 = initFaker();
    createTestObject2 = initFaker();
    const obj = createTestObject2();
    password = obj.password; // eslint-disable-line
    await User.sync({ force: true });
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('sign-in form: /session/new - GET 200', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST 422 /session - wrong password sign in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: createTestObject1({ email: 'wrong email' }) });
    expect(res).toHaveHTTPStatus(422);
  });

  it('POST /session - sign-in - sign out', async () => {
    const query = request.agent(server);
    const res1 = await query
      .post('/users')
      .type('form')
      .send({ form: createTestObject1() });
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await query
      .post('/session')
      .type('form')
      .send({ form: createTestObject1({ firstName: false, lastName: false }) });
    expect(res2).toHaveHTTPStatus(302);

    const res3 = await request.agent(server)
      .get('/settings');
    expect(res3).toHaveHTTPStatus(302);

    const res4 = await request.agent(server)
      .get('/session/end');
    expect(res4).toHaveHTTPStatus(302);
  });

  it('POST /session - edit settings - delete user', async () => {
    const query = request.agent(server);
    const res1 = await query
      .post('/users')
      .type('form')
      .send({ form: createTestObject2() });
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await query
      .post('/session')
      .type('form')
      .send({ form: createTestObject2({ firstName: false, lastName: false }) });
    expect(res2).toHaveHTTPStatus(302);

    const res3 = await request.agent(server)
      .patch('/settings/edit')
      .type('form')
      .send({ form: createTestObject2({ firstName: false, lastName: false }) });
    expect(res3).toHaveHTTPStatus(302);

    const res4 = await request.agent(server)
      .patch('/settings/password')
      .type('form')
      .send({ form: createTestObject2({ oldPassword: password, password: 'hello' }) });
    expect(res4).toHaveHTTPStatus(302);

    const res5 = await request.agent(server)
      .delete('/settings')
      .type('form')
      .send({ form: createTestObject2() });
    expect(res5).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});
