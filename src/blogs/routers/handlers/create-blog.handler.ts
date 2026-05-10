import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsService } from '../../application/blogs.service';
import { BlogAttributes } from '../../dto/blog.attributes';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model.util';

export async function createBlogHandler(
  req: Request<{}, {}, BlogAttributes>,
  res: Response,
) {
  try {
    const createdBlogId = await blogsService.createBlog(req.body);
    const createdBlog = await blogsService.findByIdOrFail(createdBlogId);
    res.status(HttpStatus.Created).send(mapToBlogViewModel(createdBlog));
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
