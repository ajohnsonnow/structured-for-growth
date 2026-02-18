/**
 * AI Routes — Test Suite
 *
 * Tests: POST /orchestrate, POST /generate-document, POST /gap-analysis,
 *        GET /agents, GET /audit, GET /audit/stats,
 *        GET/POST /reviews, GET/PUT /cost, GET/POST /evaluation
 */
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminToken, createTestApp, userToken } from '../helpers.js';

vi.mock('../../server/models/database.js', () => ({
  execute: vi.fn(),
  query: vi.fn(() => []),
  queryOne: vi.fn(() => null),
}));

vi.mock('../../server/lib/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    security: vi.fn(),
  }),
}));

vi.mock('../../server/lib/ai/orchestrator.js', () => ({
  orchestrate: vi.fn(() => ({
    agent: {
      id: 'compliance',
      name: 'Compliance Agent',
      model: 'gpt-4o',
      maxTokens: 4096,
      temperature: 0.3,
    },
    intent: { agentId: 'compliance', confidence: 0.95 },
    sessionId: 'sess_test123',
    messages: [{ role: 'assistant', content: 'Test AI response' }],
    warnings: [],
  })),
  processResponse: vi.fn((res) => res),
  classifyIntent: vi.fn(() => ({ agentId: 'compliance', confidence: 0.9 })),
  listAgents: vi.fn(() => [
    { id: 'compliance', name: 'Compliance Agent', model: 'gpt-4o' },
    { id: 'document', name: 'Document Agent', model: 'gpt-4o' },
  ]),
  getAgent: vi.fn((id) => ({ id, name: `${id} Agent` })),
}));

vi.mock('../../server/lib/ai/guardrails.js', () => ({
  validateInput: vi.fn(() => ({ valid: true })),
  filterOutput: vi.fn((output) => output),
  evaluateContentSafety: vi.fn(() => ({ safe: true })),
  aiInputGuard: vi.fn((req, res, next) => {
    // Simulate what the real guard does: validate and set req.aiInput
    const prompt = req.body?.prompt;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, errors: [{ msg: 'Prompt is required' }] });
    }
    req.aiInput = { prompt: prompt.trim(), context: req.body?.context || null };
    next();
  }),
}));

vi.mock('../../server/lib/ai/auditTrail.js', () => ({
  logAiInteraction: vi.fn(),
  queryRecentAudit: vi.fn(() => []),
  getAuditStats: vi.fn(() => ({
    totalInteractions: 10,
    averageLatency: 500,
    topAgents: [],
  })),
}));

vi.mock('../../server/lib/ai/humanReview.js', () => ({
  initHumanReviewTables: vi.fn(),
  submitForReview: vi.fn(() => ({ id: 'rev_1' })),
  approveReview: vi.fn(() => ({ status: 'approved' })),
  rejectReview: vi.fn(() => ({ status: 'rejected' })),
  getReviewQueue: vi.fn(() => ({ items: [], total: 0 })),
  getReviewItem: vi.fn(() => null),
  getReviewStats: vi.fn(() => ({ pending: 0, approved: 0, rejected: 0 })),
}));

vi.mock('../../server/lib/ai/costTracker.js', () => ({
  calculateCost: vi.fn(() => 0.01),
  recordUsage: vi.fn(),
  checkBudget: vi.fn(() => ({ allowed: true, remaining: 4.99 })),
  setBudgetLimit: vi.fn(),
  getUsageReport: vi.fn(() => ({ total: 1.0, entries: [] })),
  getAllUsersUsageSummary: vi.fn(() => []),
  MODEL_PRICING: {},
}));

vi.mock('../../server/lib/ai/evaluation.js', () => ({
  evaluateTestCase: vi.fn(() => ({ passed: true, score: 1.0 })),
  runEvaluationSuite: vi.fn(() => ({ overall: 85, categories: {} })),
  getTestSuite: vi.fn(() => []),
  addTestCase: vi.fn(),
}));

let app;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: router } = await import('../../server/routes/ai.js');
  app = createTestApp('/api/ai', router);
});

describe('AI Routes', () => {
  describe('POST /api/ai/orchestrate', () => {
    it('requires authentication', async () => {
      const res = await request(app).post('/api/ai/orchestrate').send({ prompt: 'Test prompt' });
      expect(res.status).toBe(401);
    });

    it('accepts valid orchestration request', async () => {
      const res = await request(app)
        .post('/api/ai/orchestrate')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ prompt: 'Analyze compliance for NIST 800-171' });
      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
    });

    it('rejects empty prompt', async () => {
      const res = await request(app)
        .post('/api/ai/orchestrate')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ prompt: '' });
      expect([400, 422]).toContain(res.status);
    });
  });

  describe('GET /api/ai/agents', () => {
    it('requires authentication', async () => {
      const res = await request(app).get('/api/ai/agents');
      expect(res.status).toBe(401);
    });

    it('returns list of agents', async () => {
      const res = await request(app)
        .get('/api/ai/agents')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/ai/audit', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .get('/api/ai/audit')
        .set('Authorization', `Bearer ${userToken()}`);
      expect(res.status).toBe(403);
    });

    it('returns audit trail for admin', async () => {
      const res = await request(app)
        .get('/api/ai/audit')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/ai/audit/stats', () => {
    it('requires admin role', async () => {
      const res = await request(app)
        .get('/api/ai/audit/stats')
        .set('Authorization', `Bearer ${userToken()}`);
      expect(res.status).toBe(403);
    });

    it('returns audit statistics', async () => {
      const res = await request(app)
        .get('/api/ai/audit/stats')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Human Review endpoints', () => {
    it('GET /reviews requires auth', async () => {
      const res = await request(app).get('/api/ai/reviews');
      expect(res.status).toBe(401);
    });

    it('GET /reviews returns queue', async () => {
      const res = await request(app)
        .get('/api/ai/reviews')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });

    it('GET /reviews/stats returns stats', async () => {
      const res = await request(app)
        .get('/api/ai/reviews/stats')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Cost endpoints', () => {
    it('GET /cost/summary requires admin', async () => {
      const res = await request(app)
        .get('/api/ai/cost/summary')
        .set('Authorization', `Bearer ${userToken()}`);
      expect(res.status).toBe(403);
    });

    it('GET /cost/summary returns usage summary', async () => {
      const res = await request(app)
        .get('/api/ai/cost/summary')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });

  describe('Evaluation endpoints', () => {
    it('GET /evaluation/suite requires admin', async () => {
      const res = await request(app)
        .get('/api/ai/evaluation/suite')
        .set('Authorization', `Bearer ${userToken()}`);
      expect(res.status).toBe(403);
    });

    it('GET /evaluation/suite returns test suite', async () => {
      const res = await request(app)
        .get('/api/ai/evaluation/suite')
        .set('Authorization', `Bearer ${adminToken()}`);
      expect(res.status).toBe(200);
    });
  });
});
