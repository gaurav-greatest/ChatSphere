import User from '../models/user.model.js';
import RefreshToken from '../models/refresh-token.model.js';
import type { IUserDocument } from '../models/user.model.js';
import { ApiError } from '../utils/api-error.js';
import { ERROR_MESSAGES } from '../constants/error-messages.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateRandomToken,
  hashToken,
} from '../utils/token.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service.js';
import { logger } from '../utils/logger.js';
import type { RegisterInput, LoginInput } from '../validations/auth.validation.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: Record<string, unknown>;
  accessToken: string;
  refreshToken: string;
}

// ─── Register ───────────────────────────────────────────────
export const registerUser = async (
  input: RegisterInput,
  deviceInfo?: { userAgent?: string; ip?: string },
): Promise<AuthResponse> => {
  const { username, email, password, displayName } = input;

  // Check if email already exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw ApiError.conflict(ERROR_MESSAGES.USER_ALREADY_EXISTS);
  }

  // Check if username already exists
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw ApiError.conflict(ERROR_MESSAGES.USERNAME_TAKEN);
  }

  // Generate email verification token
  const verificationToken = generateRandomToken();
  const verificationTokenHash = hashToken(verificationToken);

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    displayName,
    emailVerificationToken: verificationTokenHash,
    emailVerificationExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  // Generate auth tokens
  const tokens = await createAuthTokens(user, deviceInfo);

  // Send verification email (non-blocking — don't fail registration if email fails)
  sendVerificationEmail(email, displayName, verificationToken).catch((err) => {
    logger.error('Failed to send verification email:', err);
  });

  logger.info(`New user registered: ${email}`);

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

// ─── Login ──────────────────────────────────────────────────
export const loginUser = async (
  input: LoginInput,
  deviceInfo?: { userAgent?: string; ip?: string },
): Promise<AuthResponse> => {
  const { email, password } = input;

  // Find user with password field (excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Check if account is a social login
  if (user.provider !== 'local') {
    throw ApiError.unauthorized(`This account uses ${user.provider} login. Please sign in with ${user.provider}.`);
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  // Generate auth tokens
  const tokens = await createAuthTokens(user, deviceInfo);

  // Update online status
  user.isOnline = true;
  user.lastSeen = new Date();
  await user.save({ validateBeforeSave: false });

  logger.info(`User logged in: ${email}`);

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

// ─── Refresh Token ──────────────────────────────────────────
export const refreshAccessToken = async (
  refreshTokenValue: string,
  deviceInfo?: { userAgent?: string; ip?: string },
): Promise<AuthResponse> => {
  if (!refreshTokenValue) {
    throw ApiError.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED);
  }

  // Verify the JWT structure of the refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenValue);
  } catch {
    throw ApiError.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
  }

  // Check if the token exists in the database
  const tokenHash = hashToken(refreshTokenValue);
  const storedToken = await RefreshToken.findOne({
    userId: decoded.userId,
    tokenHash,
    isRevoked: false,
  });

  if (!storedToken) {
    // Possible token reuse — revoke all tokens for this user (security measure)
    await RefreshToken.updateMany(
      { userId: decoded.userId },
      { isRevoked: true },
    );
    logger.warn(`Potential refresh token reuse detected for user: ${decoded.userId}`);
    throw ApiError.unauthorized(ERROR_MESSAGES.REFRESH_TOKEN_INVALID);
  }

  // Check if token has expired
  if (storedToken.expiresAt < new Date()) {
    await storedToken.deleteOne();
    throw ApiError.unauthorized(ERROR_MESSAGES.TOKEN_EXPIRED);
  }

  // Revoke old token
  await storedToken.deleteOne();

  // Find user
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw ApiError.unauthorized(ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Generate new token pair (rotation)
  const tokens = await createAuthTokens(user, deviceInfo);

  return {
    user: user.toJSON(),
    ...tokens,
  };
};

// ─── Logout ─────────────────────────────────────────────────
export const logoutUser = async (
  userId: string,
  refreshTokenValue?: string,
): Promise<void> => {
  if (refreshTokenValue) {
    // Revoke specific token
    const tokenHash = hashToken(refreshTokenValue);
    await RefreshToken.deleteOne({ userId, tokenHash });
  } else {
    // Revoke all tokens for this user
    await RefreshToken.deleteMany({ userId });
  }

  // Update online status
  await User.findByIdAndUpdate(userId, {
    isOnline: false,
    lastSeen: new Date(),
  });

  logger.info(`User logged out: ${userId}`);
};

// ─── Verify Email ───────────────────────────────────────────
export const verifyEmail = async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpiry: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpiry');

  if (!user) {
    throw ApiError.badRequest(ERROR_MESSAGES.TOKEN_INVALID);
  }

  if (user.isEmailVerified) {
    throw ApiError.badRequest(ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({ validateBeforeSave: false });

  logger.info(`Email verified for user: ${user.email}`);
};

// ─── Forgot Password ───────────────────────────────────────
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });

  // Always return success (don't reveal if email exists)
  if (!user) {
    return;
  }

  if (user.provider !== 'local') {
    return; // Social accounts don't have passwords
  }

  // Generate reset token
  const resetToken = generateRandomToken();
  const resetTokenHash = hashToken(resetToken);

  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save({ validateBeforeSave: false });

  // Send reset email
  await sendPasswordResetEmail(user.email, user.displayName, resetToken);

  logger.info(`Password reset requested for: ${email}`);
};

// ─── Reset Password ────────────────────────────────────────
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpiry: { $gt: new Date() },
  }).select('+passwordResetToken +passwordResetExpiry');

  if (!user) {
    throw ApiError.badRequest(ERROR_MESSAGES.PASSWORD_RESET_EXPIRED);
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpiry = undefined;
  await user.save();

  // Revoke all refresh tokens (force re-login)
  await RefreshToken.deleteMany({ userId: user._id });

  logger.info(`Password reset completed for: ${user.email}`);
};

// ─── Get Current User ───────────────────────────────────────
export const getCurrentUser = async (userId: string): Promise<IUserDocument> => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound(ERROR_MESSAGES.USER_NOT_FOUND);
  }
  return user;
};

// ─── Helper: Create Auth Tokens ─────────────────────────────
const createAuthTokens = async (
  user: IUserDocument,
  deviceInfo?: { userAgent?: string; ip?: string },
): Promise<AuthTokens> => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token hash in database
  const tokenHash = hashToken(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo,
  });

  return { accessToken, refreshToken };
};
