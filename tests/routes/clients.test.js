/**
 * Unit Tests: Client Routes
 * Tests CRUD operations, search, filtering, and statistics
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
import { createTestApp, adminToken } from '../helpers.js';
import clientRouter from '../../server/routes/clients.js';
import { query, queryOne, execute } from '../../server/models/database.js';

const app = createTestApp('/api/clients', clientRouter);

describe('Client Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = adminToken();

  describe('GET /api/clients', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/clients');
      expect(res.status).toBe(401);
    });

    it('should return clients list', async () => {
      query.mockReturnValueOnce([
        { id: 1, name: 'Acme Corp', email: 'acme@test.com', status: 'active' },
      ]);
      queryOne.mockReturnValueOnce({ total: 1 });

      const res = await request(app).get('/api/clients').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.clients).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('should support search parameter', async () => {
      query.mockReturnValueOnce([]);
      queryOne.mockReturnValueOnce({ total: 0 });

      const res = await request(app)
        .get('/api/clients?search=acme')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.clients).toHaveLength(0);
    });

    it('should support status filter', async () => {
      query.mockReturnValueOnce([]);
      queryOne.mockReturnValueOnce({ total: 0 });

      const res = await request(app)
        .get('/api/clients?status=active')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/clients/stats/overview', () => {
    it('should return statistics', async () => {
      queryOne
        .mockReturnValueOnce({ count: 10 }) // totalClients
        .mockReturnValueOnce({ count: 8 }) // activeClients
        .mockReturnValueOnce({ count: 5 }) // totalProjects
        .mockReturnValueOnce({ count: 3 }) // activeProjects
        .mockReturnValueOnce({ total: 5000 }) // monthlyRevenue
        .mockReturnValueOnce({ count: 4 }) // retainerClients
        .mockReturnValueOnce({ total: 10000 }) // projectRevenue
        .mockReturnValueOnce({ count: 2 }) // oneOffProjects
        .mockReturnValueOnce({ total: 20000 }) // completedRevenue
        .mockReturnValueOnce({ count: 1 }); // newThisMonth

      const res = await request(app)
        .get('/api/clients/stats/overview')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/clients/:id', () => {
    it('should return a specific client', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        name: 'Acme Corp',
        email: 'acme@test.com',
        status: 'active',
      });
      query.mockReturnValueOnce([]); // projects

      const res = await request(app).get('/api/clients/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.client.name).toBe('Acme Corp');
    });

    it('should return 404 for non-existent client', async () => {
      queryOne.mockReturnValueOnce(null);

      const res = await request(app)
        .get('/api/clients/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/clients', () => {
    it('should create a new client', async () => {
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 10 });

      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Client',
          email: 'new@client.com',
          company: 'NewCo',
          status: 'active',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject client with missing name', async () => {
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'no-name@test.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/clients/:id', () => {
    it('should update an existing client', async () => {
      queryOne.mockReturnValueOnce({ id: 1 }); // existing
      execute.mockReturnValueOnce({ changes: 1 });
      queryOne.mockReturnValueOnce({
        id: 1,
        name: 'Updated Client',
        email: 'updated@test.com',
      });

      const res = await request(app)
        .put('/api/clients/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Client' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    it('should delete a client', async () => {
      queryOne.mockReturnValueOnce({ id: 1, name: 'ToDelete' });
      execute.mockReturnValueOnce({ changes: 1 });

      const res = await request(app)
        .delete('/api/clients/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent client', async () => {
      queryOne.mockReturnValueOnce(null);

      const res = await request(app)
        .delete('/api/clients/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});
