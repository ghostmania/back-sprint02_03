import { Response } from 'express';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { HttpStatus } from '../types/http-statuses';
import { DomainError } from './domain.error';

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    res.status(HttpStatus.NotFound).send({
      errorsMessages: [{ field: '', message: error.message }],
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(HttpStatus.UnprocessableEntity).send({
      errorsMessages: [{ field: error.source ?? '', message: error.message }],
    });
    return;
  }

  res.status(HttpStatus.InternalServerError);
  return;
}
