/**
 * Database Migration Framework (P5.1.3)
 *
 * A lightweight migration system for sql.js / SQLite.
 *
 * Think of migrations like version control for your database structure —
 * each migration file says "here's what changed in the database schema
 * for version X." They run in order, only once, and can't be re-run.
 *
 * Why not Knex/Prisma? Those are great tools but add heavy ORM overhead
 * to a project that uses raw sql.js. This gives us the migration tracking
 * without a full ORM swap.
 *
 * Standards: Twelve-Factor (Disposability), ISO 25010 (Maintainability)
 *
 * Usage:
 *   node server/migrations/run.js            # Apply pending migrations
 *   node server/migrations/run.js --status    # Show migration status
 *   node server/migrations/run.js --create "add_user_avatar"
 */

import { createLogger } from '../lib/logger.js';
import { execute, query } from '../models/database.js';

const logger = createLogger('migrations');

// ────────────────────────────────────────────────────────────
// Migration Registry
// ────────────────────────────────────────────────────────────

/**
 * All migrations, in order. Each has:
 * - id: unique sequential identifier (YYYYMMDD_NNN format)
 * - name: human-readable description
 * - up: SQL or function to apply the change
 * - down: SQL or function to revert (best-effort)
 */
const MIGRATIONS = [
  {
    id: '20260215_001',
    name: 'create_migrations_table',
    up: `
      CREATE TABLE IF NOT EXISTS _migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT DEFAULT (datetime('now'))
      )
    `,
    down: 'DROP TABLE IF EXISTS _migrations',
  },
  {
    id: '20260215_002',
    name: 'add_users_avatar_bio',
    up: `
      ALTER TABLE users ADD COLUMN avatar_url TEXT;
      ALTER TABLE users ADD COLUMN bio TEXT;
    `,
    down: `
      -- SQLite doesn't support DROP COLUMN before 3.35.0
      -- Handled via table rebuild if needed
    `,
  },
  {
    id: '20260215_003',
    name: 'add_api_keys_table',
    up: `
      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        key_hash TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        scopes TEXT DEFAULT '*',
        last_used_at TEXT,
        expires_at TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `,
    down: 'DROP TABLE IF EXISTS api_keys',
  },
  {
    id: '20260215_004',
    name: 'add_sessions_table',
    up: `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        expires_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `,
    down: 'DROP TABLE IF EXISTS user_sessions',
  },
  {
    id: '20260215_005',
    name: 'add_notifications_table',
    up: `
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        action_url TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `,
    down: 'DROP TABLE IF EXISTS notifications',
  },
  {
    id: '20260215_006',
    name: 'add_push_subscriptions_table',
    up: `
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        endpoint TEXT NOT NULL UNIQUE,
        keys_p256dh TEXT NOT NULL,
        keys_auth TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `,
    down: 'DROP TABLE IF EXISTS push_subscriptions',
  },
];

// ────────────────────────────────────────────────────────────
// Migration Engine
// ────────────────────────────────────────────────────────────

/**
 * Ensure the migrations tracking table exists.
 */
function ensureMigrationsTable() {
  try {
    execute(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT DEFAULT (datetime('now'))
      )
    `);
  } catch {
    // Table already exists or DB not ready — that's OK
  }
}

/**
 * Get list of already-applied migration IDs.
 */
function getAppliedMigrations() {
  try {
    const rows = query('SELECT id FROM _migrations ORDER BY id');
    return new Set((rows || []).map((r) => r.id));
  } catch {
    return new Set();
  }
}

/**
 * Run all pending migrations.
 * @returns {{ applied: string[], skipped: string[], errors: string[] }}
 */
export function runMigrations() {
  ensureMigrationsTable();
  const applied = getAppliedMigrations();
  const results = { applied: [], skipped: [], errors: [] };

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) {
      results.skipped.push(migration.id);
      continue;
    }

    try {
      // Run the migration
      const statements = migration.up.split(';').filter((s) => s.trim());
      for (const sql of statements) {
        execute(sql);
      }

      // Record it
      execute('INSERT INTO _migrations (id, name) VALUES (?, ?)', [migration.id, migration.name]);

      results.applied.push(migration.id);
      logger.info(`Migration applied: ${migration.id} — ${migration.name}`);
    } catch (err) {
      results.errors.push(`${migration.id}: ${err.message}`);
      logger.error(`Migration failed: ${migration.id}`, { error: err.message });
      // Stop on first error — don't apply out-of-order
      break;
    }
  }

  return results;
}

/**
 * Get migration status.
 */
export function getMigrationStatus() {
  ensureMigrationsTable();
  const applied = getAppliedMigrations();

  return MIGRATIONS.map((m) => ({
    id: m.id,
    name: m.name,
    status: applied.has(m.id) ? 'applied' : 'pending',
  }));
}

/**
 * Add a new migration template to the registry.
 * (In a real system this would write a file. Here it returns the template.)
 */
export function createMigrationTemplate(name) {
  const id =
    new Date().toISOString().slice(0, 10).replace(/-/g, '') +
    '_' +
    String(MIGRATIONS.length + 1).padStart(3, '0');
  return {
    id,
    name,
    template: `
  {
    id: '${id}',
    name: '${name}',
    up: \`
      -- Your SQL here
    \`,
    down: \`
      -- Revert SQL here
    \`,
  },`,
  };
}

export default { runMigrations, getMigrationStatus, createMigrationTemplate, MIGRATIONS };
