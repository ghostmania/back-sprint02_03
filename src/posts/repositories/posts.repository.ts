import { postsCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { Post } from '../types/post';

export const postsRepository = {
  async findById(id: string): Promise<WithId<Omit<Post, 'id'>> | null> {
    return postsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newPost: Omit<Post, 'id'>): Promise<string> {
    const insertResult = await postsCollection.insertOne(newPost);
    return insertResult.insertedId.toString();
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await postsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Post not exist');
    }
  },
};
