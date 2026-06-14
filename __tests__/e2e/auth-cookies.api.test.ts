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

describe('Auth cookies flow', () => {
  const app = express();
  setupApp(app);

  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;

  const userInput = {
    login: 'cookieuser',
    password: 'pass1234',
    email: 'cookieuser@example.com',
  };

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
    await request(app)
      .post('/users')
      .set('Authorization', adminAuthHeader)
      .send(userInput)
      .expect(HttpStatus.Created);
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  const login = () =>
    request(app)
      .post('/auth/login')
      .send({ loginOrEmail: userInput.login, password: userInput.password });

  function getSetCookieHeaders(res: request.Response): string[] {
    const raw = res.headers['set-cookie'];
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }

  function extractRefreshToken(loginRes: request.Response): string {
    const entry = getSetCookieHeaders(loginRes).find((c) =>
      c.startsWith('refreshToken='),
    );
    if (!entry) throw new Error('refreshToken cookie not set');
    return entry.split(';')[0].replace('refreshToken=', '');
  }

  describe('POST /auth/login', () => {
    it('returns accessToken in body and refreshToken in httpOnly cookie; status 200', async () => {
      const res = await login().expect(HttpStatus.Ok);

      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');

      const rtCookie = getSetCookieHeaders(res).find((c) =>
        c.startsWith('refreshToken='),
      );
      expect(rtCookie).toBeDefined();
      expect(rtCookie).toMatch(/HttpOnly/i);
    });

    it('returns 401 for wrong password', async () => {
      await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: userInput.login, password: 'wrong' })
        .expect(HttpStatus.Unauthorized);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('returns new accessToken in body and new refreshToken cookie; status 200', async () => {
      const loginRes = await login().expect(HttpStatus.Ok);
      const refreshToken = extractRefreshToken(loginRes);

      const refreshRes = await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.Ok);

      expect(refreshRes.body).toHaveProperty('accessToken');

      const newRtCookie = getSetCookieHeaders(refreshRes).find((c) =>
        c.startsWith('refreshToken='),
      );
      expect(newRtCookie).toBeDefined();

      const newRefreshToken = newRtCookie!
        .split(';')[0]
        .replace('refreshToken=', '');
      expect(newRefreshToken).not.toBe(refreshToken);
    });

    it('returns 401 when using the same refreshToken twice (one-time use)', async () => {
      const loginRes = await login().expect(HttpStatus.Ok);
      const refreshToken = extractRefreshToken(loginRes);

      await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.Ok);

      await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.Unauthorized);
    });

    it('returns 401 when no cookie is sent', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .expect(HttpStatus.Unauthorized);
    });
  });

  describe('POST /auth/logout', () => {
    it('returns 204 and clears cookie on valid refreshToken', async () => {
      const loginRes = await login().expect(HttpStatus.Ok);
      const refreshToken = extractRefreshToken(loginRes);

      const logoutRes = await request(app)
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NoContent);

      const rtCookie = getSetCookieHeaders(logoutRes).find((c) =>
        c.startsWith('refreshToken='),
      );
      expect(rtCookie).toMatch(/refreshToken=;/);
    });

    it('returns 401 after logout when trying to refresh', async () => {
      const loginRes = await login().expect(HttpStatus.Ok);
      const refreshToken = extractRefreshToken(loginRes);

      await request(app)
        .post('/auth/logout')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.NoContent);

      await request(app)
        .post('/auth/refresh-token')
        .set('Cookie', `refreshToken=${refreshToken}`)
        .expect(HttpStatus.Unauthorized);
    });

    it('returns 401 when no cookie is sent', async () => {
      await request(app).post('/auth/logout').expect(HttpStatus.Unauthorized);
    });
  });

  describe('GET /auth/me', () => {
    it('returns { email, login, userId } for a valid accessToken; status 200', async () => {
      const loginRes = await login().expect(HttpStatus.Ok);
      const accessToken = loginRes.body.accessToken as string;

      const meRes = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.Ok);

      expect(meRes.body).toEqual({
        email: userInput.email,
        login: userInput.login,
        userId: expect.any(String),
      });
    });

    it('returns 401 when no Authorization header is sent', async () => {
      await request(app).get('/auth/me').expect(HttpStatus.Unauthorized);
    });
  });
});
