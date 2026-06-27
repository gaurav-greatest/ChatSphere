import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  sendMessageSchema,
  editMessageSchema,
  addReactionSchema,
  forwardMessageSchema,
  messageIdParamSchema,
  searchMessageQuerySchema,
  getMessagesQuerySchema,
} from '../validations/message.validation.js';
import { chatIdParamSchema } from '../validations/chat.validation.js';

const router = Router();

// Apply auth protection to all message routes
router.use(authenticate);

// ─── Search messages globally or inside a chat ──────────────
router.get('/search', validate(searchMessageQuerySchema, 'query'), messageController.searchMessages);

// ─── Forward messages ───────────────────────────────────────
router.post('/forward', validate(forwardMessageSchema), messageController.forwardMessages);

// ─── Chat-specific Message Operations ───────────────────────
router.post('/chats/:chatId/messages', validate(chatIdParamSchema, 'params'), validate(sendMessageSchema), messageController.sendMessage);
router.get('/chats/:chatId/messages', validate(chatIdParamSchema, 'params'), validate(getMessagesQuerySchema, 'query'), messageController.getChatMessages);

// ─── Individual Message Operations ──────────────────────────
router.patch('/:id', validate(messageIdParamSchema, 'params'), validate(editMessageSchema), messageController.editMessage);
router.delete('/:id', validate(messageIdParamSchema, 'params'), messageController.deleteMessage);

// ─── Reactions ──────────────────────────────────────────────
router.post('/:id/react', validate(messageIdParamSchema, 'params'), validate(addReactionSchema), messageController.reactToMessage);
router.delete('/:id/react', validate(messageIdParamSchema, 'params'), messageController.removeReaction);

// ─── Pins ───────────────────────────────────────────────────
router.post('/:id/pin', validate(messageIdParamSchema, 'params'), messageController.togglePin);

export default router;
