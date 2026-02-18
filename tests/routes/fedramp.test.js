/**
 * FedRAMP Routes — Test Suite
 *
 * Tests: SSP controls, ConMon dashboard, POA&M CRUD,
 *        scan ingestion, significant changes
 */
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminToken, createTestApp } from '../helpers.js';

vi.mock('../../server/models/database.js', () => ({
  execute: vi.fn(),
  query: vi.fn(() => []),
  queryOne: vi.fn((sql) => {
    if (sql?.includes('last_insert_rowid')) {
      return { id: 1 };
    }
    if (sql?.includes('COUNT')) {
      return { total: 0 };
    }
    return null;
  }),
  logActivity: vi.fn(),
}));

vi.mock('../../server/lib/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

vi.mock('../../server/middleware/zeroTrust.js', () => ({
  getZeroTrustStatus: vi.fn(() => ({
    enabled: true,
    trustThreshold: 40,
    policyLevel: 'standard',
  })),
  computeTrustScore: vi.fn(() => ({ score: 75, factors: [] })),
  zeroTrustEnforce: vi.fn((req, res, next) => next()),
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: router } = await import('../../server/routes/fedramp.js');
  app = createTestApp('/api/fedramp', router);
});

describe('FedRAMP Routes', () => {
  describe('GET /api/fedramp/ssp/controls', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/fedramp/ssp/controls');
      expect(res.status).toBe(401);
    });

    it('returns SSP controls', async () => {
      const res = await request(app)
        .get('/api/fedramp/ssp/controls')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/fedramp/conmon/dashboard', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/fedramp/conmon/dashboard');
      expect(res.status).toBe(401);
    });

    it('returns ConMon dashboard data', async () => {
      const res = await request(app)
        .get('/api/fedramp/conmon/dashboard')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POA&M CRUD', () => {
    it('GET /conmon/poam lists POA&M items', async () => {
      const res = await request(app)
        .get('/api/fedramp/conmon/poam')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /conmon/poam creates a POA&M item', async () => {
      const res = await request(app)
        .post('/api/fedramp/conmon/poam')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          weakness: 'Missing multifactor authentication',
          controlId: 'IA-2',
          riskLevel: 'high',
          milestones: 'Deploy MFA solution',
          scheduledCompletion: '2026-06-01',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('POST /conmon/poam validates required fields', async () => {
      const res = await request(app)
        .post('/api/fedramp/conmon/poam')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('PATCH /conmon/poam/:id updates a POA&M item', async () => {
      const { queryOne: dbQueryOne } = await import('../../server/models/database.js');
      dbQueryOne.mockReturnValueOnce({
        id: 1,
        weakness: 'Test',
        status: 'open',
        poam_id: 'POAM-1',
      });

      const res = await request(app)
        .patch('/api/fedramp/conmon/poam/1')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'closed' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('returns 404 for non-existent POA&M item', async () => {
      const res = await request(app)
        .patch('/api/fedramp/conmon/poam/999')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'closed' });
      expect(res.status).toBe(404);
    });
  });

  describe('Scan Results', () => {
    it('POST /conmon/scans ingests scan results', async () => {
      const res = await request(app)
        .post('/api/fedramp/conmon/scans')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          scanType: 'infrastructure',
          scanner: 'Nessus',
          findings: [
            {
              severity: 'high',
              title: 'SSL Certificate Expired',
              description: 'The SSL certificate has expired',
            },
          ],
        });
      expect(res.status).toBe(201);
    });

    it('GET /conmon/scans lists scan results', async () => {
      const res = await request(app)
        .get('/api/fedramp/conmon/scans')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('ConMon Changes', () => {
    it('POST /conmon/changes logs a change', async () => {
      const res = await request(app)
        .post('/api/fedramp/conmon/changes')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          changeType: 'boundary-change',
          description: 'Network topology update',
          impactLevel: 'moderate',
        });
      expect(res.status).toBe(201);
    });

    it('GET /conmon/changes lists changes', async () => {
      const res = await request(app)
        .get('/api/fedramp/conmon/changes')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });
});
