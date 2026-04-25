import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { db } from '../../../db/posts.db';

export function deletePostHandler(req: Request, res: Response) {
  const id = req.params.id;

  const index = db.posts.findIndex((v) => v.id === id);

  // if (index === -1) {
  //   res
  //     .status(HttpStatus.NotFound)
  //     .send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
  //   return;
  // }

  db.posts.splice(index, 1);
  res.sendStatus(HttpStatus.NoContent);
}
