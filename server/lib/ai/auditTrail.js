/**
 * AI Conversation Audit Trail (P4.1.5)
 *
 * Logs every AI interaction: prompts, responses, tool calls,
 * token counts, latency, and safety evaluations.
 *
 * Standards: NIST AU-2, AU-3, AI observability best practices
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = createLogger('ai-audit');

const AUDIT_LOG_PATH =
  process.env.AI_AUDIT_LOG || path.join(__dirname, '../../../logs/ai-audit.jsonl');
const MAX_LOG_SIZE = 50 * 1024 * 1024; // 50 MB before rotation

// In-memory ring buffer for recent entries (fast lookup)
const RING_BUFFER_SIZE = 500;
const ringBuffer = [];
let bufferIndex = 0;

/**
 * @typedef {Object} AuditEntry
 * @property {string} id - Unique conversation turn ID
 * @property {string} sessionId - Conversation session ID
 * @property {string} userId - Authenticated user ID
 * @property {string} agentId - Which specialist agent handled this
 * @property {string} action - Action type (prompt | response | tool_call | approval | rejection)
 * @property {Object} input - Sanitized prompt and context
 * @property {Object} output - Model response (truncated if large)
 * @property {Object} toolCalls - Any tool calls made by the agent
 * @property {Object} tokens - Token usage { prompt, completion, total }
 * @property {number} latencyMs - Response time in milliseconds
 * @property {Object} safety - Content safety evaluation result
 * @property {string} model - Model identifier used
 * @property {number} cost - Estimated cost in USD
 * @property {Object} metadata - Arbitrary extra metadata
 * @property {string} timestamp - ISO 8601 timestamp
 */

/**
 * Generate a unique ID for audit entries
 * @returns {string}
 */
function generateId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `ai_${ts}_${rand}`;
}

/**
 * Log an AI interaction to the audit trail.
 *
 * @param {Partial<AuditEntry>} entry - Audit data
 * @returns {Promise<AuditEntry>} The completed entry with generated fields
 */
export async function logAiInteraction(entry) {
  const record = {
    id: generateId(),
    sessionId: entry.sessionId || null,
    userId: entry.userId || null,
    agentId: entry.agentId || 'unknown',
    action: entry.action || 'prompt',
    input: entry.input || null,
    output: truncateField(entry.output, 5000),
    toolCalls: entry.toolCalls || null,
    tokens: entry.tokens || { prompt: 0, completion: 0, total: 0 },
    latencyMs: entry.latencyMs || 0,
    safety: entry.safety || null,
    model: entry.model || null,
    cost: entry.cost || 0,
    metadata: entry.metadata || {},
    timestamp: new Date().toISOString(),
  };

  // Write to ring buffer
  ringBuffer[bufferIndex % RING_BUFFER_SIZE] = record;
  bufferIndex++;

  // Persist to JSONL file
  try {
    await ensureLogDir();
    await fs.appendFile(AUDIT_LOG_PATH, JSON.stringify(record) + '\n', 'utf8');

    // Check for rotation
    const stats = await fs.stat(AUDIT_LOG_PATH).catch(() => null);
    if (stats && stats.size > MAX_LOG_SIZE) {
      await rotateLog();
    }
  } catch (err) {
    logger.error('Failed to persist AI audit entry', { error: err.message, entryId: record.id });
  }

  logger.debug('AI audit entry logged', {
    id: record.id,
    action: record.action,
    agentId: record.agentId,
    tokens: record.tokens.total,
    latencyMs: record.latencyMs,
  });

  return record;
}

/**
 * Query recent audit entries from the ring buffer.
 *
 * @param {Object} [filters]
 * @param {string} [filters.sessionId]
 * @param {string} [filters.userId]
 * @param {string} [filters.agentId]
 * @param {string} [filters.action]
 * @param {number} [filters.limit=50]
 * @returns {AuditEntry[]}
 */
export function queryRecentAudit(filters = {}) {
  const { sessionId, userId, agentId, action, limit = 50 } = filters;

  let results = ringBuffer.filter(Boolean);

  if (sessionId) {
    results = results.filter((e) => e.sessionId === sessionId);
  }
  if (userId) {
    results = results.filter((e) => e.userId === userId);
  }
  if (agentId) {
    results = results.filter((e) => e.agentId === agentId);
  }
  if (action) {
    results = results.filter((e) => e.action === action);
  }

  // Most recent first
  results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return results.slice(0, limit);
}

/**
 * Get aggregate statistics from the audit trail.
 *
 * @param {Object} [filters]
 * @param {string} [filters.since] - ISO date string to filter entries after
 * @returns {{ totalInteractions: number, totalTokens: number, totalCost: number, avgLatencyMs: number, byAgent: Object, byAction: Object }}
 */
export function getAuditStats(filters = {}) {
  let entries = ringBuffer.filter(Boolean);

  if (filters.since) {
    const sinceDate = new Date(filters.since);
    entries = entries.filter((e) => new Date(e.timestamp) >= sinceDate);
  }

  const stats = {
    totalInteractions: entries.length,
    totalTokens: 0,
    totalCost: 0,
    avgLatencyMs: 0,
    byAgent: {},
    byAction: {},
  };

  let latencySum = 0;

  for (const entry of entries) {
    stats.totalTokens += entry.tokens?.total || 0;
    stats.totalCost += entry.cost || 0;
    latencySum += entry.latencyMs || 0;

    stats.byAgent[entry.agentId] = (stats.byAgent[entry.agentId] || 0) + 1;
    stats.byAction[entry.action] = (stats.byAction[entry.action] || 0) + 1;
  }

  stats.avgLatencyMs = entries.length > 0 ? Math.round(latencySum / entries.length) : 0;
  stats.totalCost = Math.round(stats.totalCost * 1000000) / 1000000; // 6 decimal precision

  return stats;
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function truncateField(value, maxLen) {
  if (!value) {
    return null;
  }
  if (typeof value === 'string' && value.length > maxLen) {
    return value.substring(0, maxLen) + `... [truncated, ${value.length} chars total]`;
  }
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    if (str.length > maxLen) {
      return str.substring(0, maxLen) + '... [truncated]';
    }
    return value;
  }
  return value;
}

async function ensureLogDir() {
  const dir = path.dirname(AUDIT_LOG_PATH);
  await fs.mkdir(dir, { recursive: true });
}

async function rotateLog() {
  try {
    const rotatedPath = AUDIT_LOG_PATH.replace('.jsonl', `-${Date.now()}.jsonl`);
    await fs.rename(AUDIT_LOG_PATH, rotatedPath);
    logger.info('AI audit log rotated', { rotatedTo: rotatedPath });
  } catch (err) {
    logger.error('Failed to rotate AI audit log', { error: err.message });
  }
}

export default {
  logAiInteraction,
  queryRecentAudit,
  getAuditStats,
};
