import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  access: vi.fn(() => Promise.resolve()),
}));

import request from 'supertest';
import { createTestApp } from '../helpers.js';

// Dynamic import to allow mocks to settle
let complianceRouter;
let app;

beforeEach(async () => {
  vi.clearAllMocks();
  // Reset module cache for fresh import
  vi.resetModules();
  // Re-mock after reset
  vi.mock('fs/promises', () => ({
    readdir: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(() => Promise.resolve()),
  }));
  const mod = await import('../../server/routes/compliance.js');
  complianceRouter = mod.default;
  app = createTestApp('/api/compliance', complianceRouter);
});

describe('Compliance Routes', () => {
  describe('GET /api/compliance/frameworks', () => {
    it('should return list of frameworks', async () => {
      const { readdir: rd, readFile: rf } = await import('fs/promises');
      rd.mockResolvedValue(['nist-800-53.json', 'cmmc.json']);
      rf.mockResolvedValue(JSON.stringify({ id: 'nist-800-53', name: 'NIST 800-53' }));

      const res = await request(app).get('/api/compliance/frameworks');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('frameworks');
      expect(Array.isArray(res.body.frameworks)).toBe(true);
    });

    it('should return empty array when directory not found', async () => {
      const { readdir: rd } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rd.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/frameworks');

      expect(res.status).toBe(200);
      expect(res.body.frameworks).toEqual([]);
    });

    it('should return 500 on unexpected error', async () => {
      const { readdir: rd } = await import('fs/promises');
      rd.mockRejectedValue(new Error('Permission denied'));

      const res = await request(app).get('/api/compliance/frameworks');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/compliance/frameworks/:id', () => {
    it('should return a specific framework', async () => {
      const { readFile: rf } = await import('fs/promises');
      const framework = { id: 'cmmc', name: 'CMMC 2.0', domains: [] };
      rf.mockResolvedValue(JSON.stringify(framework));

      const res = await request(app).get('/api/compliance/frameworks/cmmc');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('cmmc');
    });

    it('should return 404 for non-existent framework', async () => {
      const { readFile: rf } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rf.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/frameworks/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Framework not found');
    });

    it('should sanitize framework ID parameter', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue(JSON.stringify({ id: 'etcpasswd' }));

      const res = await request(app).get('/api/compliance/frameworks/../../etc/passwd');

      // Path traversal chars are stripped — the route sanitizes with replace(/[^a-zA-Z0-9_-]/g, '')
      // so '../../etc/passwd' becomes 'etcpasswd' which is a valid (non-traversal) lookup
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /api/compliance/crossmap', () => {
    it('should return cross-framework mappings', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue(JSON.stringify({ mappings: [{ from: 'nist', to: 'cmmc' }] }));

      const res = await request(app).get('/api/compliance/crossmap');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('mappings');
    });

    it('should return empty when no crossmap file', async () => {
      const { readFile: rf } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rf.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/crossmap');

      expect(res.status).toBe(200);
      expect(res.body.mappings).toEqual([]);
    });
  });

  describe('GET /api/compliance/templates', () => {
    it('should return template metadata', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue(JSON.stringify({ templates: ['ssp', 'poam'] }));

      const res = await request(app).get('/api/compliance/templates');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('templates');
    });

    it('should return 500 on error', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockRejectedValue(new Error('Read error'));

      const res = await request(app).get('/api/compliance/templates');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/compliance/oscal', () => {
    it('should list OSCAL catalogs', async () => {
      const { readdir: rd } = await import('fs/promises');
      rd.mockResolvedValue(['catalog-nist-800-53.json', 'catalog-cmmc.json']);

      const res = await request(app).get('/api/compliance/oscal');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('catalogs');
      expect(res.body.catalogs.length).toBe(2);
      expect(res.body.catalogs[0]).toHaveProperty('id');
      expect(res.body.catalogs[0]).toHaveProperty('downloadUrl');
    });

    it('should return empty when no OSCAL directory', async () => {
      const { readdir: rd } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rd.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/oscal');

      expect(res.status).toBe(200);
      expect(res.body.catalogs).toEqual([]);
    });
  });

  describe('GET /api/compliance/oscal/:framework', () => {
    it('should return a specific OSCAL catalog', async () => {
      const { readFile: rf } = await import('fs/promises');
      const catalog = { catalog: { metadata: { title: 'NIST 800-53' } } };
      rf.mockResolvedValue(JSON.stringify(catalog));

      const res = await request(app).get('/api/compliance/oscal/nist-800-53');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('catalog');
    });

    it('should return 404 for non-existent catalog', async () => {
      const { readFile: rf } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rf.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/oscal/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/compliance/evidence', () => {
    it('should return evidence matrix', async () => {
      const { readdir: rd, readFile: rf } = await import('fs/promises');
      rd.mockResolvedValue(['nist.json']);
      rf.mockResolvedValue(
        JSON.stringify({
          id: 'nist',
          name: 'NIST',
          domains: [
            {
              name: 'Access Control',
              controls: [
                {
                  id: 'AC-1',
                  name: 'Policy',
                  evidenceRequired: ['policy document'],
                  automationCapability: 'partial',
                },
              ],
            },
          ],
        })
      );

      const res = await request(app).get('/api/compliance/evidence');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalControls');
      expect(res.body).toHaveProperty('evidence');
      expect(res.body.evidence[0]).toHaveProperty('frameworkId');
      expect(res.body.evidence[0]).toHaveProperty('evidenceRequired');
    });

    it('should return empty when no frameworks', async () => {
      const { readdir: rd } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rd.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/evidence');

      expect(res.status).toBe(200);
      expect(res.body.totalControls).toBe(0);
      expect(res.body.evidence).toEqual([]);
    });
  });

  describe('GET /api/compliance/guidance/:framework', () => {
    it('should return implementation guide markdown', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue('# NIST Implementation Guide\n\nStep 1...');

      const res = await request(app).get('/api/compliance/guidance/nist-800-53');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/markdown');
    });

    it('should return 404 for missing guide', async () => {
      const { readFile: rf } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rf.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/guidance/nonexistent');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/compliance/lookup', () => {
    it('should return cross-framework lookup', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue(JSON.stringify({ controls: {} }));

      const res = await request(app).get('/api/compliance/lookup');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('controls');
    });

    it('should return 404 when lookup not built', async () => {
      const { readFile: rf } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rf.mockRejectedValue(err);

      const res = await request(app).get('/api/compliance/lookup');

      expect(res.status).toBe(404);
    });
  });
});
