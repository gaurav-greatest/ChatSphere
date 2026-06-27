import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import { clerkMiddleware } from '@clerk/express';
import { defaultLimiter } from './middlewares/rate-limit.middleware.js';
import { logger } from './utils/logger.js';

const app = express();

// ─── Security Headers ───────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ───────────────────────────────────────────────────
app.use(cors({
  origin: env.isDevelopment
    ? [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000']
    : [env.CLIENT_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsing ───────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Cookie Parser ──────────────────────────────────────────
app.use(cookieParser());
app.use(clerkMiddleware());

// ─── Data Sanitization ─────────────────────────────────────
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP parameter pollution

// ─── Compression ────────────────────────────────────────────
app.use(compression());

// ─── Rate Limiting ──────────────────────────────────────────
app.use('/api', defaultLimiter);

// ─── Request Logging ────────────────────────────────────────
app.use((req, _res, next) => {
  if (env.isDevelopment) {
    logger.debug(`${req.method} ${req.path}`);
  }
  next();
});

// ─── Health Check Endpoint ──────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'ChatSphere API is running successfully.' });
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 Handler ────────────────────────────────────────────
app.use(notFoundMiddleware);

// ─── Global Error Handler ───────────────────────────────────
app.use(errorMiddleware);

export default app;
