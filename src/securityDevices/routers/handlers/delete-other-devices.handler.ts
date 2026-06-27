import { Request, Response } from 'express';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { securityDevicesRepository } from '../../repositories/security-devices.repository';

export async function deleteOtherDevicesHandler(req: Request, res: Response) {
  const userId = req.user!.id;
  const currentDeviceId = req.deviceId!;
  await securityDevicesRepository.deleteAllOther(userId, currentDeviceId);
  return res.sendStatus(HttpStatuses.NoContent);
}
