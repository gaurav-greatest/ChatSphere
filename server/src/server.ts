import dns from 'dns';
dns.setServers(['1.1.1.1', '8.8.8.8']);

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import env from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis, getRedisClient, getRedisSubscriber } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { logger } from './utils/logger.js';
import { createAdapter } from '@socket.io/redis-adapter';

import { configureSockets } from './config/socket.js';

const server = http.createServer(app);

// ─── Socket.IO Setup ────────────────────────────────────────
const io = new SocketIOServer(server, {
  cors: {
    origin: env.isDevelopment
      ? [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
      : [env.CLIENT_URL],
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
});

// Set io inside app settings to share with HTTP controllers cleanly
app.set('io', io);

// Export io instance for use in socket handlers
export { io };

// ─── Bootstrap ──────────────────────────────────────────────
const bootstrap = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Connect to Redis (non-blocking — app works without it)
    await connectRedis();

    // Setup Redis Adapter for Socket.IO if client connected successfully
    try {
      const pubClient = getRedisClient();
      const subClient = getRedisSubscriber();
      if (pubClient.status === 'ready' || pubClient.status === 'connecting') {
        io.adapter(createAdapter(pubClient, subClient));
        logger.info('Socket.IO Redis adapter configured');
      }
    } catch (err) {
      logger.error('Error configuring Socket.IO Redis adapter:', err);
    }

    // Configure Cloudinary
    configureCloudinary();

    // Setup Socket connection flows and events handlers
    configureSockets(io);

    // Start HTTP server
    server.listen(env.PORT, () => {
      logger.info(`🚀 ChatSphere server running on port ${env.PORT}`);
      logger.info(`📡 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Client URL: ${env.CLIENT_URL}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ─── Graceful Shutdown ──────────────────────────────────────
const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  // Close Socket.IO connections
  io.close(() => {
    logger.info('Socket.IO connections closed');
  });

  // Close HTTP server
  server.close(async () => {
    logger.info('HTTP server closed');

    // Disconnect from databases
    await disconnectDatabase();
    await disconnectRedis();

    logger.info('Graceful shutdown complete');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  // Don't exit on unhandled rejections in dev; crash in production
  if (env.isProduction) {
    throw reason;
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

// Start the server
bootstrap();
