import { Router } from 'express';
import { loginUserHandler } from './handlers/login-user.handler';
import { getMeHandler } from './handlers/get-me.handler';
import { registrationHandler } from './handlers/registration.handler';
import { registrationConfirmationHandler } from './handlers/registration-confirmation.handler';
import { registrationEmailResendingHandler } from './handlers/registration-email-resending.handler';
import { refreshTokenHandler } from './handlers/refresh-token.handler';
import { logoutHandler } from './handlers/logout.handler';
import { accessTokenGuard } from '../guards/access.token.guard';
import { refreshTokenGuard } from '../guards/refresh-token.guard';
import { registrationValidation } from '../middleware/registration.validation';
import { registrationConfirmationValidation } from '../middleware/registration-confirmation.validation';
import { registrationEmailResendingValidation } from '../middleware/registration-email-resending.validation';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';

export const authRouter = Router({});

authRouter.post('/login', rateLimitMiddleware, loginUserHandler);

authRouter.post(
  '/refresh-token',
  rateLimitMiddleware,
  refreshTokenGuard,
  refreshTokenHandler,
);

authRouter.post('/logout', refreshTokenGuard, logoutHandler);

authRouter.get('/me', accessTokenGuard, getMeHandler);

authRouter.post(
  '/registration',
  rateLimitMiddleware,
  ...registrationValidation,
  registrationHandler,
);

authRouter.post(
  '/registration-confirmation',
  rateLimitMiddleware,
  ...registrationConfirmationValidation,
  registrationConfirmationHandler,
);

authRouter.post(
  '/registration-email-resending',
  rateLimitMiddleware,
  ...registrationEmailResendingValidation,
  registrationEmailResendingHandler,
);
