# SQL Coding Standards (P5.6.3)

> Standards for all SQL in Structured for Growth (SQLite via sql.js). Covers DDL, DML, naming, and security.

---

## General Rules

- Use **uppercase** for SQL keywords: `SELECT`, `INSERT`, `WHERE`, `CREATE TABLE`.
- Use **snake_case** for table and column names.
- End every statement with a semicolon.
- Use parameterized queries — **never** concatenate user input into SQL.

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Tables | Plural snake_case | `users`, `compliance_evidence` |
| Columns | Singular snake_case | `user_id`, `created_at` |
| Primary keys | `id` | `id INTEGER PRIMARY KEY` |
| Foreign keys | `{table_singular}_id` | `user_id`, `framework_id` |
| Booleans | `is_` or `has_` prefix | `is_active`, `has_mfa` |
| Timestamps | `_at` suffix | `created_at`, `updated_at` |
| Indexes | `idx_{table}_{columns}` | `idx_users_email` |

---

## Table Definitions

```sql
-- ✅ Good
CREATE TABLE IF NOT EXISTS compliance_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  framework TEXT NOT NULL,
  control_id TEXT NOT NULL,
  status TEXT DEFAULT 'not-started'
    CHECK (status IN ('not-started', 'in-progress', 'implemented', 'not-applicable')),
  evidence TEXT,
  assessed_by TEXT,
  assessed_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_compliance_evidence_framework
  ON compliance_evidence(framework);
```

---

## Parameterized Queries (CRITICAL)

This is a **security requirement**, not a style preference. SQL injection is CWE-89 and OWASP A03.

```javascript
// ✅ GOOD — parameterized
const user = queryOne('SELECT * FROM users WHERE id = ?', [userId]);

// ✅ GOOD — multiple params
const rows = query(
  'SELECT * FROM evidence WHERE framework = ? AND status = ?',
  [framework, status]
);

// ❌ NEVER DO THIS — SQL injection vulnerability
const user = queryOne(`SELECT * FROM users WHERE id = ${userId}`);
const user = queryOne('SELECT * FROM users WHERE id = ' + userId);
```

---

## Query Formatting

For multi-line queries, align keywords:

```sql
SELECT
  u.id,
  u.email,
  u.role,
  COUNT(e.id) AS evidence_count
FROM users u
LEFT JOIN compliance_evidence e ON e.assessed_by = u.username
WHERE u.role IN ('admin', 'editor')
  AND u.is_active = 1
GROUP BY u.id
HAVING evidence_count > 0
ORDER BY evidence_count DESC
LIMIT 50;
```

---

## Timestamps

- Store as ISO 8601 text: `datetime('now')` in SQLite.
- Always store UTC.
- Column names: `created_at`, `updated_at`, `deleted_at`.

---

## Migrations

- Every schema change goes through the migration framework (`server/migrations/`).
- Never modify production tables with ad-hoc SQL.
- Always write both `up` and `down` migrations.
- Migration names: `YYYYMMDD_NNN_description.js`

---

## Performance

- Add indexes for columns used in `WHERE`, `JOIN`, and `ORDER BY`.
- Use `EXPLAIN QUERY PLAN` to verify index usage.
- Prefer `EXISTS` over `IN` for subqueries.
- Limit result sets: always use `LIMIT` for user-facing queries.
