import { HttpStatus } from '../../../core/types/http-statuses';
import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { BlogAttributes } from '../../dto/blog.attributes';
import { DomainError } from '../../../core/errors/domain.error';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function updateBlogHandler(
  req: Request<{ id: string }, {}, BlogAttributes>,
  res: Response,
) {
  try {
    await blogsService.update(req.params.id, req.body);
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
