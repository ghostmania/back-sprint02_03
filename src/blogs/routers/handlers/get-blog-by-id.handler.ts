import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { db } from '../../../db/blogs.db';
import { Request, Response } from 'express';

export function getBlogByIdHandler(req: Request, res: Response) {
  const id = req.params.id;
  const driver = db.blogs.find((d) => d.id === id);

  if (!driver) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'Blog not found' }]));
    return;
  }
  res.status(HttpStatus.Ok).send(driver);
}
