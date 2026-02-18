/**
 * Unit Tests: Compliance Engine (P3.4)
 * Tests evidence tracking, gap scoring, assessment scheduling, and POA&M export
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock database
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

import request from 'supertest';
import { execute, logActivity, query, queryOne } from '../../server/models/database.js';
import complianceEngineRouter from '../../server/routes/compliance-engine.js';
import { adminToken, createTestApp, userToken } from '../helpers.js';

const app = createTestApp('/api/compliance-engine', complianceEngineRouter);

describe('Compliance Engine (P3.4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // â”€â”€â”€ Evidence CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('POST /api/compliance-engine/evidence', () => {
    it('should reject missing required fields', async () => {
      const token = adminToken();
      const res = await request(app)
        .post('/api/compliance-engine/evidence')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
      // express-validator returns errors array
      const errorMsg = res.body.message || JSON.stringify(res.body.errors);
      expect(errorMsg).toContain('required');
    });

    it('should create evidence artifact', async () => {
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 42 });

      const token = adminToken();
      const res = await request(app)
        .post('/api/compliance-engine/evidence')
        .set('Authorization', `Bearer ${token}`)
        .send({ framework: 'cmmc', control_id: 'AC.L2-3.1.1', title: 'ACL config export' });

      expect(res.status).toBe(201);
      expect(res.body.evidenceId).toBe(42);
      expect(logActivity).toHaveBeenCalled();
    });
  });

  describe('GET /api/compliance-engine/evidence', () => {
    it('should list evidence records', async () => {
      query.mockReturnValueOnce([
        { id: 1, framework: 'cmmc', control_id: 'AC.L2-3.1.1', title: 'ACL doc' },
      ]);
      queryOne.mockReturnValueOnce({ count: 1 });

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/evidence')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.evidence).toHaveLength(1);
    });
  });

  describe('GET /api/compliance-engine/evidence/:id', () => {
    it('should return 404 for missing evidence', async () => {
      queryOne.mockReturnValueOnce(null);

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/evidence/999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return evidence record', async () => {
      queryOne.mockReturnValueOnce({ id: 1, framework: 'cmmc', title: 'ACL doc' });

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/evidence/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.evidence.title).toBe('ACL doc');
    });
  });

  describe('PUT /api/compliance-engine/evidence/:id', () => {
    it('should update evidence record', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        title: 'Old',
        status: 'draft',
        assessor: null,
        assessed_at: null,
        description: null,
        evidence_type: 'document',
        notes: null,
      });

      const token = adminToken();
      const res = await request(app)
        .put('/api/compliance-engine/evidence/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'approved', assessor: 'Jane Doe' });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('updated');
    });
  });

  describe('DELETE /api/compliance-engine/evidence/:id', () => {
    it('should reject non-admin', async () => {
      const token = userToken();
      const res = await request(app)
        .delete('/api/compliance-engine/evidence/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });

    it('should delete evidence', async () => {
      queryOne.mockReturnValueOnce({ id: 1, title: 'To delete' });

      const token = adminToken();
      const res = await request(app)
        .delete('/api/compliance-engine/evidence/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  // â”€â”€â”€ Gap Scoring â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('GET /api/compliance-engine/gap-score', () => {
    it('should return aggregate gap scores', async () => {
      query.mockReturnValueOnce([
        {
          framework: 'cmmc',
          total_controls: 10,
          implemented: 6,
          partial: 2,
          planned: 1,
          not_met: 1,
          not_assessed: 0,
          avg_pct: 72.0,
        },
      ]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/gap-score')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalFrameworks).toBe(1);
      expect(res.body.frameworks[0].score).toBe(70); // (6 + 2*0.5) / 10 * 100 = 70
    });
  });

  describe('GET /api/compliance-engine/gap-score/:framework', () => {
    it('should return 404 for framework with no data', async () => {
      query.mockReturnValueOnce([]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/gap-score/unknown')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return per-control detail', async () => {
      query.mockReturnValueOnce([
        { control_id: 'AC-1', status: 'implemented', implementation_pct: 100 },
        { control_id: 'AC-2', status: 'partial', implementation_pct: 50 },
      ]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/gap-score/nist-800-53')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalControls).toBe(2);
      expect(res.body.score).toBe(75); // (1 + 1*0.5) / 2 * 100 = 75
    });
  });

  // â”€â”€â”€ Assessment Scheduling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('POST /api/compliance-engine/assessments', () => {
    it('should reject missing required fields', async () => {
      const token = adminToken();
      const res = await request(app)
        .post('/api/compliance-engine/assessments')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should schedule an assessment', async () => {
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 10 });

      const token = adminToken();
      const res = await request(app)
        .post('/api/compliance-engine/assessments')
        .set('Authorization', `Bearer ${token}`)
        .send({ framework: 'cmmc', title: 'Annual CMMC', scheduled_date: '2026-03-01' });

      expect(res.status).toBe(201);
      expect(res.body.assessmentId).toBe(10);
    });
  });

  describe('GET /api/compliance-engine/assessments', () => {
    it('should list assessments with upcoming/overdue flags', async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      query.mockReturnValueOnce([
        {
          id: 1,
          framework: 'cmmc',
          title: 'Overdue',
          status: 'scheduled',
          scheduled_date: pastDate,
          reminder_days: 7,
        },
      ]);
      queryOne.mockReturnValueOnce({ count: 1 });

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/assessments')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.assessments[0].isOverdue).toBe(true);
    });
  });

  describe('PUT /api/compliance-engine/assessments/:id', () => {
    it('should update assessment', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        title: 'Old',
        description: '',
        status: 'scheduled',
        scheduled_date: '2026-03-01',
        completed_date: null,
        assessor: null,
        scope: null,
        findings_count: 0,
        score: null,
      });

      const token = adminToken();
      const res = await request(app)
        .put('/api/compliance-engine/assessments/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed', score: 85 });

      expect(res.status).toBe(200);
    });

    it('should return 404 for missing assessment', async () => {
      queryOne.mockReturnValueOnce(null);

      const token = adminToken();
      const res = await request(app)
        .put('/api/compliance-engine/assessments/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
    });
  });

  // â”€â”€â”€ POA&M Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  describe('GET /api/compliance-engine/export/poam', () => {
    it('should export POA&M with open items', async () => {
      query.mockReturnValueOnce([
        {
          framework: 'cmmc',
          control_id: 'AC-1',
          status: 'partial',
          implementation_pct: 50,
          poam_id: null,
          poam_milestone: null,
          poam_due_date: null,
          notes: 'WIP',
        },
        {
          framework: 'cmmc',
          control_id: 'IR-4',
          status: 'planned',
          implementation_pct: 0,
          poam_id: 'POAM-0099',
          poam_milestone: 'Q2 2026',
          poam_due_date: '2026-06-30',
          notes: null,
        },
      ]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/export/poam?framework=cmmc')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.poam.totalItems).toBe(2);
      expect(res.body.poam.items[0].controlId).toBe('AC-1');
      expect(res.body.poam.items[1].poamId).toBe('POAM-0099');
      expect(res.body.poam.items[1].milestone).toBe('Q2 2026');
    });

    it('should export all frameworks when no filter specified', async () => {
      query.mockReturnValueOnce([]);

      const token = adminToken();
      const res = await request(app)
        .get('/api/compliance-engine/export/poam')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.poam.framework).toBe('all');
      expect(res.body.poam.totalItems).toBe(0);
    });
  });
});
