import { HttpStatus } from '../../../core/types/http-statuses';
import { createErrorMessages } from '../../../core/utils/error.utils';
import { db } from '../../../db/blogs.db';
import { Request, Response } from 'express';

export function updateBlogHandler(req: Request, res: Response) {
  const id = req.params.id;
  const index = db.blogs.findIndex((v) => v.id === id);

  if (index === -1) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'Blog not found' }]));
    return;
  }
  const driver = db.blogs[index];

  driver.name = req.body.name;
  driver.description = req.body.description;
  driver.websiteUrl = req.body.websiteUrl;

  res.sendStatus(HttpStatus.NoContent);
}
