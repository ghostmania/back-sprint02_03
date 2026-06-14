import {
  FieldValidationError,
  ValidationError,
  validationResult,
} from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../../types/http-statuses';

type FieldError = { field: string; message: string };

const formatValidationError = (error: ValidationError): FieldError => {
  const expressError = error as unknown as FieldValidationError;
  return { field: expressError.path, message: expressError.msg };
};

export const inputValidationResultMiddleware = (
  req: Request<{}, {}, {}, {}>,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatValidationError)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).json({ errorsMessages: errors });
    return;
  }
  next();
};
