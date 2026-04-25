import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { blogsRepository } from '../../repositories/blogs.repository';
import { Blog } from '../../types/blog';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model.util';

export async function createBlogHandler(
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) {
  try {
    const newBlog: Omit<Blog, 'id'> = {
      // id: req.body.name,
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
      isMembership: false,
      createdAt: new Date().toISOString(),
    };

    const createdBlog = await blogsRepository.create(newBlog);
    const blogViewModel = mapToBlogViewModel(createdBlog);
    res.status(HttpStatus.Created).send(blogViewModel);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
