import { securityDevicesCollection } from '../../db/mongo.db';
import { DeviceSession } from '../types/device-session';

export const securityDevicesRepository = {
  async create(session: DeviceSession): Promise<void> {
    await securityDevicesCollection.insertOne(session);
  },
  async findByDeviceId(deviceId: string): Promise<DeviceSession | null> {
    return securityDevicesCollection.findOne(
      { deviceId },
      { projection: { _id: 0 } },
    );
  },
  async findActiveByUserId(userId: string): Promise<DeviceSession[]> {
    return securityDevicesCollection
      .find({ userId }, { projection: { _id: 0 } })
      .toArray();
  },
  async updateLastActive(
    deviceId: string,
    lastActiveDate: string,
    expirationDate: string,
  ): Promise<void> {
    await securityDevicesCollection.updateOne(
      { deviceId },
      { $set: { lastActiveDate, expirationDate } },
    );
  },
  async deleteByDeviceId(deviceId: string): Promise<void> {
    await securityDevicesCollection.deleteOne({ deviceId });
  },
  async deleteAllOther(userId: string, currentDeviceId: string): Promise<void> {
    await securityDevicesCollection.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });
  },
};
