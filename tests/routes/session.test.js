/**
 * Unit Tests: Session Management (P3.2.3)
 * Tests refresh token rotation, logout/revocation, and password-change revocation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock database
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

// Mock session module
vi.mock('../../server/lib/session.js', () => ({
  issueTokenPair: vi.fn(() => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 900,
  })),
  rotateRefreshToken: vi.fn(() => null),
  revokeAllUserTokens: vi.fn(),
  revokeSingleToken: vi.fn(),
}));

import bcrypt from 'bcryptjs';
import request from 'supertest';
import {
  issueTokenPair,
  revokeAllUserTokens,
  revokeSingleToken,
  rotateRefreshToken,
} from '../../server/lib/session.js';
import { logActivity, queryOne } from '../../server/models/database.js';
import authRouter from '../../server/routes/auth.js';
import { adminToken, createTestApp } from '../helpers.js';

const app = createTestApp('/api/auth', authRouter);

describe('Session Management (P3.2.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Login should issue token pair ───────────────────────
  describe('POST /api/auth/login — token pair', () => {
    it('should return accessToken + refreshToken on successful login', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      queryOne.mockReturnValueOnce({
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        role: 'user',
        is_active: 1,
        password: hashed,
      });

      const res = await request(app).post('/api/auth/login').send({
        username: 'alice',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('mock-access-token');
      expect(res.body.refreshToken).toBe('mock-refresh-token');
      expect(res.body.expiresIn).toBe(900);
      expect(issueTokenPair).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, username: 'alice' })
      );
    });
  });

  // ─── POST /api/auth/refresh ──────────────────────────────
  describe('POST /api/auth/refresh', () => {
    it('should reject when refreshToken is missing', async () => {
      const res = await request(app).post('/api/auth/refresh').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when refresh token is invalid', async () => {
      rotateRefreshToken.mockReturnValueOnce(null);

      const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'bad-token' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid or expired');
    });

    it('should rotate tokens and return new pair', async () => {
      rotateRefreshToken.mockReturnValueOnce({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        expiresIn: 900,
        user: { id: 1, username: 'alice', email: 'alice@example.com', role: 'user' },
      });

      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'old-valid-token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBe('new-access');
      expect(res.body.refreshToken).toBe('new-refresh');
      expect(res.body.expiresIn).toBe(900);
      expect(res.body.user.username).toBe('alice');
      expect(logActivity).toHaveBeenCalledWith(
        1,
        'TOKEN_REFRESH',
        'user',
        1,
        'Token rotated',
        expect.anything()
      );
    });
  });

  // ─── POST /api/auth/logout ──────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should revoke a specific refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: 'token-to-revoke' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(revokeSingleToken).toHaveBeenCalledWith('token-to-revoke');
    });

    it('should revoke all user tokens when access token is provided', async () => {
      const token = adminToken();

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'some-rt' });

      expect(res.status).toBe(200);
      expect(revokeSingleToken).toHaveBeenCalledWith('some-rt');
      expect(revokeAllUserTokens).toHaveBeenCalledWith(1, 'LOGOUT', expect.anything());
    });

    it('should succeed even without a refresh token or auth header', async () => {
      const res = await request(app).post('/api/auth/logout').send({});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ─── Password change should revoke all sessions ─────────
  describe('POST /api/auth/change-password — session revocation', () => {
    it('should revoke all tokens after password change', async () => {
      const hashed = await bcrypt.hash('oldpassword', 10);
      queryOne.mockReturnValueOnce({
        id: 1,
        username: 'admin',
        password: hashed,
      });

      const token = adminToken();
      const res = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'oldpassword', newPassword: 'newsecure123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('sessions revoked');
      expect(revokeAllUserTokens).toHaveBeenCalledWith(1, 'PASSWORD_CHANGE', expect.anything());
    });
  });
});
