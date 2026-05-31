import { ValidationError } from '../../blogs/types/validationError';
import { CommentInputDto } from '../dto/comment.input-dto';

export const commentInputDtoValidation = (
  data: CommentInputDto,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (
    !data.content ||
    (data.content && typeof data.content !== 'string') ||
    (data.content && data.content.trim().length < 20) ||
    (data.content && data.content.trim().length > 300)
  ) {
    errors.push({ field: 'content', message: 'Invalid comment content' });
  }

  return errors;
};
