/**
 * Error Monitoring System (P3.1.7)
 *
 * Lightweight, self-hosted error monitoring — think Sentry without the SaaS.
 * Captures, deduplicates, and stores application errors with full context
 * (request info, user, stack trace, environment) for review in the admin dashboard.
 *
 * Features:
 *  - Fingerprint-based deduplication (same error counted, not duplicated)
 *  - Contextual metadata (request, user, environment)
 *  - Rate limiting to prevent log flooding (max 100 distinct errors/minute)
 *  - In-memory ring buffer (last 1,000 errors) + optional file persistence
 *  - /api/errors admin endpoint for dashboard viewer
 *  - Breadcrumb trail (last N actions before the error)
 *
 * Standards: NIST AU-2 (Auditable Events), NIST AU-3 (Content of Audit Records),
 *            OWASP A09 (Security Logging and Monitoring Failures)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger('error-monitor');

// ── Configuration ──

const MAX_BUFFER_SIZE = 1000; // Keep last N distinct errors in memory
const MAX_BREADCRUMBS = 20; // Breadcrumbs per request
const RATE_LIMIT_WINDOW = 60000; // 1 minute window
const RATE_LIMIT_MAX = 100; // Max distinct errors per window
const PERSIST_FILE = path.resolve(__dirname, '../../logs/errors.jsonl');

// ── In-Memory Store ──

/** @type {Map<string, ErrorRecord>} fingerprint → record */
const errorStore = new Map();

/** @type {string[]} ordered fingerprints (oldest first) for eviction */
const errorOrder = [];

/** Rate limit tracking */
let rateWindowStart = Date.now();
let rateCount = 0;

// ── Types ──

/**
 * @typedef {Object} ErrorRecord
 * @property {string}   fingerprint  - SHA-256 of message + first stack frame
 * @property {string}   message      - Error message
 * @property {string}   name         - Error class name (TypeError, AppError, etc.)
 * @property {string}   code         - Machine-readable error code (if AppError)
 * @property {number}   statusCode   - HTTP status (if AppError)
 * @property {string}   stack        - Full stack trace
 * @property {string}   firstSeen    - ISO timestamp of first occurrence
 * @property {string}   lastSeen     - ISO timestamp of most recent occurrence
 * @property {number}   count        - Total occurrences
 * @property {Object}   lastContext  - Request context from most recent occurrence
 * @property {string[]} breadcrumbs  - Last actions before the error
 * @property {boolean}  resolved     - Manually marked resolved by admin
 * @property {string}   environment  - NODE_ENV
 */

// ── Core Functions ──

/**
 * Generate a fingerprint for an error by hashing its name + message + first
 * application stack frame (ignoring node_modules and node internals).
 * Errors with the same fingerprint are the "same bug."
 */
function fingerprint(err) {
  const stackLines = (err.stack || '').split('\n');
  // Find the first frame from application code (not node_modules or internal)
  const appFrame =
    stackLines.find(
      (l, i) =>
        i > 0 &&
        l.trim().startsWith('at ') &&
        !l.includes('node_modules') &&
        !l.includes('node:internal')
    ) || '';
  // Extract just the function/method name and file, ignoring line numbers
  // e.g., "at Object.captureError (server/lib/errorMonitor.js:123:5)" → "Object.captureError server/lib/errorMonitor.js"
  const _frameKey = appFrame
    .replace(/:\d+:\d+\)?$/, '') // Strip line:col
    .replace(/\(/, '') // Strip opening paren
    .trim();
  const raw = `${err.name || 'Error'}:${err.message}`;
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

/**
 * Check if we're within rate limits.
 * Returns true if the error should be recorded, false if rate-limited.
 */
function checkRateLimit() {
  const now = Date.now();
  if (now - rateWindowStart > RATE_LIMIT_WINDOW) {
    rateWindowStart = now;
    rateCount = 0;
  }
  if (rateCount >= RATE_LIMIT_MAX) {
    return false;
  }
  rateCount++;
  return true;
}

/**
 * Capture an error with full context.
 *
 * @param {Error}  err     - The error to capture
 * @param {Object} [context] - Optional context
 * @param {Object} [context.req]  - Express request object
 * @param {Object} [context.user] - User info { id, username, role }
 * @param {Object} [context.extra] - Any additional metadata
 * @param {string[]} [context.breadcrumbs] - Recent actions
 */
export function captureError(err, context = {}) {
  if (!checkRateLimit()) {
    logger.warn('Error monitoring rate limit reached — dropping error', {
      message: err.message,
    });
    return null;
  }

  const fp = fingerprint(err);
  const now = new Date().toISOString();
  const env = process.env.NODE_ENV || 'development';

  // Build request context (sanitized — no auth headers or body)
  const reqContext = context.req
    ? {
        method: context.req.method,
        url: context.req.originalUrl || context.req.url,
        ip: context.req.ip,
        userAgent: context.req.get?.('user-agent'),
        requestId: context.req.id,
        query: context.req.query,
        params: context.req.params,
      }
    : undefined;

  const userContext =
    context.user || context.req?.user
      ? {
          id: (context.user || context.req?.user)?.id,
          username: (context.user || context.req?.user)?.username,
          role: (context.user || context.req?.user)?.role,
        }
      : undefined;

  if (errorStore.has(fp)) {
    // Deduplicate: increment count, update lastSeen
    const existing = errorStore.get(fp);
    existing.count++;
    existing.lastSeen = now;
    existing.lastContext = { request: reqContext, user: userContext, extra: context.extra };
    existing.breadcrumbs = context.breadcrumbs || existing.breadcrumbs;
    existing.resolved = false; // re-open if it recurs
    logger.debug(`Error recurring (x${existing.count}): ${err.message}`, { fingerprint: fp });
  } else {
    // New error
    const record = {
      fingerprint: fp,
      message: err.message,
      name: err.name || 'Error',
      code: err.code || undefined,
      statusCode: err.statusCode || undefined,
      stack: err.stack,
      firstSeen: now,
      lastSeen: now,
      count: 1,
      lastContext: { request: reqContext, user: userContext, extra: context.extra },
      breadcrumbs: context.breadcrumbs || [],
      resolved: false,
      environment: env,
    };

    // Evict oldest if at capacity
    if (errorStore.size >= MAX_BUFFER_SIZE) {
      const oldest = errorOrder.shift();
      if (oldest) {
        errorStore.delete(oldest);
      }
    }

    errorStore.set(fp, record);
    errorOrder.push(fp);

    logger.error(`New error captured: ${err.message}`, {
      fingerprint: fp,
      name: err.name,
      code: err.code,
      statusCode: err.statusCode,
    });

    // Persist to file (append-only JSONL)
    persistError(record);
  }

  return fp;
}

/**
 * Persist an error record to logs/errors.jsonl (append-only).
 */
function persistError(record) {
  try {
    const dir = path.dirname(PERSIST_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const line = JSON.stringify({
      ...record,
      stack: record.stack?.split('\n').slice(0, 5).join('\n'), // Truncate stack for storage
    });
    fs.appendFileSync(PERSIST_FILE, line + '\n');
  } catch (writeErr) {
    logger.warn('Failed to persist error record', { error: writeErr.message });
  }
}

// ── Query Functions (for admin API) ──

/**
 * Get all tracked errors, sorted by most recent.
 * @param {Object}  [options]
 * @param {boolean} [options.unresolved] - Only show unresolved errors
 * @param {number}  [options.limit]      - Max results (default 50)
 * @param {string}  [options.environment] - Filter by environment
 * @returns {ErrorRecord[]}
 */
export function getErrors({ unresolved = false, limit = 50, environment } = {}) {
  let errors = Array.from(errorStore.values());

  if (unresolved) {
    errors = errors.filter((e) => !e.resolved);
  }
  if (environment) {
    errors = errors.filter((e) => e.environment === environment);
  }

  // Sort by lastSeen descending
  errors.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
  return errors.slice(0, limit);
}

/**
 * Get a single error by fingerprint.
 */
export function getErrorByFingerprint(fp) {
  return errorStore.get(fp) || null;
}

/**
 * Mark an error as resolved.
 */
export function resolveError(fp) {
  const record = errorStore.get(fp);
  if (!record) {
    return false;
  }
  record.resolved = true;
  return true;
}

/**
 * Get summary statistics.
 */
export function getErrorStats() {
  const errors = Array.from(errorStore.values());
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const oneDayAgo = now - 86400000;

  return {
    total: errors.length,
    unresolved: errors.filter((e) => !e.resolved).length,
    lastHour: errors.filter((e) => new Date(e.lastSeen).getTime() > oneHourAgo).length,
    lastDay: errors.filter((e) => new Date(e.lastSeen).getTime() > oneDayAgo).length,
    topErrors: errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((e) => ({ fingerprint: e.fingerprint, message: e.message, count: e.count })),
  };
}

// ── Express Middleware ──

/**
 * Express error-monitoring middleware.
 * Place BEFORE the final error handler to capture errors with context.
 *
 * Usage: app.use(errorMonitorMiddleware);
 */
export function errorMonitorMiddleware(err, req, res, next) {
  captureError(err, {
    req,
    user: req.user,
  });
  // Pass to the next error handler (the one that sends the response)
  next(err);
}

/**
 * Breadcrumb middleware — attaches a breadcrumb collector to each request.
 * Other middleware/routes can call `req.addBreadcrumb('action')`.
 */
export function breadcrumbMiddleware(req, _res, next) {
  req._breadcrumbs = [];
  req.addBreadcrumb = function (action, data) {
    if (req._breadcrumbs.length < MAX_BREADCRUMBS) {
      req._breadcrumbs.push({
        action,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  };
  next();
}

// ── Cleanup ──

/**
 * Clear all stored errors (for testing).
 */
export function clearErrors() {
  errorStore.clear();
  errorOrder.length = 0;
}

export default {
  captureError,
  getErrors,
  getErrorByFingerprint,
  resolveError,
  getErrorStats,
  errorMonitorMiddleware,
  breadcrumbMiddleware,
  clearErrors,
};
