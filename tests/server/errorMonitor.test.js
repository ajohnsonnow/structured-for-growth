/**
 * Error Monitor Tests (P3.1.7)
 * Tests for the self-hosted error monitoring system
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureError,
  getErrors,
  getErrorByFingerprint,
  resolveError,
  getErrorStats,
  clearErrors,
} from '../../server/lib/errorMonitor.js';

describe('Error Monitor (P3.1.7)', () => {
  beforeEach(() => {
    clearErrors();
  });

  describe('captureError', () => {
    it('should capture a basic error and return a fingerprint', () => {
      const err = new Error('Something went wrong');
      const fp = captureError(err);

      expect(fp).toBeDefined();
      expect(typeof fp).toBe('string');
      expect(fp.length).toBe(16);
    });

    it('should capture error with request context', () => {
      const err = new Error('Route failed');
      const mockReq = {
        method: 'POST',
        originalUrl: '/api/clients',
        ip: '127.0.0.1',
        get: () => 'test-agent',
        id: 'req-123',
        query: {},
        params: {},
        user: { id: 1, username: 'admin', role: 'admin' },
      };

      const fp = captureError(err, { req: mockReq });
      const record = getErrorByFingerprint(fp);

      expect(record).toBeDefined();
      expect(record.lastContext.request.method).toBe('POST');
      expect(record.lastContext.request.url).toBe('/api/clients');
      expect(record.lastContext.user.username).toBe('admin');
    });

    it('should deduplicate identical errors', () => {
      const err1 = new Error('Duplicate error');
      const err2 = new Error('Duplicate error');

      const fp1 = captureError(err1);
      const fp2 = captureError(err2);

      expect(fp1).toBe(fp2);

      const record = getErrorByFingerprint(fp1);
      expect(record.count).toBe(2);
    });

    it('should distinguish different errors', () => {
      const err1 = new Error('Error A');
      const err2 = new Error('Error B');

      const fp1 = captureError(err1);
      const fp2 = captureError(err2);

      expect(fp1).not.toBe(fp2);
    });

    it('should re-open resolved errors on recurrence', () => {
      const err = new Error('Recurring issue');
      const fp = captureError(err);
      resolveError(fp);

      let record = getErrorByFingerprint(fp);
      expect(record.resolved).toBe(true);

      // Recurs
      captureError(new Error('Recurring issue'));
      record = getErrorByFingerprint(fp);
      expect(record.resolved).toBe(false);
      expect(record.count).toBe(2);
    });
  });

  describe('getErrors', () => {
    it('should return errors sorted by most recent', () => {
      captureError(new Error('First'));
      captureError(new Error('Second'));
      captureError(new Error('Third'));

      const errors = getErrors();
      expect(errors.length).toBe(3);
      // All three errors should be present
      const messages = errors.map((e) => e.message);
      expect(messages).toContain('First');
      expect(messages).toContain('Second');
      expect(messages).toContain('Third');
    });

    it('should filter unresolved only', () => {
      const fp1 = captureError(new Error('Will resolve'));
      captureError(new Error('Still open'));
      resolveError(fp1);

      const unresolved = getErrors({ unresolved: true });
      expect(unresolved.length).toBe(1);
      expect(unresolved[0].message).toBe('Still open');
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        captureError(new Error(`Error ${i}`));
      }

      const limited = getErrors({ limit: 3 });
      expect(limited.length).toBe(3);
    });
  });

  describe('resolveError', () => {
    it('should mark error as resolved', () => {
      const fp = captureError(new Error('Fix me'));
      const result = resolveError(fp);

      expect(result).toBe(true);
      expect(getErrorByFingerprint(fp).resolved).toBe(true);
    });

    it('should return false for unknown fingerprint', () => {
      const result = resolveError('nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('getErrorStats', () => {
    it('should return summary statistics', () => {
      captureError(new Error('Error 1'));
      captureError(new Error('Error 2'));
      const fp = captureError(new Error('Error 3'));
      resolveError(fp);

      const stats = getErrorStats();

      expect(stats.total).toBe(3);
      expect(stats.unresolved).toBe(2);
      expect(stats.lastHour).toBe(3);
      expect(stats.lastDay).toBe(3);
      expect(stats.topErrors).toHaveLength(3);
    });

    it('should return empty stats when no errors', () => {
      const stats = getErrorStats();
      expect(stats.total).toBe(0);
      expect(stats.unresolved).toBe(0);
      expect(stats.topErrors).toHaveLength(0);
    });
  });
});
