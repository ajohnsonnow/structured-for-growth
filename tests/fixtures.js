// cspell:disable
/**
 * Centralized Test Fixtures
 *
 * All test credentials, secrets, and mock data live here so they
 * can be swapped via environment variables in CI/CD without touching tests.
 *
 * Usage:
 *   import { TEST_CREDENTIALS, TEST_SECRETS, TEST_MFA } from '../fixtures.js';
 */

/* ── Secrets & Keys ──────────────────────────────────────── */

export const TEST_SECRETS = Object.freeze({
  jwtSecret: process.env.TEST_JWT_SECRET || 'test-jwt-secret-e7a1b2c3d4',
  portalJwtSecret: process.env.TEST_PORTAL_JWT_SECRET || 'test-portal-jwt-secret-f8e9d0c1b2',
});

/* ── User Credentials ────────────────────────────────────── */

export const TEST_CREDENTIALS = Object.freeze({
  admin: {
    username: 'testadmin',
    email: process.env.TEST_ADMIN_EMAIL || 'admin@test.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'Str0ngT3st!',
    role: 'admin',
  },
  user: {
    username: 'testuser',
    email: process.env.TEST_USER_EMAIL || 'user@test.com',
    password: process.env.TEST_USER_PASSWORD || 'Us3rP@ss!',
    role: 'user',
  },
  client: {
    username: 'clientuser',
    email: process.env.TEST_CLIENT_EMAIL || 'client@test.com',
    password: process.env.TEST_CLIENT_PASSWORD || 'Cl13nt!Pass',
    role: 'client',
  },
  /** Used for registration tests where a "new" user is needed */
  newUser: {
    username: 'newadmin',
    email: 'new@test.com',
    password: process.env.TEST_NEW_PASSWORD || 'N3wP@ssword!',
  },
  /** Deliberately invalid/wrong credentials for negative tests */
  invalid: {
    email: 'notanemail',
    password: 'short',
    wrongPassword: process.env.TEST_WRONG_PASSWORD || 'wr0ng-pa$$word',
    badToken: 'invalid.token.here',
  },
  /** Existing/duplicate user for conflict tests */
  existing: {
    username: process.env.TEST_EXISTING_USERNAME || 'test-duplicate-user',
    email: process.env.TEST_EXISTING_EMAIL || 'existing@test.com',
  },
  /** First registered user (becomes admin) */
  firstUser: {
    username: process.env.TEST_FIRST_USERNAME || 'test-first-user',
  },
  /** Non-existent user for 401/404 tests */
  nonExistent: {
    username: process.env.TEST_NONEXISTENT_USERNAME || 'test-no-such-user',
  },
  /** Disabled account for lockout tests */
  disabled: {
    username: process.env.TEST_DISABLED_USERNAME || 'test-disabled-user',
  },
});

/* ── MFA Fixtures ────────────────────────────────────────── */

export const TEST_MFA = Object.freeze({
  /** TOTP seed used as the MFA temporary secret */
  totpSeed: process.env.TEST_MFA_SECRET || 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRLD',
  validToken: '123456',
  invalidToken: '000000',
});

/* ── Mock Tokens (session tests) ─────────────────────────── */

// Test-only mock values — not real credentials; safe to commit (Snyk HardcodedNonCryptoSecret/test)
export const TEST_TOKENS = Object.freeze({
  accessToken: process.env.TEST_ACCESS_TOKEN ?? 'MOCK_ACCESS_FIXTURE',
  refreshToken: process.env.TEST_REFRESH_TOKEN ?? 'MOCK_REFRESH_FIXTURE',
  newAccess: process.env.TEST_NEW_ACCESS ?? 'MOCK_NEW_ACCESS_FIXTURE',
  newRefresh: process.env.TEST_NEW_REFRESH ?? 'MOCK_NEW_REFRESH_FIXTURE',
  oldValid: process.env.TEST_OLD_VALID ?? 'MOCK_OLD_VALID_FIXTURE',
  badRefresh: process.env.TEST_BAD_REFRESH ?? 'MOCK_BAD_REFRESH_FIXTURE',
  toRevoke: process.env.TEST_REVOKE_TOKEN ?? 'MOCK_REVOKE_TOKEN_FIXTURE',
  someRefresh: process.env.TEST_SOME_REFRESH ?? 'MOCK_SOME_REFRESH_FIXTURE',
});

/* ── Contact / Form Fixtures ─────────────────────────────── */

export const TEST_CONTACT = Object.freeze({
  validEmail: 'test@test.com',
  clientEmail: 'new@client.com',
});

/* ── Portal-specific Test Data ───────────────────────────── */

export const TEST_PORTAL = Object.freeze({
  /** Intentionally bad credentials for 401 tests */
  badUser: process.env.TEST_PORTAL_BAD_USER || 'bad-portal-user',
  badPass: process.env.TEST_PORTAL_BAD_PASS || 'bad-portal-pass',
  /** Username for a user who exists but has no linked client account */
  noClientUser: process.env.TEST_NO_CLIENT_USER || 'no-client-portal-user',
});

/* ── Mock Values (non-secret test doubles) ───────────────── */

export const TEST_MOCKS = Object.freeze({
  /** Fake bcrypt hash for mock DB rows — intentionally not a real hash */
  bcryptHash: '$2b$10$mockhashfortestingonly.placeholder',
});

/* ── Password Change Fixtures ────────────────────────────── */

export const TEST_PASSWORD_CHANGE = Object.freeze({
  current: process.env.TEST_OLD_PASSWORD || '0ldP@ssw0rd!',
  next: process.env.TEST_NEW_PASSWORD_CHANGE || 'n3wS3cure!23',
});
