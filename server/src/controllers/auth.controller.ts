import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import * as authService from '../services/auth.service.js';
import env from '../config/env.js';

const REFRESH_TOKEN_COOKIE = 'chatsphere_refresh_token';

const getRefreshTokenCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/v1/auth',
});

// ─── Register ───────────────────────────────────────────────
export const register = asyncHandler(async (req: Request, res: Response) => {
  const deviceInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const result = await authService.registerUser(req.body, deviceInfo);

  // Set refresh token as HTTP-only cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshTokenCookieOptions());

  ApiResponse.created(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Registration successful. Please verify your email.');
});

// ─── Login ──────────────────────────────────────────────────
export const login = asyncHandler(async (req: Request, res: Response) => {
  const deviceInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const result = await authService.loginUser(req.body, deviceInfo);

  // Set refresh token as HTTP-only cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshTokenCookieOptions());

  ApiResponse.success(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Login successful');
});

// ─── Refresh Token ──────────────────────────────────────────
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  // Get refresh token from cookie or body
  const token = req.cookies[REFRESH_TOKEN_COOKIE] || req.body.refreshToken;

  const deviceInfo = {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  const result = await authService.refreshAccessToken(token, deviceInfo);

  // Set new refresh token cookie
  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, getRefreshTokenCookieOptions());

  ApiResponse.success(res, {
    user: result.user,
    accessToken: result.accessToken,
  }, 'Token refreshed');
});

// ─── Logout ─────────────────────────────────────────────────
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenValue = req.cookies[REFRESH_TOKEN_COOKIE];

  if (req.userId) {
    await authService.logoutUser(req.userId, refreshTokenValue);
  }

  // Clear refresh token cookie
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? ('none' as const) : ('lax' as const),
    path: '/api/v1/auth',
  });

  ApiResponse.success(res, null, 'Logged out successfully');
});

// ─── Verify Email ───────────────────────────────────────────
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token as string);
  ApiResponse.success(res, null, 'Email verified successfully');
});

// ─── Forgot Password ───────────────────────────────────────
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  // Always return success to prevent email enumeration
  ApiResponse.success(res, null, 'If an account with that email exists, a password reset link has been sent.');
});

// ─── Reset Password ────────────────────────────────────────
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token as string, req.body.password);
  ApiResponse.success(res, null, 'Password reset successful. You can now log in with your new password.');
});

// ─── Get Current User ───────────────────────────────────────
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.userId!);
  ApiResponse.success(res, { user }, 'User fetched successfully');
});
