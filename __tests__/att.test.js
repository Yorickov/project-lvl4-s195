import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import { logger } from '../app/container';
import app from '../app';
import initFaker from './utils';
import User from '../db/models';

describe('requests', () => {
  let server;
  const createTestObject = initFaker();
  // const loginUser = (login, done) => {
  //   const agent = request.agent(server);
  //   agent
  //     .post('/login')
  //     .send(createTestObject(login))
  //     .end((err, res) => {
  //       if (err) throw err;
  //       return done(agent);
  //     });
  // };

  beforeAll(() => {
    jasmine.addMatchers(matchers);
    server = app().listen();
  });

  it('root: / - GET 200', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('wrong path - GET 404', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  it('sign-up form: /users/new - GET 200', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('sign-up: /users/new - POST 302', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: createTestObject() });
    expect(res).toHaveHTTPStatus(302);
  });

  it('all users: /users - GET 200', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  it('sign-in form: /session/new - GET 200', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('wrong password sign in: /session - POST 422', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: createTestObject({ email: 'wrong email' }) });
    expect(res).toHaveHTTPStatus(422);
  });

  it('sign in: /session - POST 302', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: createTestObject({ firstName: false, lastName: false }) });
    expect(res).toHaveHTTPStatus(302);
  });

  // it('settings: /settings - GET 302', async () => {
  //   const res = await request.agent(server)
  //     .get('/settings');
  //   expect(res).toHaveHTTPStatus(302);
  // });

  it('sign out: /session - DELETE 302', async () => {
    const res = await request.agent(server)
      .delete('/session');
    expect(res).toHaveHTTPStatus(302);
  });

  afterAll(async () => {
    server.close();
  });
});
