import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

// Sequential e2e flow. Each test depends on state left by the previous one,
// so DB state is reset once in beforeAll (and not between tests).

describe('Users + Auth flow', () => {
  const app = express();
  setupApp(app);

  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;

  const userInput = {
    login: 'johndoe',
    password: 'secret123',
    email: 'john.doe@example.com',
  };

  const secondUserInput = {
    login: 'janedoe',
    password: 'secret456',
    email: 'jane.doe@example.com',
  };

  let createdUser: {
    id: string;
    login: string;
    email: string;
    createdAt: string;
  };
  let secondUser: {
    id: string;
    login: string;
    email: string;
    createdAt: string;
  };

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    if (client) {
      await client.close();
    }
  });

  it('POST -> "/users": should create new user; status 201; content: created user; used additional methods: GET => /users', async () => {
    const createResponse = await request(app)
      .post('/users')
      .set('Authorization', adminAuthHeader)
      .send(userInput)
      .expect(HttpStatus.Created);

    expect(createResponse.body).toEqual({
      id: expect.any(String),
      login: userInput.login,
      email: userInput.email,
      createdAt: expect.any(String),
    });
    expect(createResponse.body).not.toHaveProperty('password');

    createdUser = createResponse.body;

    const listResponse = await request(app).get('/users').expect(HttpStatus.Ok);
    expect(listResponse.body.items).toEqual(
      expect.arrayContaining([createdUser]),
    );
  });

  it('GET -> "/users": should return status 200; content: users array with pagination; used additional methods: POST -> /users', async () => {
    const secondResponse = await request(app)
      .post('/users')
      .set('Authorization', adminAuthHeader)
      .send(secondUserInput)
      .expect(HttpStatus.Created);

    secondUser = secondResponse.body;

    const listResponse = await request(app).get('/users').expect(HttpStatus.Ok);

    expect(listResponse.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 2,
      items: expect.arrayContaining([createdUser, secondUser]),
    });
    expect(listResponse.body.items).toHaveLength(2);
  });

  it('DELETE -> "/users/:id": should delete user by id; status 204; used additional methods: POST -> /users, GET -> /users', async () => {
    await request(app)
      .delete(`/users/${createdUser.id}`)
      .set('Authorization', adminAuthHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .delete(`/users/${secondUser.id}`)
      .set('Authorization', adminAuthHeader)
      .expect(HttpStatus.NoContent);

    const listResponse = await request(app).get('/users').expect(HttpStatus.Ok);
    expect(listResponse.body.totalCount).toBe(0);
    expect(listResponse.body.items).toEqual([]);
  });

  it('POST -> "/users": should create new user; status 201; content: created user; used additional methods: GET => /users', async () => {
    const createResponse = await request(app)
      .post('/users')
      .set('Authorization', adminAuthHeader)
      .send(userInput)
      .expect(HttpStatus.Created);

    expect(createResponse.body).toEqual({
      id: expect.any(String),
      login: userInput.login,
      email: userInput.email,
      createdAt: expect.any(String),
    });

    createdUser = createResponse.body;

    const listResponse = await request(app).get('/users').expect(HttpStatus.Ok);
    expect(listResponse.body.totalCount).toBe(1);
    expect(listResponse.body.items).toEqual([createdUser]);
  });

  it('POST -> "/auth/login": should sign in user; status 204', async () => {
    let response = await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: userInput.login,
        password: userInput.password,
      })
      .expect(HttpStatus.Ok);
    expect(response.body.accessToken).toEqual(expect.any(String));
  });

  it('POST -> "/auth/login": should return error if passed wrong login or password; status 401', async () => {
    await request(app)
      .post('/auth/login')
      .send({
        loginOrEmail: userInput.login,
        password: 'wrong-password',
      })
      .expect(HttpStatus.Unauthorized);
  });
});
