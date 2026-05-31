import { HttpStatuses } from '../types/httpStatuses';
import { ResultStatus } from './resultCode';

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
  switch (resultCode) {
    case ResultStatus.BadRequest:
      return HttpStatuses.BadRequest;
    case ResultStatus.Forbidden:
      return HttpStatuses.Forbidden;
    case ResultStatus.NotFound:
      return HttpStatuses.NotFound;
    case ResultStatus.Unauthorized:
      return HttpStatuses.Unauthorized;
    default:
      return HttpStatuses.ServerError;
  }
};
