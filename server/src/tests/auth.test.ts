import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import User from '../models/user.model.js';
import RefreshToken from '../models/refresh-token.model.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Spin up an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections before each test run
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
});

describe('🔑 Authentication REST API Endpoints', () => {
  const registerPayload = {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'Password123!',
    displayName: 'Test User',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(registerPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.username).toBe(registerPayload.username);
      expect(res.body.data.user.email).toBe(registerPayload.email);
      expect(res.body.data.accessToken).toBeDefined();
      
      // Verify refresh token cookie was set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      if (cookies && cookies[0]) {
        expect(cookies[0]).toContain('chatsphere_refresh_token');
      }
    });

    it('should reject duplicate email registrations', async () => {
      await request(app).post('/api/v1/auth/register').send(registerPayload);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...registerPayload,
          username: 'differentuser',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/auth/register').send(registerPayload);
    });

    it('should successfully log in registered users', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject logins with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: registerPayload.email,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
