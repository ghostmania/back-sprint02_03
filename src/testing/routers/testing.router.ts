import { Router, Request, Response } from 'express';
import { HttpStatus } from '../../core/types/http-statuses';
import {
  apiRequestsCollection,
  blogsCollection,
  commentsCollection,
  postsCollection,
  securityDevicesCollection,
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
  if (securityDevicesCollection) {
    await securityDevicesCollection.deleteMany({});
  }
  if (apiRequestsCollection) {
    await apiRequestsCollection.deleteMany({});
  }
  res.sendStatus(HttpStatus.NoContent);
});
