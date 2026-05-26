import { ObjectId, WithId } from 'mongodb';
import { User } from '../types/user';
import { usersCollection } from '../../db/mongo.db';

export const usersRepository = {
  async findById(id: string): Promise<WithId<Omit<User, 'id'>> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newUser: User): Promise<string> {
    const insertResult = await usersCollection.insertOne(newUser);
    return insertResult.insertedId.toString();
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
