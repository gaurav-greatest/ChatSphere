import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import { generateAccessToken } from '../utils/token.js';

let mongoServer: MongoMemoryServer;
let token1: string;
let token2: string;
let user1Id: string;
let user2Id: string;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Chat.deleteMany({});

  const user1 = await User.create({
    username: 'userone',
    email: 'userone@example.com',
    password: 'Password123!',
    displayName: 'User One',
  });
  const user2 = await User.create({
    username: 'usertwo',
    email: 'usertwo@example.com',
    password: 'Password123!',
    displayName: 'User Two',
  });

  user1Id = user1._id.toString();
  user2Id = user2._id.toString();

  token1 = generateAccessToken({ userId: user1Id, email: user1.email });
  token2 = generateAccessToken({ userId: user2Id, email: user2.email });
});

describe('💬 Chat REST API Endpoints', () => {
  describe('POST /api/v1/chats', () => {
    it('should create or retrieve a direct chat between two users', async () => {
      const res = await request(app)
        .post('/api/v1/chats')
        .set('Authorization', `Bearer ${token1}`)
        .send({ recipientId: user2Id });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.members).toContain(user1Id);
      expect(res.body.data.members).toContain(user2Id);
    });
  });

  describe('GET /api/v1/chats', () => {
    it('should list all chats for the authenticated user', async () => {
      await Chat.create({
        type: 'direct',
        members: [user1Id, user2Id],
        createdBy: user1Id,
      });

      const res = await request(app)
        .get('/api/v1/chats')
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);

      const res2 = await request(app)
        .get('/api/v1/chats')
        .set('Authorization', `Bearer ${token2}`);
      expect(res2.status).toBe(200);
    });
  });
});
