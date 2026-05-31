import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../db/mongo.db';
import { Comment } from '../types/comment';

export const commentsRepository = {
  async findById(id: string): Promise<WithId<Comment> | null> {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return commentsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newComment: Comment): Promise<string> {
    const insertResult = await commentsCollection.insertOne(newComment);
    return insertResult.insertedId.toString();
  },

  async update(id: string, content: string): Promise<void> {
    const updateResult = await commentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content } },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Comment not exist');
    }
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await commentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Comment not exist');
    }
  },
};
