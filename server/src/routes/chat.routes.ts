import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createDirectChatSchema,
  createGroupChatSchema,
  updateGroupChatSchema,
  addRemoveMemberSchema,
  updateAdminRoleSchema,
  chatIdParamSchema,
} from '../validations/chat.validation.js';

const router = Router();

// Apply auth protection to all chat/group routes
router.use(authenticate);

// ─── Direct Chats & Chat Lists ──────────────────────────────
router.post('/', validate(createDirectChatSchema), chatController.createDirectChat);
router.get('/', chatController.getUserChats);
router.get('/:chatId', validate(chatIdParamSchema, 'params'), chatController.getChatDetails);
router.delete('/:chatId', validate(chatIdParamSchema, 'params'), chatController.deleteOrLeaveChat);

// ─── Archive & Mute ─────────────────────────────────────────
router.patch('/:chatId/archive', validate(chatIdParamSchema, 'params'), chatController.toggleArchive);
router.patch('/:chatId/mute', validate(chatIdParamSchema, 'params'), chatController.toggleMute);

// ─── Group Chat Operations ──────────────────────────────────
router.post('/groups', validate(createGroupChatSchema), chatController.createGroupChat);
router.patch('/groups/:chatId', validate(chatIdParamSchema, 'params'), validate(updateGroupChatSchema), chatController.updateGroupDetails);
router.post('/groups/:chatId/members', validate(chatIdParamSchema, 'params'), validate(addRemoveMemberSchema), chatController.addGroupMember);
router.delete('/groups/:chatId/members/:userId', validate(chatIdParamSchema, 'params'), chatController.removeGroupMember);
router.patch('/groups/:chatId/admins', validate(chatIdParamSchema, 'params'), validate(updateAdminRoleSchema), chatController.updateAdminRole);

export default router;
