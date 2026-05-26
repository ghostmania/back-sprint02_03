import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/mongo.db';
import { Blog } from '../types/blog';

export const blogsRepository = {
  async findById(id: string): Promise<WithId<Omit<Blog, 'id'>> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newBlog: Blog): Promise<string> {
    const insertResult = await blogsCollection.insertOne(newBlog);
    return insertResult.insertedId.toString();
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not exist');
    }
  },
};
