/**
 * Error Monitor API Routes (P3.1.7)
 *
 * Admin-only endpoints for viewing, querying, and resolving
 * tracked application errors.
 *
 * Endpoints:
 *   GET  /api/errors          — List errors (query: unresolved, limit, env)
 *   GET  /api/errors/stats    — Summary statistics
 *   GET  /api/errors/:fp      — Single error by fingerprint
 *   PATCH /api/errors/:fp/resolve — Mark error as resolved
 *
 * Standards: NIST AU-6 (Audit Review), NIST AU-7 (Audit Reduction)
 */

import express from 'express';
import { param, validationResult } from 'express-validator';
import {
  getErrorByFingerprint,
  getErrors,
  getErrorStats,
  resolveError,
} from '../lib/errorMonitor.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

const router = express.Router();

// All error-monitor routes require admin authentication
router.use(authenticateToken, requireRole('admin'));

/**
 * GET /api/errors
 * List tracked errors with optional filters.
 *
 * Query params:
 *   unresolved (boolean) — only unresolved errors (default: false)
 *   limit      (number)  — max results (default: 50, max: 200)
 *   env        (string)  — filter by environment
 */
router.get('/', (req, res) => {
  try {
    const unresolved = req.query.unresolved === 'true';
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const environment = req.query.env || undefined;

    const errors = getErrors({ unresolved, limit, environment });

    res.json({
      success: true,
      count: errors.length,
      errors: errors.map((e) => ({
        fingerprint: e.fingerprint,
        message: e.message,
        name: e.name,
        code: e.code,
        statusCode: e.statusCode,
        firstSeen: e.firstSeen,
        lastSeen: e.lastSeen,
        count: e.count,
        resolved: e.resolved,
        environment: e.environment,
        lastContext: e.lastContext,
      })),
    });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve errors' });
  }
});

/**
 * GET /api/errors/stats
 * Summary statistics for the error dashboard widget.
 */
router.get('/stats', (_req, res) => {
  try {
    const stats = getErrorStats();
    res.json({ success: true, ...stats });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve error stats' });
  }
});

/**
 * GET /api/errors/:fingerprint
 * Full error detail including stack trace and breadcrumbs.
 */
router.get('/:fingerprint', (req, res) => {
  try {
    const error = getErrorByFingerprint(req.params.fingerprint);
    if (!error) {
      return res.status(404).json({ success: false, message: 'Error not found' });
    }
    res.json({ success: true, error });
  } catch (_err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve error' });
  }
});

/**
 * PATCH /api/errors/:fingerprint/resolve
 * Mark an error as resolved.
 */
router.patch(
  '/:fingerprint/resolve',
  [
    param('fingerprint')
      .isString()
      .isLength({ min: 1, max: 64 })
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Invalid fingerprint format'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const resolved = resolveError(req.params.fingerprint);
      if (!resolved) {
        return res.status(404).json({ success: false, message: 'Error not found' });
      }
      res.json({ success: true, message: 'Error marked as resolved' });
    } catch (_err) {
      res.status(500).json({ success: false, message: 'Failed to resolve error' });
    }
  }
);

export default router;
