import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import * as notificationService from '../services/notification.service.js';
import { safeParseInt, getTotalPages } from '../utils/helpers.js';

// ─── Get Notifications ──────────────────────────────────────
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = safeParseInt(req.query.page as string, 1);
  const limit = safeParseInt(req.query.limit as string, 20);

  const { notifications, total } = await notificationService.getUserNotifications(
    req.userId!,
    page,
    limit,
  );
  const totalPages = getTotalPages(total, limit);

  ApiResponse.success(
    res,
    notifications,
    'Notifications retrieved successfully',
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

// ─── Mark as Read ───────────────────────────────────────────
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await notificationService.markAsRead(req.params.id as string, req.userId!);
  ApiResponse.success(res, notification, 'Notification marked as read');
});

// ─── Mark All as Read ───────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllAsRead(req.userId!);
  ApiResponse.success(res, null, 'All notifications marked as read');
});
