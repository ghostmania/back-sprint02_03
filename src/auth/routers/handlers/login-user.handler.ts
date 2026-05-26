import { Request, Response } from 'express';
import { LoginAttributes } from '../../dto/login.attributes';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { resultCodeToHttpException } from '../../../common/result/resultCodeToHttpException';
import { HttpStatuses } from '../../../common/types/httpStatuses';

export async function loginUserHandler(
  req: Request<{}, {}, LoginAttributes>,
  res: Response,
) {
  try {
    const result = await authService.login(req.body);
    if (result.status !== ResultStatus.Success) {
      return res
        .status(resultCodeToHttpException(result.status))
        .send(result.extensions);
    }

    return res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data!.accessToken });
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
