import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import jwt from 'jsonwebtoken';
import { LoginAttributes } from '../dto/login.attributes';
import { usersQueryRepository } from '../../users/repositories/users.query.repository';
import { usersRepository } from '../../users/repositories/users.repository';
import { bcryptService } from '../adapters/bcrypt.service';
import { nodemailerService } from '../adapters/nodemailer.service';
import { Result } from '../../common/result/result.type';
import { jwtService } from '../adapters/jwt.service';
import { ResultStatus } from '../../common/result/resultCode';
import { WithId } from 'mongodb';
import { User } from '../../users/types/user';
import { UserAttributes } from '../../users/dto/user.attributes';
import { securityDevicesRepository } from '../../securityDevices/repositories/security-devices.repository';

export const authService = {
  async login(
    dto: LoginAttributes,
    ip: string,
    userAgent: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const result = await this.checkUserCredentials(
      dto.loginOrEmail,
      dto.password,
    );
    if (result.status !== ResultStatus.Success) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [{ field: 'loginOrEmail', message: 'Wrong credentials' }],
        data: null,
      };
    }

    const userId = result.data!._id.toString();
    const deviceId = randomUUID();
    const lastActiveDate = new Date().toISOString();
    const accessToken = await jwtService.createAccessToken(userId);
    const refreshToken = await jwtService.createRefreshToken(
      userId,
      deviceId,
      lastActiveDate,
    );
    const decoded = jwt.decode(refreshToken) as { exp: number };
    await securityDevicesRepository.create({
      userId,
      deviceId,
      ip: ip || 'unknown',
      title: userAgent || 'Unknown device',
      lastActiveDate,
      expirationDate: new Date(decoded.exp * 1000).toISOString(),
    });

    return {
      status: ResultStatus.Success,
      data: { accessToken, refreshToken },
      extensions: [],
    };
  },

  async refreshTokens(
    refreshToken: string,
  ): Promise<Result<{ accessToken: string; refreshToken: string } | null>> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [],
        data: null,
      };
    }

    const session = await securityDevicesRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!session || session.lastActiveDate !== payload.lastActiveDate) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [],
        data: null,
      };
    }

    const { userId, deviceId } = payload;
    const newLastActiveDate = new Date().toISOString();
    const newAccessToken = await jwtService.createAccessToken(userId);
    const newRefreshToken = await jwtService.createRefreshToken(
      userId,
      deviceId,
      newLastActiveDate,
    );
    const decoded = jwt.decode(newRefreshToken) as { exp: number };
    await securityDevicesRepository.updateLastActive(
      deviceId,
      newLastActiveDate,
      new Date(decoded.exp * 1000).toISOString(),
    );

    return {
      status: ResultStatus.Success,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      extensions: [],
    };
  },

  async logout(refreshToken: string): Promise<Result<null>> {
    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [],
        data: null,
      };
    }

    const session = await securityDevicesRepository.findByDeviceId(
      payload.deviceId,
    );
    if (!session || session.lastActiveDate !== payload.lastActiveDate) {
      return {
        status: ResultStatus.Unauthorized,
        errorMessage: 'Unauthorized',
        extensions: [],
        data: null,
      };
    }

    await securityDevicesRepository.deleteByDeviceId(payload.deviceId);

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async checkUserCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<Result<WithId<User> | null>> {
    const user = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [{ field: 'loginOrEmail', message: 'Not Found' }],
      };
    }
    const isPassCorrect = await bcryptService.compare(
      password,
      user.passwordHash,
    );
    if (!isPassCorrect)
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'password', message: 'Wrong password' }],
      };
    return {
      status: ResultStatus.Success,
      data: user,
      extensions: [],
    };
  },

  async registerUser(dto: UserAttributes): Promise<Result<null>> {
    const existingByLogin = await usersQueryRepository.findByLoginOrEmail(
      dto.login,
    );
    if (existingByLogin) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'login', message: 'Login already exists' }],
      };
    }

    const existingByEmail = await usersQueryRepository.findByEmail(dto.email);
    if (existingByEmail) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [{ field: 'email', message: 'Email already exists' }],
      };
    }

    const passwordHash = await bcryptService.generateHash(dto.password);
    const confirmationCode = randomUUID();

    const newUser: User = {
      login: dto.login,
      email: dto.email,
      passwordHash,
      createdAt: new Date(),
      emailConfirmation: {
        confirmationCode,
        expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
      },
    };

    await usersRepository.create(newUser);

    try {
      await nodemailerService.sendRegistrationEmail(
        dto.email,
        confirmationCode,
      );
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async confirmRegistration(code: string): Promise<Result<null>> {
    const user = await usersQueryRepository.findByConfirmationCode(code);

    if (!user || !user.emailConfirmation) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [
          {
            field: 'code',
            message:
              'Confirmation code is incorrect, expired or already been applied',
          },
        ],
      };
    }

    if (user.emailConfirmation.expirationDate < new Date()) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [
          {
            field: 'code',
            message:
              'Confirmation code is incorrect, expired or already been applied',
          },
        ],
      };
    }

    await usersRepository.clearEmailConfirmation(user._id.toString());

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },

  async resendConfirmationEmail(email: string): Promise<Result<null>> {
    const user = await usersQueryRepository.findByEmail(email);

    if (!user || !user.emailConfirmation) {
      return {
        status: ResultStatus.BadRequest,
        data: null,
        errorMessage: 'Bad Request',
        extensions: [
          { field: 'email', message: 'Email not found or already confirmed' },
        ],
      };
    }

    const newCode = randomUUID();
    await usersRepository.updateEmailConfirmation(user._id.toString(), {
      confirmationCode: newCode,
      expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
    });

    try {
      await nodemailerService.sendRegistrationEmail(email, newCode);
    } catch (e: unknown) {
      console.error('Send email error', e);
    }

    return {
      status: ResultStatus.Success,
      data: null,
      extensions: [],
    };
  },
};
