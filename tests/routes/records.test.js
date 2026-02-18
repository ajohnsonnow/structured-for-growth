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

import request from 'supertest';
import { execute, logActivity, query, queryOne } from '../../server/models/database.js';
import recordsRouter from '../../server/routes/records.js';
import { createTestApp } from '../helpers.js';

const app = createTestApp('/api/records', recordsRouter);

describe('Records Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/records', () => {
    it('should return paginated records', async () => {
      query.mockReturnValue([
        { id: 1, title: 'Test Document', record_type: 'document', status: 'active' },
      ]);
      queryOne.mockReturnValue({ count: 1 });

      const res = await request(app).get('/api/records');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.records).toHaveLength(1);
      expect(res.body.pagination).toHaveProperty('page');
      expect(res.body.pagination).toHaveProperty('total');
    });

    it('should support filtering by status', async () => {
      query.mockReturnValue([]);
      queryOne.mockReturnValue({ count: 0 });

      const res = await request(app).get('/api/records?status=active');

      expect(res.status).toBe(200);
      // Verify the query was called with status filter
      const callArgs = query.mock.calls[0];
      expect(callArgs[0]).toContain('status = ?');
      expect(callArgs[1]).toContain('active');
    });

    it('should support filtering by record type', async () => {
      query.mockReturnValue([]);
      queryOne.mockReturnValue({ count: 0 });

      const res = await request(app).get('/api/records?type=contract');

      expect(res.status).toBe(200);
      const callArgs = query.mock.calls[0];
      expect(callArgs[0]).toContain('record_type = ?');
    });

    it('should support legal hold filter', async () => {
      query.mockReturnValue([]);
      queryOne.mockReturnValue({ count: 0 });

      const res = await request(app).get('/api/records?hold=true');

      expect(res.status).toBe(200);
      const callArgs = query.mock.calls[0];
      expect(callArgs[0]).toContain('legal_hold = 1');
    });
  });

  describe('POST /api/records', () => {
    it('should create a record with metadata', async () => {
      execute.mockReturnValue({ changes: 1, lastInsertRowid: 42 });

      const res = await request(app).post('/api/records').send({
        title: 'System Security Plan',
        description: 'SSP for the SFG platform',
        record_type: 'document',
        category: 'security',
        classification: 'cui',
        cui_category: 'CTI',
        retention_schedule: 'GRS-4.2-020',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.recordId).toBe(42);
      expect(logActivity).toHaveBeenCalledWith(
        1,
        'RECORD_CREATE',
        'record',
        42,
        expect.any(String)
      );
    });

    it('should reject record without title', async () => {
      const res = await request(app)
        .post('/api/records')
        .send({ description: 'No title provided' });

      expect(res.status).toBe(400);
      // express-validator returns errors array
      const errorMsg = res.body.message || JSON.stringify(res.body.errors);
      expect(errorMsg).toMatch(/title|required/i);
    });

    it('should use retention schedule defaults when schedule ID provided', async () => {
      queryOne.mockReturnValue({ retention_years: 5, disposition_action: 'destroy' });
      execute.mockReturnValue({ changes: 1, lastInsertRowid: 43 });

      const res = await request(app).post('/api/records').send({
        title: 'IT Project Record',
        retention_schedule: 'GRS-3.1-010',
      });

      expect(res.status).toBe(201);
      // Should have looked up the retention schedule
      expect(queryOne).toHaveBeenCalledWith(
        expect.stringContaining('retention_schedules'),
        expect.arrayContaining(['GRS-3.1-010'])
      );
    });
  });

  describe('GET /api/records/:id', () => {
    it('should return a record with disposition history', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Test Record',
        record_type: 'document',
        status: 'active',
        legal_hold: 0,
      });
      query.mockReturnValue([{ id: 1, record_id: 1, action: 'legal_hold', reason: 'Audit' }]);

      const res = await request(app).get('/api/records/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.record.title).toBe('Test Record');
      expect(res.body.dispositionHistory).toHaveLength(1);
    });

    it('should return 404 for non-existent record', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).get('/api/records/999');

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/records/:id', () => {
    it('should update a record', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Old Title',
        description: 'Old desc',
        category: 'general',
        classification: 'unclassified',
        cui_category: null,
        cui_marking: null,
        status: 'active',
        legal_hold: 0,
      });

      const res = await request(app)
        .put('/api/records/1')
        .send({ title: 'Updated Title', classification: 'cui' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(logActivity).toHaveBeenCalledWith(
        1,
        'RECORD_UPDATE',
        'record',
        '1',
        expect.any(String)
      );
    });

    it('should return 404 for non-existent record', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).put('/api/records/999').send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should block update on record under legal hold', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Held Record',
        legal_hold: 1,
      });

      const res = await request(app).put('/api/records/1').send({ title: 'Try Update' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/legal hold/i);
    });
  });

  describe('DELETE /api/records/:id', () => {
    it('should dispose a record with logging', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Old Record',
        retention_years: 3,
        disposition_action: 'destroy',
        legal_hold: 0,
      });

      const res = await request(app).delete('/api/records/1').send({ reason: 'Retention expired' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/disposed/i);
      // Should log disposition
      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining('disposition_log'),
        expect.any(Array)
      );
      // Should mark as disposed
      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining('status = ?'),
        expect.arrayContaining(['disposed'])
      );
    });

    it('should return 404 for non-existent record', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).delete('/api/records/999');

      expect(res.status).toBe(404);
    });

    it('should block dispose on record under legal hold', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Held Record',
        legal_hold: 1,
      });

      const res = await request(app).delete('/api/records/1');

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/legal hold/i);
    });
  });

  describe('POST /api/records/:id/hold', () => {
    it('should place a legal hold', async () => {
      queryOne.mockReturnValue({ id: 1, title: 'Important Document' });

      const res = await request(app)
        .post('/api/records/1/hold')
        .send({ reason: 'Pending litigation' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/legal hold placed/i);
      expect(execute).toHaveBeenCalledWith(
        expect.stringContaining('legal_hold = 1'),
        expect.any(Array)
      );
    });

    it('should return 404 for non-existent record', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).post('/api/records/999/hold').send({ reason: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/records/:id/hold', () => {
    it('should release a legal hold', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Held Document',
        legal_hold: 1,
      });

      const res = await request(app)
        .delete('/api/records/1/hold')
        .send({ reason: 'Litigation resolved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/released/i);
    });

    it('should return 404 for non-existent record', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).delete('/api/records/999/hold');

      expect(res.status).toBe(404);
    });

    it('should return 400 when no hold exists', async () => {
      queryOne.mockReturnValue({
        id: 1,
        title: 'Not Held',
        legal_hold: 0,
      });

      const res = await request(app).delete('/api/records/1/hold');

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/no legal hold/i);
    });
  });

  describe('GET /api/records/holds/active', () => {
    it('should return records under legal hold', async () => {
      query.mockReturnValue([
        { id: 1, title: 'Held Doc 1', legal_hold: 1 },
        { id: 2, title: 'Held Doc 2', legal_hold: 1 },
      ]);

      const res = await request(app).get('/api/records/holds/active');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.holds).toHaveLength(2);
    });
  });

  describe('GET /api/records/disposition/log', () => {
    it('should return disposition log with pagination', async () => {
      query.mockReturnValue([{ id: 1, record_id: 1, action: 'destroy', record_title: 'Old Doc' }]);
      queryOne.mockReturnValue({ count: 1 });

      const res = await request(app).get('/api/records/disposition/log');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.entries).toHaveLength(1);
      expect(res.body.pagination).toHaveProperty('page');
    });
  });

  describe('GET /api/records/retention/schedules', () => {
    it('should return retention schedules', async () => {
      query.mockReturnValue([
        { id: 1, schedule_id: 'GRS-5.2-020', name: 'Transitory Records', retention_years: 1 },
        { id: 2, schedule_id: 'GRS-5.1-010', name: 'Common Office Records', retention_years: 3 },
      ]);

      const res = await request(app).get('/api/records/retention/schedules');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.schedules).toHaveLength(2);
    });
  });

  // ═══ P3.3.5 — Version Control Tests ═══

  describe('GET /api/records/:id/versions', () => {
    it('should list versions of a record', async () => {
      queryOne.mockReturnValueOnce({ id: 1, title: 'Test Doc' }); // record exists
      query.mockReturnValueOnce([
        {
          id: 1,
          record_id: 1,
          version_number: 2,
          title: 'Updated',
          change_summary: 'Changed title',
        },
        {
          id: 2,
          record_id: 1,
          version_number: 1,
          title: 'Original',
          change_summary: 'Initial version',
        },
      ]);

      const res = await request(app).get('/api/records/1/versions');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.versions).toHaveLength(2);
      expect(res.body.totalVersions).toBe(2);
    });

    it('should return 404 if record does not exist', async () => {
      queryOne.mockReturnValueOnce(null);

      const res = await request(app).get('/api/records/999/versions');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/records/:id/versions/:version', () => {
    it('should return a specific version snapshot', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        record_id: 1,
        version_number: 1,
        title: 'Original',
        content_snapshot: '{"status":"active"}',
        change_summary: 'Initial',
      });

      const res = await request(app).get('/api/records/1/versions/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.version.version_number).toBe(1);
      expect(res.body.version.content_snapshot).toEqual({ status: 'active' });
    });

    it('should return 404 for non-existent version', async () => {
      queryOne.mockReturnValueOnce(null);

      const res = await request(app).get('/api/records/1/versions/99');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/records/:id/diff/:v1/:v2', () => {
    it('should compute diff between two versions', async () => {
      queryOne
        .mockReturnValueOnce({
          title: 'Original Title',
          description: 'Old desc',
          category: 'technical',
          classification: 'unclassified',
          cui_category: null,
          cui_marking: null,
          content_snapshot: '{"status":"active","retention_years":3}',
        })
        .mockReturnValueOnce({
          title: 'Updated Title',
          description: 'New desc',
          category: 'technical',
          classification: 'CUI',
          cui_category: 'CTI',
          cui_marking: 'CUI//SP-CTI',
          content_snapshot: '{"status":"active","retention_years":5}',
        });

      const res = await request(app).get('/api/records/1/diff/1/2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.changes.length).toBeGreaterThan(0);
      expect(res.body.totalChanges).toBeGreaterThan(0);

      // Verify some expected changes
      const titleChange = res.body.changes.find((c) => c.field === 'title');
      expect(titleChange).toBeDefined();
      expect(titleChange.from).toBe('Original Title');
      expect(titleChange.to).toBe('Updated Title');
    });

    it('should return 404 if either version is missing', async () => {
      queryOne.mockReturnValueOnce(null).mockReturnValueOnce(null);

      const res = await request(app).get('/api/records/1/diff/1/99');

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/records/:id/versions', () => {
    it('should create a manual version checkpoint', async () => {
      queryOne
        .mockReturnValueOnce({ id: 1, title: 'Test Doc' }) // record exists check
        .mockReturnValueOnce({
          // record for snapshot
          id: 1,
          title: 'Test Doc',
          description: 'Desc',
          category: 'tech',
          classification: 'unclassified',
          cui_category: null,
          cui_marking: null,
          record_type: 'document',
          retention_schedule: null,
          retention_years: 3,
          disposition_action: 'destroy',
          status: 'active',
        })
        .mockReturnValueOnce({ maxVer: 1 }); // latest version number

      const res = await request(app)
        .post('/api/records/1/versions')
        .send({ change_summary: 'Pre-update checkpoint' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.versionNumber).toBe(2);
      expect(logActivity).toHaveBeenCalled();
    });

    it('should return 404 for non-existent record', async () => {
      queryOne.mockReturnValueOnce(null);

      const res = await request(app).post('/api/records/999/versions');

      expect(res.status).toBe(404);
    });
  });
});
