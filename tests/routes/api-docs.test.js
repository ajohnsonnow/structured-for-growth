/**
 * API Docs Routes — Test Suite
 *
 * Tests: GET /api/docs (OpenAPI spec)
 */
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestApp } from '../helpers.js';

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
  const { default: router } = await import('../../server/routes/api-docs.js');
  app = createTestApp('/api/docs', router);
});

describe('API Docs Routes', () => {
  describe('GET /api/docs/openapi.json', () => {
    it('returns OpenAPI specification', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('openapi');
      expect(res.body.openapi).toMatch(/^3\.\d+\.\d+$/);
    });

    it('includes info section', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.body.info).toBeDefined();
      expect(res.body.info).toHaveProperty('title');
      expect(res.body.info).toHaveProperty('version');
    });

    it('includes paths section', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.body.paths).toBeDefined();
      expect(typeof res.body.paths).toBe('object');
    });

    it('includes component schemas', async () => {
      const res = await request(app).get('/api/docs/openapi.json');
      expect(res.body.components).toBeDefined();
      expect(res.body.components.schemas).toBeDefined();
    });
  });

  describe('GET /api/docs', () => {
    it('returns HTML documentation page', async () => {
      const res = await request(app).get('/api/docs/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });
  });
});
