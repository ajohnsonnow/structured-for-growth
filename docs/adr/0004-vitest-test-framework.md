# ADR-0004: Vitest as Test Framework

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-02-01 |
| **Decision Makers** | Core team |
| **P-ID** | P1.3.1 |

## Context

SFG uses Vite as the frontend build tool. We need a JavaScript test framework that supports:

- Unit and integration testing for Express routes (server-side).
- DOM testing for client-side modules (jsdom).
- Accessibility testing via axe-core.
- Coverage reporting with thresholds enforced in CI.
- Fast execution for developer experience.

## Decision

Use **Vitest v4** as the unified test framework for both server and client code.

Key configuration:
- `@vitest/coverage-v8` for code coverage with thresholds (branches 64%, functions/lines/statements 65%).
- `jsdom` environment for client-side tests.
- `supertest` for HTTP integration tests against Express routers.
- `axe-core` for accessibility regression tests.

## Consequences

### Positive

- Native Vite integration—reuses `vite.config.js`, no duplicate config.
- ES module support out of the box—no Babel or CommonJS shimming.
- Fast HMR-based test re-runs during development.
- Compatible with Jest API (`describe`, `it`, `expect`, `vi.mock`) for familiarity.
- Coverage thresholds enforced in CI prevent regression.

### Negative

- Smaller ecosystem than Jest (fewer tutorials, Stack Overflow answers).
- `vi.mock` hoisting behavior differs slightly from Jest's `jest.mock`.

### Risks

- Vitest major version upgrades could break mocking patterns. Mitigated by pinning versions in `package.json`.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Jest | Largest ecosystem, stable | Poor ESM support, requires Babel transforms, slow with Vite projects |
| Mocha + Chai | Flexible, mature | No built-in mocking, requires many plugins |
| Node.js built-in test runner | Zero dependencies | Immature, limited mocking, no coverage thresholds |

## References

- [Vitest documentation](https://vitest.dev/)
- [Vitest migration from Jest](https://vitest.dev/guide/migration.html)
