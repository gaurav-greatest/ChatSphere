import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/user.model.js';
import Chat from '../models/chat.model.js';
import Message from '../models/message.model.js';
import { generateAccessToken } from '../utils/token.js';

let mongoServer: MongoMemoryServer;
let token1: string;
let user1Id: string;
let user2Id: string;
let chatId: string;

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
  await Message.deleteMany({});

  const user1 = await User.create({
    username: 'msguser1',
    email: 'msguser1@example.com',
    password: 'Password123!',
    displayName: 'Msg User 1',
  });
  const user2 = await User.create({
    username: 'msguser2',
    email: 'msguser2@example.com',
    password: 'Password123!',
    displayName: 'Msg User 2',
  });

  user1Id = user1._id.toString();
  user2Id = user2._id.toString();

  token1 = generateAccessToken({ userId: user1Id, email: user1.email });

  const chat = await Chat.create({
    type: 'direct',
    members: [user1Id, user2Id],
    createdBy: user1Id,
  });
  chatId = chat._id.toString();
});

describe('✉️ Message REST API Endpoints', () => {
  describe('POST /api/v1/messages/chats/:chatId/messages', () => {
    it('should post a new text message to the chat', async () => {
      const res = await request(app)
        .post(`/api/v1/messages/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token1}`)
        .send({ content: 'Hello from test suite!' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Hello from test suite!');
    });
  });

  describe('GET /api/v1/messages/chats/:chatId/messages', () => {
    it('should retrieve paginated messages for a chat', async () => {
      await Message.create({
        chatId,
        sender: user1Id,
        content: 'Existing test message',
        type: 'text',
      });

      const res = await request(app)
        .get(`/api/v1/messages/chats/${chatId}/messages`)
        .set('Authorization', `Bearer ${token1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });
});
