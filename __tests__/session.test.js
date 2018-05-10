import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import { initFaker, getCookieRequest } from '../app/lib/testLib';
import db from '../app/models';
import createTables from '../app/createTables';

const user = initFaker();

describe('session and create User', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await createTables();
  });

  beforeEach(async () => {
    server = app().listen();
    await db.User.sync({ force: true });
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

  it('GET /users/new - show sign-up form', async () => {
    const res = await request.agent(server)
      .get('/users/new');
    expect(res).toHaveHTTPStatus(200);
  });

  it('POST /users - create user', async () => { // Hide in session
    const res = await request.agent(server)
      .post('/users')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
    const userDb = await db.User.findOne({
      where: { email: user.email },
    });
    expect(user.lastName).toMatch(userDb.lastName);
  });

  it('POST /session - good sign-in', async () => {
    await db.User.create(user);
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /sesssion - sign-out', async () => {
    await db.User.create(user);
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    expect(res).toHaveHTTPStatus(302);
    const cookie = getCookieRequest(res);

    const res1 = await request.agent(server)
      .delete('/session')
      .set('Cookie', cookie);
    expect(res1).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});
