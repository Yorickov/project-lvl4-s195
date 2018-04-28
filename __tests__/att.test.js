import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import initFaker from './utils';
import { User } from '../db/models';

describe('requests', () => {
  let server;
  let createTestObject;
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

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    createTestObject = initFaker();
    await User.sync({ force: true });
  });

  beforeEach(() => {
    server = app().listen();
  });

  it('GET root', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404 / = wwrong path', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(404);
  });

  it('GET /users/new - show sign-up form', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST 422 /session - wrong password sign in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: createTestObject({ email: 'wrong email' }) });
    expect(res).toHaveHTTPStatus(422);
  });

  it('POST /users, POST /session - sign-up and sign-in', async () => {
    const query = request.agent(server);
    const res1 = await query
      .post('/users')
      .type('form')
      .send({ form: createTestObject() });
    expect(res1).toHaveHTTPStatus(302);

    const res2 = await query
      .post('/session')
      .type('form')
      .send({ form: createTestObject({ firstName: false, lastName: false }) });
    expect(res2).toHaveHTTPStatus(302);
  });

  it('GET 200 /users - show users', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  // it('sign-in form: /session/new - GET 200', async () => {
  //   const res = await request.agent(server)
  //     .get('/session/new');
  //   expect(res).toHaveHTTPStatus(200);
  // });

  // it('settings: /settings - GET 302', async () => {
  //   const res = await request.agent(server)
  //     .get('/settings');
  //   expect(res).toHaveHTTPStatus(302);
  // });

  // it('sign out: /session - DELETE 302', async () => {
  //   const res = await request.agent(server)
  //     .get('/session/end');
  //   expect(res).toHaveHTTPStatus(302);
  // });

  afterEach(async () => {
    await server.close();
  });
});
