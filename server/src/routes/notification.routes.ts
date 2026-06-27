import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { z } from 'zod';

const router = Router();

// Apply auth protection to all notification routes
router.use(authenticate);

const notificationIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid notification ID'),
});

const getNotificationsQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).max(100).default(20)),
});

router.get('/', validate(getNotificationsQuerySchema, 'query'), notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', validate(notificationIdParamSchema, 'params'), notificationController.markAsRead);

export default router;
