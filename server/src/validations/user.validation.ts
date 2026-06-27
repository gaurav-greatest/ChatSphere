import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name cannot exceed 50 characters')
    .optional(),
  bio: z.string().max(200, 'Bio cannot exceed 200 characters').optional(),
  statusMessage: z.string().max(100, 'Status message cannot exceed 100 characters').optional(),
});

export const updatePrivacySettingsSchema = z.object({
  showLastSeen: z.enum(['everyone', 'contacts', 'nobody']).optional(),
  showAvatar: z.enum(['everyone', 'contacts', 'nobody']).optional(),
  showStatus: z.enum(['everyone', 'contacts', 'nobody']).optional(),
  readReceipts: z.boolean().optional(),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export const searchUserQuerySchema = z.object({
  q: z.string().min(1, 'Search query cannot be empty'),
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).max(100).default(20)),
});
