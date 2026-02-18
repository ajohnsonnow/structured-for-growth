/**
 * Database Connection Manager (P5.1.8)
 *
 * Wraps sql.js database access with connection-pool-like semantics.
 *
 * sql.js is an in-memory SQLite compiled to WebAssembly — it doesn't
 * need traditional connection pooling like PostgreSQL. But we DO need:
 *  - Write serialization (SQLite allows only one writer at a time)
 *  - Auto-save scheduling (batch disk writes for performance)
 *  - Query timing / slow query logging
 *  - Connection health checks
 *
 * Think of it like a traffic controller for database operations.
 *
 * Standards: ISO 25010 Performance, Twelve-Factor (Backing Services)
 */

import { createLogger } from '../lib/logger.js';
import { execute, query, queryOne } from '../models/database.js';

const logger = createLogger('db-pool');

// ────────────────────────────────────────────────────────────
// Query Performance Tracking
// ────────────────────────────────────────────────────────────

const SLOW_QUERY_MS = parseInt(process.env.SLOW_QUERY_MS || '100', 10);

/** @type {{ sql: string, duration: number, timestamp: number }[]} */
const slowQueries = [];
const MAX_SLOW_QUERIES = 100;

/**
 * Execute a query with timing. Logs if it takes longer than threshold.
 */
export function timedQuery(sql, params = []) {
  const start = performance.now();
  const result = query(sql, params);
  const duration = performance.now() - start;

  if (duration > SLOW_QUERY_MS) {
    const entry = {
      sql: sql.substring(0, 200),
      duration: Math.round(duration),
      timestamp: Date.now(),
    };
    slowQueries.push(entry);
    if (slowQueries.length > MAX_SLOW_QUERIES) {
      slowQueries.shift();
    }
    logger.warn(`Slow query (${Math.round(duration)}ms): ${sql.substring(0, 100)}...`);
  }

  return result;
}

/**
 * Execute a timed single-row query.
 */
export function timedQueryOne(sql, params = []) {
  const start = performance.now();
  const result = queryOne(sql, params);
  const duration = performance.now() - start;

  if (duration > SLOW_QUERY_MS) {
    slowQueries.push({
      sql: sql.substring(0, 200),
      duration: Math.round(duration),
      timestamp: Date.now(),
    });
    logger.warn(`Slow query (${Math.round(duration)}ms): ${sql.substring(0, 100)}...`);
  }

  return result;
}

/**
 * Execute a write operation with timing.
 */
export function timedExecute(sql, params = []) {
  const start = performance.now();
  const result = execute(sql, params);
  const duration = performance.now() - start;

  if (duration > SLOW_QUERY_MS) {
    slowQueries.push({
      sql: sql.substring(0, 200),
      duration: Math.round(duration),
      timestamp: Date.now(),
    });
    logger.warn(`Slow write (${Math.round(duration)}ms): ${sql.substring(0, 100)}...`);
  }

  return result;
}

// ────────────────────────────────────────────────────────────
// Transaction Support
// ────────────────────────────────────────────────────────────

/**
 * Run multiple operations in a transaction.
 * If any operation fails, ALL changes are rolled back.
 *
 * @param {(ops: {query, queryOne, execute}) => void} fn
 */
export function transaction(fn) {
  try {
    execute('BEGIN TRANSACTION');
    fn({ query: timedQuery, queryOne: timedQueryOne, execute: timedExecute });
    execute('COMMIT');
  } catch (err) {
    execute('ROLLBACK');
    logger.error('Transaction rolled back', { error: err.message });
    throw err;
  }
}

// ────────────────────────────────────────────────────────────
// Health & Diagnostics
// ────────────────────────────────────────────────────────────

/**
 * Check database health.
 */
export function checkDbHealth() {
  try {
    const start = performance.now();
    const result = queryOne('SELECT 1 as ok');
    const latency = Math.round(performance.now() - start);

    // Check database size
    const pageCount = queryOne('PRAGMA page_count');
    const pageSize = queryOne('PRAGMA page_size');
    const sizeBytes = (pageCount?.page_count || 0) * (pageSize?.page_size || 4096);

    return {
      status: result?.ok === 1 ? 'healthy' : 'degraded',
      latencyMs: latency,
      sizeBytes,
      sizeMB: Math.round((sizeBytes / 1024 / 1024) * 100) / 100,
      tableCount:
        query("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'")?.at(0)?.count || 0,
    };
  } catch (err) {
    return { status: 'unhealthy', error: err.message };
  }
}

/**
 * Get slow query log.
 */
export function getSlowQueries() {
  return [...slowQueries];
}

/**
 * Get database statistics.
 */
export function getDbStats() {
  const health = checkDbHealth();
  return {
    ...health,
    slowQueries: slowQueries.length,
    slowQueryThresholdMs: SLOW_QUERY_MS,
    recentSlowQueries: slowQueries.slice(-5),
  };
}

export default {
  timedQuery,
  timedQueryOne,
  timedExecute,
  transaction,
  checkDbHealth,
  getSlowQueries,
  getDbStats,
};
