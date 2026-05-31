import { WithId } from 'mongodb';
import { Comment } from '../types/comment';
import { CommentViewModel } from '../types/comment-view-model';

export function mapToCommentViewModel(
  comment: WithId<Comment>,
): CommentViewModel {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: comment.commentatorInfo,
    createdAt: comment.createdAt.toISOString(),
  };
}
