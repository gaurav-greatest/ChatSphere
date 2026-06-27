import { getRedisClient } from '../config/redis.js';
import { logger } from '../utils/logger.js';

const ONLINE_USERS_KEY = 'presence:online';
const UNREAD_COUNTS_PREFIX = 'unread:';

/**
 * Marks a user as online in Redis.
 */
export const setOnlineStatus = async (userId: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    await redis.sadd(ONLINE_USERS_KEY, userId);
  } catch (err) {
    logger.error(`Redis error setting online status for user ${userId}:`, err);
  }
};

/**
 * Marks a user as offline in Redis.
 */
export const setOfflineStatus = async (userId: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    await redis.srem(ONLINE_USERS_KEY, userId);
  } catch (err) {
    logger.error(`Redis error setting offline status for user ${userId}:`, err);
  }
};

/**
 * Check if a user is online using Redis.
 */
export const isUserOnline = async (userId: string): Promise<boolean> => {
  try {
    const redis = getRedisClient();
    const result = await redis.sismember(ONLINE_USERS_KEY, userId);
    return result === 1;
  } catch (err) {
    logger.error(`Redis error checking online status for user ${userId}:`, err);
    return false;
  }
};

/**
 * Get all online user IDs.
 */
export const getOnlineUsers = async (): Promise<string[]> => {
  try {
    const redis = getRedisClient();
    return await redis.smembers(ONLINE_USERS_KEY);
  } catch (err) {
    logger.error('Redis error getting online users:', err);
    return [];
  }
};

/**
 * Increment unread message count for a user in a specific chat.
 */
export const incrementUnread = async (userId: string, chatId: string): Promise<number> => {
  try {
    const redis = getRedisClient();
    const key = `${UNREAD_COUNTS_PREFIX}${userId}`;
    return await redis.hincrby(key, chatId, 1);
  } catch (err) {
    logger.error(`Redis error incrementing unread count for user ${userId} in chat ${chatId}:`, err);
    return 0;
  }
};

/**
 * Reset unread message count for a user in a specific chat.
 */
export const resetUnread = async (userId: string, chatId: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    const key = `${UNREAD_COUNTS_PREFIX}${userId}`;
    await redis.hset(key, chatId, 0);
  } catch (err) {
    logger.error(`Redis error resetting unread count for user ${userId} in chat ${chatId}:`, err);
  }
};

/**
 * Get unread message counts for all chats of a user.
 */
export const getUnreadCounts = async (userId: string): Promise<Record<string, number>> => {
  try {
    const redis = getRedisClient();
    const key = `${UNREAD_COUNTS_PREFIX}${userId}`;
    const result = await redis.hgetall(key);
    
    // Parse counts to numbers
    const counts: Record<string, number> = {};
    Object.entries(result).forEach(([chatId, countStr]) => {
      counts[chatId] = parseInt(countStr, 10) || 0;
    });
    
    return counts;
  } catch (err) {
    logger.error(`Redis error getting unread counts for user ${userId}:`, err);
    return {};
  }
};
