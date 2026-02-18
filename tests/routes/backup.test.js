import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database module
vi.mock('../../server/models/database.js', () => ({
  initializeDatabase: vi.fn(),
  getDatabase: vi.fn(() => ({
    run: vi.fn(),
    export: vi.fn(() => new Uint8Array([1, 2, 3])),
  })),
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

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    mkdirSync: vi.fn(),
    readdirSync: vi.fn(() => []),
    statSync: vi.fn(() => ({
      size: 1024,
      birthtime: new Date('2026-01-01'),
      mtime: new Date('2026-01-01'),
    })),
    readFileSync: vi.fn(() => JSON.stringify({ tables: {} })),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  },
  existsSync: vi.fn(() => true),
  mkdirSync: vi.fn(),
  readdirSync: vi.fn(() => []),
  statSync: vi.fn(() => ({
    size: 1024,
    birthtime: new Date('2026-01-01'),
    mtime: new Date('2026-01-01'),
  })),
  readFileSync: vi.fn(() => JSON.stringify({ tables: {} })),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
}));

import fs from 'fs';
import request from 'supertest';
import { logActivity, query } from '../../server/models/database.js';
import backupRouter from '../../server/routes/backup.js';
import { createTestApp } from '../helpers.js';

const app = createTestApp('/api/backup', backupRouter);

describe('Backup Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/backup/list', () => {
    it('should return empty backup list', async () => {
      fs.readdirSync.mockReturnValue([]);

      const res = await request(app).get('/api/backup/list');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.backups).toEqual([]);
    });

    it('should return list of backups sorted by date', async () => {
      fs.readdirSync.mockReturnValue(['backup-2026-01-01.json', 'backup-2026-01-02.json']);
      fs.statSync.mockReturnValue({
        size: 2048,
        birthtime: new Date('2026-01-01'),
        mtime: new Date('2026-01-01'),
      });

      const res = await request(app).get('/api/backup/list');

      expect(res.status).toBe(200);
      expect(res.body.backups).toHaveLength(2);
      expect(res.body.backups[0]).toHaveProperty('filename');
      expect(res.body.backups[0]).toHaveProperty('sizeFormatted');
    });
  });

  describe('POST /api/backup/create', () => {
    it('should create a backup', async () => {
      query.mockReturnValue([{ name: 'users' }, { name: 'clients' }]);
      fs.statSync.mockReturnValue({ size: 4096 });

      const res = await request(app).post('/api/backup/create').send({ name: 'TestBackup' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('filename');
      expect(res.body.filename).toContain('TestBackup');
      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(logActivity).toHaveBeenCalled();
    });

    it('should create backup with default name', async () => {
      query.mockReturnValue([]);

      const res = await request(app).post('/api/backup/create').send({});

      expect(res.status).toBe(200);
      expect(res.body.filename).toContain('backup-');
    });
  });

  describe('GET /api/backup/download/:filename', () => {
    it('should return 404 for non-existent backup', async () => {
      fs.existsSync.mockReturnValue(false);

      const res = await request(app).get('/api/backup/download/nonexistent.json');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/backup/export', () => {
    it('should export database', async () => {
      query.mockReturnValue([{ name: 'users' }]);

      const res = await request(app).get('/api/backup/export');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/json');
      expect(res.headers['content-disposition']).toContain('attachment');
    });
  });

  describe('POST /api/backup/restore', () => {
    it('should reject when no source provided', async () => {
      const res = await request(app).post('/api/backup/restore').send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no backup source/i);
    });

    it('should return 404 for non-existent backup file', async () => {
      fs.existsSync.mockReturnValue(false);

      const res = await request(app)
        .post('/api/backup/restore')
        .send({ filename: 'nonexistent.json' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/backup/:filename', () => {
    it('should delete an existing backup', async () => {
      fs.existsSync.mockReturnValue(true);

      const res = await request(app).delete('/api/backup/old-backup.json');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(logActivity).toHaveBeenCalled();
    });

    it('should return 404 for non-existent backup', async () => {
      fs.existsSync.mockReturnValue(false);

      const res = await request(app).delete('/api/backup/missing.json');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/backup/settings', () => {
    it('should return backup settings', async () => {
      const res = await request(app).get('/api/backup/settings');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.settings).toHaveProperty('backupDir');
      expect(res.body.settings).toHaveProperty('autoBackupEnabled');
      expect(res.body.settings).toHaveProperty('maxBackups');
    });
  });

  describe('GET /api/backup/stats', () => {
    it('should return database statistics', async () => {
      query
        .mockReturnValueOnce([{ name: 'users' }, { name: 'clients' }]) // getAllTables
        .mockReturnValueOnce([{ count: 5 }]) // users count
        .mockReturnValueOnce([{ count: 10 }]); // clients count

      const res = await request(app).get('/api/backup/stats');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toHaveProperty('tables');
      expect(res.body.stats).toHaveProperty('totalRecords');
    });
  });
});
