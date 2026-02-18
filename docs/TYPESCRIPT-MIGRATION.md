# TypeScript Migration Plan (P5.5.10)

> A step-by-step plan to progressively migrate Structured for Growth from JavaScript to TypeScript with strict mode, without breaking the running product.

---

## Why Migrate?

TypeScript catches bugs **before** they reach production. In a government compliance platform, type safety isn't a luxury — it prevents the kind of data-handling mistakes that cause compliance failures.

**Concrete benefits for this project:**
- Catch missing/wrong database column names at edit time
- Ensure API response shapes match what the frontend expects
- Self-documenting interfaces for compliance frameworks, CUI categories, etc.
- Better refactoring confidence when changes span many files

---

## Migration Strategy: "Progressive Strictness"

> Don't try to convert everything at once. Instead, work from the outside in.

### Phase 1: Foundation (Week 1-2)

1. **Install TypeScript** as a dev dependency: `npm i -D typescript @types/node @types/express`
2. **Create `tsconfig.json`** with relaxed settings initially:
   ```json
   {
     "compilerOptions": {
       "target": "ESNext",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "allowJs": true,
       "checkJs": false,
       "strict": false,
       "noEmit": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "resolveJsonModule": true,
       "outDir": "./dist",
       "rootDir": "."
     },
     "include": ["server/**/*", "client/js/**/*"],
     "exclude": ["node_modules", "coverage", "dist"]
   }
   ```
3. **Add a `typecheck` script** to `package.json`: `"typecheck": "tsc --noEmit"`
4. **Add typecheck to CI** as a non-blocking warning (don't fail builds yet)

### Phase 2: Type Definitions (Week 2-3)

Create type definitions for existing JavaScript in a `types/` directory:

```typescript
// types/database.d.ts
export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface ComplianceEvidence {
  id: number;
  framework: string;
  control_id: string;
  status: 'not-started' | 'in-progress' | 'implemented' | 'not-applicable';
  evidence: string;
  assessor: string;
  assessed_at: string;
}

// ... etc for all database tables
```

### Phase 3: Convert Shared Libraries First (Week 3-5)

Rename these files from `.js` to `.ts` (they have fewer dependencies):

1. `server/lib/problemDetails.js` → `.ts`
2. `server/lib/envConfig.js` → `.ts`
3. `server/lib/dbPool.js` → `.ts`
4. `server/schemas/index.js` → `.ts`
5. `server/lib/ai/guardrails.js` → `.ts`
6. `server/lib/ai/costTracker.js` → `.ts`

**Key rule:** These files have the fewest import dependencies, so converting them first is low-risk.

### Phase 4: Convert Middleware (Week 5-6)

1. `server/middleware/auth.js` → `.ts`
2. `server/middleware/zeroTrust.js` → `.ts`
3. `server/middleware/pivCac.js` → `.ts`

### Phase 5: Convert Routes (Week 6-10)

Convert routes one at a time, starting with the simplest:

1. `server/routes/health.js` → `.ts`
2. `server/routes/records.js` → `.ts`
3. `server/routes/compliance-engine.js` → `.ts`
4. `server/routes/accessibility.js` → `.ts`
5. `server/routes/usace.js` → `.ts`
6. `server/routes/ai.js` → `.ts`
7. `server/routes/fedramp.js` → `.ts`

### Phase 6: Enable Strict Mode (Week 10-12)

Once all server files are converted:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Phase 7: Client-Side (Week 12+)

Convert `client/js/` modules — these are vanilla JS, so they'll need browser-compatible types.

---

## Build Pipeline Changes

### Option A: Type-check only (recommended for ESM)

Keep `.js` files, use JSDoc annotations for types, and run `tsc --noEmit` for checking only. No compilation step needed because Node.js runs the JS directly.

```json
// package.json
"scripts": {
  "typecheck": "tsc --noEmit",
  "lint": "eslint . && npm run typecheck"
}
```

### Option B: Full compilation

If converting to `.ts` files, add a build step:

```json
"scripts": {
  "build:server": "tsc -p tsconfig.server.json",
  "dev": "tsx watch server/index.ts"
}
```

Use `tsx` for development (instant TypeScript execution) and `tsc` for production builds.

---

## File-by-File Priority Queue

| Priority | File | Lines | Complexity | Notes |
|----------|------|-------|------------|-------|
| 1 | `server/lib/problemDetails.js` | ~120 | Low | Pure logic, zero DB |
| 2 | `server/lib/envConfig.js` | ~150 | Low | Validation schema, pure |
| 3 | `server/lib/dbPool.js` | ~100 | Low | Wraps query() |
| 4 | `server/schemas/index.js` | ~200 | Medium | Validation chains |
| 5 | `server/middleware/auth.js` | ~100 | Medium | JWT + Express types |
| 6 | `server/routes/records.js` | ~150 | Medium | CRUD + DB |
| 7 | `server/routes/compliance-engine.js` | ~400 | High | Complex queries |
| 8 | `server/routes/ai.js` | ~300 | High | Agent orchestration |
| 9 | `server/index.js` | ~200 | High | App bootstrap |
| 10 | `client/js/*.js` | varies | Medium | Browser context |

---

## Gotchas to Watch

1. **sql.js returns plain objects** — you'll need type assertions when reading from the DB
2. **Express middleware typing** — use `RequestHandler` type or manual `(req: Request, res: Response, next: NextFunction)` signatures
3. **ESM + TypeScript** — keep `"type": "module"` in `package.json`, use `"moduleResolution": "bundler"` in tsconfig
4. **Vite handles client TS natively** — no extra config needed for `client/js/` files
5. **Tests stay as .js** — Vitest handles both JS and TS seamlessly
