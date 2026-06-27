import jwt from 'jsonwebtoken';
import { appConfig } from '../../common/config/config';

function toJwtExpiry(val: string): number | string {
  return /^\d+$/.test(val) ? parseInt(val, 10) : val;
}

export const jwtService = {
  async createAccessToken(userId: string): Promise<string> {
    return jwt.sign({ userId }, appConfig.AC_SECRET, {
      expiresIn: toJwtExpiry(appConfig.AC_TIME) as jwt.SignOptions['expiresIn'],
    });
  },

  async createRefreshToken(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<string> {
    return jwt.sign({ userId, deviceId, lastActiveDate }, appConfig.RT_SECRET, {
      expiresIn: toJwtExpiry(appConfig.RT_TIME) as jwt.SignOptions['expiresIn'],
    });
  },

  async verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
      return jwt.verify(token, appConfig.AC_SECRET) as { userId: string };
    } catch {
      return null;
    }
  },

  async verifyRefreshToken(token: string): Promise<{
    userId: string;
    deviceId: string;
    lastActiveDate: string;
    iat?: number;
    exp?: number;
  } | null> {
    try {
      return jwt.verify(token, appConfig.RT_SECRET) as {
        userId: string;
        deviceId: string;
        lastActiveDate: string;
        iat?: number;
        exp?: number;
      };
    } catch {
      return null;
    }
  },
};
