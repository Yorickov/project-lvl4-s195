import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import db from '../app/models';
import createTables from '../app/createTables';
import { initFaker, getCookieRequest } from './utils';


describe('requests', () => {
  let server;
  let userDb;
  let newUserDb;
  let cookie;
  let userDbProfile;
  let userDbEmail;
  let userDbPassword;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    await createTables();
    server = app().listen();
    userDb = initFaker()();
    newUserDb = initFaker()();
    userDbProfile = { ...userDb, firstName: newUserDb.firstName, lastName: newUserDb.lastName };
    userDbEmail = { ...userDb, email: newUserDb.email };
    userDbPassword = {
      ...userDb,
      oldPassword: userDb.password,
      password: newUserDb.password,
      confirmedPassword: newUserDb.confirmedPassword,
    };
    await db.User.create(userDb);

    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: userDb });
    cookie = getCookieRequest(res);
    expect(res).toHaveHTTPStatus(302);
  });

  it('POST /account - delete user', async () => {
    const res2 = await request.agent(server)
      .delete('/account')
      .set('cookie', cookie)
      .send({ form: { password: userDb.password } });
    expect(res2).toHaveHTTPStatus(302);
    const isUser = await db.User.findOne({
      where: { email: userDb.email },
    });
    expect(isUser).toBeNull();
  });

  it('DELETE /account - failed delete user', async () => {
    const res = await request.agent(server)
      .delete('/account')
      .set('cookie', cookie)
      .send({ form: { password: 'wrongPass' } });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await db.User.findOne({
      where: { email: userDb.email },
    });
    expect(isUser).not.toBeNull();
  });

  it('PATCH /account/profile - update profile', async () => {
    const res = await request.agent(server)
      .patch('/account/profile')
      .set('cookie', cookie)
      .send({ form: userDbProfile });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await db.User.findOne({
      where: { email: userDb.email },
    });
    expect(isUser.firstName).toMatch(userDbProfile.firstName);
    expect(isUser.lastName).toMatch(userDbProfile.lastName);
  });

  it('PATCH /account/email - update email', async () => {
    const res = await request.agent(server)
      .patch('/account/email')
      .set('cookie', cookie)
      .send({ form: userDbEmail });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await db.User.findOne({
      where: { firstName: userDb.firstName },
    });
    expect(isUser.email).toMatch(userDbEmail.email);
  });

  it('PATCH /account/password - update password', async () => {
    const res = await request.agent(server)
      .patch('/account/password')
      .set('cookie', cookie)
      .send({ form: userDbPassword });
    expect(res).toHaveHTTPStatus(302);
    // const isUser = await User.findOne({
    //   where: { email: userDb.email },
    // });
    // expect(isUser.password).toMatch(userDbPassword.password);
  });

  afterEach(async () => {
    await server.close();
  });
});
