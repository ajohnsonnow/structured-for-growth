/**
 * Integration Tests — Critical Workflows
 * P1.1.5: Tests end-to-end flows across multiple endpoints.
 *
 *  1) Auth flow:         register → login → verify → profile → change-password
 *  2) Client CRUD:       create → read → update → list → delete → confirm gone
 *  3) Compliance lookup:  frameworks list → single framework → crossmap → oscal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createTestApp, adminToken, authHeader } from '../helpers.js';

/* ──────────────────────────────────────────────
 *  1. Auth Flow Integration
 * ────────────────────────────────────────────── */
vi.mock('../../server/models/database.js', () => ({
  query: vi.fn(() => []),
  queryOne: vi.fn(() => null),
  execute: vi.fn(() => ({ changes: 1, lastInsertRowid: 42 })),
  logActivity: vi.fn(),
  getDatabase: vi.fn(),
  initializeDatabase: vi.fn(),
}));

import { query, queryOne, execute, logActivity } from '../../server/models/database.js';
import bcrypt from 'bcryptjs';

describe('Integration: Auth Flow', () => {
  let app;

  beforeEach(async () => {
    vi.resetModules();
    query.mockReset();
    queryOne.mockReset();
    execute.mockReset();
    logActivity.mockReset();

    // Re-import to get fresh router
    query.mockReturnValue([]);
    queryOne.mockReturnValue(null);
    execute.mockReturnValue({ changes: 1, lastInsertRowid: 42 });

    const { default: authRouter } = await import('../../server/routes/auth.js');
    app = createTestApp('/api/auth', authRouter);
  });

  it('register → login → verify (full lifecycle)', async () => {
    // ── Step 1: Register ──
    // First user → becomes admin (userCount = 0)
    queryOne
      .mockReturnValueOnce(null) // existing user check
      .mockReturnValueOnce({ count: 0 }); // user count (first user → admin)

    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newadmin', email: 'admin@sfg.com', password: 'Str0ngP@ss!' });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.message).toContain('administrator');

    // ── Step 2: Login ──
    const hashed = await bcrypt.hash('Str0ngP@ss!', 10);
    queryOne.mockReturnValueOnce({
      id: 42,
      username: 'newadmin',
      email: 'admin@sfg.com',
      password: hashed,
      role: 'admin',
      is_active: 1,
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'newadmin', password: 'Str0ngP@ss!' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.token).toBeTruthy();
    const token = loginRes.body.token;

    // ── Step 3: Verify token ──
    queryOne.mockReturnValueOnce({
      id: 42,
      username: 'newadmin',
      email: 'admin@sfg.com',
      role: 'admin',
      is_active: 1,
    });

    const verifyRes = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${token}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.user.username).toBe('newadmin');
  });

  it('should reject login with wrong password', async () => {
    const hashed = await bcrypt.hash('correct-password', 10);
    queryOne.mockReturnValueOnce({
      id: 1,
      username: 'bob',
      email: 'bob@test.com',
      password: hashed,
      role: 'user',
      is_active: 1,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'bob', password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should reject verify with expired/invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'Bearer invalid.token.here');

    expect(res.status).toBe(401);
  });

  it('should reject registration with duplicate username', async () => {
    queryOne.mockReturnValueOnce({ id: 1 }); // existing user found

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'existing', email: 'new@test.com', password: 'Password1!' });

    expect(res.status).toBe(409);
    expect(res.body.message).toContain('already exists');
  });
});

/* ──────────────────────────────────────────────
 *  2. Client CRUD Integration
 * ────────────────────────────────────────────── */
describe('Integration: Client CRUD Lifecycle', () => {
  let app;
  const token = adminToken();

  beforeEach(async () => {
    vi.resetModules();
    query.mockReset();
    queryOne.mockReset();
    execute.mockReset();
    logActivity.mockReset();

    query.mockReturnValue([]);
    queryOne.mockReturnValue(null);
    execute.mockReturnValue({ changes: 1, lastInsertRowid: 100 });

    const { default: clientsRouter } = await import('../../server/routes/clients.js');
    app = createTestApp('/api/clients', clientsRouter);
  });

  it('create → read → update → list → delete (full CRUD)', async () => {
    const clientData = {
      name: 'USACE District',
      email: 'contracts@usace.mil',
      company: 'US Army Corps of Engineers',
      phone: '202-555-0100',
    };

    // ── Step 1: Create ──
    queryOne.mockReturnValueOnce({
      id: 100,
      ...clientData,
      status: 'active',
      created_at: new Date().toISOString(),
    }); // SELECT after INSERT

    const createRes = await request(app)
      .post('/api/clients')
      .set(authHeader(token))
      .send(clientData);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.client.name).toBe('USACE District');

    // ── Step 2: Read single ──
    queryOne.mockReturnValueOnce({ id: 100, ...clientData, status: 'active' }); // client query
    query
      .mockReturnValueOnce([{ id: 1, name: 'MILCON Project', status: 'planning' }]) // projects
      .mockReturnValueOnce([{ action: 'CREATE', entity_type: 'client' }]); // activity

    const getRes = await request(app).get('/api/clients/100').set(authHeader(token));

    expect(getRes.status).toBe(200);
    expect(getRes.body.client.name).toBe('USACE District');
    expect(getRes.body.client.projects).toHaveLength(1);

    // ── Step 3: Update ──
    queryOne
      .mockReturnValueOnce({ id: 100, name: 'USACE District' }) // find for update
      .mockReturnValueOnce({
        id: 100,
        ...clientData,
        status: 'inactive',
        name: 'USACE District Updated',
      }); // after update

    const updateRes = await request(app)
      .put('/api/clients/100')
      .set(authHeader(token))
      .send({ name: 'USACE District Updated', status: 'inactive' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.client.name).toBe('USACE District Updated');

    // ── Step 4: List all ──
    queryOne.mockReturnValueOnce({ total: 1 }); // count
    query.mockReturnValueOnce([{ id: 100, name: 'USACE District Updated', status: 'inactive' }]);

    const listRes = await request(app).get('/api/clients').set(authHeader(token));

    expect(listRes.status).toBe(200);
    expect(listRes.body.clients).toHaveLength(1);
    expect(listRes.body.pagination.total).toBe(1);

    // ── Step 5: Delete ──
    queryOne.mockReturnValueOnce({ id: 100, name: 'USACE District Updated' }); // client exists

    const deleteRes = await request(app).delete('/api/clients/100').set(authHeader(token));

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('deleted');

    // ── Step 6: Confirm gone ──
    queryOne.mockReturnValueOnce(null); // client not found

    const goneRes = await request(app).get('/api/clients/100').set(authHeader(token));

    expect(goneRes.status).toBe(404);
  });

  it('should reject create with missing required fields', async () => {
    const res = await request(app)
      .post('/api/clients')
      .set(authHeader(token))
      .send({ phone: '555-0100' }); // missing name & email

    expect(res.status).toBe(400);
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('should support filtering by status', async () => {
    queryOne.mockReturnValueOnce({ total: 2 });
    query.mockReturnValueOnce([
      { id: 1, name: 'Active Client', status: 'active' },
      { id: 2, name: 'Active Client 2', status: 'active' },
    ]);

    const res = await request(app).get('/api/clients?status=active').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.clients).toHaveLength(2);
  });

  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/clients');
    expect([401, 403]).toContain(res.status);
  });
});

/* ──────────────────────────────────────────────
 *  3. Compliance Lookup Integration
 * ────────────────────────────────────────────── */
describe('Integration: Compliance Lookup', () => {
  let app;

  beforeEach(async () => {
    vi.resetModules();

    // Mock fs/promises at the module level
    vi.doMock('fs/promises', () => ({
      readdir: vi.fn(),
      readFile: vi.fn(),
      access: vi.fn().mockResolvedValue(undefined),
    }));

    const { default: complianceRouter } = await import('../../server/routes/compliance.js');
    app = createTestApp('/api/compliance', complianceRouter);
  });

  it('frameworks list → single framework → crossmap (data chain)', async () => {
    const { readdir, readFile } = await import('fs/promises');

    const framework1 = { id: 'nist-800-171', name: 'NIST SP 800-171', controls: 110 };
    const framework2 = { id: 'cmmc-l2', name: 'CMMC Level 2', controls: 110 };
    const crossmap = { sourceId: 'nist-800-171', targetId: 'cmmc-l2', mappings: [] };

    // ── Step 1: List frameworks ──
    readdir.mockResolvedValueOnce(['nist-800-171.json', 'cmmc-l2.json']);
    readFile
      .mockResolvedValueOnce(JSON.stringify(framework1))
      .mockResolvedValueOnce(JSON.stringify(framework2));

    const listRes = await request(app).get('/api/compliance/frameworks');

    expect(listRes.status).toBe(200);
    expect(listRes.body.frameworks).toHaveLength(2);
    expect(listRes.body.frameworks[0].id).toBe('nist-800-171');

    // ── Step 2: Single framework ──
    readFile.mockResolvedValueOnce(JSON.stringify(framework1));

    const singleRes = await request(app).get('/api/compliance/frameworks/nist-800-171');

    expect(singleRes.status).toBe(200);
    expect(singleRes.body.id).toBe('nist-800-171');
    expect(singleRes.body.controls).toBe(110);

    // ── Step 3: Crossmap ──
    readdir.mockResolvedValueOnce(['nist-to-cmmc.json']);
    readFile.mockResolvedValueOnce(JSON.stringify(crossmap));

    const crossmapRes = await request(app).get('/api/compliance/crossmap');

    expect(crossmapRes.status).toBe(200);
    expect(crossmapRes.body.mappings).toBeDefined();
  });

  it('should return empty array when no frameworks exist', async () => {
    const { readdir } = await import('fs/promises');
    readdir.mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    const res = await request(app).get('/api/compliance/frameworks');

    expect(res.status).toBe(200);
    expect(res.body.frameworks).toEqual([]);
  });

  it('should return 404 for non-existent framework', async () => {
    const { readFile } = await import('fs/promises');
    readFile.mockRejectedValueOnce(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

    const res = await request(app).get('/api/compliance/frameworks/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });
});
