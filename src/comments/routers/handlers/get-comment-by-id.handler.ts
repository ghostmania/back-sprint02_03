import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { commentsService } from '../../application/comments.service';
import { mapToCommentViewModel } from '../../mappers/map-to-comment-view-model.util';

export async function getCommentByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const comment = await commentsService.findByIdOrFail(req.params.id);
    res.status(HttpStatus.Ok).send(mapToCommentViewModel(comment));
  } catch (e: unknown) {
    if (e instanceof RepositoryNotFoundError) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    res.sendStatus(HttpStatus.InternalServerError);
  }
}
