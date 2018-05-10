import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import db from '../app/models';
import createTables from '../app/createTables';
import { initFaker, getCookieRequest } from '../app/lib/testLib';

const user = initFaker();
const newUserDb = initFaker();
const userDbProfile = { ...user, firstName: newUserDb.firstName, lastName: newUserDb.lastName };
const userDbEmail = { ...user, email: newUserDb.email };

describe('unauthorized forms', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await createTables();
  });

  beforeEach(async () => {
    server = app().listen();
    await db.User.sync({ force: true });
    await db.User.create(user);
  });

  it('GET /users/:id - show profile', async () => {
    const res = await request(server)
      .get('/users/1');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 200 /users - show users', async () => {
    const res = await request.agent(server)
      .get('/users');
    expect(res).toHaveHTTPStatus(200);
  });

  afterEach(async () => {
    await server.close();
  });
});

describe('account manipulations', () => {
  let server;
  let cookie;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await createTables();
  });

  beforeEach(async () => {
    server = app().listen();
    await db.User.sync({ force: true });
    await db.User.create(user);
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    cookie = getCookieRequest(res);
  });

  it('GET /account/edit - show profile-edit form', async () => {
    const res = await request(server)
      .get('/account/edit')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /account - show destroy form', async () => {
    const res = await request(server)
      .get('/account/destroy')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /account - show pass-edit forms', async () => {
    const res = await request(server)
      .get('/account/password_edit')
      .set('Cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /account/profile - edit profile', async () => {
    const res = await request.agent(server)
      .patch('/account/profile')
      .set('Cookie', cookie)
      .send({ form: userDbProfile });
    expect(res).toHaveHTTPStatus(302);
  });

  it('PATCH /account/email - edit email', async () => {
    const res = await request.agent(server)
      .patch('/account/email')
      .set('Cookie', cookie)
      .send({ form: userDbEmail });
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /account - failed delete user', async () => {
    const res = await request.agent(server)
      .delete('/account')
      .set('Cookie', cookie)
      .send({ form: { password: 'wrongPass' } });
    expect(res).toHaveHTTPStatus(302);
  });

  it('DELETE /account - delete user', async () => {
    const res = await request.agent(server)
      .delete('/account')
      .set('Cookie', cookie)
      .send({ form: { password: user.password } });
    expect(res).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});
