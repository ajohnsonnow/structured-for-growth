/**
 * CSRF Middleware — Test Suite
 *
 * Tests: csrfToken generation, csrfProtection validation,
 *        double-submit cookie pattern, bypass for GET/HEAD/OPTIONS + Bearer
 */
import cookieParser from 'cookie-parser';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Must import after potential setup
let csrfToken, csrfProtection;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('../../server/middleware/csrf.js');
  csrfToken = mod.csrfToken;
  csrfProtection = mod.csrfProtection;
});

function createCsrfApp() {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());

  // Token endpoint
  app.get('/csrf-token', (req, res) => {
    csrfToken(req, res);
  });

  // Protected route
  app.post('/protected', csrfProtection, (req, res) => {
    res.json({ success: true, message: 'CSRF passed' });
  });

  // GET route (should bypass)
  app.get('/safe', csrfProtection, (req, res) => {
    res.json({ success: true });
  });

  app.use((err, req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  return app;
}

describe('CSRF Middleware', () => {
  describe('csrfToken', () => {
    it('generates a CSRF token and sets cookie', async () => {
      const app = createCsrfApp();
      const res = await request(app).get('/csrf-token');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('csrfToken');
      expect(typeof res.body.csrfToken).toBe('string');
      expect(res.body.csrfToken.length).toBeGreaterThan(0);

      // Should set a cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
    });
  });

  describe('csrfProtection', () => {
    it('allows GET requests without CSRF token', async () => {
      const app = createCsrfApp();
      const res = await request(app).get('/safe');
      expect(res.status).toBe(200);
    });

    it('allows requests with Bearer token (skips CSRF)', async () => {
      const app = createCsrfApp();
      const res = await request(app)
        .post('/protected')
        .set('Authorization', 'Bearer some-jwt-token')
        .send({ data: 'test' });
      expect(res.status).toBe(200);
    });

    it('rejects POST without CSRF token', async () => {
      const app = createCsrfApp();
      const res = await request(app).post('/protected').send({ data: 'test' });
      expect(res.status).toBe(403);
    });

    it('accepts valid double-submit cookie', async () => {
      const app = createCsrfApp();

      // Step 1: Get a CSRF token
      const tokenRes = await request(app).get('/csrf-token');
      const token = tokenRes.body.csrfToken;
      const cookies = tokenRes.headers['set-cookie'];

      // Step 2: Use the token in a POST
      const cookieStr = cookies?.map((c) => c.split(';')[0]).join('; ') || '';
      const res = await request(app)
        .post('/protected')
        .set('Cookie', cookieStr)
        .set('x-csrf-token', token)
        .send({ data: 'test' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
