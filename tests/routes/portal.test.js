import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database module before importing routes
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

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { execute, logActivity, query, queryOne } from '../../server/models/database.js';
import portalRouter from '../../server/routes/portal.js';
import { createTestApp } from '../helpers.js';

const app = createTestApp('/api/portal', portalRouter);

const _JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

function portalToken(clientId = 1, userId = 2) {
  return jwt.sign(
    { userId, clientId, type: 'client_portal' },
    // Portal route uses its own JWT_SECRET — match it
    process.env.JWT_SECRET || 'structured-for-growth-portal-secret-2024',
    { expiresIn: '1h' }
  );
}

function portalAuthHeader(clientId = 1, userId = 2) {
  return { Authorization: `Bearer ${portalToken(clientId, userId)}` };
}

describe('Portal Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mock implementations to defaults
    query.mockReset();
    queryOne.mockReset();
    execute.mockReset();
    logActivity.mockReset();
    query.mockReturnValue([]);
    queryOne.mockReturnValue(null);
    execute.mockReturnValue({ changes: 1, lastInsertRowid: 1 });
  });

  describe('POST /api/portal/login', () => {
    it('should reject login with missing fields', async () => {
      const res = await request(app).post('/api/portal/login').send({});

      expect(res.status).toBe(400);
      // express-validator returns errors array
      const errorMsg = res.body.message || JSON.stringify(res.body.errors);
      expect(errorMsg).toMatch(/required|invalid/i);
    });

    it('should reject login with invalid credentials', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app)
        .post('/api/portal/login')
        .send({ username: 'baduser', password: 'badpass' });

      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should login successfully with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('correctpass', 10);

      // First call: find user
      queryOne
        .mockReturnValueOnce({
          id: 2,
          username: 'clientuser',
          email: 'client@test.com',
          password: hashedPassword,
          role: 'user',
          is_active: 1,
          client_id: 1,
        })
        // Second call: find client by email
        .mockReturnValueOnce(null)
        // Third call: find client by client_id
        .mockReturnValueOnce({
          id: 1,
          name: 'Test Client',
          email: 'client@test.com',
          company: 'Test Co',
          phone: '555-1234',
          status: 'active',
          monthly_retainer: 2000,
        });

      const res = await request(app)
        .post('/api/portal/login')
        .send({ username: 'clientuser', password: 'correctpass' });

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/successful/i);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('client');
      expect(res.body.client.name).toBe('Test Client');
    });

    it('should reject when no client account found', async () => {
      const hashedPassword = await bcrypt.hash('pass123', 10);

      queryOne
        .mockReturnValueOnce({
          id: 2,
          username: 'noClient',
          email: 'noclient@test.com',
          password: hashedPassword,
          role: 'user',
          is_active: 1,
          client_id: null,
        })
        .mockReturnValueOnce(null) // no client by email
        .mockReturnValueOnce(null) // no client by client_id (null)
        .mockReturnValueOnce(null); // no fallback client

      const res = await request(app)
        .post('/api/portal/login')
        .send({ username: 'noClient', password: 'pass123' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/no client/i);
    });
  });

  describe('GET /api/portal/me', () => {
    it('should reject requests without token', async () => {
      const res = await request(app).get('/api/portal/me');

      expect(res.status).toBe(401);
    });

    it('should reject non-portal tokens', async () => {
      // Create a regular admin token (not type: client_portal)
      const token = jwt.sign(
        { userId: 1, role: 'admin' },
        process.env.JWT_SECRET || 'structured-for-growth-portal-secret-2024',
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .get('/api/portal/me')
        .set({ Authorization: `Bearer ${token}` });

      expect(res.status).toBe(403);
    });

    it('should return client profile', async () => {
      const clientData = {
        id: 1,
        name: 'Test Client',
        email: 'client@test.com',
        company: 'Test Co',
        phone: '555-1234',
        website: 'https://test.com',
        address: '123 Test St',
        status: 'active',
        monthly_retainer: 2000,
        contract_start: '2025-01-01',
        contract_end: '2026-01-01',
      };
      queryOne.mockReturnValue(clientData);

      const res = await request(app).get('/api/portal/me').set(portalAuthHeader());

      expect(res.status).toBe(200);
      expect(res.body.client.name).toBe('Test Client');
      expect(res.body.client.email).toBe('client@test.com');
    });

    it('should return 404 when client not found', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).get('/api/portal/me').set(portalAuthHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/portal/projects', () => {
    it('should return client projects with progress', async () => {
      query.mockReturnValue([
        {
          id: 1,
          title: 'Website Redesign',
          status: 'in-progress',
          hours_estimated: 100,
          hours_actual: 50,
        },
        {
          id: 2,
          title: 'Completed Project',
          status: 'completed',
          hours_estimated: 40,
          hours_actual: 38,
        },
      ]);

      const res = await request(app).get('/api/portal/projects').set(portalAuthHeader());

      expect(res.status).toBe(200);
      expect(res.body.projects).toHaveLength(2);
      expect(res.body.projects[0].progress).toBe(50); // 50/100 * 100
      expect(res.body.projects[1].progress).toBe(100); // completed = 100
    });

    it('should return empty projects list', async () => {
      query.mockReturnValue([]);

      const res = await request(app).get('/api/portal/projects').set(portalAuthHeader());

      expect(res.status).toBe(200);
      expect(res.body.projects).toEqual([]);
    });
  });

  describe('GET /api/portal/billing', () => {
    it('should return billing info for active client', async () => {
      queryOne.mockReturnValue({
        id: 1,
        monthly_retainer: 2500,
        status: 'active',
      });
      query
        .mockReturnValueOnce([{ budget: 5000 }, { budget: 3000 }]) // pending projects
        .mockReturnValueOnce([{ id: 1, title: 'New Project', description: 'Test', budget: 5000 }]); // planning projects

      const res = await request(app).get('/api/portal/billing').set(portalAuthHeader());

      expect(res.status).toBe(200);
      expect(res.body.amount_due).toBe(2500);
      expect(res.body.monthly_retainer).toBe(2500);
      expect(res.body.project_total).toBe(8000);
      expect(res.body.estimates).toHaveLength(1);
    });

    it('should return 404 when client not found', async () => {
      queryOne.mockReturnValue(null);

      const res = await request(app).get('/api/portal/billing').set(portalAuthHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/portal/messages', () => {
    it('should return client messages', async () => {
      query.mockReturnValue([
        { id: 1, subject: 'Hello', content: 'Test message', direction: 'inbound' },
      ]);

      const res = await request(app).get('/api/portal/messages').set(portalAuthHeader());

      expect(res.status).toBe(200);
      expect(res.body.messages).toHaveLength(1);
      // Should also mark outbound messages as read
      expect(execute).toHaveBeenCalled();
    });
  });

  describe('POST /api/portal/messages', () => {
    it('should send a message', async () => {
      execute.mockReturnValue({ changes: 1, lastInsertRowid: 5 });

      const res = await request(app)
        .post('/api/portal/messages')
        .set(portalAuthHeader())
        .send({ subject: 'Test', content: 'Hello from client' });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/sent/i);
      expect(res.body).toHaveProperty('messageId');
    });

    it('should reject empty message', async () => {
      const res = await request(app)
        .post('/api/portal/messages')
        .set(portalAuthHeader())
        .send({ subject: 'No Content' });

      expect(res.status).toBe(400);
      // express-validator returns errors array
      const errorMsg = res.body.message || JSON.stringify(res.body.errors);
      expect(errorMsg).toMatch(/content|required/i);
    });
  });
});
