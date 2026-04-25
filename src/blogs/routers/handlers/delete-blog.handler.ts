import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { db } from '../../../db/blogs.db';

export function deleteBlogHandler(req: Request, res: Response) {
  const id = req.params.id;

  const index = db.blogs.findIndex((v) => v.id === id);

  if (index === -1) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'Blog not found' }]));
    return;
  }

  db.blogs.splice(index, 1);
  res.sendStatus(HttpStatus.NoContent);
}
