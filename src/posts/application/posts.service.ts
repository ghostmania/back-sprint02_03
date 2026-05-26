import { WithId } from 'mongodb';
import { PostInputDto } from '../dto/post.input-dto';
import { postsRepository } from '../repositories/posts.repository';
import { postsQueryRepository } from '../repositories/posts.query.repository';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { Post } from '../types/post';
import { DomainError } from '../../core/errors/domain.error';
import { HttpStatus } from '../../core/types/http-statuses';
import { PostQueryInput } from '../routers/input/post-query.input';
import { blogsQueryRepository } from '../../blogs/repositories/blogs.query.repository';

export const postsService = {
  async createPost(dto: PostInputDto): Promise<string> {
    const blog = await blogsQueryRepository.findByIdOrFail(dto.blogId);

    const newPost: Omit<Post, 'id'> = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
      createdAt: new Date(),
    };

    return postsRepository.create(newPost);
  },

  async findByIdOrFail(id: string): Promise<WithId<Omit<Post, 'id'>>> {
    return postsQueryRepository.findByIdOrFail(id);
  },

  async update(id: string, dto: PostInputDto): Promise<void> {
    const blog = await blogsRepository.findById(dto.blogId);
    if (!blog) {
      throw new DomainError('Blog not found', HttpStatus.BadRequest);
    }

    await postsQueryRepository.update(id, {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });
  },

  async delete(id: string): Promise<void> {
    const post = await postsRepository.findById(id);
    if (!post) {
      throw new DomainError('Post not found', HttpStatus.NotFound);
    }
    await postsRepository.delete(id);
  },

  async findAll(): Promise<WithId<Omit<Post, 'id'>>[]> {
    return postsQueryRepository.findAll();
  },

  async findMany(
    queryDto: PostQueryInput,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    return postsQueryRepository.findMany(queryDto);
  },

  async findPostsForBlog(
    queryDto: PostQueryInput,
    blogId: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    await blogsQueryRepository.findByIdOrFail(blogId);

    return postsQueryRepository.findPostsForBlog(queryDto, blogId);
  },
};
