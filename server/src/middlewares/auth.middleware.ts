import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header, verifies it, and attaches userId to request.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized(ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized(ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
      return;
    }
    next(ApiError.unauthorized(ERROR_MESSAGES.TOKEN_INVALID));
  }
};

/**
 * Optional authentication — doesn't fail if no token is present,
 * but attaches userId if a valid token is provided.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = verifyAccessToken(token);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
      }
    }
    next();
  } catch {
    // Silently continue without authentication
    next();
  }
};
