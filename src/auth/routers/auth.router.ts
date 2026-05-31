import { Router } from 'express';
import { loginUserHandler } from './handlers/login-user.handler';
import { getMeHandler } from './handlers/get-me.handler';
import { accessTokenGuard } from '../guards/access.token.guard';

export const authRouter = Router({});

authRouter.post('/login', loginUserHandler);
authRouter.get('/me',
  accessTokenGuard,
  getMeHandler);
