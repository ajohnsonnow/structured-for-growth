/**
 * Unit Tests: Messages, Campaigns, Compliance, Backup, Demo, Portal, MBAi routes
 * Grouped for efficiency - tests critical paths for each route module
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
import { execute, query, queryOne } from '../../server/models/database.js';
import { adminToken, createTestApp } from '../helpers.js';

// Import routers
import campaignRouter from '../../server/routes/campaigns.js';
import messageRouter from '../../server/routes/messages.js';

const messageApp = createTestApp('/api/messages', messageRouter);
const campaignApp = createTestApp('/api/campaigns', campaignRouter);

describe('Message Routes', () => {
  beforeEach(() => vi.clearAllMocks());
  const token = adminToken();

  describe('GET /api/messages', () => {
    it('should require authentication', async () => {
      const res = await request(messageApp).get('/api/messages');
      expect(res.status).toBe(401);
    });

    it('should return conversation list', async () => {
      query.mockReturnValueOnce([
        { client_id: 1, client_name: 'Acme', last_message: 'Hello', unread: 2 },
      ]);

      const res = await request(messageApp)
        .get('/api/messages')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/messages/unread/count', () => {
    it('should return unread count', async () => {
      queryOne.mockReturnValueOnce({ count: 5 });

      const res = await request(messageApp)
        .get('/api/messages/unread/count')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/messages/client/:clientId', () => {
    it('should send a message', async () => {
      queryOne.mockReturnValueOnce({ id: 1, name: 'Acme' }); // client exists
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 10 });
      queryOne.mockReturnValueOnce({ id: 10, content: 'Hello there' }); // created message

      const res = await request(messageApp)
        .post('/api/messages/client/1')
        .set('Authorization', `Bearer ${token}`)
        .send({
          subject: 'Test',
          content: 'Hello there',
        });
      expect(res.status).toBe(201);
    });

    it('should reject message without content', async () => {
      const res = await request(messageApp)
        .post('/api/messages/client/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ subject: 'No content' });
      expect(res.status).toBe(400);
    });
  });
});

describe('Campaign Routes', () => {
  beforeEach(() => vi.clearAllMocks());
  const token = adminToken();

  describe('GET /api/campaigns', () => {
    it('should require authentication', async () => {
      const res = await request(campaignApp).get('/api/campaigns');
      expect(res.status).toBe(401);
    });

    it('should return campaigns list', async () => {
      query.mockReturnValueOnce([{ id: 1, name: 'Launch Campaign', status: 'draft' }]);

      const res = await request(campaignApp)
        .get('/api/campaigns')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/campaigns', () => {
    it('should create a campaign', async () => {
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 5 });

      const res = await request(campaignApp)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Campaign',
          subject: 'Campaign Subject',
          content: '<h1>Campaign Content</h1>',
        });
      expect(res.status).toBe(201);
    });
  });

  describe('Segments', () => {
    it('GET /api/campaigns/segments/list should return segments', async () => {
      query.mockReturnValueOnce([{ id: 1, name: 'Active Clients', client_count: 10 }]);

      const res = await request(campaignApp)
        .get('/api/campaigns/segments/list')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });

    it('POST /api/campaigns/segments should create a segment', async () => {
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 4 });

      const res = await request(campaignApp)
        .post('/api/campaigns/segments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'New Segment',
          description: 'Test segment',
          filter_rules: { status: 'active' },
        });
      expect(res.status).toBe(201);
    });
  });

  describe('Email Templates', () => {
    it('GET /api/campaigns/templates/list should return templates', async () => {
      query.mockReturnValueOnce([{ id: 1, name: 'Welcome Email', category: 'onboarding' }]);

      const res = await request(campaignApp)
        .get('/api/campaigns/templates/list')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
    });
  });
});
