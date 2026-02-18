# AI Coding Assistant Configuration Guidelines (P5.5.8)

> How to get the best results from GitHub Copilot, Cursor, and other AI assistants when working on Structured for Growth.

---

## Project Context

This project is a **Node.js ESM + Express 4** web application for government compliance consulting. Key characteristics:

- **Module system:** ES Modules (`import`/`export`, not `require`/`module.exports`)
- **Database:** sql.js (SQLite in-memory/file), with raw SQL helpers (`query()`, `execute()`, `queryOne()`)
- **Frontend:** Vanilla JS + Vite (no React/Vue on the web client)
- **Auth:** JWT with refresh rotation, `authenticateToken` and `requireRole` middleware
- **Validation:** express-validator with centralized schemas
- **Error handling:** RFC 7807 Problem Details (`AppError`, `ValidationError`, etc.)
- **Route pattern:** Lazy table init via `ensureTables()` in router-level middleware
- **Target audience:** Federal government (DoD, USACE) — compliance, CUI, accessibility

---

## Copilot / Cursor Instructions

Place these in your `.github/copilot-instructions.md` or Cursor rules:

```
You are working on "Structured for Growth", a Node.js ESM + Express 4 compliance platform.

Architecture rules:
1. ALWAYS use ES module syntax (import/export), never CommonJS (require/module.exports)
2. Database: use query(), queryOne(), execute() from server/models/database.js — NOT knex, prisma, or sequelize
3. Auth: use authenticateToken and requireRole middleware from server/middleware/auth.js
4. Errors: throw AppError subclasses from server/lib/problemDetails.js — never res.status(500).json({error})
5. Routes: use the ensureTables() lazy init pattern for any route that creates tables
6. Validation: use express-validator chains from server/schemas/index.js
7. Frontend: vanilla JS with ES modules — no React, Vue, or jQuery on the web client
8. CSS: use existing CSS custom properties from main.css
9. Touch targets: minimum 44x44px for all interactive elements (Section 508)
10. All user-facing text must be plain language (Plain Writing Act)
```

---

## Common Patterns & Examples

### Creating a new API route

```javascript
// Use this pattern — AI should always generate routes like this
import { Router } from 'express';
import { query, execute } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
let _tablesReady = false;

async function ensureTables() {
  if (_tablesReady) return;
  execute(`CREATE TABLE IF NOT EXISTS ... `);
  _tablesReady = true;
}

router.use(async (req, res, next) => {
  await ensureTables();
  next();
});

router.get('/', authenticateToken, async (req, res) => { ... });

export default router;
```

### Error handling

```javascript
// GOOD — use RFC 7807 errors
import { NotFoundError, ValidationError } from '../lib/problemDetails.js';

if (!user) throw new NotFoundError('User not found');

// BAD — never do this
res.status(404).json({ error: 'Not found' });
```

### Database queries

```javascript
// GOOD — use the helper functions
import { query, queryOne, execute } from '../models/database.js';

const users = query('SELECT * FROM users WHERE role = ?', ['admin']);
const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
execute('INSERT INTO logs (action) VALUES (?)', ['login']);

// BAD — don't use ORMs or raw db access
import knex from 'knex'; // NO
```

---

## Things to Avoid

| Don't | Instead |
|-------|---------|
| `require()` / `module.exports` | `import` / `export` |
| `var` | `const` or `let` |
| `console.log` in production code | Use `winston` logger |
| Inline CSS `style="..."` | Use CSS classes |
| `onclick="..."` in HTML attributes | `addEventListener()` in JS |
| ORM imports (Knex, Prisma, Sequelize) | `query()`/`execute()` helpers |
| React/Vue components in web client | Vanilla JS with ES modules |
| `any` type annotations (if using TS) | Proper types |
| Hardcoded secrets | Environment variables via `env()` |

---

## Compliance Considerations

When generating code for this project, always consider:

1. **Accessibility (WCAG 2.1 AA):** All UI must be keyboard navigable, have proper ARIA labels, and meet color contrast ratios
2. **CUI markings:** Any document display or print function needs CUI banner support
3. **Audit logging:** Security-relevant actions must be logged via `logActivity()`
4. **Input validation:** All user input must be validated server-side
5. **Error messages:** Never expose internal details in error responses
