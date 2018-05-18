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

  it('GET /account/edit - no sign-in forms', async () => {
    await request.agent(server)
      .get('/account/edit')
      .expect(302);
    await request.agent(server)
      .get('/account/destroy')
      .expect(302);
    await request.agent(server)
      .get('/account/password_edit')
      .expect(302);
    await request.agent(server)
      .get('/account/password_edit')
      .expect(302);
  });

  it('GET /users/:id - show users', async () => {
    await request(server)
      .get('/users/1')
      .expect(200);
    await request(server)
      .get('/users')
      .expect(200);
  });

  it('GET /users/:id - show wrong profile', async () => {
    const res = await request(server)
      .get('/users/3');
    expect(res).toHaveHTTPStatus(404);
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

  it('GET /account_ - show account-edit forms', async () => {
    await request.agent(server)
      .get('/account/edit')
      .set('cookie', cookie)
      .expect(200);
    await request.agent(server)
      .get('/account/destroy')
      .set('cookie', cookie)
      .expect(200);
    await request(server)
      .get('/account/password_edit')
      .set('cookie', cookie)
      .expect(200);
  });

  it('PATCH /account/email - edit email', async () => {
    await request.agent(server)
      .patch('/account/email')
      .set('cookie', cookie)
      .send({ form: userDbEmail });
    const isUserNewEmail = await User.findOne({
      where: { firstName: user.firstName },
    });
    expect(isUserNewEmail.email).toMatch(userDbEmail.email);
  });

  it('PATCH /account/profile - edit firstName', async () => {
    await request.agent(server)
      .patch('/account/profile')
      .set('cookie', cookie)
      .send({ form: userDbProfile });
    const isUserNewProfile = await User.findOne({
      where: { email: user.email },
    });
    expect(isUserNewProfile.firstName).toMatch(userDbProfile.firstName);
  });

  it('DELETE /account - failed delete user', async () => {
    await request.agent(server)
      .delete('/account')
      .set('Cookie', cookie)
      .send({ form: { password: 'wrongPass' } });
    const isUser = await User.findOne({
      where: { email: user.email },
    });
    expect(isUser).not.toBeNull();
  });

  it('DELETE /account - delete user', async () => {
    await request.agent(server)
      .delete('/account')
      .set('Cookie', cookie)
      .send({ form: { password: user.password } });
    const isUserDel = await User.findOne({
      where: { email: user.email },
    });
    expect(isUserDel).toBeNull();
  });

  afterEach(async () => {
    await server.close();
  });
});
