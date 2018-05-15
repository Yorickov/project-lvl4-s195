import request from 'supertest';
import matchers from 'jest-supertest-matchers';

import app from '../app';

describe('basic requests', () => {
  let server;

  beforeAll(async () => {
    jasmine.addMatchers(matchers);
  });

  beforeEach(async () => {
    server = app().listen();
  });

  it('GET root', async () => {
    const res = await request.agent(server)
      .get('/');
    expect(res).toHaveHTTPStatus(200);
  });

  it('GET 404 / = wwrong path', async () => {
    const res = await request.agent(server)
      .get('/wrong-path');
    expect(res).toHaveHTTPStatus(200);
    expect(res.headers.location).toBeUndefined();
  });

  afterEach(async () => {
    await server.close();
  });
});
