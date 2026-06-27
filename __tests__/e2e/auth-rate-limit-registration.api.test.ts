import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

jest.mock('../../src/auth/adapters/nodemailer.service', () => ({
  nodemailerService: {
    sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

// The rate-limit window is 10s; wait slightly longer so it fully expires.
const WAIT_FOR_WINDOW_MS = 10_500;
const TEST_TIMEOUT_MS = 30_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('IP restriction on registration endpoints (Homework 9)', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  it(
    'POST /auth/registration: 429 after more than 5 requests in 10s, 204 after waiting',
    async () => {
      // 5 valid registrations succeed within the window.
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/auth/registration')
          .send({
            login: `user${i}`,
            password: 'pass1234',
            email: `user${i}@example.com`,
          })
          .expect(HttpStatus.NoContent);
      }

      // The 6th request within the same window is rate-limited.
      await request(app)
        .post('/auth/registration')
        .send({
          login: 'user5',
          password: 'pass1234',
          email: 'user5@example.com',
        })
        .expect(HttpStatus.TooManyRequests);

      // After the window expires, a fresh valid request succeeds again.
      await wait(WAIT_FOR_WINDOW_MS);

      await request(app)
        .post('/auth/registration')
        .send({
          login: 'user6',
          password: 'pass1234',
          email: 'user6@example.com',
        })
        .expect(HttpStatus.NoContent);
    },
    TEST_TIMEOUT_MS,
  );

  it(
    'POST /auth/registration-email-resending: 429 after more than 5 requests in 10s, 204 after waiting',
    async () => {
      // Register an unconfirmed user so resending returns 204.
      await request(app)
        .post('/auth/registration')
        .send({
          login: 'resend',
          password: 'pass1234',
          email: 'resend@example.com',
        })
        .expect(HttpStatus.NoContent);

      const resend = () =>
        request(app)
          .post('/auth/registration-email-resending')
          .send({ email: 'resend@example.com' });

      // 5 resends succeed within the window.
      for (let i = 0; i < 5; i++) {
        await resend().expect(HttpStatus.NoContent);
      }

      // The 6th request within the same window is rate-limited.
      await resend().expect(HttpStatus.TooManyRequests);

      // After the window expires, a fresh request succeeds again.
      await wait(WAIT_FOR_WINDOW_MS);

      await resend().expect(HttpStatus.NoContent);
    },
    TEST_TIMEOUT_MS,
  );
});
