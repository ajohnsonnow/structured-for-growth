/**
 * Unit Tests: Middleware (auth.js)
 * Tests JWT authentication and role-based access control
 */
import { describe, it, expect, vi } from 'vitest';
import { authenticateToken, requireRole } from '../../server/middleware/auth.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

function mockReq(overrides = {}) {
  return {
    headers: {},
    ...overrides,
  };
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res;
}

describe('authenticateToken middleware', () => {
  it('should reject request without Authorization header', () => {
    const req = mockReq();
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token', () => {
    const req = mockReq({
      headers: { authorization: 'Bearer invalidtoken' },
    });
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should accept valid token and set req.user', () => {
    const payload = { userId: 1, username: 'test', role: 'admin' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    const req = mockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe(1);
    expect(req.user.role).toBe('admin');
  });

  it('should reject expired token', () => {
    const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '-1s' });

    const req = mockReq({
      headers: { authorization: `Bearer ${token}` },
    });
    const res = mockRes();
    const next = vi.fn();

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requireRole middleware', () => {
  it('should allow matching role', () => {
    const req = { user: { role: 'admin' } };
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('should reject non-matching role', () => {
    const req = { user: { role: 'user' } };
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject when user is undefined', () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();

    requireRole('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
