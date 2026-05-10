import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { DomainError } from '../../../core/errors/domain.error';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function deleteBlogHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    await blogsService.delete(req.params.id);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    if (e instanceof DomainError) {
      res
        .status(e.code)
        .send(createErrorMessages([{ field: 'id', message: e.message }]));
      return;
    }
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
