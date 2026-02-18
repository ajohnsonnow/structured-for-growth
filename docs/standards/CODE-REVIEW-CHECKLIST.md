# Code Review Checklist (P5.6.9)

> Structured review process per IEEE 730 SQA. Every pull request must pass all **Required** items. **Recommended** items are best-effort.

---

## How to Use This Checklist

1. **Author** self-reviews against this checklist before requesting review.
2. **Reviewer** works through each section, checking items that pass.
3. Any **Required** item that fails blocks the merge.
4. Comments reference this checklist by item number (e.g., "See CR-SEC-3").

---

## 1. Correctness (CR-COR)

| # | Check | Priority |
|---|-------|----------|
| CR-COR-1 | Code does what the PR description claims | Required |
| CR-COR-2 | Edge cases handled (empty arrays, null, zero, max values) | Required |
| CR-COR-3 | No off-by-one errors in loops or slicing | Required |
| CR-COR-4 | Async operations properly awaited (no floating promises) | Required |
| CR-COR-5 | Error paths tested — what happens when things fail? | Required |
| CR-COR-6 | Database queries return expected shape | Recommended |
| CR-COR-7 | No hardcoded values that should be configurable | Recommended |

---

## 2. Security (CR-SEC)

| # | Check | Priority |
|---|-------|----------|
| CR-SEC-1 | No secrets, tokens, or passwords in code | Required |
| CR-SEC-2 | SQL queries use parameterized statements (`?` placeholders) | Required |
| CR-SEC-3 | User input validated and sanitized before use | Required |
| CR-SEC-4 | Authentication checked on all protected routes | Required |
| CR-SEC-5 | Authorization checked — user can only access their own data | Required |
| CR-SEC-6 | No `eval()`, `Function()`, or `innerHTML` with user data | Required |
| CR-SEC-7 | Sensitive data not logged (passwords, tokens, SSNs, PII) | Required |
| CR-SEC-8 | CSRF token validated on state-changing requests | Required |
| CR-SEC-9 | Rate limiting on authentication and sensitive endpoints | Recommended |
| CR-SEC-10 | Dependencies checked for known vulnerabilities | Recommended |

---

## 3. Performance (CR-PERF)

| # | Check | Priority |
|---|-------|----------|
| CR-PERF-1 | No N+1 query patterns (queries inside loops) | Required |
| CR-PERF-2 | Database queries have appropriate indexes mentioned | Recommended |
| CR-PERF-3 | Large datasets paginated (not returned all at once) | Required |
| CR-PERF-4 | No blocking operations on the main thread/event loop | Required |
| CR-PERF-5 | Expensive computations cached where appropriate | Recommended |
| CR-PERF-6 | Assets (images, fonts) optimized for size | Recommended |
| CR-PERF-7 | No memory leaks (event listeners cleaned up, intervals cleared) | Recommended |

---

## 4. Accessibility (CR-A11Y)

| # | Check | Priority |
|---|-------|----------|
| CR-A11Y-1 | Interactive elements are keyboard accessible | Required |
| CR-A11Y-2 | Images have meaningful `alt` text (or `alt=""` for decorative) | Required |
| CR-A11Y-3 | Form inputs have associated `<label>` elements | Required |
| CR-A11Y-4 | Color contrast meets WCAG 2.1 AA (4.5:1 text, 3:1 large/UI) | Required |
| CR-A11Y-5 | ARIA attributes used correctly (roles, states, properties) | Required |
| CR-A11Y-6 | Focus order is logical and visible | Required |
| CR-A11Y-7 | Dynamic content changes announced to screen readers | Required |
| CR-A11Y-8 | Touch targets ≥ 48×48px on mobile | Required |
| CR-A11Y-9 | No content conveyed by color alone | Required |
| CR-A11Y-10 | Page works at 200% zoom without horizontal scroll | Recommended |

---

## 5. Code Quality (CR-QUAL)

| # | Check | Priority |
|---|-------|----------|
| CR-QUAL-1 | Follows project naming conventions (see NAMING-CONVENTIONS.md) | Required |
| CR-QUAL-2 | No commented-out code | Required |
| CR-QUAL-3 | No `console.log` left in production code (use Winston logger) | Required |
| CR-QUAL-4 | Functions are ≤ 50 lines; files are ≤ 400 lines | Recommended |
| CR-QUAL-5 | DRY — no copy-pasted logic that should be shared | Recommended |
| CR-QUAL-6 | Single responsibility — each function does one thing | Recommended |
| CR-QUAL-7 | Imports organized per style guide order | Recommended |
| CR-QUAL-8 | ESLint/Prettier pass with zero warnings | Required |

---

## 6. Testing (CR-TEST)

| # | Check | Priority |
|---|-------|----------|
| CR-TEST-1 | New code has corresponding tests | Required |
| CR-TEST-2 | Tests cover happy path and at least one error path | Required |
| CR-TEST-3 | Tests are deterministic (no random failures, no time-dependent) | Required |
| CR-TEST-4 | Test names describe the behavior being verified | Recommended |
| CR-TEST-5 | No test code in production files | Required |
| CR-TEST-6 | Integration tests for new API endpoints | Required |
| CR-TEST-7 | Coverage does not decrease from current baseline | Recommended |

---

## 7. Documentation (CR-DOC)

| # | Check | Priority |
|---|-------|----------|
| CR-DOC-1 | All exported functions have JSDoc/docstring comments | Required |
| CR-DOC-2 | Complex business logic has explanatory comments | Required |
| CR-DOC-3 | API changes reflected in OpenAPI spec / api-docs.js | Required |
| CR-DOC-4 | README updated if setup steps changed | Required |
| CR-DOC-5 | CHANGELOG.md updated for user-facing changes | Recommended |
| CR-DOC-6 | ADR created for significant architecture decisions | Recommended |

---

## 8. Compliance (CR-COMP)

| # | Check | Priority |
|---|-------|----------|
| CR-COMP-1 | CUI markings preserved in document generation | Required |
| CR-COMP-2 | Audit trail entries created for data changes | Required |
| CR-COMP-3 | Session timeout enforced (≤ 15 min per NIST AC-12) | Required |
| CR-COMP-4 | Failed login attempts logged (NIST AU-2) | Required |
| CR-COMP-5 | New dependencies have acceptable licenses (MIT, Apache-2.0, ISC, BSD) | Required |
| CR-COMP-6 | SBOM regenerated if dependencies changed | Recommended |

---

## PR Description Template

```markdown
## What Changed
<!-- One paragraph explaining the change -->

## Why
<!-- Link to issue/ticket, or explain the motivation -->

## How to Test
<!-- Steps for the reviewer to verify -->

## Checklist
- [ ] Self-reviewed against Code Review Checklist
- [ ] Tests added/updated
- [ ] No lint warnings
- [ ] Documentation updated
```
