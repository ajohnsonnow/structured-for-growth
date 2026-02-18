# Archived Server Modules

These modules were identified as dead code during the v1.7.1 audit and archived on 2026-02-15.

## Why Archived (Not Deleted)

Each module is well-written and may be adopted in a future sprint. They were built ahead of integration that never happened.

## Modules

### `lib/dbPool.js` — Database Connection Manager

- **Purpose:** Wraps `sql.js` queries with timing, slow-query logging, transactions, and health checks.
- **Why unused:** All routes import `query`/`queryOne`/`execute` directly from `models/database.js`.
- **To adopt:** Replace direct database imports in route files with `timedQuery`/`timedExecute` from this module.

### `lib/cui.js` — CUI Marking System

- **Purpose:** Banner marking, portion marking, designation indicators, and distribution statements per 32 CFR 2002.
- **Why unused:** Client-side CUI modules (`client/js/modules/cuiBanner.js`, `cuiConfig.js`) handle all CUI rendering. Route files store CUI as DB column values, not via this module's functions.
- **Note:** Referenced in compliance docs (SSP-TEMPLATE.md, NIST-800-171-ASSESSMENT.md) as evidence of CUI capability. The client-side implementation satisfies the same requirement.

### `schemas/index.js` — Centralized Validation Schemas

- **Purpose:** Reusable express-validator chains for all API endpoints, with RFC 7807 error formatting.
- **Why unused:** Every route file defines inline validation using `body()`/`param()` from express-validator directly.
- **To adopt:** Import `schemas.login`, `schemas.createClient`, etc. in route files to DRY up validation.
