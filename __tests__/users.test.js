import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import db from '../app/models';
import createTables from '../app/createTables';
import { initFaker, getCookieRequest } from '../app/lib/testLib';

describe('requests', () => {
  let server;
  let user;
  let cookie;
  let newUserDb;
  let userDbProfile;
  let userDbEmail;
  let userDbPassword;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
    await createTables();
    user = initFaker()();
    newUserDb = initFaker()();
    userDbProfile = { ...user, firstName: newUserDb.firstName, lastName: newUserDb.lastName };
    userDbEmail = { ...user, email: newUserDb.email };
  });

  beforeEach(async () => {
    server = app().listen();
  });

  it('POST /users - create user', async () => {
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

  it('GET /account_ - show account forms', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    cookie = getCookieRequest(res);

    const res1 = await request(server)
      .get('/account/edit')
      .set('cookie', cookie);
    expect(res1).toHaveHTTPStatus(200);

    const res2 = await request(server)
      .get('/account/destroy')
      .set('cookie', cookie);
    expect(res2).toHaveHTTPStatus(200);

    const res3 = await request(server)
      .get('/account/password_edit')
      .set('cookie', cookie);
    expect(res3).toHaveHTTPStatus(200);
  });

  it('POST/PATCH /account_ - edit account', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: user });
    cookie = getCookieRequest(res);

    const res2 = await request.agent(server)
      .patch('/account/profile')
      .set('cookie', cookie)
      .send({ form: userDbProfile });
    expect(res2).toHaveHTTPStatus(302);
    const isUserNewProfile = await db.User.findOne({
      where: { email: user.email },
    });
    expect(isUserNewProfile.firstName).toMatch(userDbProfile.firstName);

    const res3 = await request.agent(server)
      .patch('/account/email')
      .set('cookie', cookie)
      .send({ form: userDbEmail });
    expect(res3).toHaveHTTPStatus(302);
    const isUserNewEmail = await db.User.findOne({
      where: { firstName: user.firstName },
    });
    expect(isUserNewEmail.email).toMatch(userDbEmail.email);
  });

  it('DELETE /account - failed/success delete user', async () => {
    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: userDbEmail });
    cookie = getCookieRequest(res);

    const res2 = await request.agent(server)
      .delete('/account')
      .set('cookie', cookie)
      .send({ form: { password: 'wrongPass' } });
    expect(res2).toHaveHTTPStatus(302);
    const isUser = await db.User.findOne({
      where: { email: userDbEmail.email },
    });
    expect(isUser).not.toBeNull();

    const res3 = await request.agent(server)
      .delete('/account')
      .set('cookie', cookie)
      .send({ form: { password: userDbEmail.password } });
    expect(res3).toHaveHTTPStatus(302);
    const isUserDel = await db.User.findOne({
      where: { email: userDbEmail.email },
    });
    expect(isUserDel).toBeNull();
  });

  afterEach(async () => {
    await server.close();
  });
});
