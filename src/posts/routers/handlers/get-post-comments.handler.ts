import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { HttpStatus } from '../../../core/types/http-statuses';
import { RepositoryNotFoundError } from '../../../core/errors/repository-not-found.error';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { CommentQueryInput } from '../../../comments/routers/input/comment-query.input';
import { CommentSortField } from '../../../comments/routers/input/comment-sort-field';
import { commentsService } from '../../../comments/application/comments.service';
import { mapToCommentListPaginatedOutput } from '../../../comments/routers/mappers/map-to-comment-list-paginated-output.util';

export async function getPostCommentsHandler(
  req: Request<{ postId: string }>,
  res: Response,
) {
  try {
    const sanitizedQuery = matchedData<CommentQueryInput>(req, {
      locations: ['query'],
      includeOptionals: true,
    });
    const queryInput =
      setDefaultSortAndPaginationIfNotExist<CommentSortField>(sanitizedQuery);
    const { items, totalCount } = await commentsService.findManyForPost(
      queryInput,
      req.params.postId,
    );

    res.send(
      mapToCommentListPaginatedOutput(items, {
        pageNumber: queryInput.pageNumber,
        pageSize: queryInput.pageSize,
        totalCount,
      }),
    );
  } catch (e: unknown) {
    if (e instanceof RepositoryNotFoundError) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }

    res.sendStatus(HttpStatus.InternalServerError);
  }
}
