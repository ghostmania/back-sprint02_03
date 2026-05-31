import { Router } from 'express';
import { getPostByIdHandler } from './handlers/get-post-by-id.handler';
import { getPostsListHandler } from './handlers/get-post-list.hadler';
import { updatePostHandler } from './handlers/update-post.handler';
import { createPostHandler } from './handlers/create-post.handler';
import { deletePostHandler } from './handlers/delete-post.handler';
import { superAdminGuardMiddleware } from '../../auth/admin.guard-middleware';
import { DocumentExistGuardMiddleware } from '../middleware/DocumentExistGuardMiddleware';
import { PostHasValidFIeldsMiddleware } from '../middleware/PostHasValidFieldsMiddleware';
import { paginationAndSortingValidation } from '../../core/middleware/validation/query-pagination-sorting.validation-middleware';
import { PostSortField } from './input/post-sort-field';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';
import { accessTokenGuard } from '../../auth/guards/access.token.guard';
import { CommentHasValidFieldsMiddleware } from '../../comments/middleware/CommentHasValidFieldsMiddleware';
import { createPostCommentHandler } from './handlers/create-post-comment.handler';
import { getPostCommentsHandler } from './handlers/get-post-comments.handler';
import { CommentSortField } from '../../comments/routers/input/comment-sort-field';

export const postsRouter = Router({});

postsRouter
  .get(
    '',
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getPostsListHandler,
  )

  .get(
    '/:postId/comments',
    paginationAndSortingValidation(CommentSortField),
    inputValidationResultMiddleware,
    getPostCommentsHandler,
  )
  .post(
    '/:postId/comments',
    accessTokenGuard,
    CommentHasValidFieldsMiddleware,
    createPostCommentHandler,
  )
  .get('/:id', DocumentExistGuardMiddleware, getPostByIdHandler)
  .post(
    '',
    superAdminGuardMiddleware,
    PostHasValidFIeldsMiddleware,
    createPostHandler,
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    DocumentExistGuardMiddleware,
    PostHasValidFIeldsMiddleware,
    updatePostHandler,
  )

  .delete(
    '/:id',
    superAdminGuardMiddleware,
    DocumentExistGuardMiddleware,
    deletePostHandler,
  );
