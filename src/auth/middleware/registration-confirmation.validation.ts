import { body } from 'express-validator';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';

export const registrationConfirmationValidation = [
  body('code')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Confirmation code is required'),
  inputValidationResultMiddleware,
];
