import { postsCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { Post } from '../types/post';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { PostQueryInput } from '../routers/input/post-query.input';

export const postsQueryRepository = {
  async findAll(): Promise<WithId<Omit<Post, 'id'>>[]> {
    return postsCollection.find().toArray();
  },

  async findByIdOrFail(id: string): Promise<WithId<Omit<Post, 'id'>>> {
    const res = await postsCollection.findOne({ _id: new ObjectId(id) });
    if (!res) {
      throw new RepositoryNotFoundError('Post not exist');
    }
    return res;
  },

  async update(id: string, dto: Omit<Post, 'id' | 'createdAt'>): Promise<void> {
    const updateResult = await postsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
          blogName: dto.blogName,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Post not exist');
    }
  },

  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const skip = (pageNumber - 1) * pageSize;
    const [items, totalCount] = await Promise.all([
      postsCollection
        .find()
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments(),
    ]);
    return { items, totalCount };
  },

  async findPostsForBlog(
    queryDto: PostQueryInput,
    blogId: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter = { blogId };
    const skip = (pageNumber - 1) * pageSize;

    const [items, totalCount] = await Promise.all([
      postsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      postsCollection.countDocuments(filter),
    ]);
    return { items, totalCount };
  },
};
