import { HttpStatus } from '../../../core/types/http-statuses';
import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { BlogQueryInput } from '../input/blog-query.input';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { blogsService } from '../../application/blogs.service';
import { mapToBlogViewModel } from '../../mappers/map-to-blog-view-model.util';

export async function getBlogsListHandler(req: Request, res: Response) {
  try {
    const sanitizedQuery = matchedData<BlogQueryInput>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const queryInput = setDefaultSortAndPaginationIfNotExist(sanitizedQuery);

    const { items } = await blogsService.findMany(queryInput);

    res.send(items.map(mapToBlogViewModel));
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
