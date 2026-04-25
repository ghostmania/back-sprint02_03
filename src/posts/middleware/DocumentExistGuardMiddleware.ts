import { NextFunction, Request, Response } from 'express';
import { createErrorMessages } from '../../core/utils/error.utils';
import { HttpStatus } from '../../core/types/http-statuses';
import { postsRepository } from '../repositories/posts.repository';

export const DocumentExistGuardMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = req.params.id + '';

  const doc = await postsRepository.findById(id);

  if (!doc) {
    res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'Post not found' }]));
    return;
  }

  next(); // Успешная авторизация, продолжаем
};
