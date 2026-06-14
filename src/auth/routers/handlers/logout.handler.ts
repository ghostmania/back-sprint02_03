import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { ResultStatus } from '../../../common/result/resultCode';
import { HttpStatuses } from '../../../common/types/httpStatuses';
import { clearRefreshTokenCookie } from '../../utils/cookie.utils';

export async function logoutHandler(req: Request, res: Response) {
  try {
    const token: string = req.cookies.refreshToken;
    const result = await authService.logout(token);

    if (result.status !== ResultStatus.Success) {
      return res.sendStatus(HttpStatuses.Unauthorized);
    }

    clearRefreshTokenCookie(res);

    return res.sendStatus(HttpStatuses.NoContent);
  } catch (e: unknown) {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
