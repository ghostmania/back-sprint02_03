import { DeviceSession } from '../types/device-session';

export type DeviceViewModel = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export const mapToDeviceViewModel = (
  session: DeviceSession,
): DeviceViewModel => ({
  ip: session.ip,
  title: session.title,
  lastActiveDate: session.lastActiveDate,
  deviceId: session.deviceId,
});
