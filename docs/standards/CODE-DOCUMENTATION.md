# Code Documentation Standards (P5.6.8)

> How to document code across all languages. Based on JSDoc, PEP 257, and the principle: **document the why, not the what**.

---

## Principles

1. **Every exported function** must have a documentation comment.
2. **Every file** must have a header comment explaining its purpose.
3. **Complex logic** gets inline comments explaining *why*, not *what*.
4. **Types serve as documentation** — annotate parameters and return values.

---

## JavaScript (JSDoc)

### File Header

```javascript
/**
 * @file problemDetails.js — RFC 7807 Problem Details error handling.
 *
 * Provides structured error classes and Express middleware that
 * converts thrown errors into RFC 7807 JSON responses. This is
 * the single place where error formatting happens, so all routes
 * can just `throw new NotFoundError(...)` and the middleware
 * handles the rest.
 */
```

### Function Documentation

```javascript
/**
 * Calculate the SPRS (Supplier Performance Risk System) score
 * based on NIST 800-171 control assessments.
 *
 * The score starts at 110 (all controls met) and deducts
 * weighted points for each unmet control. See NIST SP 800-171A
 * for the scoring methodology.
 *
 * @param {Array<{controlId: string, status: string, weight: number}>} controls
 *   Array of assessed controls with their current status.
 * @param {Object} [options]
 * @param {boolean} [options.includePending=false] Whether to count
 *   "in-progress" controls as partial credit (50% weight).
 * @returns {number} SPRS score between -203 and 110.
 * @throws {ValidationError} If controls array is empty.
 *
 * @example
 * const score = calculateSprsScore([
 *   { controlId: 'AC.1.001', status: 'implemented', weight: 5 },
 *   { controlId: 'AC.1.002', status: 'not-implemented', weight: 3 },
 * ]);
 * // => 107
 */
export function calculateSprsScore(controls, options = {}) { ... }
```

### Quick Reference

| Tag | Usage |
|-----|-------|
| `@param {Type} name` | Function parameter |
| `@returns {Type}` | Return value |
| `@throws {ErrorType}` | Exceptions thrown |
| `@example` | Usage example |
| `@see` | Related function/doc |
| `@deprecated` | Marked for removal |
| `@typedef` | Custom type definition |
| `@type {Type}` | Variable type |

---

## Python (Google-style Docstrings)

### Module Header

```python
"""NIST 800-171 Rev 3 control data generator.

Generates the complete NIST 800-171 Rev 3 control catalog in JSON format
for use by the compliance engine. Maps controls to CMMC levels and
provides cross-references to 800-53.

Usage:
    python generate-nist-800-171r3.py > data/compliance/nist-800-171r3.json
"""
```

### Function Documentation

```python
def calculate_sprs_score(
    controls: list[dict[str, str]],
    include_pending: bool = False,
) -> int:
    """Calculate the SPRS score from control assessments.

    The score starts at 110 (all controls met) and deducts weighted
    points for each unmet control per NIST SP 800-171A methodology.

    Args:
        controls: List of control dictionaries with keys:
            - control_id (str): NIST control identifier
            - status (str): 'implemented', 'not-implemented', or 'in-progress'
            - weight (int): Point value from the scoring table
        include_pending: If True, counts in-progress controls at 50% weight.

    Returns:
        SPRS score between -203 and 110.

    Raises:
        ValueError: If controls list is empty.

    Example:
        >>> calculate_sprs_score([
        ...     {"control_id": "AC.1.001", "status": "implemented", "weight": 5},
        ...     {"control_id": "AC.1.002", "status": "not-implemented", "weight": 3},
        ... ])
        107
    """
```

---

## SQL

```sql
-- ================================================================
-- Migration: 20250101_004_user_sessions
-- Purpose:   Track active sessions for concurrent login limits
--            and audit trail (NIST AC-2, AC-7).
-- ================================================================

-- Session tracking table — one row per active login.
-- Rows are cleaned up by the session reaper (runs every 15 min).
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,         -- SHA-256 of the JWT (never store raw tokens)
  ip_address TEXT,                  -- For audit trail
  user_agent TEXT,                  -- For device identification
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL          -- Session TTL
);
```

---

## CSS

```css
/* ─── Card Component ──────────────────────────────────────────
 * Flexible card layout used on dashboard, templates, and
 * compliance pages. Supports optional image header and
 * action footer. Touch targets are 48px minimum for
 * Section 508 compliance.
 * ─────────────────────────────────────────────────────────── */
```

---

## When NOT to Comment

```javascript
// ❌ Don't restate the code
const count = items.length; // Get the length of items

// ❌ Don't comment obvious variable names
const isActive = user.status === 'active'; // Check if user is active

// ✅ DO explain business logic
// SPRS deducts 5 points for unmet AC.1.001 per NIST SP 800-171A Table 1
score -= control.weight;

// ✅ DO explain workarounds
// sql.js doesn't support ALTER TABLE DROP COLUMN, so we
// recreate the table without the column and copy data over
```
