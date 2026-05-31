import { Router } from 'express';
import { accessTokenGuard } from '../../auth/guards/access.token.guard';
import { CommentHasValidFieldsMiddleware } from '../middleware/CommentHasValidFieldsMiddleware';
import { getCommentByIdHandler } from './handlers/get-comment-by-id.handler';
import { updateCommentHandler } from './handlers/update-comment.handler';
import { deleteCommentHandler } from './handlers/delete-comment.handler';

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', getCommentByIdHandler)
  .put(
    '/:commentId',
    accessTokenGuard,
    CommentHasValidFieldsMiddleware,
    updateCommentHandler,
  )
  .delete('/:commentId', accessTokenGuard, deleteCommentHandler);
