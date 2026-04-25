import { HttpStatus } from '../../../core/types/http-statuses';
import { db } from '../../../db/posts.db';
import { Request, Response } from 'express';

export function getPostsListHandler(req: Request, res: Response) {
  res.status(HttpStatus.Ok).send(db.posts);
}
