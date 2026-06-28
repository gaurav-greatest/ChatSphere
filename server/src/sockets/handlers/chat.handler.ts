import type { Server, Socket } from 'socket.io';
import Chat from '../../models/chat.model.js';
import { SOCKET_EVENTS } from '@chatsphere/shared';
import { logger } from '../../utils/logger.js';

export const registerChatHandlers = (_io: Server, socket: Socket): void => {
  const userId = socket.data.userId;

  // ─── Explicitly Join Chat Room ───────────────────────────────
  socket.on(SOCKET_EVENTS.JOIN_CHAT, async (data: { chatId: string }) => {
    const { chatId } = data;
    if (!chatId) return;

    try {
      const chat = await Chat.findOne({ _id: chatId, members: userId });
      if (!chat) {
        socket.emit(SOCKET_EVENTS.ERROR, { message: 'Access denied to chat room' });
        return;
      }

      const roomName = `chat:${chatId}`;
      await socket.join(roomName);
      logger.debug(`User ${userId} joined room ${roomName}`);
    } catch (err) {
      logger.error(`Error joining chat room ${chatId}:`, err);
    }
  });

  // ─── Explicitly Leave Chat Room ──────────────────────────────
  socket.on(SOCKET_EVENTS.LEAVE_CHAT, async (data: { chatId: string }) => {
    const { chatId } = data;
    if (!chatId) return;

    try {
      const roomName = `chat:${chatId}`;
      await socket.leave(roomName);
      logger.debug(`User ${userId} left room ${roomName}`);
    } catch (err) {
      logger.error(`Error leaving chat room ${chatId}:`, err);
    }
  });
};
