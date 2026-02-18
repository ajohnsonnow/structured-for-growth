/**
 * requestId Middleware — Test Suite
 *
 * Tests: UUID correlation ID injection, X-Request-Id header
 */
import { describe, expect, it, vi } from 'vitest';

describe('requestId Middleware', () => {
  it('adds id to req object', async () => {
    const { requestId } = await import('../../server/middleware/requestId.js');
    const req = { headers: {} };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    requestId(req, res, next);

    expect(req.id).toBeDefined();
    expect(typeof req.id).toBe('string');
    // UUID v4 format
    expect(req.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    expect(next).toHaveBeenCalledOnce();
  });

  it('sets X-Request-Id response header', async () => {
    const { requestId } = await import('../../server/middleware/requestId.js');
    const req = { headers: {} };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    requestId(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.id);
  });

  it('generates unique IDs for each request', async () => {
    const { requestId } = await import('../../server/middleware/requestId.js');
    const ids = [];

    for (let i = 0; i < 10; i++) {
      const req = { headers: {} };
      const res = { setHeader: vi.fn() };
      requestId(req, res, vi.fn());
      ids.push(req.id);
    }

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });
});
