/**
 * Error Monitor Routes — Test Suite
 *
 * Tests: GET /errors, GET /stats, GET /errors/:fingerprint,
 *        POST /errors/:fingerprint/resolve
 */
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminToken, createTestApp, userToken } from '../helpers.js';

vi.mock('../../server/lib/errorMonitor.js', () => ({
  getErrors: vi.fn(() => [
    {
      fingerprint: 'fp1',
      message: 'Test Error',
      name: 'Error',
      count: 3,
      resolved: false,
      environment: 'test',
    },
  ]),
  getErrorStats: vi.fn(() => ({
    total: 5,
    unresolved: 2,
    resolved: 3,
    byType: { TypeError: 3, ReferenceError: 2 },
    recentRate: { last1h: 1, last24h: 4, last7d: 5 },
  })),
  getErrorByFingerprint: vi.fn((fp) => {
    if (fp === 'known-fp') {
      return { fingerprint: fp, message: 'Test Error', count: 3, resolved: false };
    }
    return null;
  }),
  resolveError: vi.fn((fp) => {
    if (fp === 'known-fp') {
      return true;
    }
    return false;
  }),
  captureError: vi.fn(),
  breadcrumbMiddleware: vi.fn((req, res, next) => next()),
  errorMonitorMiddleware: vi.fn((err, req, res, next) => next(err)),
  clearErrors: vi.fn(),
}));

vi.mock('../../server/lib/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: router } = await import('../../server/routes/error-monitor.js');
  app = createTestApp('/api/errors', router);
});

describe('Error Monitor Routes', () => {
  describe('GET /api/errors', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .get('/api/errors')
        .set('Authorization', `Bearer ${userToken()}`);
      expect(res.status).toBe(403);
    });

    it('returns error list for admin', async () => {
      const res = await request(app)
        .get('/api/errors')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/errors/stats', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .get('/api/errors/stats')
        .set('Authorization', `Bearer ${userToken()}`);
      expect(res.status).toBe(403);
    });

    it('returns error statistics', async () => {
      const res = await request(app)
        .get('/api/errors/stats')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/errors/:fingerprint', () => {
    it('returns error detail for known fingerprint', async () => {
      const res = await request(app)
        .get('/api/errors/known-fp')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });

    it('returns 404 for unknown fingerprint', async () => {
      const res = await request(app)
        .get('/api/errors/unknown-fp')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/errors/:fingerprint/resolve', () => {
    it('resolves a known error', async () => {
      const res = await request(app)
        .patch('/api/errors/known-fp/resolve')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });

    it('returns 404 for unknown error', async () => {
      const res = await request(app)
        .patch('/api/errors/unknown-fp/resolve')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(404);
    });
  });
});
