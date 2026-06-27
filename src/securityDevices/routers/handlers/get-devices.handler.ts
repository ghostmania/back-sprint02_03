import { Request, Response } from 'express';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { securityDevicesRepository } from '../../repositories/security-devices.repository';
import { mapToDeviceViewModel } from '../../mappers/device.view';

export async function getDevicesHandler(req: Request, res: Response) {
  const userId = req.user!.id;
  const sessions = await securityDevicesRepository.findActiveByUserId(userId);
  return res
    .status(HttpStatuses.Success)
    .send(sessions.map(mapToDeviceViewModel));
}
