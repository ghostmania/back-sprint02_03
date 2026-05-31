import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { createErrorMessages } from '../../core/utils/error.utils';
import { commentInputDtoValidation } from '../validation/commentInputDtoValidation';

export const CommentHasValidFieldsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = commentInputDtoValidation(req.body);

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }

  next();
};
