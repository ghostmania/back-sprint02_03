import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../adapters/jwt.service';
import { IdType } from '../../common/types/id';
import { securityDevicesRepository } from '../../securityDevices/repositories/security-devices.repository';

export const refreshTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.cookies?.refreshToken;
  if (!token) {
    return res.sendStatus(401);
  }

  const payload = await jwtService.verifyRefreshToken(token);
  if (!payload) {
    return res.sendStatus(401);
  }

  const session = await securityDevicesRepository.findByDeviceId(
    payload.deviceId,
  );
  if (!session || session.lastActiveDate !== payload.lastActiveDate) {
    return res.sendStatus(401);
  }

  req.user = { id: payload.userId } as IdType;
  req.deviceId = payload.deviceId;
  next();
};
