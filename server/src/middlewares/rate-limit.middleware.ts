import rateLimit from 'express-rate-limit';
import env from '../config/env.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';

/** Default rate limiter: 100 requests per 15 minutes */
export const defaultLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Strict limiter for auth endpoints: 5 requests per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/** Upload limiter: 20 uploads per 15 minutes */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: ERROR_MESSAGES.RATE_LIMIT,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
