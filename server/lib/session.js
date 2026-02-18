/**
 * Session Management — Refresh Token Rotation & Revocation
 *
 * Implements OWASP Session Management recommendations:
 * - Short-lived access tokens (15 min)
 * - Long-lived refresh tokens (7 days) with rotation
 * - Token family tracking for replay detection
 * - Revocation on logout / password change
 *
 * NIST SP 800-63B Digital Identity Guidelines:
 * - Reauthentication for sensitive operations
 * - Session binding to authenticated identity
 */

import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { queryOne, execute, logActivity } from '../models/database.js';
import { getJwtSecret } from '../middleware/auth.js';

/** Access token lifespan (short). */
const ACCESS_TOKEN_EXPIRY = '15m';

/** Refresh token lifespan (long). */
const REFRESH_TOKEN_DAYS = 7;

/**
 * Ensure the refresh_tokens table exists.
 * Call once during server startup after `initializeDatabase()`.
 */
export function initSessionTable(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT UNIQUE NOT NULL,
      family TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      revoked INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Index for fast lookup
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_refresh_token_hash ON refresh_tokens(token_hash)
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_refresh_token_family ON refresh_tokens(family)
  `);
}

/**
 * Generate a cryptographically random opaque token (base64url).
 * @returns {string} 48-byte random token encoded as base64url
 */
function generateOpaqueToken() {
  return crypto.randomBytes(48).toString('base64url');
}

/**
 * SHA-256 hash a token for safe storage.
 * We never store the raw refresh token — only its hash.
 * @param {string} token
 * @returns {string}
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Issue a new access token + refresh token pair.
 *
 * @param {Object} user  — { id, username, email, role }
 * @param {string} [family] — token family ID (for rotation); omit for new session
 * @returns {{ accessToken: string, refreshToken: string, expiresIn: number }}
 */
export function issueTokenPair(user, family) {
  // Short-lived access token (JWT)
  const accessToken = jwt.sign(
    { userId: user.id, username: user.username, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );

  // Long-lived opaque refresh token
  const refreshToken = generateOpaqueToken();
  const tokenHash = hashToken(refreshToken);
  const tokenFamily = family || crypto.randomUUID();

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000).toISOString();

  execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, family, expires_at)
     VALUES (?, ?, ?, ?)`,
    [user.id, tokenHash, tokenFamily, expiresAt]
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 900, // 15 minutes in seconds
  };
}

/**
 * Rotate a refresh token — invalidate the old one, issue a new pair.
 * Implements token family replay detection per OWASP.
 *
 * If a previously-used refresh token is presented (replay attack),
 * the entire token family is revoked.
 *
 * @param {string} oldRefreshToken — the raw refresh token from the client
 * @returns {{ accessToken: string, refreshToken: string, expiresIn: number, user: Object } | null}
 */
export function rotateRefreshToken(oldRefreshToken) {
  const tokenHash = hashToken(oldRefreshToken);

  const row = queryOne(
    `SELECT rt.*, u.id as uid, u.username, u.email, u.role, u.is_active
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = ?`,
    [tokenHash]
  );

  if (!row) {
    // Token not found — possible stolen token or already used
    return null;
  }

  // Check if token was already revoked (replay detection)
  if (row.revoked) {
    // Revoke entire family — attacker may have the family
    execute('UPDATE refresh_tokens SET revoked = 1 WHERE family = ?', [row.family]);
    return null;
  }

  // Check expiry
  if (new Date(row.expires_at) < new Date()) {
    execute('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [row.id]);
    return null;
  }

  // Check user is still active
  if (!row.is_active) {
    execute('UPDATE refresh_tokens SET revoked = 1 WHERE family = ?', [row.family]);
    return null;
  }

  // Revoke the old token (mark as used)
  execute('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?', [row.id]);

  // Issue new pair in the same family
  const user = { id: row.uid, username: row.username, email: row.email, role: row.role };
  const tokens = issueTokenPair(user, row.family);

  return { ...tokens, user };
}

/**
 * Revoke all refresh tokens for a user (logout / password change / account disable).
 * @param {number} userId
 * @param {string} [reason] — for audit logging
 * @param {string} [ip]
 */
export function revokeAllUserTokens(userId, reason = 'LOGOUT', ip = null) {
  execute('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ? AND revoked = 0', [userId]);
  logActivity(userId, 'TOKEN_REVOKE', 'user', userId, `All tokens revoked: ${reason}`, ip);
}

/**
 * Revoke a single refresh token by its raw value.
 * @param {string} rawToken
 */
export function revokeSingleToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  execute('UPDATE refresh_tokens SET revoked = 1 WHERE token_hash = ?', [tokenHash]);
}

/**
 * Clean up expired / revoked tokens older than 30 days.
 * Call periodically (e.g., daily cron or on server start).
 */
export function cleanupExpiredTokens() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  execute('DELETE FROM refresh_tokens WHERE (revoked = 1 OR expires_at < ?) AND created_at < ?', [
    new Date().toISOString(),
    cutoff,
  ]);
}
