import { HttpStatuses } from '../types/httpStatuses';
import { ResultStatus } from './resultCode';

export const resultCodeToHttpException = (resultCode: ResultStatus): number => {
  switch (resultCode) {
    case ResultStatus.BadRequest:
      return HttpStatuses.BadRequest;
    case ResultStatus.Forbidden:
      return HttpStatuses.Forbidden;
    default:
      return HttpStatuses.ServerError;
  }
};
