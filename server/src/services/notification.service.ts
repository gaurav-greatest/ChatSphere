import mongoose from 'mongoose';
import Notification from '../models/notification.model.js';
import type { INotificationDocument } from '../models/notification.model.js';
import { ApiError } from '../utils/api-error.js';
import type { NotificationType } from '@chatsphere/shared';

// ─── Create Notification ────────────────────────────────────
export const createNotification = async (
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<INotificationDocument> => {
  const notification = await Notification.create({
    userId: new mongoose.Types.ObjectId(userId),
    type,
    title,
    body,
    data,
  });
  return notification;
};

// ─── Get User Notifications ─────────────────────────────────
export const getUserNotifications = async (
  userId: string,
  page: number,
  limit: number,
): Promise<{ notifications: INotificationDocument[]; total: number }> => {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec(),
    Notification.countDocuments(filter),
  ]);

  return { notifications, total };
};

// ─── Mark Notification as Read ──────────────────────────────
export const markAsRead = async (
  notificationId: string,
  userId: string,
): Promise<INotificationDocument> => {
  const notification = await Notification.findOne({
    _id: new mongoose.Types.ObjectId(notificationId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

// ─── Mark All as Read ───────────────────────────────────────
export const markAllAsRead = async (userId: string): Promise<void> => {
  await Notification.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), read: false },
    { $set: { read: true, readAt: new Date() } },
  );
};
