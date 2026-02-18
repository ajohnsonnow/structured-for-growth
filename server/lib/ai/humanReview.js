/**
 * Human-in-the-Loop Review System (P4.1.6)
 *
 * Manages approval workflows for AI-generated content.
 * All AI outputs that modify data, generate documents,
 * or produce customer-facing content must be approved by
 * a human reviewer before being finalized.
 *
 * Standards: ISO 42001 (AI Management), Responsible AI Principles
 */

import { execute, query, queryOne } from '../../models/database.js';
import { logAiInteraction } from './auditTrail.js';
import { createLogger } from '../logger.js';

const logger = createLogger('ai-human-review');

// ────────────────────────────────────────────────────────────
// Database Setup
// ────────────────────────────────────────────────────────────

export function initHumanReviewTables() {
  execute(`
    CREATE TABLE IF NOT EXISTS ai_review_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      audit_id TEXT NOT NULL,
      session_id TEXT,
      agent_id TEXT NOT NULL,
      content_type TEXT NOT NULL DEFAULT 'text',
      title TEXT NOT NULL,
      ai_output TEXT NOT NULL,
      context TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'normal',
      requested_by INTEGER,
      reviewed_by INTEGER,
      reviewer_notes TEXT,
      original_prompt TEXT,
      safety_score REAL DEFAULT 0,
      safety_flags TEXT,
      reviewed_at DATETIME,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS ai_review_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      review_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      actor_id INTEGER NOT NULL,
      notes TEXT,
      diff TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  logger.debug('AI review tables initialized');
}

// ────────────────────────────────────────────────────────────
// Review Queue Operations
// ────────────────────────────────────────────────────────────

/**
 * Submit AI-generated content for human review.
 *
 * @param {Object} params
 * @param {string} params.auditId - Reference to AI audit trail entry
 * @param {string} params.sessionId - AI conversation session ID
 * @param {string} params.agentId - Agent that generated the content
 * @param {string} params.contentType - Type: text | document | template | data
 * @param {string} params.title - Short description of the content
 * @param {string} params.aiOutput - The AI-generated content to review
 * @param {string} [params.context] - Additional context for the reviewer
 * @param {string} [params.originalPrompt] - The original user prompt
 * @param {number} [params.requestedBy] - User ID who triggered the AI request
 * @param {string} [params.priority] - low | normal | high | critical
 * @param {Object} [params.safety] - Safety evaluation results
 * @param {number} [params.expiresInHours=72] - Auto-expire after N hours
 * @returns {{ reviewId: number, status: string }}
 */
export function submitForReview({
  auditId,
  sessionId,
  agentId,
  contentType = 'text',
  title,
  aiOutput,
  context,
  originalPrompt,
  requestedBy,
  priority = 'normal',
  safety,
  expiresInHours = 72,
}) {
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000).toISOString();

  // Auto-escalate priority based on safety flags
  let resolvedPriority = priority;
  if (safety && !safety.safe) {
    resolvedPriority = 'critical';
  }

  execute(
    `INSERT INTO ai_review_queue 
      (audit_id, session_id, agent_id, content_type, title, ai_output, context, 
       original_prompt, requested_by, priority, safety_score, safety_flags, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      auditId,
      sessionId || null,
      agentId,
      contentType,
      title,
      aiOutput,
      context || null,
      originalPrompt || null,
      requestedBy || null,
      resolvedPriority,
      safety?.score || 0,
      safety?.flags ? JSON.stringify(safety.flags) : null,
      expiresAt,
    ]
  );

  const row = queryOne('SELECT last_insert_rowid() as id');
  const reviewId = row.id;

  // Log initial history
  if (requestedBy) {
    execute(
      'INSERT INTO ai_review_history (review_id, action, actor_id, notes) VALUES (?, ?, ?, ?)',
      [reviewId, 'submitted', requestedBy, `Submitted for ${resolvedPriority} review`]
    );
  }

  logger.info('AI content submitted for review', {
    reviewId,
    agentId,
    contentType,
    priority: resolvedPriority,
  });

  return { reviewId, status: 'pending' };
}

/**
 * Approve AI-generated content.
 *
 * @param {number} reviewId
 * @param {number} reviewerId - User ID of the reviewer
 * @param {string} [notes] - Reviewer notes
 * @param {string} [editedOutput] - If reviewer made modifications
 * @returns {{ success: boolean, reviewId: number, status: string }}
 */
export function approveReview(reviewId, reviewerId, notes, editedOutput) {
  const item = queryOne('SELECT * FROM ai_review_queue WHERE id = ?', [reviewId]);
  if (!item) {
    return { success: false, error: 'Review item not found' };
  }
  if (item.status !== 'pending') {
    return { success: false, error: `Cannot approve item with status "${item.status}"` };
  }

  execute(
    `UPDATE ai_review_queue 
     SET status = 'approved', reviewed_by = ?, reviewer_notes = ?,
         ai_output = COALESCE(?, ai_output), reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [reviewerId, notes || null, editedOutput || null, reviewId]
  );

  execute(
    'INSERT INTO ai_review_history (review_id, action, actor_id, notes, diff) VALUES (?, ?, ?, ?, ?)',
    [
      reviewId,
      'approved',
      reviewerId,
      notes || 'Approved without changes',
      editedOutput ? JSON.stringify({ edited: true }) : null,
    ]
  );

  logger.info('AI content approved', { reviewId, reviewerId });

  // Async audit trail logging
  logAiInteraction({
    sessionId: item.session_id,
    userId: String(reviewerId),
    agentId: item.agent_id,
    action: 'approval',
    metadata: { reviewId, notes },
  }).catch(() => {});

  return { success: true, reviewId, status: 'approved' };
}

/**
 * Reject AI-generated content.
 *
 * @param {number} reviewId
 * @param {number} reviewerId
 * @param {string} reason - Reason for rejection (required)
 * @returns {{ success: boolean, reviewId: number, status: string }}
 */
export function rejectReview(reviewId, reviewerId, reason) {
  const item = queryOne('SELECT * FROM ai_review_queue WHERE id = ?', [reviewId]);
  if (!item) {
    return { success: false, error: 'Review item not found' };
  }
  if (item.status !== 'pending') {
    return { success: false, error: `Cannot reject item with status "${item.status}"` };
  }

  execute(
    `UPDATE ai_review_queue
     SET status = 'rejected', reviewed_by = ?, reviewer_notes = ?,
         reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [reviewerId, reason, reviewId]
  );

  execute(
    'INSERT INTO ai_review_history (review_id, action, actor_id, notes) VALUES (?, ?, ?, ?)',
    [reviewId, 'rejected', reviewerId, reason]
  );

  logger.info('AI content rejected', { reviewId, reviewerId, reason });

  logAiInteraction({
    sessionId: item.session_id,
    userId: String(reviewerId),
    agentId: item.agent_id,
    action: 'rejection',
    metadata: { reviewId, reason },
  }).catch(() => {});

  return { success: true, reviewId, status: 'rejected' };
}

/**
 * Get the review queue with filtering and pagination.
 *
 * @param {Object} [filters]
 * @param {string} [filters.status] - Filter by status
 * @param {string} [filters.priority] - Filter by priority
 * @param {string} [filters.agentId] - Filter by agent
 * @param {number} [filters.page=1]
 * @param {number} [filters.limit=20]
 * @returns {{ items: Array, total: number, page: number, pages: number }}
 */
export function getReviewQueue(filters = {}) {
  const { status, priority, agentId, page = 1, limit = 20 } = filters;

  let where = 'WHERE 1=1';
  const params = [];

  if (status) {
    where += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    where += ' AND priority = ?';
    params.push(priority);
  }
  if (agentId) {
    where += ' AND agent_id = ?';
    params.push(agentId);
  }

  const countRow = queryOne(`SELECT COUNT(*) as total FROM ai_review_queue ${where}`, params);
  const total = countRow?.total || 0;
  const pages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const items = query(
    `SELECT id, audit_id, session_id, agent_id, content_type, title,
            SUBSTR(ai_output, 1, 200) as output_preview, status, priority,
            requested_by, reviewed_by, reviewer_notes, safety_score,
            reviewed_at, expires_at, created_at
     FROM ai_review_queue ${where}
     ORDER BY 
       CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
       created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { items, total, page, pages };
}

/**
 * Get a single review item with full content and history.
 *
 * @param {number} reviewId
 * @returns {Object|null}
 */
export function getReviewItem(reviewId) {
  const item = queryOne('SELECT * FROM ai_review_queue WHERE id = ?', [reviewId]);
  if (!item) {
    return null;
  }

  const history = query(
    'SELECT * FROM ai_review_history WHERE review_id = ? ORDER BY created_at ASC',
    [reviewId]
  );

  return {
    ...item,
    safety_flags: item.safety_flags ? JSON.parse(item.safety_flags) : [],
    history,
  };
}

/**
 * Get review queue statistics.
 *
 * @returns {{ pending: number, approved: number, rejected: number, expired: number, byPriority: Object, byAgent: Object }}
 */
export function getReviewStats() {
  const rows = query(
    `SELECT status, priority, agent_id, COUNT(*) as count
     FROM ai_review_queue
     GROUP BY status, priority, agent_id`
  );

  const stats = { pending: 0, approved: 0, rejected: 0, expired: 0, byPriority: {}, byAgent: {} };

  for (const row of rows) {
    stats[row.status] = (stats[row.status] || 0) + row.count;
    stats.byPriority[row.priority] = (stats.byPriority[row.priority] || 0) + row.count;
    stats.byAgent[row.agent_id] = (stats.byAgent[row.agent_id] || 0) + row.count;
  }

  // Check for expired items
  const expired = queryOne(
    `SELECT COUNT(*) as count FROM ai_review_queue 
     WHERE status = 'pending' AND expires_at < datetime('now')`
  );
  stats.expired = expired?.count || 0;

  return stats;
}

export default {
  initHumanReviewTables,
  submitForReview,
  approveReview,
  rejectReview,
  getReviewQueue,
  getReviewItem,
  getReviewStats,
};
