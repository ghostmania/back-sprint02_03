import { Request, Response } from 'express';
import { matchedData } from 'express-validator';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { UserAttributes } from '../../../users/dto/user.attributes';
import { createErrorMessages } from '../../../core/utils/error.utils';

export async function registrationHandler(req: Request, res: Response) {
  try {
    const dto = matchedData<UserAttributes>(req, { locations: ['body'] });
    const result = await authService.registerUser(dto);

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
