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

// Mock the backup module to prevent file system calls
vi.mock('../../server/routes/backup.js', () => ({
  triggerAutoBackup: vi.fn(),
  default: {},
}));

import request from 'supertest';
import { execute, logActivity, query, queryOne } from '../../server/models/database.js';
import demoRouter from '../../server/routes/demo.js';
import { createTestApp } from '../helpers.js';

const app = createTestApp('/api/demo', demoRouter);

describe('Demo Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/demo/generate', () => {
    it('should generate demo data successfully', async () => {
      // Mock execute to return valid insert results
      execute.mockReturnValue({ changes: 1, lastInsertRowid: 1 });

      const res = await request(app).post('/api/demo/generate').send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('results');
      expect(res.body.results).toHaveProperty('created');
    });

    it('should clear existing data when requested', async () => {
      execute.mockReturnValue({ changes: 1, lastInsertRowid: 1 });

      const res = await request(app).post('/api/demo/generate').send({ clearExisting: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Should have called DELETE FROM for clearing demo tables
      const deleteCalls = execute.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('DELETE')
      );
      expect(deleteCalls.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/demo/stats', () => {
    it('should return demo data statistics', async () => {
      // Mock count queries for tables
      queryOne
        .mockReturnValueOnce({ count: 15 }) // total clients
        .mockReturnValueOnce({ count: 10 }); // demo clients

      query.mockReturnValue([]);

      const res = await request(app).get('/api/demo/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('stats');
    });
  });

  describe('POST /api/demo/clear', () => {
    it('should clear demo data', async () => {
      execute.mockReturnValue({ changes: 5 });

      const res = await request(app).post('/api/demo/clear').send({});

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(logActivity).toHaveBeenCalled();
    });

    it('should support clearAll option', async () => {
      execute.mockReturnValue({ changes: 10 });

      const res = await request(app).post('/api/demo/clear').send({ clearAll: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
