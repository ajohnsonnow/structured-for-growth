/**
 * Unit Tests: Auth Routes
 * Tests registration, login, token verification, password change, and admin user management
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database module before importing routes
vi.mock('../../server/models/database.js', () => ({
  initializeDatabase: vi.fn(),
  getDatabase: vi.fn(),
  query: vi.fn(() => []),
  queryOne: vi.fn(() => null),
  execute: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
  logActivity: vi.fn(),
  default: {
    initializeDatabase: vi.fn(),
    getDatabase: vi.fn(),
    query: vi.fn(() => []),
    queryOne: vi.fn(() => null),
    execute: vi.fn(() => ({ changes: 1, lastInsertRowid: 1 })),
    logActivity: vi.fn(),
  },
}));

import request from 'supertest';
import { execute, query, queryOne } from '../../server/models/database.js';
import authRouter from '../../server/routes/auth.js';
import { adminToken, createTestApp, userToken } from '../helpers.js';

const app = createTestApp('/api/auth', authRouter);

describe('Auth Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with short username', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'ab',
        email: 'test@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'notanemail',
        password: 'password123',
      });
      expect(res.status).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@test.com',
        password: 'short',
      });
      expect(res.status).toBe(400);
    });

    it('should reject duplicate username/email', async () => {
      queryOne.mockReturnValueOnce({ id: 1 });
      const res = await request(app).post('/api/auth/register').send({
        username: 'existinguser',
        email: 'existing@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already exists');
    });

    it('should register a new user successfully', async () => {
      queryOne
        .mockReturnValueOnce(null) // No existing user
        .mockReturnValueOnce({ count: 1 }); // Not first user
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 2 });

      const res = await request(app).post('/api/auth/register').send({
        username: 'newuser',
        email: 'new@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBeDefined();
    });

    it('should make first user an admin', async () => {
      queryOne
        .mockReturnValueOnce(null) // No existing user
        .mockReturnValueOnce({ count: 0 }); // First user
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 1 });

      const res = await request(app).post('/api/auth/register').send({
        username: 'firstuser',
        email: 'first@test.com',
        password: 'password123',
      });
      expect(res.status).toBe(201);
      expect(res.body.message).toContain('administrator');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing fields', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
    });

    it('should reject login with invalid credentials', async () => {
      queryOne.mockReturnValueOnce(null);
      const res = await request(app).post('/api/auth/login').send({
        username: 'noone',
        password: 'wrongpassword',
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('should reject login for disabled account', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        username: 'disabled',
        is_active: 0,
        password: '$2a$10$hash',
      });
      const res = await request(app).post('/api/auth/login').send({
        username: 'disabled',
        password: 'password123',
      });
      expect(res.status).toBe(401);
      expect(res.body.message).toContain('disabled');
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/auth/verify');
      expect(res.status).toBe(401);
    });

    it('should verify a valid token', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        role: 'admin',
        is_active: 1,
      });

      const token = adminToken();
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('admin');
    });

    it('should reject an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer invalidtoken123');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        role: 'admin',
        created_at: '2026-01-01',
        last_login: '2026-02-15',
      });

      const token = adminToken();
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('admin');
    });
  });

  describe('Admin User Management', () => {
    it('GET /api/auth/users should return users list for admin', async () => {
      query.mockReturnValueOnce([
        { id: 1, username: 'admin', role: 'admin' },
        { id: 2, username: 'user1', role: 'user' },
      ]);

      const token = adminToken();
      const res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(2);
    });

    it('GET /api/auth/users should reject non-admin', async () => {
      const token = userToken();
      const res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });

    it('DELETE /api/auth/users/:id should prevent self-deletion', async () => {
      const token = adminToken();
      const res = await request(app)
        .delete('/api/auth/users/1') // userId 1 matches admin token
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cannot delete yourself');
    });

    it('DELETE /api/auth/users/:id should delete another user', async () => {
      queryOne.mockReturnValueOnce({ id: 5, username: 'todelete' });

      const token = adminToken();
      const res = await request(app)
        .delete('/api/auth/users/5')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/activity', () => {
    it('should return activity log for admin', async () => {
      query
        .mockReturnValueOnce([{ id: 1, action: 'LOGIN', username: 'admin' }]) // activities
        .mockReturnValueOnce([{ action: 'LOGIN' }]) // actionTypes
        .mockReturnValueOnce([{ username: 'admin' }]); // users
      queryOne.mockReturnValueOnce({ count: 1 });

      const token = adminToken();
      const res = await request(app)
        .get('/api/auth/activity')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.activities).toHaveLength(1);
      expect(res.body.filters).toBeDefined();
      expect(res.body.filters.actionTypes).toContain('LOGIN');
    });

    it('should support search and filter parameters', async () => {
      query
        .mockReturnValueOnce([]) // filtered results
        .mockReturnValueOnce([{ action: 'LOGIN' }])
        .mockReturnValueOnce([{ username: 'admin' }]);
      queryOne.mockReturnValueOnce({ count: 0 });

      const token = adminToken();
      const res = await request(app)
        .get(
          '/api/auth/activity?search=test&action=LOGIN&user=admin&startDate=2025-01-01&endDate=2025-12-31'
        )
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.activities).toHaveLength(0);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should export activity log as CSV', async () => {
      query.mockReturnValueOnce([
        {
          id: 1,
          username: 'admin',
          action: 'LOGIN',
          entity_type: null,
          entity_id: null,
          details: 'Logged in',
          ip_address: '127.0.0.1',
          created_at: '2025-01-01T00:00:00Z',
        },
      ]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/auth/activity/export?format=csv')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/csv/);
      expect(res.text).toContain('ID,Username,Action');
    });

    it('should export activity log as JSON', async () => {
      query.mockReturnValueOnce([{ id: 1, username: 'admin', action: 'LOGIN' }]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/auth/activity/export?format=json')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].action).toBe('LOGIN');
    });
  });
});
