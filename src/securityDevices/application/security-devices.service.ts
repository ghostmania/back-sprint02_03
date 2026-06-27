import { Result } from '../../common/result/result.type';
import { ResultStatus } from '../../common/result/resultCode';
import { securityDevicesRepository } from '../repositories/security-devices.repository';

export const securityDevicesService = {
  async terminateDevice(
    deviceId: string,
    userId: string,
  ): Promise<Result<null>> {
    const session = await securityDevicesRepository.findByDeviceId(deviceId);
    if (!session) {
      return {
        status: ResultStatus.NotFound,
        data: null,
        errorMessage: 'Not Found',
        extensions: [],
      };
    }
    if (session.userId !== userId) {
      return {
        status: ResultStatus.Forbidden,
        data: null,
        errorMessage: 'Forbidden',
        extensions: [],
      };
    }
    await securityDevicesRepository.deleteByDeviceId(deviceId);
    return { status: ResultStatus.Success, data: null, extensions: [] };
  },
};
