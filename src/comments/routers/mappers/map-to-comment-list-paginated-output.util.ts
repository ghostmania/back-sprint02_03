import { WithId } from 'mongodb';
import { Comment } from '../../types/comment';
import { mapToCommentViewModel } from '../../mappers/map-to-comment-view-model.util';

export function mapToCommentListPaginatedOutput(
  comments: WithId<Comment>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
) {
  return {
    pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
    page: meta.pageNumber,
    pageSize: meta.pageSize,
    totalCount: meta.totalCount,
    items: comments.map(mapToCommentViewModel),
  };
}
