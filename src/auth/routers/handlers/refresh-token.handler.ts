import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { setRefreshTokenCookie } from '../../utils/cookie.utils';

export async function refreshTokenHandler(req: Request, res: Response) {
  try {
    const token: string = req.cookies.refreshToken;
    const result = await authService.refreshTokens(token);

    if (result.status !== ResultStatus.Success) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    setRefreshTokenCookie(res, result.data!.refreshToken);

    return res
      .status(HttpStatuses.Success)
      .send({ accessToken: result.data!.accessToken });
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
