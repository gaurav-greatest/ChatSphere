import type { Server, Socket } from 'socket.io';
import Message from '../../models/message.model.js';
import { SOCKET_EVENTS } from '@chatsphere/shared';
import mongoose from 'mongoose';
import { logger } from '../../utils/logger.js';

export const registerMessageHandlers = (io: Server, socket: Socket): void => {
  const userId = socket.data.userId;

  // ─── Typing Indicators ─────────────────────────────────────
  socket.on(SOCKET_EVENTS.TYPING_START, async (data: { chatId: string }) => {
    if (!data.chatId) return;
    const roomName = `chat:${data.chatId}`;
    
    // Broadcast typing notification to everyone in the chat room except the sender
    socket.to(roomName).emit(SOCKET_EVENTS.USER_TYPING, {
      chatId: data.chatId,
      userId,
    });
  });

  socket.on(SOCKET_EVENTS.TYPING_STOP, async (data: { chatId: string }) => {
    if (!data.chatId) return;
    const roomName = `chat:${data.chatId}`;
    
    // Broadcast stop-typing notification
    socket.to(roomName).emit(SOCKET_EVENTS.USER_STOP_TYPING, {
      chatId: data.chatId,
      userId,
    });
  });

  // ─── Delivery Receipts ─────────────────────────────────────
  socket.on(SOCKET_EVENTS.MESSAGE_DELIVERED, async (data: { messageId: string; chatId: string }) => {
    const { messageId, chatId } = data;
    if (!messageId || !chatId) return;

    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Add user to deliveredTo array of the message if not already present
      const message = await Message.findOneAndUpdate(
        { _id: messageId, deliveredTo: { $ne: userObjectId } },
        { $addToSet: { deliveredTo: userObjectId } },
        { new: true }
      ).populate('sender', 'displayName username');

      if (message) {
        // Broadcast delivery receipt confirmation to the chat room
        const roomName = `chat:${chatId}`;
        io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_DELIVERY_RECEIPT, {
          messageId,
          chatId,
          userId,
          deliveredAt: new Date(),
        });
      }
    } catch (err) {
      logger.error('Error handling message delivery receipt:', err);
    }
  });

  // ─── Read Receipts ─────────────────────────────────────────
  socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data: { messageId: string; chatId: string }) => {
    const { messageId, chatId } = data;
    if (!messageId || !chatId) return;

    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);

      // Add user to readBy array if not already present
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          'readBy.userId': { $ne: userObjectId },
        },
        {
          $addToSet: {
            readBy: {
              userId: userObjectId,
              readAt: new Date(),
            },
          },
        },
        { new: true }
      );

      if (message) {
        const roomName = `chat:${chatId}`;
        io.to(roomName).emit(SOCKET_EVENTS.MESSAGE_READ_RECEIPT, {
          messageId,
          chatId,
          userId,
          readAt: new Date(),
        });
      }
    } catch (err) {
      logger.error('Error handling message read receipt:', err);
    }
  });
};
