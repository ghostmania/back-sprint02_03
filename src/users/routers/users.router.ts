import { Router } from 'express';
import { query } from 'express-validator';
import { paginationAndSortingValidation } from '../../core/middleware/validation/query-pagination-sorting.validation-middleware';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';
import { getUsersListHandler } from './handlers/get-users-list.handler';
import { UsersSortField } from './input/users-sort-field';
import { superAdminGuardMiddleware } from '../../auth/admin.guard-middleware';
import { UserHasValidFIeldsMiddleware } from '../middleware/UserHasValidFieldsMW';
import { createUserHandler } from './handlers/create-user.handler';
import { deleteUserHandler } from './handlers/delete-user.handler';

export const usersRouter = Router({});

usersRouter
  .get(
    '',
    query('searchLoginTerm').optional().isString(),
    query('searchEmailTerm').optional().isString(),
    paginationAndSortingValidation(UsersSortField),
    inputValidationResultMiddleware,
    getUsersListHandler,
  )
  .post(
    '',
    superAdminGuardMiddleware,
    UserHasValidFIeldsMiddleware,
    createUserHandler,
  )
  .delete('/:id', superAdminGuardMiddleware, deleteUserHandler);
