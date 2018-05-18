import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import { initFaker, getCookieRequest } from '../app/lib/testLib';
import container from '../app/container';
import initModels from '../app/initModels';

const user = initFaker();
const { User } = container;

describe('session and create User', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await initModels();
  });

  beforeEach(async () => {
    server = app().listen();
    await User.sync({ force: true });
  });

  it('sign-in form', async () => {
    const res = await request.agent(server)
      .get('/session/new');
    expect(res).toHaveHTTPStatus(200);
    const res2 = await request.agent(server)
      .get('/users/new');
    expect(res2).toHaveHTTPStatus(200);
  });

  it('POST 422 /session - wrong email sign-in', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { ...user, email: 'email' } });
    expect(res).toHaveHTTPStatus(422);
    const res2 = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: { ...user, password: 'pass' } });
    expect(res2).toHaveHTTPStatus(422);
  });

  it('POST /users - create user', async () => {
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
    const userDb = await User.findOne({
      where: { email: user.email },
    });
    expect(user.lastName).toMatch(userDb.lastName);
  });

  it('POST /session - good sign-in', async () => {
    await User.create(user);
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    expect(res.headers.location).toBe('/');
  });

  it('DELETE /sesssion - sign-out', async () => {
    await User.create(user);
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
    const cookie = getCookieRequest(res);
    const res1 = await request.agent(server)
      .delete('/session')
      .set('Cookie', cookie);
    expect(res1.headers.location).toBe('/');
  });

  afterEach(async () => {
    await server.close();
  });
});
