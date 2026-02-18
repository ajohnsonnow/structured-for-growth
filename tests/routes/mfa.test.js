import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database module
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

// Mock the auth middleware
vi.mock('../../server/middleware/auth.js', () => ({
  authenticateToken: (req, _res, next) => {
    req.user = { userId: 1, username: 'testadmin', role: 'admin' };
    next();
  },
  requireRole: () => (_req, _res, next) => next(),
}));

// Mock speakeasy
vi.mock('speakeasy', () => ({
  default: {
    generateSecret: vi.fn(() => ({
      base32: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
      otpauth_url:
        'otpauth://totp/StructuredForGrowth:testadmin?secret=KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD&issuer=Structured%20For%20Growth',
    })),
    totp: {
      verify: vi.fn(() => true),
    },
  },
}));

// Mock qrcode
vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,mockQRdata')),
  },
}));

import speakeasy from 'speakeasy';
import request from 'supertest';
import { execute, queryOne } from '../../server/models/database.js';
import mfaRouter from '../../server/routes/mfa.js';
import { createTestApp } from '../helpers.js';

const app = createTestApp('/api/auth/mfa', mfaRouter);

describe('MFA Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/mfa/setup', () => {
    it('should initiate MFA setup', async () => {
      queryOne.mockReturnValue({ id: 1, username: 'testadmin', mfa_secret: null });

      const res = await request(app).post('/api/auth/mfa/setup');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('qrCode');
      expect(res.body).toHaveProperty('manualEntry');
      expect(res.body.qrCode).toContain('data:image/png');
      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining('mfa_temp_secret'),
        expect.any(Array)
      );
    });

    it('should return 404 when user not found', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).post('/api/auth/mfa/setup');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/mfa/verify', () => {
    it('should verify and enable MFA', async () => {
      queryOne.mockReturnValue({
        id: 1,
        mfa_temp_secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
      });
      speakeasy.totp.verify.mockReturnValue(true);

      const res = await request(app).post('/api/auth/mfa/verify').send({ token: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/enabled/i);
      // Should update mfa_secret and set mfa_enabled = 1
      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining('mfa_enabled = 1'),
        expect.any(Array)
      );
    });

    it('should reject when no token provided', async () => {
      const res = await request(app).post('/api/auth/mfa/verify').send({});

      expect(res.status).toBe(400);
      // express-validator returns errors array
      const errorMsg = res.body.message || JSON.stringify(res.body.errors);
      expect(errorMsg).toMatch(/token|required|invalid/i);
    });

    it('should reject when no setup in progress', async () => {
      queryOne.mockReturnValue({ id: 1, mfa_temp_secret: null });

      const res = await request(app).post('/api/auth/mfa/verify').send({ token: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/setup/i);
    });

    it('should reject invalid TOTP token', async () => {
      queryOne.mockReturnValue({
        id: 1,
        mfa_temp_secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
      });
      speakeasy.totp.verify.mockReturnValue(false);

      const res = await request(app).post('/api/auth/mfa/verify').send({ token: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid/i);
    });
  });

  describe('POST /api/auth/mfa/validate', () => {
    it('should validate TOTP during login', async () => {
      queryOne.mockReturnValue({
        id: 1,
        mfa_secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
        mfa_enabled: 1,
      });
      speakeasy.totp.verify.mockReturnValue(true);

      const res = await request(app)
        .post('/api/auth/mfa/validate')
        .send({ userId: 1, token: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject when userId or token missing', async () => {
      const res = await request(app).post('/api/auth/mfa/validate').send({});

      expect(res.status).toBe(400);
      // express-validator returns errors array
      const errorMsg = res.body.message || JSON.stringify(res.body.errors);
      expect(errorMsg).toMatch(/required|invalid|token|userId/i);
    });

    it('should reject when MFA not enabled', async () => {
      queryOne.mockReturnValue({ id: 1, mfa_secret: null, mfa_enabled: 0 });

      const res = await request(app)
        .post('/api/auth/mfa/validate')
        .send({ userId: 1, token: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not enabled/i);
    });

    it('should reject invalid TOTP token during login', async () => {
      queryOne.mockReturnValue({
        id: 1,
        mfa_secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
        mfa_enabled: 1,
      });
      speakeasy.totp.verify.mockReturnValue(false);

      const res = await request(app)
        .post('/api/auth/mfa/validate')
        .send({ userId: 1, token: '000000' });

      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/auth/mfa', () => {
    it('should disable MFA with valid token', async () => {
      queryOne.mockReturnValue({
        id: 1,
        mfa_secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
        mfa_enabled: 1,
      });
      speakeasy.totp.verify.mockReturnValue(true);

      const res = await request(app).delete('/api/auth/mfa').send({ token: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/disabled/i);
      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining('mfa_enabled = 0'),
        expect.any(Array)
      );
    });

    it('should reject when no token provided', async () => {
      const res = await request(app).delete('/api/auth/mfa').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/token.*required/i);
    });

    it('should reject when MFA not enabled', async () => {
      queryOne.mockReturnValue({ id: 1, mfa_secret: null, mfa_enabled: 0 });

      const res = await request(app).delete('/api/auth/mfa').send({ token: '123456' });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/not enabled/i);
    });

    it('should reject disable with invalid TOTP', async () => {
      queryOne.mockReturnValue({
        id: 1,
        mfa_secret: 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
        mfa_enabled: 1,
      });
      speakeasy.totp.verify.mockReturnValue(false);

      const res = await request(app).delete('/api/auth/mfa').send({ token: '000000' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/mfa/status', () => {
    it('should return MFA enabled status', async () => {
      queryOne.mockReturnValue({ mfa_enabled: 1 });

      const res = await request(app).get('/api/auth/mfa/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.mfaEnabled).toBe(true);
    });

    it('should return MFA disabled status', async () => {
      queryOne.mockReturnValue({ mfa_enabled: 0 });

      const res = await request(app).get('/api/auth/mfa/status');

      expect(res.status).toBe(200);
      expect(res.body.mfaEnabled).toBe(false);
    });

    it('should return 404 when user not found', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).get('/api/auth/mfa/status');

      expect(res.status).toBe(404);
    });
  });
});
