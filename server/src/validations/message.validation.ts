import { z } from 'zod';
import { MessageType } from '@chatsphere/shared';

export const sendMessageSchema = z.object({
  content: z.string().trim().max(5000, 'Message cannot exceed 5000 characters').default(''),
  type: z.enum(Object.values(MessageType) as [string, ...string[]]).default(MessageType.TEXT),
  attachments: z
    .array(
      z.object({
        url: z.string().url('Invalid attachment URL'),
        publicId: z.string().min(1, 'publicId is required'),
        type: z.string().min(1, 'Type is required'),
        size: z.number().positive('Size must be positive'),
        name: z.string().min(1, 'Name is required'),
        mimeType: z.string().min(1, 'Mime type is required'),
        thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
      }),
    )
    .optional(),
  replyTo: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid reply message ID').optional(),
}).refine(
  (data) => data.content.length > 0 || (data.attachments && data.attachments.length > 0),
  {
    message: 'Message must have either content or attachments',
    path: ['content'],
  }
);

export const editMessageSchema = z.object({
  content: z.string().trim().min(1, 'Message content cannot be empty').max(5000, 'Message cannot exceed 5000 characters'),
});

export const addReactionSchema = z.object({
  emoji: z.string().min(1, 'Emoji is required').max(10, 'Invalid emoji'),
});

export const forwardMessageSchema = z.object({
  messageIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid message ID')).min(1, 'Must forward at least one message'),
  targetChatIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid chat ID')).min(1, 'Must select at least one chat target'),
});

export const messageIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid message ID'),
});

export const searchMessageQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
  chatId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid chat ID').optional(),
});

export const getMessagesQuerySchema = z.object({
  page: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => parseInt(val as string, 10), z.number().int().min(1).max(100).default(50)),
});
