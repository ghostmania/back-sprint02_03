import { HttpStatus } from '../../../core/types/http-statuses';
import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';

export async function getPostsListHandler(req: Request, res: Response) {
  try {
    const drivers = await postsRepository.findAll();
    res.send(drivers);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
