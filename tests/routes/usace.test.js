/**
 * USACE Routes — Test Suite
 *
 * Tests: Document templates, SF298 generation, distribution statements,
 *        CDRL management, MIL-STD-498 DIDs, NEPA templates, DrChecks export
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
}));

vi.mock('../../server/lib/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }),
}));

// Mock ownershipGuard — usace uses requireOwnership for CDRL PUT
vi.mock('../../server/middleware/ownershipGuard.js', () => ({
  requireOwnership: vi.fn(() => (req, res, next) => next()),
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: router } = await import('../../server/routes/usace.js');
  app = createTestApp('/api/usace', router);
});

describe('USACE Routes', () => {
  describe('GET /api/usace/templates', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/usace/templates');
      expect(res.status).toBe(401);
    });

    it('returns available USACE document templates', async () => {
      const res = await request(app)
        .get('/api/usace/templates')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('SF298 Generation', () => {
    it('POST /sf298/generate generates a Standard Form 298', async () => {
      const res = await request(app)
        .post('/api/usace/sf298/generate')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          data: {
            reportDate: '2026-02-15',
            reportType: 'Final',
            title: 'Technical Report: Bridge Analysis',
            authors: 'John Doe, Jane Smith',
            performingOrg: 'USACE District',
            performingOrgReportNumber: 'ERDC/CHL TR-26-1',
            sponsoringAgency: 'U.S. Army Corps of Engineers',
            distributionStatement: 'A',
            abstract: 'Analysis of bridge structural integrity.',
            subjectTerms: 'bridge, structural analysis, USACE',
            limitationAbstract: 'UU',
            numberOfPages: '42',
            responsiblePerson: 'John Doe, 555-0100',
            classificationReport: 'UNCLASSIFIED',
            classificationAbstract: 'UNCLASSIFIED',
            classificationPage: 'UNCLASSIFIED',
          },
        });
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('validates required SF298 data field', async () => {
      const res = await request(app)
        .post('/api/usace/sf298/generate')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({});
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('Distribution Statements', () => {
    it('GET /distribution-statements lists all statements', async () => {
      const res = await request(app)
        .get('/api/usace/distribution-statements')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /distribution-statements/mark applies marking', async () => {
      const res = await request(app)
        .post('/api/usace/distribution-statements/mark')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          letter: 'B',
          reason: 'U.S. Government Agencies Only',
          date: '2026-02-15',
          office: 'USACE HQ',
        });
      expect([200, 201]).toContain(res.status);
    });
  });

  describe('CDRL Management', () => {
    it('GET /cdrl lists CDRL items', async () => {
      const res = await request(app)
        .get('/api/usace/cdrl')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /cdrl creates a CDRL item', async () => {
      const res = await request(app)
        .post('/api/usace/cdrl')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          cdrl_sequence: 'A001',
          data_item_title: 'System Design Document',
          did_number: 'DI-IPSC-81432',
          frequency: 'ONE/R',
          distribution_statement: 'A',
        });
      expect(res.status).toBe(201);
    });

    it('PUT /cdrl/:id updates a CDRL item', async () => {
      const { queryOne: dbQueryOne } = await import('../../server/models/database.js');
      dbQueryOne.mockReturnValueOnce({
        id: 1,
        cdrl_sequence: 'A001',
        status: 'pending',
        created_by: 1,
      });

      const res = await request(app)
        .put('/api/usace/cdrl/1')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'submitted' });
      expect(res.status).toBe(200);
    });

    it('returns 404 for non-existent CDRL', async () => {
      const res = await request(app)
        .get('/api/usace/cdrl/999')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(404);
    });

    it('DELETE /cdrl/:id removes a CDRL item (admin)', async () => {
      const { queryOne: dbQueryOne } = await import('../../server/models/database.js');
      dbQueryOne.mockReturnValueOnce({ id: 1 });

      const res = await request(app)
        .delete('/api/usace/cdrl/1')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('MIL-STD-498', () => {
    it('GET /mil-std-498 returns template list', async () => {
      const res = await request(app)
        .get('/api/usace/mil-std-498')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /mil-std-498/:type returns specific DID', async () => {
      const res = await request(app)
        .get('/api/usace/mil-std-498/SDD')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('NEPA Templates', () => {
    it('GET /nepa returns templates', async () => {
      const res = await request(app)
        .get('/api/usace/nepa')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DrChecks Export', () => {
    it('POST /drchecks/export generates export', async () => {
      const res = await request(app)
        .post('/api/usace/drchecks/export')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          projectName: 'Test Project',
          reviewType: 'ITR',
          comments: [
            {
              discipline: 'Structural',
              commentText: 'Verify load calculations',
              classification: 'Major',
            },
          ],
        });
      expect([200, 201]).toContain(res.status);
    });
  });
});
