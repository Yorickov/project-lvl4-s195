import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import { initFaker } from './utils';
import { User } from '../db/models';

describe('requests', () => {
  let server;
  let user;

  beforeAll(() => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
    user = initFaker()();
    await User.sync({ force: true });
    await User.create(user);
  });

  it('sign-in form: /session/new - GET 200', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST 422 /session - wrong email sign-in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { ...user, email: 'email' } });
    expect(res).toHaveHTTPStatus(422);
  });

  it('POST 422 /session - wrong password sign-in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { ...user, password: 'pass' } });
    expect(res).toHaveHTTPStatus(422);
  });

  it('POST /session - good sign-in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});
