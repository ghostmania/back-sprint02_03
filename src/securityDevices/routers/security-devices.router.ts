import { Router } from 'express';
import { refreshTokenGuard } from '../../auth/guards/refresh-token.guard';
import { getDevicesHandler } from './handlers/get-devices.handler';
import { deleteOtherDevicesHandler } from './handlers/delete-other-devices.handler';
import { deleteDeviceHandler } from './handlers/delete-device.handler';

export const securityDevicesRouter = Router({});

securityDevicesRouter
  .get('', refreshTokenGuard, getDevicesHandler)
  .delete('', refreshTokenGuard, deleteOtherDevicesHandler)
  .delete('/:deviceId', refreshTokenGuard, deleteDeviceHandler);
