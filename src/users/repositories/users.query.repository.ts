import { ObjectId, WithId } from 'mongodb';
import { UsersQueryInput } from '../routers/input/users-query.input';
import { User } from '../types/user';
import { usersCollection } from '../../db/mongo.db';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';

export const usersQueryRepository = {
  async findByIdOrFail(id: string): Promise<WithId<User>> {
    const res = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!res) {
      throw new RepositoryNotFoundError('User not found');
    }
    return res;
  },

  async findMany(
    queryDto: UsersQueryInput,
  ): Promise<{ users: WithId<User>[]; totalCount: number }> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filterConditions: any[] = [];

    if (searchLoginTerm) {
      filterConditions.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }
    if (searchEmailTerm) {
      filterConditions.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    const filter = filterConditions.length > 0 ? { $or: filterConditions } : {};

    const users = await usersCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await usersCollection.countDocuments(filter);

    return { users, totalCount };
  },

  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
};
