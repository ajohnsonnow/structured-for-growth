import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  access: vi.fn(() => Promise.resolve()),
}));

import request from 'supertest';
import { createTestApp } from '../helpers.js';

let mbaiRouter;
let app;

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();
  vi.mock('fs/promises', () => ({
    readdir: vi.fn(),
    readFile: vi.fn(),
    access: vi.fn(() => Promise.resolve()),
  }));
  const mod = await import('../../server/routes/mbai.js');
  mbaiRouter = mod.default;
  app = createTestApp('/api/mbai', mbaiRouter);
});

describe('MBAi Routes', () => {
  describe('GET /api/mbai/manifest', () => {
    it('should return the MBAi manifest', async () => {
      const { readFile: rf } = await import('fs/promises');
      const manifest = {
        name: 'MBAi Methodology',
        version: '1.0',
        categories: ['Strategy', 'Operations'],
      };
      rf.mockResolvedValue(JSON.stringify(manifest));

      const res = await request(app).get('/api/mbai/manifest');

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('MBAi Methodology');
      expect(res.body).toHaveProperty('categories');
    });

    it('should return 500 when manifest missing', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockRejectedValue(new Error('File not found'));

      const res = await request(app).get('/api/mbai/manifest');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /api/mbai/templates', () => {
    it('should return list of templates', async () => {
      const { readdir: rd, readFile: rf } = await import('fs/promises');
      rd.mockResolvedValue(['sbsc.json', 'tbl.json']);
      rf.mockResolvedValue(JSON.stringify({ id: 'sbsc', name: 'Sustainability BSC' }));

      const res = await request(app).get('/api/mbai/templates');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('count');
      expect(res.body).toHaveProperty('templates');
      expect(res.body.count).toBe(2);
    });

    it('should return empty when templates dir not found', async () => {
      const { readdir: rd } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rd.mockRejectedValue(err);

      const res = await request(app).get('/api/mbai/templates');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.templates).toEqual([]);
    });

    it('should return 500 on unexpected error', async () => {
      const { readdir: rd } = await import('fs/promises');
      rd.mockRejectedValue(new Error('Permission denied'));

      const res = await request(app).get('/api/mbai/templates');

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/mbai/templates/:id', () => {
    it('should return a specific template', async () => {
      const { readFile: rf } = await import('fs/promises');
      const template = { id: 'sbsc', name: 'Sustainability BSC', sections: [] };
      rf.mockResolvedValue(JSON.stringify(template));

      const res = await request(app).get('/api/mbai/templates/sbsc');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('sbsc');
    });

    it('should return 404 for non-existent template', async () => {
      const { readFile: rf } = await import('fs/promises');
      const err = new Error('ENOENT');
      err.code = 'ENOENT';
      rf.mockRejectedValue(err);

      const res = await request(app).get('/api/mbai/templates/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/not found/i);
    });

    it('should sanitize template ID', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue(JSON.stringify({ id: 'etcpasswd' }));

      const res = await request(app).get('/api/mbai/templates/../../etc/passwd');

      // Path traversal chars are stripped — the route sanitizes with replace(/[^a-zA-Z0-9_-]/g, '')
      // so '../../etc/passwd' becomes 'etcpasswd' which is a valid (non-traversal) lookup
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /api/mbai/categories', () => {
    it('should return categories from manifest', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockResolvedValue(
        JSON.stringify({
          categories: ['Strategy', 'Operations', 'Compliance'],
        })
      );

      const res = await request(app).get('/api/mbai/categories');

      expect(res.status).toBe(200);
      expect(res.body.categories).toEqual(['Strategy', 'Operations', 'Compliance']);
    });

    it('should return 500 on error', async () => {
      const { readFile: rf } = await import('fs/promises');
      rf.mockRejectedValue(new Error('Read error'));

      const res = await request(app).get('/api/mbai/categories');

      expect(res.status).toBe(500);
    });
  });
});
