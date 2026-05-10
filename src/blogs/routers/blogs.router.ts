import { Router } from 'express';
import { query } from 'express-validator';
import { getBlogsListHandler } from './handlers/get-blog-list.hadler';
import { getBlogByIdHandler } from './handlers/get-blog-by-id.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';
import { superAdminGuardMiddleware } from '../../auth/admin.guard-middleware';
import { BlogHasValidFIeldsMiddleware } from '../../posts/middleware/BlogHasValidFIeldsMW';
import { idValidation } from '../../core/middleware/validation/params-id.validation-middleware';
import { paginationAndSortingValidation } from '../../core/middleware/validation/query-pagination-sorting.validation-middleware';
import { BlogSortField } from './input/blog-sort-field';
import { PostSortField } from '../../posts/routers/input/post-sort-field';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';
import { getBlogPostListHandler } from './handlers/get-blog-post-list.handler';
import { createBlogForPostHandler } from './handlers/create-blog-post.handler';
import { BlogPostBodyValidationMiddleware } from '../../posts/middleware/BlogPostBodyValidationMiddleware';

export const blogsRouter = Router({});

blogsRouter
  .get(
    '',
    query('searchNameTerm').optional().isString(),
    paginationAndSortingValidation(BlogSortField),
    inputValidationResultMiddleware,
    getBlogsListHandler,
  )

  .get('/:id', getBlogByIdHandler)
  .post(
    '',
    superAdminGuardMiddleware,
    BlogHasValidFIeldsMiddleware,
    createBlogHandler,
  )

  .put(
    '/:id',
    superAdminGuardMiddleware,
    BlogHasValidFIeldsMiddleware,
    updateBlogHandler,
  )

  .delete('/:id', superAdminGuardMiddleware, deleteBlogHandler)
  .get(
    '/:id/posts',
    idValidation,
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getBlogPostListHandler,
  )
  .post(
    '/:id/posts',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    BlogPostBodyValidationMiddleware,
    createBlogForPostHandler,
  );
