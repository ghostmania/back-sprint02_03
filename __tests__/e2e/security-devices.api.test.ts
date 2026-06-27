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

describe('Security devices', () => {
  const app = express();
  setupApp(app);

  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;

  const userInput = {
    login: 'deviceuser',
    password: 'pass1234',
    email: 'deviceuser@example.com',
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

  const loginWith = (userAgent: string) =>
    request(app)
      .post('/auth/login')
      .set('User-Agent', userAgent)
      .send({ loginOrEmail: userInput.login, password: userInput.password });

  const refreshTokenFrom = (res: request.Response): string => {
    const raw = res.headers['set-cookie'];
    const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const entry = cookies.find((c) => c.startsWith('refreshToken='));
    if (!entry) throw new Error('refreshToken cookie not set');
    return entry.split(';')[0].replace('refreshToken=', '');
  };

  it('GET /security/devices: returns all active sessions of the user; status 200', async () => {
    const rt1 = refreshTokenFrom(
      await loginWith('Chrome').expect(HttpStatus.Ok),
    );
    await loginWith('Firefox').expect(HttpStatus.Ok);
    await loginWith('Safari').expect(HttpStatus.Ok);

    const res = await request(app)
      .get('/security/devices')
      .set('Cookie', `refreshToken=${rt1}`)
      .expect(HttpStatus.Ok);

    expect(res.body).toHaveLength(3);
    expect(res.body[0]).toEqual({
      ip: expect.any(String),
      title: expect.any(String),
      lastActiveDate: expect.any(String),
      deviceId: expect.any(String),
    });
    expect(res.body.map((d: { title: string }) => d.title)).toEqual(
      expect.arrayContaining(['Chrome', 'Firefox', 'Safari']),
    );
  });

  it('GET /security/devices: returns 401 without a refreshToken cookie', async () => {
    await request(app).get('/security/devices').expect(HttpStatus.Unauthorized);
  });

  it('DELETE /security/devices: terminates all sessions except the current one; status 204', async () => {
    const rt1 = refreshTokenFrom(
      await loginWith('Chrome').expect(HttpStatus.Ok),
    );
    await loginWith('Firefox').expect(HttpStatus.Ok);
    await loginWith('Safari').expect(HttpStatus.Ok);

    await request(app)
      .delete('/security/devices')
      .set('Cookie', `refreshToken=${rt1}`)
      .expect(HttpStatus.NoContent);

    const res = await request(app)
      .get('/security/devices')
      .set('Cookie', `refreshToken=${rt1}`)
      .expect(HttpStatus.Ok);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe('Chrome');
  });

  it('DELETE /security/devices/:deviceId: terminates the specified session; status 204', async () => {
    const rt1 = refreshTokenFrom(
      await loginWith('Chrome').expect(HttpStatus.Ok),
    );
    const rt2 = refreshTokenFrom(
      await loginWith('Firefox').expect(HttpStatus.Ok),
    );

    const devices = (
      await request(app)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${rt1}`)
        .expect(HttpStatus.Ok)
    ).body as Array<{ deviceId: string; title: string }>;

    const firefoxDeviceId = devices.find(
      (d) => d.title === 'Firefox',
    )!.deviceId;

    await request(app)
      .delete(`/security/devices/${firefoxDeviceId}`)
      .set('Cookie', `refreshToken=${rt1}`)
      .expect(HttpStatus.NoContent);

    // The deleted device's refresh token is no longer valid.
    await request(app)
      .post('/auth/refresh-token')
      .set('Cookie', `refreshToken=${rt2}`)
      .expect(HttpStatus.Unauthorized);

    const remaining = (
      await request(app)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${rt1}`)
        .expect(HttpStatus.Ok)
    ).body;
    expect(remaining).toHaveLength(1);
    expect(remaining[0].title).toBe('Chrome');
  });

  it('DELETE /security/devices/:deviceId: returns 404 for a non-existent device', async () => {
    const rt1 = refreshTokenFrom(
      await loginWith('Chrome').expect(HttpStatus.Ok),
    );

    await request(app)
      .delete('/security/devices/non-existent-device-id')
      .set('Cookie', `refreshToken=${rt1}`)
      .expect(HttpStatus.NotFound);
  });

  it("DELETE /security/devices/:deviceId: returns 403 when deleting another user's device", async () => {
    const rt1 = refreshTokenFrom(
      await loginWith('Chrome').expect(HttpStatus.Ok),
    );

    // Second user logs in and owns their own device.
    const otherUser = {
      login: 'otheruser',
      password: 'pass1234',
      email: 'otheruser@example.com',
    };
    await request(app)
      .post('/users')
      .set('Authorization', adminAuthHeader)
      .send(otherUser)
      .expect(HttpStatus.Created);

    const otherRt = refreshTokenFrom(
      await request(app)
        .post('/auth/login')
        .set('User-Agent', 'OtherDevice')
        .send({ loginOrEmail: otherUser.login, password: otherUser.password })
        .expect(HttpStatus.Ok),
    );

    const otherDeviceId = (
      await request(app)
        .get('/security/devices')
        .set('Cookie', `refreshToken=${otherRt}`)
        .expect(HttpStatus.Ok)
    ).body[0].deviceId;

    // First user tries to delete second user's device.
    await request(app)
      .delete(`/security/devices/${otherDeviceId}`)
      .set('Cookie', `refreshToken=${rt1}`)
      .expect(HttpStatus.Forbidden);
  });
});
