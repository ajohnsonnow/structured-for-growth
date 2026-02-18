# Error Handling Patterns (P5.6.7)

> How to handle errors correctly in every language used by Structured for Growth. The goal: errors should be **caught, logged, and communicated** — never swallowed, and never leaked to the user.

---

## JavaScript / Node.js (Server)

### The Golden Rule

**Every error path must:**
1. Log the error with context (Winston logger)
2. Return a structured RFC 7807 response to the client
3. Never expose internal details (stack traces, SQL, file paths)

### Pattern: Route Handler

```javascript
import { NotFoundError, ValidationError } from '../lib/problemDetails.js';
import logger from '../lib/logger.js';

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const item = queryOne('SELECT * FROM items WHERE id = ?', [req.params.id]);

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    res.json(item);
  } catch (err) {
    next(err); // Let problemDetailsHandler format the response
  }
});
```

### Pattern: Service Layer

```javascript
export async function processDocument(file) {
  try {
    const parsed = parseFile(file);
    return { success: true, data: parsed };
  } catch (err) {
    logger.error('Document processing failed', {
      file: file.name,
      error: err.message,
      stack: err.stack,
    });
    throw new AppError('Document processing failed', 500);
  }
}
```

### Anti-Patterns

```javascript
// ❌ BAD: Swallowing errors
try { doSomething(); } catch (e) { /* silence */ }

// ❌ BAD: Exposing internals
res.status(500).json({ error: err.message, stack: err.stack });

// ❌ BAD: Generic catch-all without logging
try { ... } catch { res.status(500).json({ error: 'Something went wrong' }); }

// ❌ BAD: Throwing strings
throw 'User not found';  // Use: throw new NotFoundError('User not found')
```

---

## JavaScript (Client / Browser)

### Pattern: Fetch with Error Handling

```javascript
async function fetchData(url) {
  try {
    const res = await fetch(url);

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      throw new Error(problem.title || `HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    // Show user-friendly message
    showToast(err.message || 'Something went wrong. Please try again.');
    console.error('[API Error]', err);
    return null;
  }
}
```

### Pattern: Global Error Boundary

```javascript
// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise]', event.reason);
  event.preventDefault();
});

// Catch uncaught exceptions
window.addEventListener('error', (event) => {
  console.error('[Global Error]', event.error);
});
```

---

## Python

### Pattern: Try/Except with Specific Exceptions

```python
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def load_config(path: Path) -> dict:
    """Load and validate configuration file."""
    try:
        content = path.read_text(encoding="utf-8")
        config = json.loads(content)
    except FileNotFoundError:
        logger.error("Config file not found: %s", path)
        raise
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON in %s: %s", path, e)
        raise ValueError(f"Malformed config: {e}") from e

    # Validate required fields
    required = {"name", "version", "framework"}
    missing = required - config.keys()
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    return config
```

### Anti-Patterns

```python
# ❌ BAD: Bare except
try: ... except: pass

# ❌ BAD: Catching Exception (too broad)
try: ... except Exception: ...

# ❌ BAD: Losing the original traceback
try: ... except ValueError as e: raise RuntimeError(str(e))
# ✅ GOOD: Chain exceptions
try: ... except ValueError as e: raise RuntimeError("Context") from e
```

---

## SQL Error Handling in Application Code

```javascript
// Always wrap DB operations in try/catch
try {
  execute('INSERT INTO evidence (framework, control_id, status) VALUES (?, ?, ?)',
    [framework, controlId, status]
  );
} catch (err) {
  if (err.message.includes('UNIQUE constraint')) {
    throw new ConflictError('Evidence already exists for this control');
  }
  logger.error('DB insert failed', { table: 'evidence', error: err.message });
  throw new AppError('Failed to save evidence', 500);
}
```

---

## Error Classification

| Error Type | HTTP Status | User Message | Log Level |
|-----------|-------------|-------------|-----------|
| Validation | 400 | "Invalid input: [field details]" | warn |
| Authentication | 401 | "Please log in to continue" | warn |
| Authorization | 403 | "You don't have permission" | warn |
| Not Found | 404 | "Resource not found" | info |
| Conflict | 409 | "This resource already exists" | warn |
| Rate Limit | 429 | "Too many requests, try again later" | warn |
| Server Error | 500 | "Something went wrong. Please try again." | error |
| External Service | 502/503 | "Service temporarily unavailable" | error |
