import { refreshTokensCollection } from '../../db/mongo.db';

export const refreshTokensRepository = {
  async save(userId: string, token: string, expiresAt: Date): Promise<void> {
    await refreshTokensCollection.insertOne({
      userId,
      token,
      isRevoked: false,
      createdAt: new Date(),
      expiresAt,
    });
  },

  async isValid(token: string): Promise<boolean> {
    const doc = await refreshTokensCollection.findOne({ token });
    return !!doc && !doc.isRevoked;
  },

  async revoke(token: string): Promise<void> {
    await refreshTokensCollection.updateOne(
      { token },
      { $set: { isRevoked: true } },
    );
  },
};
