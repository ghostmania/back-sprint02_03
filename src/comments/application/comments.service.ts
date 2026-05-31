import { WithId } from 'mongodb';
import { ObjectId } from 'mongodb';
import { CommentInputDto } from '../dto/comment.input-dto';
import { Comment } from '../types/comment';
import { commentsRepository } from '../repositories/comments.repository';
import { commentsQueryRepository } from '../repositories/comments.query.repository';
import { postsQueryRepository } from '../../posts/repositories/posts.query.repository';
import { usersQueryRepository } from '../../users/repositories/users.query.repository';
import { CommentQueryInput } from '../routers/input/comment-query.input';
import { DomainError } from '../../core/errors/domain.error';
import { HttpStatus } from '../../core/types/http-statuses';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';

export const commentsService = {
  async createForPost(
    postId: string,
    dto: CommentInputDto,
    userId: string,
  ): Promise<string> {
    if (!ObjectId.isValid(postId)) {
      throw new RepositoryNotFoundError('Post not found');
    }

    await postsQueryRepository.findByIdOrFail(postId);
    const user = await usersQueryRepository.findByIdOrFail(userId);

    const newComment: Comment = {
      content: dto.content,
      postId,
      commentatorInfo: {
        userId,
        userLogin: user.login,
      },
      createdAt: new Date(),
    };

    return commentsRepository.create(newComment);
  },

  async findByIdOrFail(id: string): Promise<WithId<Comment>> {
    return commentsQueryRepository.findByIdOrFail(id);
  },

  async findManyForPost(
    queryDto: CommentQueryInput,
    postId: string,
  ): Promise<{ items: WithId<Comment>[]; totalCount: number }> {
    if (!ObjectId.isValid(postId)) {
      throw new RepositoryNotFoundError('Post not found');
    }

    await postsQueryRepository.findByIdOrFail(postId);
    return commentsQueryRepository.findManyForPost(queryDto, postId);
  },

  async update(
    id: string,
    dto: CommentInputDto,
    userId: string,
  ): Promise<void> {
    const comment = await commentsQueryRepository.findByIdOrFail(id);

    if (comment.commentatorInfo.userId !== userId) {
      throw new DomainError('Forbidden', HttpStatus.Forbidden);
    }

    await commentsRepository.update(id, dto.content);
  },

  async delete(id: string, userId: string): Promise<void> {
    const comment = await commentsQueryRepository.findByIdOrFail(id);

    if (comment.commentatorInfo.userId !== userId) {
      throw new DomainError('Forbidden', HttpStatus.Forbidden);
    }

    await commentsRepository.delete(id);
  },
};
