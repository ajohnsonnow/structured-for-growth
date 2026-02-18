/**
 * AI API Routes (P4.1)
 *
 * Endpoints for the agentic AI system — orchestration, document generation,
 * compliance gap analysis, human review, cost tracking, and evaluation.
 *
 * Endpoints:
 *   POST   /api/ai/orchestrate             — Route prompt to specialist agent
 *   POST   /api/ai/generate-document       — AI-assisted document generation (4.1.3)
 *   POST   /api/ai/gap-analysis            — AI-powered compliance gap analysis (4.1.4)
 *   GET    /api/ai/agents                  — List registered agents
 *   GET    /api/ai/audit                   — Query AI audit trail (4.1.5)
 *   GET    /api/ai/audit/stats             — Audit trail statistics
 *   GET    /api/ai/reviews                 — Get review queue (4.1.6)
 *   GET    /api/ai/reviews/:id             — Get single review item
 *   POST   /api/ai/reviews/:id/approve     — Approve AI content
 *   POST   /api/ai/reviews/:id/reject      — Reject AI content
 *   GET    /api/ai/cost                    — Get cost/usage report (4.1.7)
 *   GET    /api/ai/cost/summary            — Admin: all users cost summary
 *   PUT    /api/ai/cost/budget             — Set user budget
 *   GET    /api/ai/evaluation/suite        — Get evaluation test suite (4.1.8)
 *   POST   /api/ai/evaluation/run          — Run evaluation suite
 *
 * Standards: NIST AI RMF, ISO 42001, OWASP LLM Top 10
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { getAuditStats, queryRecentAudit } from '../lib/ai/auditTrail.js';
import {
  checkBudget,
  getAllUsersUsageSummary,
  getUsageReport,
  setBudgetLimit,
} from '../lib/ai/costTracker.js';
import { getTestSuite, runEvaluationSuite } from '../lib/ai/evaluation.js';
import { aiInputGuard } from '../lib/ai/guardrails.js';
import {
  approveReview,
  getReviewItem,
  getReviewQueue,
  getReviewStats,
  initHumanReviewTables,
  rejectReview,
  submitForReview,
} from '../lib/ai/humanReview.js';
import { listAgents, orchestrate } from '../lib/ai/orchestrator.js';
import { createLogger } from '../lib/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();
const logger = createLogger('ai-routes');

// Defer table init until database is ready
let tablesReady = false;
function ensureTables() {
  if (tablesReady) {
    return;
  }
  try {
    initHumanReviewTables();
    tablesReady = true;
  } catch {
    /* retry next request */
  }
}
router.use((_req, _res, next) => {
  ensureTables();
  next();
});

// ────────────────────────────────────────────────────────────
// Helper: validation error handler
// ────────────────────────────────────────────────────────────

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// POST /api/ai/orchestrate — Route prompt to specialist agent
// ────────────────────────────────────────────────────────────

router.post(
  '/orchestrate',
  authenticateToken,
  [
    body('agentId').optional().isString().trim().withMessage('agentId must be a string'),
    body('sessionId').optional().isString().trim().withMessage('sessionId must be a string'),
  ],
  aiInputGuard,
  async (req, res) => {
    try {
      const { agentId, sessionId } = req.body;
      const result = await orchestrate({
        prompt: req.aiInput.prompt,
        context: req.aiInput.context,
        agentId,
        userId: String(req.user.id),
        sessionId,
      });

      res.json({
        success: true,
        data: {
          agent: { id: result.agent.id, name: result.agent.name },
          intent: result.intent,
          sessionId: result.sessionId,
          messages: result.messages,
          model: result.agent.model,
          maxTokens: result.agent.maxTokens,
          temperature: result.agent.temperature,
          warnings: result.warnings,
        },
      });
    } catch (err) {
      logger.error('Orchestration failed', { error: err.message });
      const status = err.statusCode || 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/ai/generate-document — AI-assisted document generation (4.1.3)
// ────────────────────────────────────────────────────────────

router.post(
  '/generate-document',
  authenticateToken,
  [
    body('templateType').isString().notEmpty().withMessage('templateType is required'),
    body('parameters').isObject().withMessage('parameters must be an object'),
    body('prompt').optional().isString(),
  ],
  aiInputGuard,
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const { templateType, parameters, sessionId } = req.body;

      // Route to document agent
      const result = await orchestrate({
        prompt:
          req.aiInput.prompt || `Generate a ${templateType} document with the provided parameters`,
        context: JSON.stringify({ templateType, parameters }),
        agentId: 'document',
        userId: String(req.user.id),
        sessionId,
      });

      // The actual LLM call would happen here in production.
      // For now, we return the prepared orchestration + a placeholder indicating
      // the caller should make the LLM call with the returned messages.
      const reviewResult = submitForReview({
        auditId: `gen_${Date.now()}`,
        sessionId: result.sessionId,
        agentId: 'document',
        contentType: 'document',
        title: `Generated ${templateType}`,
        aiOutput: '[Awaiting LLM response — pass messages to your LLM provider]',
        context: JSON.stringify(parameters),
        originalPrompt: req.aiInput.prompt,
        requestedBy: req.user.id,
        priority: 'normal',
      });

      res.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          messages: result.messages,
          model: result.agent.model,
          reviewId: reviewResult.reviewId,
          note: 'Send the messages array to your LLM provider, then update the review item with the response',
        },
      });
    } catch (err) {
      logger.error('Document generation failed', { error: err.message });
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
);

// ────────────────────────────────────────────────────────────
// POST /api/ai/gap-analysis — AI-powered compliance gap analysis (4.1.4)
// ────────────────────────────────────────────────────────────

router.post(
  '/gap-analysis',
  authenticateToken,
  [
    body('systemDescription').isString().notEmpty().withMessage('systemDescription is required'),
    body('framework')
      .isString()
      .notEmpty()
      .withMessage('framework is required (e.g., nist-800-171r3)'),
    body('currentControls').optional().isArray(),
  ],
  aiInputGuard,
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const { systemDescription, framework, currentControls, sessionId } = req.body;

      const prompt = `Analyze the following system description against ${framework} controls and identify compliance gaps.
Provide a structured gap analysis with:
1. Controls that are fully satisfied
2. Controls that are partially implemented
3. Controls that are not implemented
4. Specific remediation recommendations for each gap

System Description:
${systemDescription}

${currentControls?.length ? `Currently implemented controls: ${currentControls.join(', ')}` : ''}`;

      const result = await orchestrate({
        prompt,
        agentId: 'compliance',
        userId: String(req.user.id),
        sessionId,
      });

      // Submit for review since gap analysis affects compliance posture
      const reviewResult = submitForReview({
        auditId: `gap_${Date.now()}`,
        sessionId: result.sessionId,
        agentId: 'compliance',
        contentType: 'data',
        title: `Gap Analysis: ${framework}`,
        aiOutput: '[Awaiting LLM response]',
        originalPrompt: prompt,
        requestedBy: req.user.id,
        priority: 'high',
      });

      res.json({
        success: true,
        data: {
          sessionId: result.sessionId,
          messages: result.messages,
          model: result.agent.model,
          reviewId: reviewResult.reviewId,
          framework,
        },
      });
    } catch (err) {
      logger.error('Gap analysis failed', { error: err.message });
      res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
  }
);

// ────────────────────────────────────────────────────────────
// GET /api/ai/agents — List all registered agents
// ────────────────────────────────────────────────────────────

router.get('/agents', authenticateToken, (_req, res) => {
  res.json({ success: true, data: listAgents() });
});

// ────────────────────────────────────────────────────────────
// Audit Trail Endpoints (4.1.5)
// ────────────────────────────────────────────────────────────

router.get('/audit', authenticateToken, requireRole('admin'), (req, res) => {
  const { sessionId, userId, agentId, action, limit } = req.query;
  const entries = queryRecentAudit({
    sessionId,
    userId,
    agentId,
    action,
    limit: limit ? parseInt(limit, 10) : 50,
  });
  res.json({ success: true, data: entries });
});

router.get('/audit/stats', authenticateToken, requireRole('admin'), (req, res) => {
  const { since } = req.query;
  const stats = getAuditStats({ since });
  res.json({ success: true, data: stats });
});

// ────────────────────────────────────────────────────────────
// Human Review Endpoints (4.1.6)
// ────────────────────────────────────────────────────────────

router.get('/reviews', authenticateToken, (req, res) => {
  const { status, priority, agentId, page, limit } = req.query;
  const result = getReviewQueue({
    status,
    priority,
    agentId,
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
  });
  res.json({ success: true, data: result });
});

router.get('/reviews/stats', authenticateToken, (_req, res) => {
  res.json({ success: true, data: getReviewStats() });
});

router.get('/reviews/:id', authenticateToken, param('id').isInt(), (req, res) => {
  const valErr = handleValidation(req, res);
  if (valErr) {
    return;
  }

  const item = getReviewItem(parseInt(req.params.id, 10));
  if (!item) {
    return res.status(404).json({ success: false, message: 'Review item not found' });
  }
  res.json({ success: true, data: item });
});

router.post(
  '/reviews/:id/approve',
  authenticateToken,
  [
    param('id').isInt(),
    body('notes').optional().isString(),
    body('editedOutput').optional().isString(),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    const result = approveReview(
      parseInt(req.params.id, 10),
      req.user.id,
      req.body.notes,
      req.body.editedOutput
    );

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.json({ success: true, data: result });
  }
);

router.post(
  '/reviews/:id/reject',
  authenticateToken,
  [
    param('id').isInt(),
    body('reason').isString().notEmpty().withMessage('Rejection reason is required'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    const result = rejectReview(parseInt(req.params.id, 10), req.user.id, req.body.reason);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }
    res.json({ success: true, data: result });
  }
);

// ────────────────────────────────────────────────────────────
// Cost Tracking Endpoints (4.1.7)
// ────────────────────────────────────────────────────────────

router.get('/cost', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  const report = getUsageReport(String(req.user.id), { startDate, endDate });
  const budget = checkBudget(String(req.user.id));
  res.json({ success: true, data: { ...report, budget } });
});

router.get('/cost/summary', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ success: true, data: getAllUsersUsageSummary() });
});

router.put(
  '/cost/budget',
  authenticateToken,
  requireRole('admin'),
  [body('userId').isString().notEmpty(), body('dailyLimitUsd').isFloat({ min: 0.01, max: 1000 })],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    setBudgetLimit(req.body.userId, req.body.dailyLimitUsd);
    res.json({ success: true, message: 'Budget limit updated' });
  }
);

// ────────────────────────────────────────────────────────────
// Evaluation Endpoints (4.1.8)
// ────────────────────────────────────────────────────────────

router.get('/evaluation/suite', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ success: true, data: getTestSuite() });
});

router.post(
  '/evaluation/run',
  authenticateToken,
  requireRole('admin'),
  [body('responses').isObject().withMessage('responses must be a map of testId → response text')],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    const results = runEvaluationSuite(req.body.responses);
    res.json({ success: true, data: results });
  }
);

export default router;
