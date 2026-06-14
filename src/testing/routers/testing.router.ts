import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import {
  blogsCollection,
  commentsCollection,
  postsCollection,
  refreshTokensCollection,
  usersCollection,
} from '../../db/mongo.db';

export const testingRouter = Router({});

testingRouter.delete('/all-data', async (req: Request, res: Response) => {
  if (blogsCollection) {
    await blogsCollection.deleteMany({});
  }
  if (postsCollection) {
    await postsCollection.deleteMany({});
  }
  if (usersCollection) {
    await usersCollection.deleteMany({});
  }
  if (commentsCollection) {
    await commentsCollection.deleteMany({});
  }
  if (refreshTokensCollection) {
    await refreshTokensCollection.deleteMany({});
  }
  res.sendStatus(HttpStatus.NoContent);
});
