import { body } from 'express-validator';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';

export const registrationEmailResendingValidation = [
  body('email').isEmail().withMessage('Email must be a valid email address'),
  inputValidationResultMiddleware,
];
