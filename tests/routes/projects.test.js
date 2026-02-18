/**
 * Unit Tests: Project Routes
 * Tests CRUD, task management, and time entries
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
import projectRouter from '../../server/routes/projects.js';
import { query, queryOne, execute } from '../../server/models/database.js';

const app = createTestApp('/api/projects', projectRouter);

describe('Project Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const token = adminToken();

  describe('GET /api/projects', () => {
    it('should require authentication', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });

    it('should return projects list', async () => {
      query.mockReturnValueOnce([{ id: 1, title: 'Project Alpha', status: 'in-progress' }]);
      queryOne.mockReturnValueOnce({ total: 1 });

      const res = await request(app).get('/api/projects').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 5 });

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Project',
          client_id: 1,
          description: 'Test project',
          status: 'planning',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject project without title', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ client_id: 1 });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return project with tasks and time entries', async () => {
      queryOne.mockReturnValueOnce({
        id: 1,
        title: 'Project Alpha',
        client_id: 1,
      });
      query
        .mockReturnValueOnce([{ id: 1, title: 'Task 1' }]) // tasks
        .mockReturnValueOnce([{ id: 1, hours: 4 }]); // time entries

      const res = await request(app).get('/api/projects/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.project.title).toBe('Project Alpha');
    });

    it('should return 404 for missing project', async () => {
      queryOne.mockReturnValueOnce(null);

      const res = await request(app)
        .get('/api/projects/999')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update a project', async () => {
      queryOne
        .mockReturnValueOnce({ id: 1, title: 'Old Title' }) // existing
        .mockReturnValueOnce({ id: 1, title: 'New Title' }); // after update
      execute.mockReturnValueOnce({ changes: 1 });

      const res = await request(app)
        .put('/api/projects/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Title' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      queryOne.mockReturnValueOnce({ id: 1, title: 'ToDelete' });
      execute.mockReturnValueOnce({ changes: 1 });

      const res = await request(app)
        .delete('/api/projects/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Task Management', () => {
    it('POST /api/projects/:id/tasks should create a task', async () => {
      queryOne.mockReturnValueOnce({ id: 1 }); // project exists
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 1 });
      queryOne.mockReturnValueOnce({ id: 1, title: 'New Task' }); // created task

      const res = await request(app)
        .post('/api/projects/1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Task', priority: 'high' });
      expect(res.status).toBe(201);
    });

    it('GET /api/projects/:id should include tasks', async () => {
      queryOne.mockReturnValueOnce({ id: 1, title: 'Project Alpha' }); // project
      query
        .mockReturnValueOnce([
          { id: 1, title: 'Task 1' },
          { id: 2, title: 'Task 2' },
        ]) // tasks
        .mockReturnValueOnce([]); // time entries

      const res = await request(app).get('/api/projects/1').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.project).toBeDefined();
    });
  });

  describe('Time Entries', () => {
    it('POST /api/projects/:projectId/time should create a time entry', async () => {
      queryOne.mockReturnValueOnce({ id: 1 }); // project exists
      execute.mockReturnValueOnce({ changes: 1, lastInsertRowid: 1 });
      queryOne.mockReturnValueOnce({ id: 1, hours: 4 }); // return created entry

      const res = await request(app)
        .post('/api/projects/1/time')
        .set('Authorization', `Bearer ${token}`)
        .send({ hours: 4, description: 'Development work', entry_date: '2026-02-15' });
      expect(res.status).toBe(201);
    });
  });
});
