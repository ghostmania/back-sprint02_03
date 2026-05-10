import { WithId } from 'mongodb';
import { BlogAttributes } from '../dto/blog.attributes';
import { blogsRepository } from '../repositories/blogs.repository';
import { Blog } from '../types/blog';
import { DomainError } from '../../core/errors/domain.error';
import { HttpStatus } from '../../core/types/http-statuses';
import { BlogQueryInput } from '../routers/input/blog-query.input';

export const blogsService = {
  async createBlog(dto: BlogAttributes) {
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      isMembership: false,
      createdAt: new Date(),
    };
    console.log(newBlog);
    return await blogsRepository.create(newBlog);
  },
  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    return blogsRepository.findByIdOrFail(id);
  },
  async update(id: string, dto: BlogAttributes): Promise<void> {
    const blog = await blogsRepository.findById(id);
    if (!blog) {
      throw new DomainError('Blog not found', HttpStatus.NotFound);
    }
    await blogsRepository.update(id, dto);
  },
  async delete(id: string): Promise<void> {
    const blog = await blogsRepository.findById(id);

    if (!blog) {
      throw new DomainError(`Blog not found`, HttpStatus.NotFound);
    }

    await blogsRepository.delete(id);
    return;
  },
  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return blogsRepository.findMany(queryDto);
  },
};
