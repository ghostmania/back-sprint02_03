export type DeviceSession = {
  userId: string;
  deviceId: string;
  ip: string;
  title: string;
  lastActiveDate: string; // ISO, equals iat of current refresh token
  expirationDate: string; // ISO, equals exp of current refresh token
};
