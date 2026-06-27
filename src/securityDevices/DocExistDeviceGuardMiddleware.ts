import { NextFunction, Request, Response } from 'express';
import { securityDevicesRepository } from './repositories/security-devices.repository';
import { HttpStatus } from '../core/types/http-statuses';
import { createErrorMessages } from '../core/utils/error.utils';

export const DocumentExistGuardMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id + '';

  const doc = await securityDevicesRepository.findByDeviceId(id);

  if (!doc) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'Device not found' }]));
    return;
  }

  next();
};
