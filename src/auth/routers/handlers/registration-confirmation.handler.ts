import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function registrationConfirmationHandler(
  req: Request,
  res: Response,
) {
  try {
    const { code } = matchedData<{ code: string }>(req, {
      locations: ['body'],
    });
    const result = await authService.confirmRegistration(code);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send(createErrorMessages(result.extensions));
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
