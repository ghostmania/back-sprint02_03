import { ObjectId, WithId } from 'mongodb';
import { UsersQueryInput } from '../routers/input/users-query.input';
import { User } from '../types/user';
import { usersCollection } from '../../db/mongo.db';

export const usersRepository = {
  async findById(id: string): Promise<WithId<Omit<User, 'id'>> | null> {
    return usersCollection.findOne({ _id: new ObjectId(id) });
  },
  async findMany(
    queryDto: UsersQueryInput,
  ): Promise<{ users: WithId<User>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, searchEmailTerm } =
      queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filterConditions: any[] = [];

    if (searchLoginTerm) {
      filterConditions.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }
    if (searchEmailTerm) {
      filterConditions.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
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
  async create(newBlog: User): Promise<string> {
    const insertResult = await usersCollection.insertOne(newBlog);
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
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    });
  },
};
