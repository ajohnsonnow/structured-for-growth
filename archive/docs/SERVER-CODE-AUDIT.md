# Server-Side Code Audit Report

**Date:** 2025-01-14
**Scope:** All files under `server/`, cross-referenced with `tests/`
**Auditor:** Automated deep read of every source file

---

## Executive Summary

The server is a feature-rich Express.js + sql.js (SQLite/WASM) application targeting government/DoD compliance workflows.
The codebase demonstrates strong domain expertise (NIST, FedRAMP, USACE, CUI, Zero Trust) and a solid foundation,
but it contains **several security vulnerabilities**, **architectural inconsistencies**, and **missing authorization controls**
that must be addressed before production deployment in a regulated environment.

| Severity | Count |
|----------|-------|
| **CRITICAL** | 6 |
| **HIGH** | 8 |
| **MEDIUM** | 14 |
| **LOW / INFO** | 12 |

---

## 1. CRITICAL Issues

### 1.1 Backup routes lack admin authorization — any authenticated user can restore or delete the database

**File:** `server/routes/backup.js`
**Lines:** All endpoints use only `authenticateToken`; `requireRole('admin')` is never applied.

Any logged-in user can:
- Download the entire database (`GET /list`, `GET /download/:filename`)
- **Overwrite the database** (`POST /restore`)
- **Delete backup files** (`DELETE /:filename`)
- Export all data (`GET /export`)

**Recommendation:** Add `requireRole('admin')` to every backup route.

---

### 1.2 Path traversal in backup download/delete

**File:** `server/routes/backup.js`
**Lines:** `GET /download/:filename` and `DELETE /:filename` use `req.params.filename` directly in `path.join()` without sanitization.

A request to `GET /api/backup/download/../../server/index.js` can read arbitrary files.

**Recommendation:** Validate filename with `path.basename()` and reject any value containing `..`, `/`, or `\`.

---

### 1.3 SQL injection in `exportDatabase()`

**File:** `server/routes/backup.js:38-42`

```js
for (const table of tables) {
    data.tables[table.name] = query(`SELECT * FROM ${table.name}`);
}
```

Table names from `sqlite_master` are interpolated directly into SQL. A malicious table name (created via
the restore endpoint) could execute arbitrary SQL.

**Recommendation:** Validate table names against `[a-zA-Z0-9_]+` before interpolation, or use bracket-quoting.

---

### 1.4 MFA `/validate` endpoint accepts `userId` without authentication

**File:** `server/routes/mfa.js`
**Lines:** `POST /validate` — no `authenticateToken` middleware.

The endpoint accepts `{ userId, token }` in the body. An attacker can brute-force 6-digit TOTP codes
(only 1,000,000 possibilities with a 30-second window) for **any** user.

**Recommendation:** Either:
1. Require authentication, or
2. Apply aggressive rate-limiting (e.g., 5 attempts per minute per userId).

---

### 1.5 XSS in contact form email — user input unsanitized in HTML

**File:** `server/controllers/contactController.js`

```js
html: `<h2>New Contact Form Submission</h2>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Message:</strong> ${message}</p>`
```

`name`, `email`, and `message` are raw user input interpolated into HTML email.
If the recipient's email client renders HTML, this is a stored XSS vector.

**Recommendation:** Escape HTML entities before interpolation, or use a templating engine with auto-escaping.

---

### 1.6 CSRF protection defined but never applied

**File:** `server/middleware/csrf.js` — `csrfProtection` middleware is exported.
**File:** `server/index.js` — Only `csrfToken` (the token-issuing GET endpoint) is mounted.

The `csrfProtection` middleware that *validates* double-submit cookies is **never applied** to any
state-changing route. All `POST`/`PUT`/`DELETE` routes are unprotected against CSRF when
session cookies are used (e.g., the cookie set on line 138 of index.js).

**Recommendation:** Apply `csrfProtection` middleware before all state-changing API routes, or
remove the cookie-based session if only using Bearer tokens.

---

## 2. HIGH Issues

### 2.1 No tenant isolation / ownership checks on core CRUD routes

| Route file | Path | Issue |
|---|---|---|
| `server/routes/clients.js` | All endpoints | Any authenticated user can read/update/delete **any** client |
| `server/routes/projects.js` | All endpoints | Any user can modify **any** project, task, or time entry |
| `server/routes/messages.js` | All endpoints | Any user can read/delete **any** message |
| `server/routes/campaigns.js` | All endpoints | Any user can CRUD all campaigns, segments, templates |

In a multi-user system, this allows horizontal privilege escalation.

**Recommendation:** Filter all queries by `user_id` or implement a resource-ownership middleware.

---

### 2.2 Error monitor routes missing admin authorization

**File:** `server/routes/error-monitor.js`

All endpoints (`GET /`, `GET /stats`, `GET /:fingerprint`, `POST /:fingerprint/resolve`) use
`authenticateToken` but NOT `requireRole('admin')`. Any authenticated user can view all application
errors (which may contain stack traces, file paths, and user data) and resolve them.

**Recommendation:** Add `requireRole('admin')`.

---

### 2.3 Portal JWT with separate hardcoded secret fallback

**File:** `server/routes/portal.js`

```js
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-portal-secret';
```

The portal has its own independent auth system with a **different** hardcoded fallback from the main
auth (`'dev-only-secret-change-in-production'` in `middleware/auth.js`). In production without
`JWT_SECRET`, both are insecure. Worse, tokens from one system may not be validated by the other,
creating confusion.

**Recommendation:** Centralize JWT secret management; fail-hard in production if `JWT_SECRET` is missing.

---

### 2.4 Portal "first available client" matching fallback

**File:** `server/routes/portal.js`

When a client logs in and the exact email lookup fails, the code falls back to trying the first
available client. This means a user who knows any valid client email can gain access to a
different client's data.

**Recommendation:** Remove the fallback; require exact email matching.

---

### 2.5 Restore endpoint allows arbitrary table data injection

**File:** `server/routes/backup.js`

`POST /restore` accepts a JSON upload and iterates over `tables`, executing `INSERT` statements
for each row. There is no allowlist of valid tables, no schema validation, and no sanitization of
column names/values. Combined with the missing admin check (1.1), this is a full database takeover
vector.

**Recommendation:** Allowlist tables and columns, require admin role, validate against schema.

---

### 2.6 `saveDatabase()` called after every write — performance bottleneck

**File:** `server/models/database.js`

Every `execute()` call triggers `saveDatabase()`, which serializes the entire in-memory SQLite
database to a `Uint8Array`, then writes it to disk via `fs.writeFileSync`. Under any concurrent
load, this will:
- Block the event loop
- Create write-write conflicts
- Degrade performance linearly with database size

**Recommendation:** Debounce saves (e.g., flush every 5 seconds or on process signals), or use
WAL-mode with native SQLite.

---

### 2.7 Activity log CSV export — CSV injection risk

**File:** `server/routes/auth.js`

`GET /activity/export` generates CSV by concatenating values without escaping. Fields starting
with `=`, `+`, `-`, `@` are interpreted as formulas by Excel/Google Sheets.

**Recommendation:** Prefix cell values with a tab character or single-quote when they start with
formula characters; or use a proper CSV library.

---

### 2.8 FedRAMP routes lack authentication

**File:** `server/routes/fedramp.js`

Several routes have **no** `authenticateToken` middleware:
- `GET /ssp`, `GET /ssp/controls`, `GET /ssp/control/:controlId`
- `GET /conmon/dashboard`
- `GET /conmon/poam`
- `POST /conmon/poam`, `PATCH /conmon/poam/:id`
- `POST /conmon/scans`, `GET /conmon/scans`
- `POST /conmon/changes`, `GET /conmon/changes`, `PATCH /conmon/changes/:id/approve`

All ConMon data (vulnerability scans, POA&M items, significant changes) and the SSP are publicly
accessible. Anyone can create/modify POA&M items or approve significant changes.

**Recommendation:** Add `authenticateToken` (and `requireRole('admin')` for mutations) to all routes.

---

## 3. MEDIUM Issues

### 3.1 Dual error class systems — `errors.js` vs `problemDetails.js`

**Files:** `server/lib/errors.js` and `server/lib/problemDetails.js`

Both files define `AppError`, `ValidationError`, `NotFoundError`, etc. Different route files import
from different modules. This creates confusion about which error types to throw and inconsistent
error response formats across the API.

**Recommendation:** Consolidate into a single module. The RFC 7807 `problemDetails.js` approach is more
standards-compliant.

---

### 3.2 Centralized validation schemas defined but unused

**File:** `server/schemas/index.js`

A well-structured centralized validation system is defined with reusable fields and endpoint-specific
schemas. However, **no route file imports it**. Every route defines its own inline `express-validator`
chains, leading to inconsistencies (e.g., password length: 8 in routes, 12 in schemas).

**Recommendation:** Migrate routes to use the centralized schemas.

---

### 3.3 `dbPool.js` utilities unused

**File:** `server/lib/dbPool.js`

Provides `timedQuery`, `timedExecute`, `transaction`, and `dbHealth` — query timing, slow-query
logging, transaction support. None of these are imported by any route file; all routes use raw
`query`/`execute` from `database.js`.

**Recommendation:** Migrate routes to use `dbPool.js` wrappers for observability and transactional
safety.

---

### 3.4 Password requirement inconsistency

| Location | Minimum length |
|---|---|
| `server/routes/auth.js` — register/change-password | 8 characters |
| `server/schemas/index.js` — centralized schemas | 12 characters |

**Recommendation:** Standardize to 12 characters minimum (NIST SP 800-63B recommends ≥ 8, but 12+ is
common for CUI systems per DFARS 252.204-7012).

---

### 3.5 Duplicate `/api/compliance` mount path

**File:** `server/index.js:172,177`

```js
app.use('/api/compliance', complianceRoutes);     // line 172
app.use('/api/compliance', complianceEngineRoutes); // line 177
```

Both routers share the same base path. Express will try both in order, but overlapping paths
(e.g., if both define `GET /`) will yield unpredictable behavior.

**Recommendation:** Mount `complianceEngineRoutes` at `/api/compliance-engine` or merge the routers.

---

### 3.6 `console.error` used alongside structured logger

Approximately 30+ route handlers use `console.error(...)` in catch blocks instead of `logger.error(...)`.
This bypasses Winston's JSON formatting, file transports, and log levels.

**Files affected:** `auth.js`, `clients.js`, `projects.js`, `messages.js`, `campaigns.js`, `portal.js`,
`backup.js`, `demo.js`, `records.js`, `compliance-engine.js`, `mfa.js`

**Recommendation:** Replace all `console.error` with structured `logger.error`.

---

### 3.7 Missing input validation on several endpoints

| Route | Endpoint | Missing validation |
|---|---|---|
| `projects.js` | `PUT /:projectId/tasks/:taskId` | No validation middleware at all |
| `campaigns.js` | `PUT /templates/:id` | No validation middleware |
| `messages.js` | `POST /bulk` | No limit on `client_ids` array size |
| `campaigns.js` | `POST /:id/send` | No rate limiting |
| `clients.js` | `GET /` | `parseInt(limit)` without NaN check |
| `records.js` | `PUT /:id` | No express-validator; relies on destructuring defaults |

---

### 3.8 `readyz` health check does not test database connectivity

**File:** `server/index.js`

```js
app.get('/readyz', async (req, res) => {
    if (typeof initializeDatabase === 'function') { ... }
});
```

This checks whether `initializeDatabase` is a function (always true) rather than actually querying
the database. The readiness check will report healthy even when the database is corrupt or unavailable.

**Recommendation:** Execute `SELECT 1` or use `dbPool.dbHealth()`.

---

### 3.9 Accessibility: SQL injection risk in trend query

**File:** `server/routes/accessibility.js`

```js
WHERE created_at >= datetime('now', '-${parseInt(days)} days')
```

While `parseInt()` provides some protection, directly interpolating into the SQL template string
is a risky pattern. If `days` is `NaN`, the query becomes invalid.

**Recommendation:** Use parameterized query with `?`.

---

### 3.10 SMTP `secure: false` hardcoded

**File:** `server/controllers/contactController.js`

```js
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    ...
});
```

Email credentials are sent in plaintext. This is acceptable only for local development.

**Recommendation:** Use `secure: true` for port 465, or rely on STARTTLS (which nodemailer does
by default on 587 without `secure: false`).

---

### 3.11 Task-project relationship not validated

**File:** `server/routes/projects.js`

`PUT /:projectId/tasks/:taskId` does not verify that the task with `:taskId` actually belongs to
the project with `:projectId`. A user can update any task by guessing the taskId.

**Recommendation:** Add `WHERE project_id = ? AND id = ?` to the update query.

---

### 3.12 In-memory session store in Zero Trust middleware

**File:** `server/middleware/zeroTrust.js`

Session tracking (`ztSessions` Map) is in-memory. In a multi-instance deployment (e.g., Render
auto-scaling), sessions will not be shared across instances. Additionally, all session data is
lost on restart.

**Recommendation:** Use the database or a shared store (Redis) for Zero Trust sessions.

---

### 3.13 Demo clear route uses unsanitized table names

**File:** `server/routes/demo.js`

```js
for (const table of tablesToClear) {
    const result = execute(`DELETE FROM ${table} WHERE is_demo = 1`);
}
```

Although `tablesToClear` is a hardcoded array (safe), the pattern of interpolating table names into SQL
is fragile. Future edits could introduce injection.

**Recommendation:** Use parameterized approaches or assert table names against an allowlist.

---

### 3.14 `logActivity` call signature mismatch in FedRAMP routes

**File:** `server/routes/fedramp.js`

```js
logActivity(req.user?.id, 'poam_create', `Created POA&M: ${poamId}`);
```

`logActivity` in `database.js` expects `(userId, action, entityType, entityId, details)` — 5 parameters.
FedRAMP routes pass only 3 parameters, making `entityType` equal to the details string and `entityId`
and `details` undefined.

**Recommendation:** Pass all 5 parameters correctly.

---

## 4. LOW / INFORMATIONAL Issues

### 4.1 Hardcoded API version in api-docs.js

**File:** `server/routes/api-docs.js:45`

```js
version: '1.4.8',
```

The OpenAPI spec version is hardcoded. It will inevitably drift from `package.json`.

**Recommendation:** Import version from `package.json`.

---

### 4.2 Non-deterministic admin password in database seed

**File:** `server/models/database.js`

```js
const adminHash = await bcrypt.hash(`admin_secure_${Date.now()}`, SALT_ROUNDS);
```

The seeded admin password is unknowable after creation because it includes `Date.now()`.

**Recommendation:** Use a fixed default password (documented for first-login change) or a
seed-admin script.

---

### 4.3 Missing JSDoc on many route handlers

These route files have **no** function-level JSDoc on most handlers:
- `clients.js`, `projects.js`, `messages.js`, `campaigns.js`, `portal.js`, `backup.js`, `demo.js`

The `server/lib/ai/` files are exemplary — all functions have full JSDoc with `@param` and `@returns`.

---

### 4.4 No request body size limit for backup restore / AI prompts

**File:** `server/index.js`

```js
app.use(express.json({ limit: '10mb' }));
```

10 MB is very generous for most API endpoints and may enable DoS attacks, especially on the
backup restore and AI prompt endpoints.

**Recommendation:** Apply per-route body size limits.

---

### 4.5 Missing `try/catch` in some async handlers

Several async route handlers (e.g., `accessibility.js` scan submission, `usace.js` data loaders,
`fedramp.js` SSP endpoints) do not wrap their logic in try/catch. Unhandled rejections will crash
the process in newer Node.js versions.

---

### 4.6 TODO / Incomplete features

| File | Line | Note |
|---|---|---|
| `contactController.js` | — | Fallback to `console.log` when SMTP not configured |
| `middleware/csrf.js` | — | CSRF protection middleware defined but never wired |
| `fedramp.js` SSP controls | — | `IR-6` marked as `planned` |
| `compliance-engine.js` | — | Evidence file upload field accepted but not stored to disk |

---

### 4.7 `req.user.userId` vs `req.user.id` inconsistency

Route handlers inconsistently access the authenticated user ID:
- `auth.js`, `records.js`, `mfa.js` → `req.user.userId`
- `usace.js`, `accessibility.js`, `ai.js` → `req.user.id`

This depends on how the JWT payload is structured. If both exist, one may be wrong.

**Recommendation:** Standardize to a single property name.

---

### 4.8 Segment deletion doesn't check campaign references

**File:** `server/routes/campaigns.js`

`DELETE /segments/:id` deletes a segment without checking if any campaign references it via
`segment_id`. This can create orphaned foreign key references.

---

### 4.9 AI cost tracker data is in-memory only

**File:** `server/lib/ai/costTracker.js`

All AI usage data (token counts, costs, budget limits) is stored in `Map` objects. Data is lost on
every restart.

**Recommendation:** Persist to the database alongside the JSONL audit trail.

---

### 4.10 Bulk message has no array size limit

**File:** `server/routes/messages.js`

`POST /bulk` accepts `client_ids` array without a size limit. Sending to thousands of clients in a
single request will block the event loop.

**Recommendation:** Cap `client_ids` (e.g., maximum 100 per request).

---

### 4.11 Output filter `replace()` only replaces first match

**File:** `server/lib/ai/guardrails.js`

```js
filtered = filtered.replace(pattern, '[REDACTED]');
```

`String.replace` with a regex without the `g` flag only replaces the first occurrence. Multiple
secrets in a single output would leave subsequent ones unredacted.

**Recommendation:** Use `filtered.replaceAll(pattern, '[REDACTED]')` or add the `g` flag.

---

### 4.12 Swagger UI loaded from CDN — integrity not verified

**File:** `server/routes/api-docs.js`

```html
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
```

No `integrity` or `crossorigin` attributes. A compromised CDN could inject scripts into the admin
documentation page.

**Recommendation:** Add SRI hashes or self-host Swagger UI.

---

## 5. Test Coverage Cross-Reference

### Routes with test files

| Route file | Test file | Status |
|---|---|---|
| `auth.js` | `tests/routes/auth.test.js` | ✅ Covered |
| `backup.js` | `tests/routes/backup.test.js` | ✅ Covered |
| `clients.js` | `tests/routes/clients.test.js` | ✅ Covered |
| `compliance-engine.js` | `tests/routes/compliance-engine.test.js` | ✅ Covered |
| `compliance.js` | `tests/routes/compliance.test.js` | ✅ Covered |
| `contact.js` | `tests/routes/contact.test.js` | ✅ Covered |
| `demo.js` | `tests/routes/demo.test.js` | ✅ Covered |
| `mbai.js` | `tests/routes/mbai.test.js` | ✅ Covered |
| `messages.js` + `campaigns.js` | `tests/routes/messages-campaigns.test.js` | ✅ Covered |
| `mfa.js` | `tests/routes/mfa.test.js` | ✅ Covered |
| `portal.js` | `tests/routes/portal.test.js` | ✅ Covered |
| `projects.js` | `tests/routes/projects.test.js` | ✅ Covered |
| `records.js` | `tests/routes/records.test.js` | ✅ Covered |

### Routes WITHOUT test files — ❌

| Route file | Lines of code | Domain |
|---|---|---|
| `ai.js` | 407 | AI orchestration, doc gen, gap analysis, reviews, cost |
| `usace.js` | 606 | USACE/DoD templates, SF298, CDRL, MIL-STD-498, NEPA |
| `accessibility.js` | 491 | A11y dashboard, scans, remediation, VPAT |
| `fedramp.js` | 882 | FedRAMP SSP, ConMon, POA&M, scans, changes |
| `api-docs.js` | 1784 | OpenAPI spec (data file, low risk) |
| `error-monitor.js` | ~60 | Error viewing (has `tests/server/errorMonitor.test.js` for lib) |

### Libraries WITHOUT test files

| Library file | Lines | Domain |
|---|---|---|
| `lib/ai/orchestrator.js` | 356 | Multi-agent orchestration |
| `lib/ai/guardrails.js` | 300 | Prompt injection defense, output filtering |
| `lib/ai/auditTrail.js` | 215 | AI interaction logging |
| `lib/ai/humanReview.js` | 351 | Review queue management |
| `lib/ai/costTracker.js` | 284 | Token usage & budget |
| `lib/ai/evaluation.js` | 291 | Model evaluation framework |
| `lib/problemDetails.js` | 230 | RFC 7807 errors |
| `lib/errors.js` | 209 | Custom error hierarchy |
| `lib/dbPool.js` | 165 | Query timing & transactions |
| `lib/envConfig.js` | 203 | Environment validation |
| `lib/cui.js` | 248 | CUI marking system |

### Middleware test coverage

| Middleware | Test file | Status |
|---|---|---|
| `auth.js` | `tests/middleware/auth.test.js` | ✅ Covered |
| `csrf.js` | — | ❌ **Untested** |
| `pivCac.js` | — | ❌ **Untested** |
| `requestId.js` | — | ❌ **Untested** |
| `zeroTrust.js` | — | ❌ **Untested** |

---

## 6. Architecture Observations

### Strengths
1. **Domain expertise** — NIST, FedRAMP, USACE, CUI controls are detailed and standards-accurate
2. **AI layer** — Well-designed multi-agent system with guardrails, audit trail, human review, cost tracking
3. **Structured logging** — Winston with module labels, security event helpers, file rotation
4. **RFC 7807 support** — problemDetails.js provides standards-compliant error responses
5. **Zero Trust design** — NIST SP 800-207 trust scoring with multiple factors
6. **PIV/CAC support** — Full HSPD-12 / FIPS 201 implementation for DoD environments
7. **Comprehensive OpenAPI spec** — 1,784-line documentation of all endpoints

### Architectural Debt
1. **Two parallel error systems** that should be merged
2. **Centralized validation defined but not adopted** by any route
3. **Query timing/pooling layer built but not used** by any route
4. **In-memory stores** for Zero Trust sessions, AI cost tracking, and error monitoring (not production-ready for multi-instance)
5. **No database migration for route-created tables** — Routes like `fedramp.js`, `records.js`, `accessibility.js`, `usace.js` create their own tables via `ensureTables()` rather than using the migration system

---

## 7. Recommended Priority Actions

1. **Immediately**: Add `requireRole('admin')` to `backup.js`, `error-monitor.js` routes; add `authenticateToken` to all `fedramp.js` routes
2. **Immediately**: Sanitize `filename` in backup download/delete (path traversal fix)
3. **Immediately**: Fix MFA `/validate` — add auth or rate-limiting
4. **Short-term**: Add ownership/tenant isolation to `clients.js`, `projects.js`, `messages.js`, `campaigns.js`
5. **Short-term**: Wire CSRF protection or remove the cookie on line 138 of index.js
6. **Short-term**: Replace all `console.error` with `logger.error`
7. **Medium-term**: Consolidate `errors.js` + `problemDetails.js` into one module
8. **Medium-term**: Adopt centralized `schemas/index.js` and `dbPool.js` across all routes
9. **Medium-term**: Debounce `saveDatabase()` calls
10. **Medium-term**: Add test coverage for `ai.js`, `usace.js`, `accessibility.js`, `fedramp.js`, and all `lib/ai/` modules
