import { NextFunction } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { Request, Response } from 'express';
import { blogInputDtoValidation } from '../../blogs/validation/blogInputDtoValidation';

export const BlogHasValidFIeldsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = blogInputDtoValidation({
    ...req.body,
  });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }
  next(); // Успешная авторизация, продолжаем
};
