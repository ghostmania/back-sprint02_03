import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';

export async function registrationEmailResendingHandler(
  req: Request,
  res: Response,
) {
  try {
    const { email } = matchedData<{ email: string }>(req, {
      locations: ['body'],
    });
    const result = await authService.resendConfirmationEmail(email);

    if (result.status !== ResultStatus.Success) {
      res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
      return;
    }

    res.sendStatus(HttpStatus.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
