import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';
import { getAuth, clerkClient } from '@clerk/express';
import User from '../models/user.model.js';
import { logger } from '../utils/logger.js';

// Extend Express Request to include authenticated user details
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Syncs the Clerk authenticated user with the local Mongoose Database (JIT Provisioning).
 */
const getOrCreateLocalUser = async (clerkUserId: string): Promise<{ id: string; email: string }> => {
  // 1. Check if user already exists
  let user = await User.findOne({ clerkId: clerkUserId });
  
  if (user) {
    return { id: user._id.toString(), email: user.email };
  }

  // 2. JIT User Provisioning: Fetch user metadata from Clerk
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw ApiError.badRequest('Clerk account has no primary email address');
    }

    // Clerk username might be null if registered via OAuth/phone
    const username = clerkUser.username || `clerk_${clerkUserId.substring(5, 15)}`;
    const displayName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || username;

    user = await User.create({
      clerkId: clerkUserId,
      email,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      displayName,
      provider: 'clerk',
      isEmailVerified: true,
      avatar: clerkUser.imageUrl,
    });

    logger.info(`JIT Provisioned local database user: ${email} (clerkId: ${clerkUserId})`);
    return { id: user._id.toString(), email: user.email };
  } catch (err: any) {
    logger.error(`Failed to provision user for clerkUserId ${clerkUserId}:`, err);
    throw ApiError.internal('Authentication user syncing failed');
  }
};

/**
 * Authentication middleware.
 * Verifies Clerk token, provisions user locally if needed, and attaches userId.
 */
export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    
    if (!auth || !auth.userId) {
      throw ApiError.unauthorized(ERROR_MESSAGES.TOKEN_REQUIRED);
    }

    const localUser = await getOrCreateLocalUser(auth.userId);
    req.userId = localUser.id;
    req.userEmail = localUser.email;
    
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
 * Optional authentication — attaches authenticated local userId if valid Clerk token is present.
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const auth = getAuth(req);
    
    if (auth && auth.userId) {
      const localUser = await getOrCreateLocalUser(auth.userId);
      req.userId = localUser.id;
      req.userEmail = localUser.email;
    }
    next();
  } catch {
    // Silently continue without authentication
    next();
  }
};
