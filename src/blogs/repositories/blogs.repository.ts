import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/mongo.db';
import { BlogInputDto } from '../dto/blog.input-dto';
import { Blog } from '../types/blog';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { BlogQueryInput } from '../routers/input/blog-query.input';

export const blogsRepository = {
  async findAll(): Promise<WithId<Omit<Blog, 'id'>>[]> {
    return blogsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<Omit<Blog, 'id'>> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    const res = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new RepositoryNotFoundError('Blog not found');
    }
    return res;
  },

  async create(newBlog: Blog): Promise<string> {
    const insertResult = await blogsCollection.insertOne(newBlog);
    return insertResult.insertedId.toString();
  },

  async update(id: string, dto: BlogInputDto): Promise<void> {
    const updateResult = await blogsCollection.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Blog not exist');
    }
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not exist');
    }
  },
  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      queryDto;

    const skip = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const items = await blogsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogsCollection.countDocuments(filter);

    return { items, totalCount };
  },
};
