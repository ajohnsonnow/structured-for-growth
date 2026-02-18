/**
 * Ownership Guard Middleware (P1.2.9 — Horizontal Privilege Escalation Prevention)
 *
 * Verifies that the authenticated user has the right to access a specific
 * resource. Admin users bypass all ownership checks.
 *
 * Think of it like a bouncer at an apartment building:
 *   - Admins have a master key (go anywhere)
 *   - Regular users can only enter their own apartment
 *
 * Standards: OWASP A01 (Broken Access Control), NIST AC-3 (Access Enforcement)
 *
 * @module ownershipGuard
 */

import { queryOne } from '../models/database.js';

/**
 * Map of entity types → SQL queries that verify ownership.
 * Each query must return a row if the user owns the resource.
 *
 * :id     — resource ID (from req.params)
 * :userId — authenticated user's ID (from req.user.userId)
 */
const OWNERSHIP_QUERIES = {
  client: `
    SELECT id FROM clients
    WHERE id = :id AND (
      created_by = :userId
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
  project: `
    SELECT p.id FROM projects p
    WHERE p.id = :id AND (
      p.created_by = :userId
      OR p.client_id IN (
        SELECT c.id FROM clients c WHERE c.created_by = :userId
      )
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
  message: `
    SELECT m.id FROM messages m
    WHERE m.id = :id AND (
      m.sender_id = :userId
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
  campaign: `
    SELECT id FROM campaigns
    WHERE id = :id AND (
      created_by = :userId
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
  record: `
    SELECT id FROM record_metadata
    WHERE id = :id AND (
      created_by = :userId
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
  evidence: `
    SELECT id FROM compliance_evidence
    WHERE id = :id AND (
      uploaded_by = :userId
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
  cdrl: `
    SELECT id FROM cdrl_items
    WHERE id = :id AND (
      created_by = :userId
      OR EXISTS (SELECT 1 FROM users WHERE id = :userId AND role = 'admin')
    )
  `,
};

/**
 * Create middleware that checks resource ownership.
 *
 * @param {string} entityType — one of: client, project, message, campaign, record, evidence, cdrl
 * @param {string} [paramName='id'] — req.params key containing the resource ID
 * @returns {Function} Express middleware
 *
 * @example
 * router.put('/:id', authenticateToken, requireOwnership('client'), updateClient);
 * router.delete('/:id', authenticateToken, requireOwnership('project', 'projectId'), deleteProject);
 */
export function requireOwnership(entityType, paramName = 'id') {
  const sql = OWNERSHIP_QUERIES[entityType];
  if (!sql) {
    throw new Error(`Unknown entity type for ownership check: "${entityType}"`);
  }

  return async (req, res, next) => {
    // Admins bypass ownership checks
    if (req.user?.role === 'admin') {
      return next();
    }

    const resourceId = req.params[paramName];
    const userId = req.user?.userId;

    if (!resourceId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing resource ID or user ID',
      });
    }

    try {
      const row = await queryOne(sql, {
        ':id': resourceId,
        ':userId': userId,
      });

      if (!row) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      // If the table doesn't have a created_by column yet,
      // fall through (don't break existing functionality)
      if (error?.message?.includes('no such column')) {
        return next();
      }
      return res.status(500).json({
        success: false,
        message: 'Ownership verification failed',
      });
    }
  };
}
