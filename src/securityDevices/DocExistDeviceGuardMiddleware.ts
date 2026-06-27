import { NextFunction, Request, Response } from 'express';
import { securityDevicesRepository } from './repositories/security-devices.repository';
import { HttpStatus } from '../core/types/http-statuses';
import { createErrorMessages } from '../core/utils/error.utils';

export const DocumentExistGuardMiddleware = async (
  req: Request<{ deviceId: string }>,
  res: Response,
  next: NextFunction,
) => {
  const deviceId = req.params.deviceId;

  const doc = await securityDevicesRepository.findByDeviceId(deviceId);

  if (!doc) {
    res
      .status(HttpStatus.NotFound)
      .send(
        createErrorMessages([
          { field: 'deviceId', message: 'Device not found' },
        ]),
      );
    return;
  }

  next();
};
