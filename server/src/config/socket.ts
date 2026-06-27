import type { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';
import { logger } from '../utils/logger.js';
import Chat from '../models/chat.model.js';
import { SOCKET_EVENTS } from '@chatsphere/shared';
import { registerMessageHandlers } from '../sockets/handlers/message.handler.js';
import { registerPresenceHandlers, handleDisconnect } from '../sockets/handlers/presence.handler.js';

// Ephemeral in-memory mapping of user ID -> set of active Socket IDs.
// Note: This will be supplemented/integrated with Redis in Phase 7 for multi-instance scaling.
export const userSocketMap = new Map<string, Set<string>>();

export const configureSockets = (io: Server): void => {
  // ─── Socket Authentication Middleware ──────────────────────
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      next();
    } catch (err) {
      logger.error('Socket authentication error:', err);
      next(new Error('Invalid authentication token'));
    }
  });

  // ─── Connection Lifecycle ──────────────────────────────────
  io.on(SOCKET_EVENTS.CONNECTION, async (socket: Socket) => {
    const userId = socket.data.userId;
    logger.info(`Socket connected: ${socket.id} (User: ${userId})`);

    // Track user socket association
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId)!.add(socket.id);

    // Make the socket join its private user room (for direct user targets)
    await socket.join(`user:${userId}`);

    try {
      // Auto-join all chats the user is currently a member of
      const userChats = await Chat.find({ members: userId }).select('_id');
      for (const chat of userChats) {
        await socket.join(`chat:${chat._id.toString()}`);
      }

      // Mark user online & broadcast status
      await registerPresenceHandlers(io, socket);

      // Register feature-specific handlers
      registerMessageHandlers(io, socket);

      // Disconnect event
      socket.on(SOCKET_EVENTS.DISCONNECT, async (reason) => {
        logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
        
        const sockets = userSocketMap.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSocketMap.delete(userId);
            // Last connection closed, mark user offline
            await handleDisconnect(io, userId);
          }
        }
      });
    } catch (err) {
      logger.error(`Error initializing socket ${socket.id}:`, err);
    }
  });
};

/**
 * Returns active socket IDs for a given user.
 */
export const getUserSockets = (userId: string): string[] => {
  const sockets = userSocketMap.get(userId);
  return sockets ? Array.from(sockets) : [];
};
