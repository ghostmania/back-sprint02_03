import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { DomainError } from '../../../core/errors/domain.error';
import { CommentInputDto } from '../../dto/comment.input-dto';
import { commentsService } from '../../application/comments.service';

export async function updateCommentHandler(
  req: Request<{ commentId: string }, {}, CommentInputDto>,
  res: Response,
) {
  try {
    await commentsService.update(req.params.commentId, req.body, req.user!.id);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    if (e instanceof RepositoryNotFoundError) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    if (e instanceof DomainError && e.code === HttpStatus.Forbidden) {
      res.sendStatus(HttpStatus.Forbidden);
      return;
    }

    res.sendStatus(HttpStatus.InternalServerError);
  }
}
