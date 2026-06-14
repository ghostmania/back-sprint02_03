import { body } from 'express-validator';
import { inputValidationResultMiddleware } from '../../core/middleware/validation/input-validtion-result.middleware';

export const registrationValidation = [
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
];
