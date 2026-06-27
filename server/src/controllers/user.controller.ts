import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import * as userService from '../services/user.service.js';
import { safeParseInt, getTotalPages } from '../utils/helpers.js';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateProfile(req.userId!, req.body);
  ApiResponse.success(res, { user }, 'Profile updated successfully');
});

export const updatePrivacySettings = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updatePrivacySettings(req.userId!, req.body);
  ApiResponse.success(res, { user }, 'Privacy settings updated successfully');
});

export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const page = safeParseInt(req.query.page as string, 1);
  const limit = safeParseInt(req.query.limit as string, 20);

  const { users, total } = await userService.searchUsers(req.userId!, query, page, limit);
  const totalPages = getTotalPages(total, limit);

  ApiResponse.success(
    res,
    users,
    'Users searched successfully',
    200,
    {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  );
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await userService.getUserById(req.params.id as string, req.userId!);
  ApiResponse.success(res, profile, 'User profile fetched successfully');
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.blockUser(req.userId!, req.params.id as string);
  ApiResponse.success(res, null, 'User blocked successfully');
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.unblockUser(req.userId!, req.params.id as string);
  ApiResponse.success(res, null, 'User unblocked successfully');
});
