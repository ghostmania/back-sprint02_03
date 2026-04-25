import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { Request, Response } from 'express';
import { postInputDtoValidation } from '../../validation/postInputDtoValidation';
import { db } from '../../../db/posts.db';
import { db as blogsDb } from '../../../db/blogs.db';

export function updatePostHandler(req: Request, res: Response) {
  const id = req.params.id;
  const index = db.posts.findIndex((v) => v.id === id);

  // if (index === -1) {
  //   res
  //     .status(HttpStatus.NotFound)
  //     .send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
  //   return;
  // }
  const post = db.posts[index];

  // const errors = postInputDtoValidation({
  //   ...req.body,
  // });

  // if (errors.length > 0) {
  //   res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  //   return;
  // }

  const blog = blogsDb.blogs.find((item) => item.id === req.body.blogId);
  if (!blog) {
    res
      .status(HttpStatus.BadRequest)
      .send(
        createErrorMessages([
          { field: 'blogId', message: 'Blog for post does not exist' },
        ]),
      );
    return;
  }

  post.title = req.body.title;
  post.shortDescription = req.body.shortDescription;
  post.content = req.body.content;
  post.blogId = req.body.blogId;
  post.blogName = blog.name;

  res.sendStatus(HttpStatus.NoContent);
}
