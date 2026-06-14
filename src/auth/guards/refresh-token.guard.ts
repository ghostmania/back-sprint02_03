import { NextFunction, Request, Response } from 'express';
import { jwtService } from '../adapters/jwt.service';
import { IdType } from '../../common/types/id';

export const refreshTokenGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token: string | undefined = req.cookies?.refreshToken;
  if (!token) {
    return res.sendStatus(401);
  }

  const payload = await jwtService.verifyRefreshToken(token);
  if (!payload) {
    return res.sendStatus(401);
  }

  req.user = { id: payload.userId } as IdType;
  next();
};
