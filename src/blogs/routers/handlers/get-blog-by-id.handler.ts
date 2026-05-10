import { HttpStatus } from '../../../core/types/http-statuses';
import { Request, Response } from 'express';
import { blogsService } from '../../application/blogs.service';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model.util';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function getBlogByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const blog = await blogsService.findByIdOrFail(req.params.id);
    res.status(HttpStatus.Ok).send(mapToBlogViewModel(blog));
  } catch (e: unknown) {
    if (e instanceof RepositoryNotFoundError) {
      res
        .status(HttpStatus.NotFound)
        .send(createErrorMessages([{ field: 'id', message: e.message }]));
      return;
    }
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
