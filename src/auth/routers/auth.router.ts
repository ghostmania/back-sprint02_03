import { Router } from 'express';
import { body } from 'express-validator';
import { loginUserHandler } from './handlers/login-user.handler';
import { getMeHandler } from './handlers/get-me.handler';
import { registrationHandler } from './handlers/registration.handler';
import { registrationConfirmationHandler } from './handlers/registration-confirmation.handler';
import { registrationEmailResendingHandler } from './handlers/registration-email-resending.handler';
import { accessTokenGuard } from '../guards/access.token.guard';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';

export const authRouter = Router({});

authRouter.post('/login', loginUserHandler);

authRouter.get('/me', accessTokenGuard, getMeHandler);

authRouter.post(
  '/registration',
  body('login')
    .isString()
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('Login must be 3-10 characters')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Login must contain only letters, digits, underscore or dash'),
  body('password')
    .isString()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Password must be 6-20 characters'),
  body('email').isEmail().withMessage('Email must be a valid email address'),
  inputValidationResultMiddleware,
  registrationHandler,
);

authRouter.post(
  '/registration-confirmation',
  body('code')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Confirmation code is required'),
  inputValidationResultMiddleware,
  registrationConfirmationHandler,
);

authRouter.post(
  '/registration-email-resending',
  body('email').isEmail().withMessage('Email must be a valid email address'),
  inputValidationResultMiddleware,
  registrationEmailResendingHandler,
);
