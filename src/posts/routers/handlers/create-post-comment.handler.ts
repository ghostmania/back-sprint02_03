import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { CommentInputDto } from '../../../comments/dto/comment.input-dto';
import { commentsService } from '../../../comments/application/comments.service';
import { mapToCommentViewModel } from '../../../comments/mappers/map-to-comment-view-model.util';

export async function createPostCommentHandler(
  req: Request<{ postId: string }, {}, CommentInputDto>,
  res: Response,
) {
  try {
    const createdCommentId = await commentsService.createForPost(
      req.params.postId,
      req.body,
      req.user!.id,
    );
    const createdComment =
      await commentsService.findByIdOrFail(createdCommentId);

    res.status(HttpStatus.Created).send(mapToCommentViewModel(createdComment));
  } catch (e: unknown) {
    if (e instanceof RepositoryNotFoundError) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    res.sendStatus(HttpStatus.InternalServerError);
  }
}
