import { NextFunction, Request, Response } from 'express';
import { db } from '../../db/posts.db';
import { createErrorMessages } from '../../core/utils/error.utils';
import { HttpStatus } from '../../core/types/http-statuses';

export const DocumentExistGuardMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id;

  const index = db.posts.findIndex((v) => v.id === id);

  if (index === -1) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
    return;
  }

  next(); // Успешная авторизация, продолжаем
};
