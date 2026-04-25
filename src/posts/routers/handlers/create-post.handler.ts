import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { Post } from '../../types/post';
import { PostInputDto } from '../../dto/post.input-dto';
import { postsRepository } from '../../repositories/posts.repository';

export async function createPostHandler(
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) {
  try {
    const newDriver: Post = {
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: req.body.blogId,
      blogName: 'FIX',
      id: req.body.title,
    };

    const createdPost = await postsRepository.create(newDriver);
    // const driverViewModel = mapToDriverViewModel(createdDriver);
    res.status(HttpStatus.Created).send(createdPost);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
