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

  it('GET /account/edit - show account', async () => {
    const res = await request(server)
      .get('/account/edit')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /users/:id - show profile', async () => {
    const res = await request(server)
      .get('/users/1')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /account/destroy - show account_destroy form', async () => {
    const res = await request(server)
      .get('/account/destroy')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /account/password_edit - show password_edit form', async () => {
    const res = await request(server)
      .get('/account/password_edit')
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
