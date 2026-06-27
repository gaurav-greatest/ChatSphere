import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiResponse } from '../utils/api-response.js';
import * as messageService from '../services/message.service.js';
import Message from '../models/message.model.js';
import { safeParseInt, getTotalPages } from '../utils/helpers.js';
import { SOCKET_EVENTS } from '@chatsphere/shared';
import type { Server } from 'socket.io';

// ─── Send Message ───────────────────────────────────────────
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.sendMessage(req.userId!, req.params.chatId as string, req.body);
  
  // Emit message:new event to socket room
  const io: Server | undefined = req.app.get('io');
  if (io) {
    const roomName = `chat:${req.params.chatId}`;
    io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_NEW, message);
  }

  ApiResponse.created(res, message, 'Message sent successfully');
});

// ─── Get Chat Messages (Paginated) ──────────────────────────
export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  const page = safeParseInt(req.query.page as string, 1);
  const limit = safeParseInt(req.query.limit as string, 50);

  const { messages, total } = await messageService.getChatMessages(
    req.params.chatId as string,
    req.userId!,
    page,
    limit,
  );
  const totalPages = getTotalPages(total, limit);

  ApiResponse.success(
    res,
    messages,
    'Messages retrieved successfully',
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

// ─── Edit Message ───────────────────────────────────────────
export const editMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.editMessage(req.params.id as string, req.userId!, req.body.content);

  // Emit message:edited event to socket room
  const io: Server | undefined = req.app.get('io');
  if (io) {
    const roomName = `chat:${message.chatId.toString()}`;
    io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_EDITED, message);
  }

  ApiResponse.success(res, message, 'Message edited successfully');
});

// ─── Delete Message ─────────────────────────────────────────
export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.deleteMessage(req.params.id as string, req.userId!);

  // Emit message:deleted event to socket room
  const io: Server | undefined = req.app.get('io');
  if (io) {
    const roomName = `chat:${message.chatId.toString()}`;
    io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_DELETED, {
      messageId: message._id,
      chatId: message.chatId,
    });
  }

  ApiResponse.success(res, message, 'Message deleted successfully');
});

// ─── React to Message ───────────────────────────────────────
export const reactToMessage = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.reactToMessage(req.params.id as string, req.userId!, req.body.emoji);

  // Emit reaction:added event to socket room
  const io: Server | undefined = req.app.get('io');
  if (io) {
    const roomName = `chat:${message.chatId.toString()}`;
    io.to(roomName).emit(SOCKET_EVENTS.REACTION_ADDED, {
      messageId: message._id,
      chatId: message.chatId,
      reactions: message.reactions,
    });
  }

  ApiResponse.success(res, message, 'Reaction added successfully');
});

// ─── Remove Reaction ────────────────────────────────────────
export const removeReaction = asyncHandler(async (req: Request, res: Response) => {
  const message = await messageService.removeReaction(req.params.id as string, req.userId!);

  // Emit reaction:removed event to socket room
  const io: Server | undefined = req.app.get('io');
  if (io) {
    const roomName = `chat:${message.chatId.toString()}`;
    io.to(roomName).emit(SOCKET_EVENTS.REACTION_REMOVED, {
      messageId: message._id,
      chatId: message.chatId,
      reactions: message.reactions,
    });
  }

  ApiResponse.success(res, message, 'Reaction removed successfully');
});

// ─── Pin Message ────────────────────────────────────────────
export const togglePin = asyncHandler(async (req: Request, res: Response) => {
  const result = await messageService.togglePinMessage(req.params.id as string, req.userId!);

  // Emit chat:updated event to trigger refetching pins on the client
  const message = await Message.findById(req.params.id);
  const io: Server | undefined = req.app.get('io');
  if (io && message) {
    const roomName = `chat:${message.chatId.toString()}`;
    io.to(roomName).emit(SOCKET_EVENTS.CHAT_UPDATED, {
      chatId: message.chatId,
      pinnedMessages: result.isPinned ? [message._id] : [],
    });
  }

  ApiResponse.success(
    res,
    result,
    result.isPinned ? 'Message pinned successfully' : 'Message unpinned successfully',
  );
});

// ─── Forward Messages ───────────────────────────────────────
export const forwardMessages = asyncHandler(async (req: Request, res: Response) => {
  const { messageIds, targetChatIds } = req.body;
  const messages = await messageService.forwardMessages(req.userId!, messageIds, targetChatIds);

  // Emit message:new event to all target socket rooms
  const io: Server | undefined = req.app.get('io');
  if (io) {
    messages.forEach((msg) => {
      const roomName = `chat:${msg.chatId.toString()}`;
      io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_NEW, msg);
    });
  }

  ApiResponse.success(res, messages, 'Messages forwarded successfully');
});

// ─── Search Messages ────────────────────────────────────────
export const searchMessages = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const chatId = req.query.chatId as string | undefined;

  const messages = await messageService.searchMessages(req.userId!, query, chatId);
  ApiResponse.success(res, messages, 'Messages searched successfully');
});
