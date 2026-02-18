/**
 * Zero Trust Middleware — Test Suite
 *
 * Tests: computeTrustScore, zeroTrustEnforce, getZeroTrustStatus,
 *        policy levels, trust scoring factors
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../server/lib/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    security: vi.fn(),
  }),
}));

let computeTrustScore, zeroTrustEnforce, getZeroTrustStatus;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('../../server/middleware/zeroTrust.js');
  computeTrustScore = mod.computeTrustScore;
  zeroTrustEnforce = mod.zeroTrustEnforce;
  getZeroTrustStatus = mod.getZeroTrustStatus;
});

describe('Zero Trust Middleware', () => {
  describe('computeTrustScore', () => {
    it('returns an object with numeric score between 0 and 100', () => {
      const req = {
        user: { id: 1, role: 'admin' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        path: '/api/test',
      };
      const result = computeTrustScore(req);
      expect(typeof result).toBe('object');
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.factors)).toBe(true);
    });

    it('scores higher with authenticated user', () => {
      const authReq = {
        user: { id: 1, role: 'admin', mfaVerified: true },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        path: '/api/test',
      };
      const unauthReq = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        path: '/api/test',
      };
      const authScore = computeTrustScore(authReq).score;
      const unauthScore = computeTrustScore(unauthReq).score;
      expect(authScore).toBeGreaterThan(unauthScore);
    });

    it('scores higher with MFA verified', () => {
      const mfaReq = {
        user: { id: 1, role: 'admin', mfaVerified: true },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        path: '/api/test',
      };
      const noMfaReq = {
        user: { id: 1, role: 'admin' },
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        path: '/api/test',
      };
      const mfaScore = computeTrustScore(mfaReq).score;
      const noMfaScore = computeTrustScore(noMfaReq).score;
      expect(mfaScore).toBeGreaterThanOrEqual(noMfaScore);
    });
  });

  describe('zeroTrustEnforce', () => {
    it('calls next() for public routes', () => {
      const req = {
        path: '/api/health',
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        method: 'GET',
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
        setHeader: vi.fn(),
      };
      const next = vi.fn();

      zeroTrustEnforce(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('allows authenticated requests on standard routes', () => {
      const req = {
        user: { userId: 1, role: 'user' },
        path: '/api/clients',
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        method: 'GET',
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
        setHeader: vi.fn(),
      };
      const next = vi.fn();

      zeroTrustEnforce(req, res, next);
      // In dev mode, should warn but not block
      expect(next).toHaveBeenCalled();
    });
  });

  describe('getZeroTrustStatus', () => {
    it('returns a status object', () => {
      const status = getZeroTrustStatus();
      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
    });
  });
});
