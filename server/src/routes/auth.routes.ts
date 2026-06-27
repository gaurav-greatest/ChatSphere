import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authLimiter } from '../middlewares/rate-limit.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetPasswordParamsSchema,
  verifyEmailParamsSchema,
} from '../validations/auth.validation.js';

const router = Router();

// Public routes (with stricter rate limiting)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post(
  '/reset-password/:token',
  authLimiter,
  validate(resetPasswordParamsSchema, 'params'),
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.get(
  '/verify-email/:token',
  validate(verifyEmailParamsSchema, 'params'),
  authController.verifyEmail,
);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;
