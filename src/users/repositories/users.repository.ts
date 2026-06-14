import { ObjectId, WithId } from 'mongodb';
import { EmailConfirmation, User } from '../types/user';
import { usersCollection } from '../../db/mongo.db';

export const usersRepository = {
  async findById(id: string): Promise<WithId<Omit<User, 'id'>> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newUser: User): Promise<string> {
    const insertResult = await usersCollection.insertOne(newUser);
    return insertResult.insertedId.toString();
  },

  async updateEmailConfirmation(
    userId: string,
    emailConfirmation: EmailConfirmation,
  ): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { emailConfirmation } },
    );
  },

  async clearEmailConfirmation(userId: string): Promise<void> {
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { emailConfirmation: null } },
    );
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await usersCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('User does not exist');
    }
  },
};
