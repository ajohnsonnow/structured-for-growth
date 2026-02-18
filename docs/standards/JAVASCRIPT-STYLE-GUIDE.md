# JavaScript / TypeScript Style Guide (P5.6.1)

> Standards for all JS/TS code in Structured for Growth. Based on ECMAScript 2024, TypeScript 5.x, and the Airbnb style base.

---

## Module System

- **Always** use ES Modules (`import`/`export`).
- **Never** use CommonJS (`require`/`module.exports`).
- File extensions: `.js` for JavaScript, `.ts`/`.tsx` for TypeScript.

```javascript
// ✅ Good
import { Router } from 'express';
export default router;

// ❌ Bad
const express = require('express');
module.exports = router;
```

---

## Variables & Constants

| Rule | Example |
|------|---------|
| Use `const` by default | `const PORT = 3000;` |
| Use `let` when reassignment is needed | `let retries = 3;` |
| Never use `var` | — |
| UPPER_SNAKE_CASE for true constants | `const MAX_RETRIES = 3;` |
| camelCase for variables and functions | `const userName = 'admin';` |
| PascalCase for classes and types | `class AppError extends Error {}` |

---

## Functions

- Prefer arrow functions for callbacks, named functions for top-level declarations.
- Always use explicit return types in TypeScript.
- Limit function parameters to 3. Use an options object for more.

```javascript
// ✅ Good — named function for top-level
export function calculateScore(controls, evidence) { ... }

// ✅ Good — arrow for callback
const scores = controls.map((c) => c.score);

// ✅ Good — options object for 3+ params
function createUser({ email, name, role, department }) { ... }

// ❌ Bad — too many positional params
function createUser(email, name, role, department, phone) { ... }
```

---

## Error Handling

- Always use `try/catch` for async operations.
- Throw `AppError` subclasses (from `problemDetails.js`), not raw strings or generic Errors.
- Never swallow errors silently — at minimum, log them.

```javascript
// ✅ Good
import { NotFoundError } from '../lib/problemDetails.js';

const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
if (!user) throw new NotFoundError('User not found');

// ❌ Bad
if (!user) res.status(404).json({ error: 'not found' });
```

---

## Async/Await

- Always use `async/await` over `.then()` chains.
- Always handle rejections — never leave a promise unhandled.

```javascript
// ✅ Good
try {
  const data = await fetchData();
} catch (err) {
  logger.error('Fetch failed', { error: err.message });
}

// ❌ Bad
fetchData().then(data => { ... }); // unhandled rejection
```

---

## Strings

- Use template literals for interpolation: `` `Hello ${name}` ``
- Use single quotes for plain strings: `'hello'`
- No string concatenation with `+`

---

## Comparisons

- Always use strict equality: `===` and `!==`
- Never use loose equality: `==` and `!=`

---

## Comments

- Use JSDoc for all exported functions.
- Use `//` for inline comments, `/** */` for documentation.
- Write comments that explain **why**, not **what**.

```javascript
// ✅ Good — explains WHY
// Retry 3 times because the DB connection pool sometimes drops under load
const MAX_RETRIES = 3;

// ❌ Bad — restates the code
// Set max retries to 3
const MAX_RETRIES = 3;
```

---

## Import Order

Organize imports in this order, with blank lines between groups:

1. Node.js built-ins (`node:path`, `node:fs`)
2. External packages (`express`, `winston`)
3. Internal modules (`../lib/`, `../middleware/`)
4. Relative files (`./helpers.js`)

```javascript
import { readFile } from 'node:fs/promises';

import express from 'express';
import winston from 'winston';

import { query } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

import { formatDate } from './helpers.js';
```

---

## ESLint Configuration

The project uses ESLint with these key rules:

```json
{
  "rules": {
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "curly": ["error", "multi-line"],
    "no-throw-literal": "error",
    "prefer-template": "error",
    "no-eval": "error",
    "no-implied-eval": "error"
  }
}
```

---

## TypeScript-Specific Rules

When writing TypeScript:

- Enable `strict: true` in tsconfig.
- Never use `any` — use `unknown` and narrow with type guards.
- Use interface for object shapes, type for unions/intersections.
- Prefer `readonly` for properties that shouldn't be mutated.

```typescript
// ✅ Good
interface User {
  readonly id: number;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

// ❌ Bad
type User = any;
```
