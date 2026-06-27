import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import * as chatService from '../services/chat.service.js';
import { safeParseInt, getTotalPages } from '../utils/helpers.js';

// ─── Direct Chats ───────────────────────────────────────────
export const createDirectChat = asyncHandler(async (req: Request, res: Response) => {
  const chat = await chatService.getOrCreateDirectChat(req.userId!, req.body.recipientId);
  ApiResponse.created(res, chat, 'Direct chat created or retrieved successfully');
});

// ─── List User Chats ────────────────────────────────────────
export const getUserChats = asyncHandler(async (req: Request, res: Response) => {
  const page = safeParseInt(req.query.page as string, 1);
  const limit = safeParseInt(req.query.limit as string, 20);

  const { chats, total } = await chatService.getUserChats(req.userId!, page, limit);
  const totalPages = getTotalPages(total, limit);

  ApiResponse.success(
    res,
    chats,
    'Chats retrieved successfully',
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

// ─── Get Chat details ───────────────────────────────────────
export const getChatDetails = asyncHandler(async (req: Request, res: Response) => {
  const chat = await chatService.getChatById(req.params.chatId as string, req.userId!);
  ApiResponse.success(res, chat, 'Chat details retrieved successfully');
});

// ─── Delete or Leave Chat ───────────────────────────────────
export const deleteOrLeaveChat = asyncHandler(async (req: Request, res: Response) => {
  await chatService.deleteOrLeaveChat(req.params.chatId as string, req.userId!);
  ApiResponse.success(res, null, 'Left/Deleted chat successfully');
});

// ─── Archive / Unarchive Chat ───────────────────────────────
export const toggleArchive = asyncHandler(async (req: Request, res: Response) => {
  const isArchived = await chatService.toggleArchiveChat(req.params.chatId as string, req.userId!);
  ApiResponse.success(
    res,
    { isArchived },
    isArchived ? 'Chat archived successfully' : 'Chat unarchived successfully',
  );
});

// ─── Mute / Unmute Chat ─────────────────────────────────────
export const toggleMute = asyncHandler(async (req: Request, res: Response) => {
  const isMuted = await chatService.toggleMuteChat(req.params.chatId as string, req.userId!);
  ApiResponse.success(
    res,
    { isMuted },
    isMuted ? 'Chat muted successfully' : 'Chat unmuted successfully',
  );
});

// ─── Create Group Chat ──────────────────────────────────────
export const createGroupChat = asyncHandler(async (req: Request, res: Response) => {
  const { groupName, members, groupDescription } = req.body;
  const group = await chatService.createGroupChat(req.userId!, groupName, members, groupDescription);
  ApiResponse.created(res, group, 'Group chat created successfully');
});

// ─── Update Group Details ───────────────────────────────────
export const updateGroupDetails = asyncHandler(async (req: Request, res: Response) => {
  const group = await chatService.updateGroupDetails(req.params.chatId as string, req.userId!, req.body);
  ApiResponse.success(res, group, 'Group details updated successfully');
});

// ─── Add Member to Group ────────────────────────────────────
export const addGroupMember = asyncHandler(async (req: Request, res: Response) => {
  const group = await chatService.addGroupMember(req.params.chatId as string, req.userId!, req.body.userId);
  ApiResponse.success(res, group, 'Member added to group successfully');
});

// ─── Remove Member from Group ────────────────────────────────
export const removeGroupMember = asyncHandler(async (req: Request, res: Response) => {
  const group = await chatService.removeGroupMember(req.params.chatId as string, req.userId!, req.params.userId as string);
  ApiResponse.success(res, group, 'Member removed from group successfully');
});

// ─── Promotes or Demotes Admin Role ──────────────────────────
export const updateAdminRole = asyncHandler(async (req: Request, res: Response) => {
  const { targetUserId, isAdmin } = req.body;
  const group = await chatService.updateGroupAdminRole(req.params.chatId as string, req.userId!, targetUserId, isAdmin);
  ApiResponse.success(res, group, isAdmin ? 'Promoted to admin successfully' : 'Demoted from admin successfully');
});
