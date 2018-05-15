import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import container from '../app/container';
import initModels from '../app/initModels';
import { initFaker, getCookieRequest } from '../app/lib/testLib';

const { User } = container;

const user = initFaker();
const newUserDb = initFaker();
const userDbProfile = { ...user, firstName: newUserDb.firstName, lastName: newUserDb.lastName };
const userDbEmail = { ...user, email: newUserDb.email };

describe('unauthorized forms', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
    await initModels();
    await User.create(user);
  });

  it('GET /users/:id - show profile', async () => {
    const res = await request(server)
      .get('/users/1');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /users/:id - show wrong profile', async () => {
    const res = await request(server)
      .get('/users/3');
    expect(res).toHaveHTTPStatus(200);
    expect(res.headers.location).toBeUndefined();
  });

  it('GET 200 /users - show users', async () => {
    const res = await request(server)
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
  });

  beforeEach(async () => {
    await initModels();
    server = app().listen();
    await User.create(user);
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    cookie = getCookieRequest(res);
  });

  it('GET /account/edit - show profile-edit form', async () => {
    const res = await request.agent(server)
      .get('/account/edit')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /account - show destroy form', async () => {
    const res = await request.agent(server)
      .get('/account/destroy')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET /account - show pass-edit forms', async () => {
    const res = await request(server)
      .get('/account/password_edit')
      .set('cookie', cookie);
    expect(res).toHaveHTTPStatus(200);
  });

  it('PATCH /account/email - edit email', async () => {
    const res = await request.agent(server)
      .patch('/account/email')
      .set('cookie', cookie)
      .send({ form: userDbEmail });
    expect(res).toHaveHTTPStatus(302);
    const isUserNewEmail = await User.findOne({
      where: { firstName: user.firstName },
    });
    expect(isUserNewEmail.email).toMatch(userDbEmail.email);
  });

  it('PATCH /account/profile - edit firstName', async () => {
    const res = await request.agent(server)
      .patch('/account/profile')
      .set('cookie', cookie)
      .send({ form: userDbProfile });
    expect(res).toHaveHTTPStatus(302);
    const isUserNewProfile = await User.findOne({
      where: { email: user.email },
    });
    expect(isUserNewProfile.firstName).toMatch(userDbProfile.firstName);
  });

  it('DELETE /account - failed delete user', async () => {
    const res = await request.agent(server)
      .delete('/account')
      .set('Cookie', cookie)
      .send({ form: { password: 'wrongPass' } });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await User.findOne({
      where: { email: user.email },
    });
    expect(isUser).not.toBeNull();
  });

  it('DELETE /account - delete user', async () => {
    const res = await request.agent(server)
      .delete('/account')
      .set('Cookie', cookie)
      .send({ form: { password: user.password } });
    expect(res).toHaveHTTPStatus(302);
    const isUserDel = await User.findOne({
      where: { email: user.email },
    });
    expect(isUserDel).toBeNull();
  });

  it('GET /account/edit - no sign-in profile-edit form', async () => {
    const res2 = await request.agent(server)
      .get('/account/edit');
    expect(res2).toHaveHTTPStatus(302);
  });

  it('GET /account - no sign-in destroy form', async () => {
    const res2 = await request.agent(server)
      .get('/account/destroy');
    expect(res2).toHaveHTTPStatus(302);
  });

  it('GET /account - no sign-in pass-edit form', async () => {
    const res2 = await request.agent(server)
      .get('/account/password_edit');
    expect(res2).toHaveHTTPStatus(302);
  });

  afterEach(async () => {
    await server.close();
  });
});
