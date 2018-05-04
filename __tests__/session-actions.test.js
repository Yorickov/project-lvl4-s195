import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import { initFaker, getCookieRequest } from './utils';
import { User } from '../app/models';

describe('requests', () => {
  let server;
  let user;
  let cookie;

  beforeAll(() => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
    user = initFaker()();
    await User.sync({ force: true });
    await User.create(user);

    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    cookie = getCookieRequest(res);
  });

  it('GET /settings - show settings', async () => {
    const res = await request(server)
      .get('/settings')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /users/:id - show profile', async () => {
    const res = await request(server)
      .get('/users/1')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /access - show account', async () => {
    const res = await request(server)
      .get('/settings/account')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /access - show password', async () => {
    const res = await request(server)
      .get('/settings/password')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('DELETE /sesssion - sign-out', async () => {
    const res = await request(server)
      .delete('/session')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});
