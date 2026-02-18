/**
 * Ownership Guard Middleware Tests
 * Tests horizontal privilege escalation prevention.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database module — ownership guard uses { queryOne }
vi.mock('../../server/models/database.js', () => ({
  queryOne: vi.fn(),
  default: { getDb: vi.fn() },
}));

import { requireOwnership } from '../../server/middleware/ownershipGuard.js';
import { queryOne } from '../../server/models/database.js';

function mockReq(overrides = {}) {
  return {
    params: {},
    user: { userId: 1, role: 'user' },
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

describe('requireOwnership middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow admin users to bypass ownership check', async () => {
    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { userId: 1, role: 'admin' }, params: { id: '99' } });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should allow owner to access their own resource', async () => {
    queryOne.mockResolvedValue({ id: 42 });

    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { userId: 1, role: 'user' }, params: { id: '42' } });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject non-owner access (returns 403)', async () => {
    queryOne.mockResolvedValue(null);

    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { userId: 1, role: 'user' }, params: { id: '42' } });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 for missing entity ID', async () => {
    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { userId: 1, role: 'user' }, params: {} });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 for missing userId', async () => {
    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { role: 'user' }, params: { id: '1' } });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });

  it('should fall through gracefully on "no such column" errors', async () => {
    queryOne.mockRejectedValue(new Error('no such column: created_by'));

    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { userId: 1, role: 'user' }, params: { id: '1' } });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 500 on unexpected database errors', async () => {
    queryOne.mockRejectedValue(new Error('DB connection failed'));

    const middleware = requireOwnership('client', 'id');
    const req = mockReq({ user: { userId: 1, role: 'user' }, params: { id: '1' } });
    const res = mockRes();
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  it('should support all 7 entity types without throwing', () => {
    const entityTypes = ['client', 'project', 'message', 'campaign', 'record', 'evidence', 'cdrl'];
    entityTypes.forEach((type) => {
      expect(() => requireOwnership(type, 'id')).not.toThrow();
    });
  });

  it('should throw for unknown entity type', () => {
    expect(() => requireOwnership('nonexistent', 'id')).toThrow();
  });
});
