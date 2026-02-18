# Security Coding Checklist (P5.6.10)

> Language-specific secure coding patterns based on OWASP Top 10, CWE Top 25, and NIST 800-53 SI/SC control families. Every developer should internalize these before writing code that handles user input, authentication, or sensitive data.

---

## JavaScript / Node.js Server

### Injection Prevention (CWE-89, CWE-79)

```javascript
// ✅ Parameterized query — the ONLY acceptable pattern
const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);

// ❌ NEVER concatenate user input into SQL
const user = queryOne(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ HTML output encoding (server-side templates)
import { escapeHtml } from '../lib/sanitize.js';
res.send(`<p>${escapeHtml(userInput)}</p>`);

// ❌ NEVER inject raw user input into HTML
res.send(`<p>${userInput}</p>`);
```

### Authentication & Session (CWE-287, CWE-384)

```javascript
// ✅ Constant-time comparison for tokens/hashes
import crypto from 'node:crypto';

function safeCompare(a, b) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// ✅ Password hashing with bcrypt (cost factor ≥ 12)
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// ✅ JWT configuration
const token = jwt.sign(payload, secret, {
  expiresIn: '15m',      // Short-lived access tokens
  algorithm: 'HS256',    // Explicit algorithm
  issuer: 'sfg-api',     // Restrict token scope
});

// ❌ NEVER use jwt.decode() for auth — it skips verification
// ❌ NEVER set expiresIn to more than 1 hour for access tokens
```

### Input Validation (CWE-20)

```javascript
// ✅ Validate at the boundary (route handler)
import { body, param, validationResult } from 'express-validator';

router.post('/templates',
  body('name').isString().trim().isLength({ min: 1, max: 200 }),
  body('category').isIn(['contract', 'report', 'memo', 'plan']),
  body('content').isString().isLength({ max: 50_000 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  templateController.create
);

// ✅ Validate file uploads
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new ValidationError('Unsupported file type');
}
if (file.size > MAX_SIZE) {
  throw new ValidationError('File exceeds 10 MB limit');
}
```

### Secrets Management (CWE-798)

```javascript
// ✅ Load from environment, validate on startup
import { env } from '../lib/envConfig.js';
const secret = env('JWT_SECRET'); // Throws if missing

// ✅ .env.example documents required vars WITHOUT values
// JWT_SECRET=
// DB_ENCRYPTION_KEY=

// ❌ NEVER hardcode secrets
const secret = 'my-super-secret-key-12345';  // CWE-798

// ❌ NEVER commit .env files — they're in .gitignore
```

### Error Information Leakage (CWE-209)

```javascript
// ✅ Production errors hide internals
if (process.env.NODE_ENV === 'production') {
  // Return generic message to client
  res.status(500).json({
    type: 'https://structuredforgrowth.com/errors/internal',
    title: 'Internal Server Error',
    status: 500,
  });
} else {
  // Development: include stack trace
  res.status(500).json({ ...error, stack: error.stack });
}

// ❌ NEVER expose stack traces, SQL errors, or file paths in production
```

### HTTP Security Headers

```javascript
// ✅ Helmet provides sensible defaults — already configured
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],          // No inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"], // CSS only
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],     // Clickjacking protection
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

---

## JavaScript / Browser Client

### DOM Manipulation (CWE-79)

```javascript
// ✅ Use textContent for user-generated text
element.textContent = userInput;

// ✅ Use DOM APIs to build elements
const li = document.createElement('li');
li.textContent = item.name;
list.appendChild(li);

// ❌ NEVER use innerHTML with user data
element.innerHTML = userInput;  // XSS vulnerability

// ✅ If HTML is required, sanitize with DOMPurify
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(richTextContent);
```

### Sensitive Data in Client

```javascript
// ❌ NEVER store secrets in localStorage (accessible to any script)
localStorage.setItem('token', jwt);  // XSS can steal this

// ✅ Prefer httpOnly cookies for auth tokens (set server-side)
// ✅ If localStorage is required (PWA), clear on logout
window.addEventListener('beforeunload', () => {
  sessionStorage.clear();
});

// ❌ NEVER log sensitive data to console
console.log('User password:', password);  // Visible in DevTools
```

### Third-Party Scripts

```javascript
// ✅ Use Subresource Integrity (SRI) for CDN scripts
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-abc123..."
        crossorigin="anonymous"></script>

// ✅ Prefer self-hosted copies over CDN for compliance environments
// ✅ Audit all third-party scripts for data exfiltration
```

---

## Python

### Injection (CWE-78, CWE-89)

```python
# ✅ Parameterized queries
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))

# ❌ NEVER use f-strings or .format() in SQL
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")

# ✅ Subprocess with list arguments (no shell=True)
import subprocess
subprocess.run(["ls", "-la", directory], check=True)

# ❌ NEVER use shell=True with user input
subprocess.run(f"ls -la {directory}", shell=True)  # CWE-78

# ❌ NEVER use eval(), exec(), or __import__() with user data
```

### File Operations

```python
import os
from pathlib import Path

# ✅ Validate file paths to prevent traversal (CWE-22)
UPLOAD_DIR = Path("/app/uploads").resolve()

def safe_path(filename: str) -> Path:
    """Resolve path and verify it's within UPLOAD_DIR."""
    target = (UPLOAD_DIR / filename).resolve()
    if not str(target).startswith(str(UPLOAD_DIR)):
        raise ValueError("Path traversal detected")
    return target
```

### Cryptography

```python
# ✅ Use high-level libraries
from cryptography.fernet import Fernet
key = Fernet.generate_key()
cipher = Fernet(key)

# ✅ Use secrets module for tokens (not random)
import secrets
token = secrets.token_urlsafe(32)

# ❌ NEVER use random module for security purposes
import random
token = random.randint(0, 999999)  # Predictable! CWE-330
```

---

## SQL / Database

### Access Control

```sql
-- ✅ Principle of least privilege: app user gets minimal permissions
-- CREATE USER app_user WITH PASSWORD '...';
-- GRANT SELECT, INSERT, UPDATE ON templates TO app_user;
-- REVOKE DELETE ON users FROM app_user;

-- ✅ Row-level security: always filter by user context
SELECT * FROM templates WHERE org_id = ? AND deleted_at IS NULL;

-- ❌ NEVER return all rows without tenant/user filter
SELECT * FROM templates;  -- Data leak across organizations
```

### Sensitive Data Storage

```sql
-- ✅ Hash passwords — never store plaintext (CWE-256)
-- The application layer handles bcrypt hashing

-- ✅ Encrypt PII at rest
-- token_hash stores SHA-256, never the raw token

-- ✅ Audit columns on sensitive tables
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,        -- bcrypt hash
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT,
  failed_login_count INTEGER DEFAULT 0,
  locked_until TEXT                    -- Account lockout (NIST AC-7)
);
```

---

## Dependency Security

### npm

```bash
# ✅ Audit regularly
npm audit

# ✅ Generate SBOM for compliance
npx @cyclonedx/cyclonedx-npm --output-file sbom.json

# ✅ Pin exact versions in production
npm install --save-exact express@4.21.2

# ✅ Use lockfile (package-lock.json committed)
# ✅ Review new dependencies before adding
```

### Pre-commit Checks

```bash
# ✅ Scan for secrets before committing
# (configured in .husky/pre-commit)
npx secretlint "**/*"

# ✅ Common patterns to block:
# - AWS keys: AKIA[0-9A-Z]{16}
# - Private keys: -----BEGIN (RSA|EC|DSA) PRIVATE KEY-----
# - Generic secrets: password\s*=\s*['"][^'"]+
# - Connection strings: mongodb://.*:.*@
```

---

## OWASP Top 10 Quick Reference

| # | Risk | Our Mitigation |
|---|------|----------------|
| A01 | Broken Access Control | `authenticateToken` + `requireRole` middleware, row-level filters |
| A02 | Cryptographic Failures | bcrypt passwords, JWT HS256, HTTPS enforced |
| A03 | Injection | Parameterized queries everywhere, express-validator |
| A04 | Insecure Design | Threat model in ADRs, security review checklist |
| A05 | Security Misconfiguration | Helmet CSP, env validation on startup, `.env.example` |
| A06 | Vulnerable Components | `npm audit`, CycloneDX SBOM, Dependabot alerts |
| A07 | Auth Failures | Short JWT TTL, refresh rotation, account lockout |
| A08 | Data Integrity Failures | CSRF tokens, SRI for scripts, signed updates |
| A09 | Logging Failures | Winston structured logging, audit trail, SIEM-ready |
| A10 | SSRF | No user-controlled URLs in server requests |

---

## CWE Top 25 Mapping

| CWE | Name | Language | Checklist Item |
|-----|------|----------|---------------|
| CWE-79 | Cross-site Scripting | JS Client | Use `textContent`, DOMPurify |
| CWE-89 | SQL Injection | JS/Python | Parameterized queries only |
| CWE-78 | OS Command Injection | Python | No `shell=True` with user input |
| CWE-20 | Improper Input Validation | All | express-validator at boundary |
| CWE-22 | Path Traversal | Python/Node | `resolve()` + prefix check |
| CWE-287 | Improper Authentication | JS Server | bcrypt + JWT + middleware |
| CWE-798 | Hardcoded Credentials | All | Environment variables only |
| CWE-862 | Missing Authorization | JS Server | `requireRole()` on every route |
| CWE-209 | Error Info Leak | JS Server | Generic errors in production |
| CWE-330 | Weak Randomness | Python | `secrets` module, not `random` |
