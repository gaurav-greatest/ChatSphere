import { Redis } from 'ioredis';
import env from './env.js';
import { logger } from '../utils/logger.js';

let redisClient: Redis | null = null;
let redisSubscriber: Redis | null = null;

const createRedisClient = (name: string): Redis => {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times: number) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    lazyConnect: true,
  });

  client.on('connect', () => {
    logger.info(`Redis ${name} client connected`);
  });

  client.on('error', (err: Error) => {
    logger.error(`Redis ${name} client error:`, err);
  });

  client.on('close', () => {
    logger.warn(`Redis ${name} client disconnected`);
  });

  return client;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = createRedisClient('primary');
  }
  return redisClient;
};

export const getRedisSubscriber = (): Redis => {
  if (!redisSubscriber) {
    redisSubscriber = createRedisClient('subscriber');
  }
  return redisSubscriber;
};

export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    const sub = getRedisSubscriber();
    await Promise.all([client.connect(), sub.connect()]);
    logger.info('Redis connected successfully (publisher & subscriber)');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    // Redis is optional for basic functionality — don't exit
    logger.warn('Continuing without Redis. Some features will be unavailable.');
  }
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      redisClient = null;
    }
    if (redisSubscriber) {
      await redisSubscriber.quit();
      redisSubscriber = null;
    }
    logger.info('Redis disconnected gracefully');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};
