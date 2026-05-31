import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../db/mongo.db';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { Comment } from '../types/comment';
import { CommentQueryInput } from '../routers/input/comment-query.input';

export const commentsQueryRepository = {
  async findByIdOrFail(id: string): Promise<WithId<Comment>> {
    if (!ObjectId.isValid(id)) {
      throw new RepositoryNotFoundError('Comment not found');
    }

    const comment = await commentsCollection.findOne({ _id: new ObjectId(id) });
    if (!comment) {
      throw new RepositoryNotFoundError('Comment not found');
    }
    return comment;
  },

  async findManyForPost(
    queryDto: CommentQueryInput,
    postId: string,
  ): Promise<{ items: WithId<Comment>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter = { postId };
    const skip = (pageNumber - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      commentsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      commentsCollection.countDocuments(filter),
    ]);

    return { items, totalCount };
  },
};
