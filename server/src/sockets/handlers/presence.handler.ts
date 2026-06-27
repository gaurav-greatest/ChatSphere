import type { Server, Socket } from 'socket.io';
import User from '../../models/user.model.js';
import Chat from '../../models/chat.model.js';
import { SOCKET_EVENTS } from '@chatsphere/shared';
import { logger } from '../../utils/logger.js';
import { setOnlineStatus, setOfflineStatus } from '../../services/redis.service.js';

export const registerPresenceHandlers = async (_io: Server, socket: Socket): Promise<void> => {
  const userId = socket.data.userId;

  try {
    // 1. Update User DB state to online & cache in Redis
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
      }),
      setOnlineStatus(userId),
    ]);

    // 2. Fetch all chats the user is part of
    const userChats = await Chat.find({ members: userId }).select('_id');

    // 3. Notify rooms that this user is online
    userChats.forEach((chat) => {
      const roomName = `chat:${chat._id.toString()}`;
      socket.to(roomName).emit(SOCKET_EVENTS.USER_ONLINE, {
        userId,
        isOnline: true,
      });
    });

    logger.debug(`User presence online broadcasted: ${userId}`);
  } catch (err) {
    logger.error(`Error updating online presence for user ${userId}:`, err);
  }
};

export const handleDisconnect = async (io: Server, userId: string): Promise<void> => {
  try {
    const lastSeen = new Date();

    // 1. Update user offline state & cache in Redis
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen,
      }),
      setOfflineStatus(userId),
    ]);

    // 2. Fetch all chats the user is part of
    const userChats = await Chat.find({ members: userId }).select('_id');

    // 3. Notify rooms this user is offline
    userChats.forEach((chat) => {
      const roomName = `chat:${chat._id.toString()}`;
      io.to(roomName).emit(SOCKET_EVENTS.USER_OFFLINE, {
        userId,
        isOnline: false,
        lastSeen,
      });
    });

    logger.debug(`User presence offline broadcasted: ${userId}`);
  } catch (err) {
    logger.error(`Error handling disconnect presence for user ${userId}:`, err);
  }
};
