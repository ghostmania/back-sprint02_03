import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

describe('Auth rate limiting', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    // Сбрасывает все коллекции, включая apiRequests, чтобы окно лимита было пустым.
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it('POST -> "/auth/login": should allow 5 requests in 10s and block the 6th with 429;', async () => {
    const loginAttempt = () =>
      request(app)
        .post('/auth/login')
        .send({ loginOrEmail: 'nobody', password: 'wrong-password' });

    // Первые 5 запросов укладываются в лимит и доходят до обработчика (не 429).
    for (let i = 0; i < 5; i++) {
      const response = await loginAttempt();
      expect(response.status).not.toBe(HttpStatus.TooManyRequests);
    }

    // 6-й запрос за то же окно превышает лимит.
    await loginAttempt().expect(HttpStatus.TooManyRequests);
  });

  it('should count each URL separately: hitting the limit on one route does not block another;', async () => {
    // Исчерпываем лимит на /auth/login.
    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: 'nobody', password: 'wrong-password' });
    }

    await request(app)
      .post('/auth/login')
      .send({ loginOrEmail: 'nobody', password: 'wrong-password' })
      .expect(HttpStatus.TooManyRequests);

    // Другой URL имеет собственный счётчик и не заблокирован (не 429).
    const otherRouteResponse = await request(app)
      .post('/auth/registration-email-resending')
      .send({ email: 'someone@example.com' });

    expect(otherRouteResponse.status).not.toBe(HttpStatus.TooManyRequests);
  });
});
