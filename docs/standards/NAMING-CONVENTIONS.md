# Naming Conventions (P5.6.6)

> Unified naming conventions across all languages and file types in Structured for Growth.

---

## Summary Table

| Element | JavaScript/TS | Python | SQL | CSS | HTML |
|---------|--------------|--------|-----|-----|------|
| Variables | camelCase | snake_case | N/A | N/A | N/A |
| Functions | camelCase | snake_case | N/A | N/A | N/A |
| Constants | UPPER_SNAKE | UPPER_SNAKE | N/A | N/A | N/A |
| Classes | PascalCase | PascalCase | N/A | N/A | N/A |
| File names | camelCase.js | snake_case.py | snake_case.sql | kebab-case.css | kebab-case.html |
| CSS classes | N/A | N/A | N/A | BEM kebab-case | N/A |
| HTML IDs | N/A | N/A | N/A | N/A | camelCase |
| HTML data attrs | N/A | N/A | N/A | N/A | kebab-case |
| DB tables | N/A | N/A | plural snake_case | N/A | N/A |
| DB columns | N/A | N/A | singular snake_case | N/A | N/A |
| Env vars | UPPER_SNAKE | UPPER_SNAKE | N/A | N/A | N/A |
| URLs / routes | kebab-case | kebab-case | N/A | N/A | N/A |

---

## JavaScript / TypeScript

```javascript
// Variables and functions — camelCase
const userName = 'admin';
function getUserById(id) { ... }

// Constants — UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_BASE_URL = '/api/v1';

// Classes and types — PascalCase
class ComplianceEngine { ... }
interface UserProfile { ... }
type FrameworkId = string;

// File names — camelCase
// problemDetails.js, authStore.ts, offlineStore.js

// Boolean variables — is/has/can/should prefix
const isAuthenticated = true;
const hasPermission = checkPermission(user);
const canEdit = user.role === 'admin';
```

---

## Python

```python
# Variables and functions — snake_case
user_name = "admin"
def get_user_by_id(user_id: int) -> User: ...

# Constants — UPPER_SNAKE_CASE
MAX_RETRIES = 3
API_BASE_URL = "/api/v1"

# Classes — PascalCase
class ComplianceEngine:
    pass

# File names — snake_case
# compliance_utils.py, fix_escaping.py
```

---

## SQL

```sql
-- Tables — plural snake_case
CREATE TABLE compliance_evidence (...);
CREATE TABLE user_sessions (...);

-- Columns — singular snake_case
-- id, user_id, created_at, is_active

-- Foreign keys — {singular_table}_id
-- user_id references users(id)

-- Indexes — idx_{table}_{columns}
CREATE INDEX idx_evidence_framework ON compliance_evidence(framework);
```

---

## CSS

```css
/* BEM naming — block__element--modifier */
.card { }
.card__title { }
.card__title--large { }
.nav-menu { }
.nav-menu__item { }
.nav-menu__item--active { }

/* Custom properties — kebab-case */
--color-primary: #2563eb;
--font-size-lg: 1.25rem;
```

---

## HTML

```html
<!-- IDs — camelCase (matches JS getElementById) -->
<div id="liveAnnouncer"></div>
<form id="contactForm"></form>

<!-- Classes — BEM kebab-case -->
<div class="card card--featured">
  <h2 class="card__title">Title</h2>
</div>

<!-- Data attributes — kebab-case -->
<button data-action="submit" data-form-id="contact">Submit</button>
```

---

## API Routes

```
GET    /api/compliance-evidence      (kebab-case, plural)
POST   /api/compliance-evidence
GET    /api/compliance-evidence/:id
PUT    /api/compliance-evidence/:id
DELETE /api/compliance-evidence/:id
GET    /api/user-sessions            (kebab-case, plural)
```

---

## Git

| Element | Convention | Example |
|---------|-----------|---------|
| Branch names | `type/description` | `feature/pwa-offline`, `fix/auth-token-refresh` |
| Commit messages | Conventional Commits | `feat(auth): add biometric login` |
| Tags | Semantic versioning | `v1.7.0` |

### Conventional Commits

```
feat: add PWA offline support
fix: resolve JWT token expiration bug
docs: update API documentation
style: format compliance.css with Prettier
refactor: extract validation schemas
test: add unit tests for evidence API
chore: update dependencies
ci: add Lighthouse CI step
perf: optimize compliance query with index
security: upgrade jsonwebtoken to fix CVE
```
