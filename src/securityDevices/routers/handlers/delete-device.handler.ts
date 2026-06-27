import { Request, Response } from 'express';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { securityDevicesService } from '../../application/security-devices.service';

export async function deleteDeviceHandler(
  req: Request<{ deviceId: string }>,
  res: Response,
) {
  const result = await securityDevicesService.terminateDevice(
    req.params.deviceId,
    req.user!.id,
  );
  if (result.status !== ResultStatus.Success) {
    return res.sendStatus(resultCodeToHttpException(result.status));
  }
  return res.sendStatus(HttpStatuses.NoContent);
}
