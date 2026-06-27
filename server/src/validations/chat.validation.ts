import { z } from 'zod';

export const createDirectChatSchema = z.object({
  recipientId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid recipient ID'),
});

export const createGroupChatSchema = z.object({
  groupName: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name cannot exceed 100 characters')
    .trim(),
  groupDescription: z.string().max(300, 'Group description cannot exceed 300 characters').optional(),
  members: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid member ID'))
    .min(1, 'A group must have at least one other member'),
});

export const updateGroupChatSchema = z.object({
  groupName: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name cannot exceed 100 characters')
    .trim()
    .optional(),
  groupDescription: z.string().max(300, 'Group description cannot exceed 300 characters').optional(),
  groupAvatar: z.string().url('Invalid avatar URL').optional(),
});

export const addRemoveMemberSchema = z.object({
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export const updateAdminRoleSchema = z.object({
  targetUserId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  isAdmin: z.boolean(),
});

export const chatIdParamSchema = z.object({
  chatId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid chat ID'),
});
