import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import { db as blogsDb } from '../../db/blogs.db';
import { db as postsDb } from '../../db/posts.db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', (req: Request, res: Response) => {
  blogsDb.blogs = [];
  postsDb.posts = [];
  res.sendStatus(HttpStatus.NoContent);
});
