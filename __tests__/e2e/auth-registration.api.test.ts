import express from 'express';
import request from 'supertest';
import { HttpStatus } from '../../src/core/types/http-statuses';
import { client, runDB, usersCollection } from '../../src/db/mongo.db';
import { setupApp } from '../../src/setup-app';
import { appConfig } from '../../src/common/config/config';

jest.mock('../../src/auth/adapters/nodemailer.service', () => ({
  nodemailerService: {
    sendRegistrationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

import { nodemailerService } from '../../src/auth/adapters/nodemailer.service';
const sendEmailMock = nodemailerService.sendRegistrationEmail as jest.Mock;

describe('Auth registration flow', () => {
  const app = express();
  setupApp(app);

  const adminAuthHeader = `Basic ${Buffer.from('admin:qwerty').toString('base64')}`;

  const validUser = {
    login: 'testuser',
    password: 'pass1234',
    email: 'testuser@example.com',
  };

  beforeAll(async () => {
    await runDB(appConfig.MONGO_URL);
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
    sendEmailMock.mockClear();
  });

  afterAll(async () => {
    if (client) await client.close();
  });

  describe('POST /auth/registration', () => {
    it('should register user and send confirmation email; status 204', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);

      expect(sendEmailMock).toHaveBeenCalledTimes(1);
      expect(sendEmailMock).toHaveBeenCalledWith(
        validUser.email,
        expect.any(String),
      );

      const userInDb = await usersCollection.findOne({
        login: validUser.login,
      });
      expect(userInDb).toBeTruthy();
      expect(userInDb!.emailConfirmation).not.toBeNull();
      expect(userInDb!.emailConfirmation!.confirmationCode).toEqual(
        expect.any(String),
      );
    });

    it('should return 400 if login already taken', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);

      const res = await request(app)
        .post('/auth/registration')
        .send({ ...validUser, email: 'other@example.com' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'login' })]),
      );
    });

    it('should return 400 if email already taken', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);

      const res = await request(app)
        .post('/auth/registration')
        .send({ ...validUser, login: 'other99' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })]),
      );
    });

    it('should return 400 for invalid body fields', async () => {
      await request(app)
        .post('/auth/registration')
        .send({ login: 'ab', password: '123', email: 'not-an-email' })
        .expect(HttpStatus.BadRequest);
    });
  });

  describe('POST /auth/registration-confirmation', () => {
    it('should confirm registration with valid code; status 204', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);
      const userInDb = await usersCollection.findOne({
        login: validUser.login,
      });
      const code = userInDb!.emailConfirmation!.confirmationCode;

      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code })
        .expect(HttpStatus.NoContent);

      const confirmedUser = await usersCollection.findOne({
        login: validUser.login,
      });
      expect(confirmedUser!.emailConfirmation).toBeNull();
    });

    it('confirmed user can log in', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);
      const userInDb = await usersCollection.findOne({
        login: validUser.login,
      });
      const code = userInDb!.emailConfirmation!.confirmationCode;
      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code })
        .expect(HttpStatus.NoContent);

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: validUser.login, password: validUser.password })
        .expect(HttpStatus.Ok);

      expect(loginRes.body).toHaveProperty('accessToken');
    });

    it('should return 400 for wrong code', async () => {
      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code: 'non-existent-code' })
        .expect(HttpStatus.BadRequest);
    });

    it('should return 400 if code already applied (replay)', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);
      const userInDb = await usersCollection.findOne({
        login: validUser.login,
      });
      const code = userInDb!.emailConfirmation!.confirmationCode;

      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code })
        .expect(HttpStatus.NoContent);

      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code })
        .expect(HttpStatus.BadRequest);
    });

    it('should return 400 for missing code field', async () => {
      await request(app)
        .post('/auth/registration-confirmation')
        .send({})
        .expect(HttpStatus.BadRequest);
    });
  });

  describe('POST /auth/registration-email-resending', () => {
    it('should resend email, overwrite old code, old code no longer works; status 204', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);
      const userBefore = await usersCollection.findOne({
        login: validUser.login,
      });
      const oldCode = userBefore!.emailConfirmation!.confirmationCode;

      sendEmailMock.mockClear();

      await request(app)
        .post('/auth/registration-email-resending')
        .send({ email: validUser.email })
        .expect(HttpStatus.NoContent);

      expect(sendEmailMock).toHaveBeenCalledTimes(1);

      const userAfter = await usersCollection.findOne({
        login: validUser.login,
      });
      const newCode = userAfter!.emailConfirmation!.confirmationCode;
      expect(newCode).not.toBe(oldCode);

      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code: oldCode })
        .expect(HttpStatus.BadRequest);

      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code: newCode })
        .expect(HttpStatus.NoContent);
    });

    it('should return 400 for unknown email', async () => {
      await request(app)
        .post('/auth/registration-email-resending')
        .send({ email: 'nobody@example.com' })
        .expect(HttpStatus.BadRequest);
    });

    it('should return 400 for already confirmed email (emailConfirmation is null)', async () => {
      await request(app)
        .post('/auth/registration')
        .send(validUser)
        .expect(HttpStatus.NoContent);
      const userInDb = await usersCollection.findOne({
        login: validUser.login,
      });
      const code = userInDb!.emailConfirmation!.confirmationCode;
      await request(app)
        .post('/auth/registration-confirmation')
        .send({ code })
        .expect(HttpStatus.NoContent);

      await request(app)
        .post('/auth/registration-email-resending')
        .send({ email: validUser.email })
        .expect(HttpStatus.BadRequest);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app)
        .post('/auth/registration-email-resending')
        .send({ email: 'not-an-email' })
        .expect(HttpStatus.BadRequest);
    });
  });

  describe('Admin-created user can log in without email confirmation', () => {
    it('POST /users then POST /auth/login should succeed immediately', async () => {
      await request(app)
        .post('/users')
        .set('Authorization', adminAuthHeader)
        .send(validUser)
        .expect(HttpStatus.Created);

      const loginRes = await request(app)
        .post('/auth/login')
        .send({ loginOrEmail: validUser.login, password: validUser.password })
        .expect(HttpStatus.Ok);

      expect(loginRes.body).toHaveProperty('accessToken');
    });
  });
});
