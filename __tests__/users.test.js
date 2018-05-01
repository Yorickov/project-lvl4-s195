import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';
import { initFaker, getCookieRequest } from './utils';
import { User } from '../db/models';

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
    await User.sync({ force: true });
    await User.create(userDb);

    const res = await request.agent(server)
      .post('/session')
      .type('form')
      .send({ form: userDb });
    cookie = getCookieRequest(res);
    expect(res).toHaveHTTPStatus(302);
  });

  it('POST /settings - delete user', async () => {
    const res2 = await request.agent(server)
      .delete('/settings')
      .set('cookie', cookie)
      .send({ form: { password: userDb.password } });
    expect(res2).toHaveHTTPStatus(302);
    const isUser = await User.findOne({
      where: { email: userDb.email },
    });
    expect(isUser).toBeNull();
  });

  it('POST /settings - failed delete user', async () => {
    const res = await request.agent(server)
      .delete('/settings')
      .set('cookie', cookie)
      .send({ form: { password: 'wrongPass' } });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await User.findOne({
      where: { email: userDb.email },
    });
    expect(isUser).not.toBeNull();
  });

  it('PATCH /settings/profile - update profile', async () => {
    const res = await request.agent(server)
      .patch('/settings/profile')
      .set('cookie', cookie)
      .send({ form: userDbProfile });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await User.findOne({
      where: { email: userDb.email },
    });
    expect(isUser.firstName).toMatch(userDbProfile.firstName);
    expect(isUser.lastName).toMatch(userDbProfile.lastName);
  });

  it('PATCH /settings/email - update email', async () => {
    const res = await request.agent(server)
      .patch('/settings/email')
      .set('cookie', cookie)
      .send({ form: userDbEmail });
    expect(res).toHaveHTTPStatus(302);
    const isUser = await User.findOne({
      where: { firstName: userDb.firstName },
    });
    expect(isUser.email).toMatch(userDbEmail.email);
  });

  it('PATCH /settings/password - update password', async () => {
    const res = await request.agent(server)
      .patch('/settings/password')
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
