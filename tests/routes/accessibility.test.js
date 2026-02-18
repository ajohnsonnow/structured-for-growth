/**
 * Accessibility Routes — Test Suite
 *
 * Tests: GET /dashboard, POST /scan, GET /trends,
 *        GET/POST/PUT /remediation, GET /vpat-data
 */
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminToken, createTestApp } from '../helpers.js';

// Mock database module
vi.mock('../../server/models/database.js', () => {
  const rows = [];
  return {
    execute: vi.fn((...args) => {
      if (typeof args[0] === 'string' && args[0].trim().startsWith('CREATE TABLE')) {
        return;
      }
      if (typeof args[0] === 'string' && args[0].trim().startsWith('INSERT')) {
        rows.push({ id: rows.length + 1 });
      }
    }),
    query: vi.fn(() => []),
    queryOne: vi.fn((sql) => {
      if (sql?.includes('last_insert_rowid')) {
        return { id: 1 };
      }
      if (sql?.includes('COUNT')) {
        return {
          total: 0,
          open_count: 0,
          in_progress: 0,
          resolved: 0,
          wontfix: 0,
          critical_open: 0,
        };
      }
      return null;
    }),
  };
});

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
  const { default: router } = await import('../../server/routes/accessibility.js');
  app = createTestApp('/api/accessibility', router);
});

describe('Accessibility Routes', () => {
  describe('GET /api/accessibility/dashboard', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/accessibility/dashboard');
      expect(res.status).toBe(401);
    });

    it('returns dashboard metrics when authenticated', async () => {
      const res = await request(app)
        .get('/api/accessibility/dashboard')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('overview');
      expect(res.body.data).toHaveProperty('remediation');
      expect(res.body.data).toHaveProperty('pageScores');
      expect(res.body.data).toHaveProperty('wcagBreakdown');
    });

    it('overview contains expected fields', async () => {
      const res = await request(app)
        .get('/api/accessibility/dashboard')
        .set('Authorization', `Bearer ${adminToken()}`);
      const overview = res.body.data.overview;
      expect(overview).toHaveProperty('totalPages');
      expect(overview).toHaveProperty('avgConformanceScore');
      expect(overview).toHaveProperty('totalViolations');
      expect(overview).toHaveProperty('criticalViolations');
    });
  });

  describe('POST /api/accessibility/scan', () => {
    it('requires authentication', async () => {
      const res = await request(app)
        .post('/api/accessibility/scan')
        .send({ pageUrl: '/test', violations: [] });
      expect(res.status).toBe(401);
    });

    it('validates required fields', async () => {
      const res = await request(app)
        .post('/api/accessibility/scan')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('accepts valid scan with violations', async () => {
      const res = await request(app)
        .post('/api/accessibility/scan')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          pageUrl: '/index.html',
          pageTitle: 'Home Page',
          scanTool: 'axe-core',
          violations: [
            {
              id: 'color-contrast',
              impact: 'serious',
              description: 'Elements must have sufficient color contrast',
              tags: ['wcag2aa', 'wcag143'],
              nodes: [{ html: '<p>test</p>', target: ['p.low-contrast'] }],
            },
          ],
          passes: [{ id: 'html-has-lang' }],
          incomplete: [],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('scanId');
      expect(res.body.data).toHaveProperty('conformanceScore');
      expect(res.body.data).toHaveProperty('remediationItemsCreated');
    });

    it('accepts scan with empty violations', async () => {
      const res = await request(app)
        .post('/api/accessibility/scan')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          pageUrl: '/clean-page.html',
          violations: [],
          passes: [{ id: 'html-has-lang' }, { id: 'document-title' }],
        });
      expect(res.status).toBe(201);
      expect(res.body.data.violations).toBe(0);
    });
  });

  describe('GET /api/accessibility/trends', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/accessibility/trends');
      expect(res.status).toBe(401);
    });

    it('returns trend data', async () => {
      const res = await request(app)
        .get('/api/accessibility/trends')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('accepts pageUrl and days query params', async () => {
      const res = await request(app)
        .get('/api/accessibility/trends?pageUrl=/index.html&days=30')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/accessibility/remediation', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/accessibility/remediation');
      expect(res.status).toBe(401);
    });

    it('returns remediation list with pagination', async () => {
      const { query: dbQuery } = await import('../../server/models/database.js');
      dbQuery.mockReturnValueOnce([]);

      const res = await request(app)
        .get('/api/accessibility/remediation')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('items');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('pages');
    });

    it('filters by status, impact, and page_url', async () => {
      const res = await request(app)
        .get('/api/accessibility/remediation?status=open&impact=critical&page_url=/index.html')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/accessibility/remediation', () => {
    it('validates required fields', async () => {
      const res = await request(app)
        .post('/api/accessibility/remediation')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('creates a remediation item', async () => {
      const res = await request(app)
        .post('/api/accessibility/remediation')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          page_url: '/dashboard.html',
          rule_id: 'color-contrast',
          impact: 'serious',
          description: 'Insufficient color contrast ratio',
          wcag_criteria: 'wcag143',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('rejects invalid impact value', async () => {
      const res = await request(app)
        .post('/api/accessibility/remediation')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          page_url: '/test.html',
          rule_id: 'test-rule',
          impact: 'catastrophic',
          description: 'Test',
        });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/accessibility/remediation/:id', () => {
    it('validates id is integer', async () => {
      const res = await request(app)
        .put('/api/accessibility/remediation/abc')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'resolved' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent item', async () => {
      const { queryOne: dbQueryOne } = await import('../../server/models/database.js');
      dbQueryOne.mockReturnValueOnce(null);

      const res = await request(app)
        .put('/api/accessibility/remediation/999')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'resolved' });
      expect(res.status).toBe(404);
    });

    it('updates remediation item', async () => {
      const { queryOne: dbQueryOne } = await import('../../server/models/database.js');
      dbQueryOne.mockReturnValueOnce({ id: 1, status: 'open' });

      const res = await request(app)
        .put('/api/accessibility/remediation/1')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'in-progress', priority: 'high' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/accessibility/vpat-data', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/accessibility/vpat-data');
      expect(res.status).toBe(401);
    });

    it('returns VPAT data structure', async () => {
      const res = await request(app)
        .get('/api/accessibility/vpat-data')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
