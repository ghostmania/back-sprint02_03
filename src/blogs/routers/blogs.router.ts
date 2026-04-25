import { Router } from 'express';
import { getBlogsListHandler } from './handlers/get-blog-list.hadler';
import { getBlogByIdHandler } from './handlers/get-blog-by-id.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';
import { superAdminGuardMiddleware } from '../../auth/admin.guard-middleware';
import { BlogHasValidFIeldsMiddleware } from '../../posts/middleware/BlogHasValidFIeldsMW';

export const blogsRouter = Router({});

blogsRouter
  .get('', getBlogsListHandler)

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

  .delete('/:id', superAdminGuardMiddleware, deleteBlogHandler);
