# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.2] - 2026-02-17

### Fixed

- **Cross-Browser Compatibility** — Added `-webkit-backdrop-filter` prefix for Safari support in skills controls bar
- **CSS `color-mix()` Fallbacks** — Replaced `color-mix()` with rgba fallbacks in skills card hover and journey outcome for Chrome < 111 compat
- **Print CSS** — Replaced Firefox-unsupported `orphans`/`widows` with universally-supported `break-inside: avoid`
- **Offline Page** — Added missing `apple-touch-icon` link; moved inline styles to `<style>` block (webhint `no-inline-styles`)
- **ESLint Warnings** — Removed unused `activeView` and `catMap` variables from `client/js/skills.js`
- **GitHub Actions** — Fixed `dast.yml` JWT_SECRET context access warning by using static CI test value
- **TypeScript Configs** — Enabled `forceConsistentCasingInFileNames` in `desktop/tsconfig.json` and `mobile/tsconfig.json`

### Changed

- **`meta[name=theme-color]`** — Removed from all 9 HTML pages to eliminate Firefox/Opera compat warnings (PWA manifest still provides theme color)
- **COMPREHENSIVE-DEVELOPMENT-PLAN.md** — Updated Critical Gaps section with completion status
  for all 7 original blockers; updated Risk Register with 6 resolved risks;
  corrected framework/template counts (12/33)
- **README.md** — Corrected API table from "10 frameworks" to "12 frameworks"
- **package.json** — Added missing npm scripts: `db:seed`, `generate:nist53`, `generate:nist171`

### Removed (Archived)

- **`scripts/audit-codebase.js`** — Orphaned static analysis script (not in `package.json`). Moved to `archive/scripts/`
- **`codeql_db/`** — Untracked 337 generated CodeQL database files from git (already in `.gitignore`)

### Security

- `.gitignore` updated to also exclude `sbom.json` (generated artifact, should not be committed)

### Stats

- ESLint: 0 errors, 0 warnings
- Tests: 511 passing across 48 files
- Audit: 109 passed / 3 warnings / 0 errors
- Production build: 43 modules, all pages compiled

---

## [1.8.1] - 2026-02-15

### Fixed

- **Dev-Mode Page Rendering** — Express now serves `/styles`, `/js`, and `/assets` statically in development so pages render with full CSS on port 3000
- **Dev-Mode Page Routes** — Added server-side routes for all 9 sub-pages
  (`/templates`, `/compliance`, `/skills`, `/glossary`, `/docs`, `/mbai`, `/portal`, `/dashboard`, `/offline`)
  plus SPA fallback for unknown routes
- **Version References** — Updated stale `1.4.8` references to `1.8.1` across API docs, health endpoint, README, VPAT, Trusted Tester Checklist, and Comprehensive Development Plan
- **Framework Count** — Updated from "10 frameworks" to "12 frameworks" (added NIST 800-53, NIST 800-171r3) with 651+ controls across index.html and README
- **Template Count** — Updated CLIENT-GUIDE.md from "16+" to "33" production-ready templates

### Added

- **Page Rendering Integrity Audit** — 6 new checks in `scripts/audit.js`:
  - All CSS files referenced in HTML exist on disk
  - Core stylesheets (main.css, tokens.css, nav.css, components.css) exist and aren't empty
  - Every HTML page links all core stylesheets
  - Vite build config includes all pages in rollup inputs
  - Express has routes for all pages (dev + prod)
  - Dev-mode static CSS serving is configured

### Stats

- ESLint: 0 errors, 0 warnings
- Tests: 511 passing across 48 files
- Audit: 110 passed / 3 warnings / 0 errors
- Pages render with full styling on both ports (3000 dev, 5173 Vite)

---

## [1.8.0] - 2026-02-15

### Changed

- **ESLint Flat Config Migration** — Migrated from `.eslintrc.json` to `eslint.config.js` for ESLint v10 compatibility
- **Route Mount Separation** — Separated `compliance-engine` to `/api/compliance-engine` (was shadowing `/api/compliance`)
- **Coverage Thresholds** — Tests at 511 passing across 48 files
- **`.env.example`** — Expanded from 11 to 41 documented env vars with organized sections

### Fixed

- **747 ESLint Errors** — Auto-fixed 395, manually resolved 352 (no-undef globals, eqeqeq, curly, unused vars)
- **innerHTML Security** — Added sanitizer acknowledgments to 7 client files
- **HTML Meta Tags** — Added OG tags, canonical URLs, skip links to `mbai.html` and `offline.html`

### Removed (Archived)

- **Dead module: `server/schemas/index.js`** — Centralized validation schemas (never imported by any route). Moved to `archive/server/schemas/`
- **Dead module: `server/lib/dbPool.js`** — Database connection manager wrapper (all routes use `models/database.js` directly). Moved to `archive/server/lib/`
- **Dead module: `server/lib/cui.js`** — Server-side CUI marking system (client-side modules handle CUI rendering). Moved to `archive/server/lib/`
- **Stale audit docs archived** — `AUDIT-REPORT.md`, `CLIENT-JS-AUDIT.md`, `SERVER-CODE-AUDIT.md` moved to `archive/docs/`

### Security

- `.gitignore` updated to exclude `audit-report.json` and `codeql_db/` (generated artifacts)
- 2 intentional warnings documented: `compliance.js` and `mbai.js` routes are public-facing by design (no auth required)

### Wiring Audit

- 20/20 route files registered and mounted
- 6/6 middleware files wired in correct order
- 49/49 frontend API calls map to valid server endpoints
- Static serving + SPA fallback properly configured
- 3 dead modules archived (schemas, dbPool, CUI)

---

## [1.7.0] - 2026-02-16

### Added

- **NIST SP 800-53 Rev 5 Complete Catalog (P3.4.4)**
  - Expanded from 60 to 322 base controls across all 20 families
  - Added missing PT (PII Processing and Transparency) family — 8 controls
  - Each control includes baseline applicability (Low/Moderate/High), category, and automation capability
  - Generator script (`scripts/generate-nist-800-53.js`) for reproducible catalog builds

- **NIST SP 800-171 Rev 3 Complete Catalog (P3.4.5)**
  - Expanded from 47 to 115 security requirements across 17 families
  - Full NIST 800-53 cross-references for every requirement
  - Detailed implementation guidance, evidence requirements, and automation capability per control
  - Generator script (`scripts/generate-nist-800-171r3.js`) for reproducible catalog builds

- **Audit Log Viewer — Search, Filter, Export (P3.1.6)**
  - Search bar for filtering by username, action type, or details text
  - Dropdown filters for action type and user (auto-populated from data)
  - Date range filtering (start/end date pickers)
  - Pagination with previous/next navigation and result count
  - CSV and JSON export with current filter state preserved
  - Server-side query building with parameterized SQL (no injection risk)
  - 4 new tests covering search, filter, CSV export, and JSON export

### Fixed

- **Accessibility (P2.2.5)**
  - `compliance.html`: Fixed heading-order violation — modal `<h3>` changed to `<h2>` for proper nesting
  - `mbai.html`: Removed redundant `aria-label` on `<h2 id="mbaiModalTitle">` (was duplicating heading text)
  - Updated Trusted Tester Checklist — marked known issues as resolved
  - Updated Baseline 4 (Bypass Blocks) — landmark region issue marked fixed
  - Updated Baseline 13 (Content Structure) — heading-order marked passing on all 7 pages

---

## [1.6.0] - 2026-02-15

### Added

- **Error Monitoring System (P3.1.7)**
  - Self-hosted error tracking library with fingerprint-based deduplication
  - In-memory ring buffer (last 1,000 errors) + JSONL file persistence
  - Rate limiting (max 100 distinct errors/minute) to prevent log flooding
  - Breadcrumb middleware for tracking actions before errors
  - Admin API endpoints: GET/PATCH /api/errors, /api/errors/stats
  - Error resolution workflow (mark errors resolved, auto-reopen on recurrence)
  - 12 unit tests covering capture, dedup, resolve, stats

- **DAST Scanning (P3.2.2)**
  - OWASP ZAP baseline scan GitHub Actions workflow (.github/workflows/dast.yml)
  - ZAP rule configuration file (.zap/rules.tsv) with tuned severity levels
  - SARIF upload to GitHub Security tab for unified vulnerability view
  - Weekly scheduled scan + manual trigger support

- **Document Version Control (P3.3.5)**
  - Version snapshot system for record metadata (record_versions table)
  - Automatic version creation on record updates (pre-save snapshots)
  - Manual version checkpoint endpoint (POST /api/records/:id/versions)
  - Version listing (GET /api/records/:id/versions)
  - Version snapshot retrieval (GET /api/records/:id/versions/:version)
  - Field-level diff between any two versions (GET /api/records/:id/diff/:v1/:v2)
  - Tracks title, description, category, classification, CUI, and metadata changes
  - 8 new route tests for version control endpoints
  - Standard: MIL-HDBK-61A Configuration Management

- **Health Check Endpoints (P5.1.6)**
  - /healthz — basic liveness probe (Kubernetes-compatible)
  - /livez — liveness with timestamp
  - /readyz — readiness probe with dependency checks
  - /api/health — enhanced with uptime, memory usage, and environment info

### Changed

- Coverage thresholds raised from 64-65% to 80% (branches, functions, lines, statements)
- Total test count increased to 305 across 24 test files
- Error handling pipeline now includes monitoring middleware before response handler

## [1.5.0] - 2025-01-XX

### Added

- **Testing Infrastructure (P1.1)**
  - Vitest test framework with 68 unit/integration tests
  - Test helpers for authenticated requests and mock database
  - ESLint + Prettier configuration with consistent code style
  - lint-staged + Husky for pre-commit quality checks
  - Code coverage with v8 provider (60% threshold)
  - `npm run ci` pipeline script (lint → test → build)

- **Security Hardening (P1.2)**
  - Content Security Policy (CSP) headers with strict directives
  - JWT secret fail-fast in production (no hardcoded fallback)
  - CSRF protection via double-submit cookie pattern
  - Secure cookie flags (httpOnly, sameSite, secure in prod)
  - Request body size limits (1MB)
  - Graceful server shutdown (SIGTERM/SIGINT with 10s timeout)

- **Accessibility Improvements (P1.3)**
  - Skip-to-content links on dashboard and portal pages
  - ARIA landmarks (role="navigation", role="main", role="banner")
  - aria-hidden on decorative emoji icons
  - aria-live announcer region for dynamic content updates
  - aria-label on unread message badge
  - role="dialog" and aria-modal on portal login modal

- **API Documentation (P2.5)**
  - OpenAPI 3.0 specification covering all endpoints
  - Swagger UI served at `/api/docs`
  - OpenAPI JSON available at `/api/docs/openapi.json`

- **CUI Marking System (P2.1)**
  - CUI banner and portion marking generation
  - NARA CUI Registry category support
  - Distribution Statements A through F and X
  - Designation indicator block generation
  - Print header/footer marking helpers
  - CUI metadata schema for document enrichment
  - Client-side CUI banner component

- **Structured Logging (P3.1)**
  - Winston-based structured JSON logging
  - Request correlation IDs (X-Request-Id header)
  - HTTP access logging with timing
  - Security event logging helper
  - File transports in production (error.log, combined.log, security.log)

- **Advanced Security (P3.2)**
  - TOTP-based Multi-Factor Authentication (MFA)
  - QR code provisioning for authenticator apps
  - MFA enable/disable and verification endpoints

- **Records Management (P3.3)**
  - Document metadata tracking with retention schedules
  - Legal hold management
  - Disposition logging and audit trail
  - NARA retention schedule support

- **Supply Chain Security (P2.3)**
  - CycloneDX SBOM generation (`npm run sbom`)

- **CI/CD Pipeline**
  - GitHub Actions workflow (lint → test → build → audit)
  - Node.js 18.x and 20.x matrix testing
  - Dependency caching for fast builds

### Changed

- `server/index.js` — Major security overhaul with CSP, CSRF, body limits, structured logging
- `server/middleware/auth.js` — Removed hardcoded JWT fallback, exported `getJwtSecret()`
- `server/routes/auth.js` — Uses centralized `getJwtSecret()` instead of inline fallback

### Security

- Eliminated hardcoded JWT secret (`'your-secret-key'`) from all code paths
- Added CSP headers to prevent XSS and data injection attacks
- CSRF protection for all state-changing API requests
- Body size limits protect against payload-based DoS

## [1.4.8] - Previous Release

### Features

- Admin dashboard with client, project, and campaign management
- Client portal with project views and messaging
- Contact form with validation
- Backup and restore system
- Demo data generation
- GoatCounter analytics integration
- MBAI template system
- Compliance framework tracking
