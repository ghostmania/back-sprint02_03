import { ValidationError } from '../types/validationError';
import { BlogInputDto } from '../dto/blog.input-dto';

const WEBSITE_URL_PATTERN =
  /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;

export const blogInputDtoValidation = (
  data: BlogInputDto,
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (
    !data.name ||
    (data.name && typeof data.name !== 'string') ||
    (data.name && data.name.trim().length < 1) ||
    (data.name && data.name.trim().length > 15)
  ) {
    errors.push({ field: 'name', message: 'Invalid blog name' });
  }

  if (
    !data.description ||
    (data.description && typeof data.description !== 'string') ||
    (data.description && data.description.trim().length < 1) ||
    (data.description && data.description.trim().length > 500)
  ) {
    errors.push({ field: 'description', message: 'Invalid blog description' });
  }

  if (
    !data.websiteUrl ||
    (data.websiteUrl && typeof data.websiteUrl !== 'string') ||
    (data.websiteUrl && data.websiteUrl.trim().length < 1) ||
    (data.websiteUrl && data.websiteUrl.trim().length > 100) ||
    (data.websiteUrl &&
      typeof data.websiteUrl === 'string' &&
      !WEBSITE_URL_PATTERN.test(data.websiteUrl.trim()))
  ) {
    errors.push({ field: 'websiteUrl', message: 'Invalid blog websiteUrl' });
  }

  return errors;
};
