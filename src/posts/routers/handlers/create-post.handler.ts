import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { db } from '../../../db/posts.db';
import { db as db2 } from '../../../db/blogs.db';
import { Post } from '../../types/post';

export function createPostHandler(req: Request, res: Response) {
  // validate blog exists and get data
  const blog = db2.blogs.find((d) => d.id === req.body.blogId);
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

  const newPost: Post = {
    id: db.posts.length ? db.posts[db.posts.length - 1].id + 1 : '1',
    title: req.body.title,
    shortDescription: req.body.shortDescription,
    content: req.body.content,
    blogId: req.body.blogId,
    blogName: blog.name,
  };
  db.posts.push(newPost);
  res.status(HttpStatus.Created).send(newPost);
}
