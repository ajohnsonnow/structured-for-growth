/**
 * Accessibility Dashboard Routes (P4.3.1)
 *
 * Endpoints for conformance metrics, trend tracking, remediation status,
 * and PDF/UA export support.
 *
 * Endpoints:
 *   GET    /api/accessibility/dashboard      — Dashboard summary metrics
 *   GET    /api/accessibility/conformance     — Conformance data per page/component
 *   POST   /api/accessibility/scan            — Submit scan results
 *   GET    /api/accessibility/trends          — Trend data over time
 *   GET    /api/accessibility/remediation     — Remediation items list
 *   POST   /api/accessibility/remediation     — Create remediation item
 *   PUT    /api/accessibility/remediation/:id — Update remediation item
 *   GET    /api/accessibility/vpat-data       — Data for VPAT/ACR generation
 *
 * Standards: Section 508, WCAG 2.1 AA, ISO 14289 (PDF/UA)
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createLogger } from '../lib/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { execute, query, queryOne } from '../models/database.js';

const router = Router();
const logger = createLogger('accessibility-routes');

// ────────────────────────────────────────────────────────────
// Database Setup
// ────────────────────────────────────────────────────────────

export function initAccessibilityTables() {
  execute(`
    CREATE TABLE IF NOT EXISTS a11y_scan_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_url TEXT NOT NULL,
      page_title TEXT,
      scan_tool TEXT NOT NULL DEFAULT 'axe-core',
      scan_type TEXT DEFAULT 'automated',
      total_violations INTEGER DEFAULT 0,
      critical_count INTEGER DEFAULT 0,
      serious_count INTEGER DEFAULT 0,
      moderate_count INTEGER DEFAULT 0,
      minor_count INTEGER DEFAULT 0,
      passes_count INTEGER DEFAULT 0,
      incomplete_count INTEGER DEFAULT 0,
      wcag_level TEXT DEFAULT 'AA',
      conformance_score REAL DEFAULT 0,
      details TEXT,
      scanned_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS a11y_remediation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_id INTEGER,
      page_url TEXT NOT NULL,
      rule_id TEXT NOT NULL,
      impact TEXT NOT NULL,
      description TEXT NOT NULL,
      wcag_criteria TEXT,
      element_selector TEXT,
      element_html TEXT,
      fix_suggestion TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'normal',
      assigned_to INTEGER,
      resolved_by INTEGER,
      resolution_notes TEXT,
      resolved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  logger.debug('Accessibility tables initialized');
}

// Defer table init until database is ready
let tablesReady = false;
function ensureTables() {
  if (tablesReady) {
    return;
  }
  try {
    initAccessibilityTables();
    tablesReady = true;
  } catch {
    /* retry next request */
  }
}
router.use((_req, _res, next) => {
  ensureTables();
  next();
});

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

// ────────────────────────────────────────────────────────────
// GET /api/accessibility/dashboard — Summary metrics
// ────────────────────────────────────────────────────────────

router.get('/dashboard', authenticateToken, (_req, res) => {
  try {
    // Overall conformance
    const latestScans = query(`
      SELECT s.* FROM a11y_scan_results s
      INNER JOIN (
        SELECT page_url, MAX(created_at) as max_date
        FROM a11y_scan_results
        GROUP BY page_url
      ) latest ON s.page_url = latest.page_url AND s.created_at = latest.max_date
      ORDER BY s.page_url
    `);

    const totalPages = latestScans.length;
    const avgConformance =
      totalPages > 0
        ? Math.round(
            latestScans.reduce((sum, s) => sum + (s.conformance_score || 0), 0) / totalPages
          )
        : 0;

    const totalViolations = latestScans.reduce((sum, s) => sum + (s.total_violations || 0), 0);
    const criticalViolations = latestScans.reduce((sum, s) => sum + (s.critical_count || 0), 0);

    // Remediation stats
    const remStats = queryOne(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'in-progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status = 'wontfix' THEN 1 ELSE 0 END) as wontfix,
        SUM(CASE WHEN impact = 'critical' THEN 1 ELSE 0 END) as critical_open
      FROM a11y_remediation
      WHERE status IN ('open', 'in-progress')
    `);

    // Pass rate by WCAG criteria
    const wcagBreakdown = query(`
      SELECT wcag_criteria, status, COUNT(*) as count
      FROM a11y_remediation
      WHERE wcag_criteria IS NOT NULL
      GROUP BY wcag_criteria, status
      ORDER BY wcag_criteria
    `);

    res.json({
      success: true,
      data: {
        overview: {
          totalPages,
          avgConformanceScore: avgConformance,
          totalViolations,
          criticalViolations,
          pagesScanned: totalPages,
          lastScanDate: latestScans[0]?.created_at || null,
        },
        remediation: {
          total: remStats?.total || 0,
          open: remStats?.open_count || 0,
          inProgress: remStats?.in_progress || 0,
          resolved: remStats?.resolved || 0,
          wontfix: remStats?.wontfix || 0,
        },
        pageScores: latestScans.map((s) => ({
          pageUrl: s.page_url,
          pageTitle: s.page_title,
          conformanceScore: s.conformance_score,
          violations: s.total_violations,
          critical: s.critical_count,
          serious: s.serious_count,
          lastScanned: s.created_at,
        })),
        wcagBreakdown,
      },
    });
  } catch (err) {
    logger.error('Dashboard load failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
});

// ────────────────────────────────────────────────────────────
// POST /api/accessibility/scan — Submit scan results
// ────────────────────────────────────────────────────────────

router.post(
  '/scan',
  authenticateToken,
  [
    body('pageUrl').isString().notEmpty(),
    body('pageTitle').optional().isString(),
    body('scanTool').optional().isString(),
    body('violations').isArray(),
    body('passes').optional().isArray(),
    body('incomplete').optional().isArray(),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const { pageUrl, pageTitle, scanTool, violations, passes, incomplete } = req.body;

      const criticalCount = violations.filter((v) => v.impact === 'critical').length;
      const seriousCount = violations.filter((v) => v.impact === 'serious').length;
      const moderateCount = violations.filter((v) => v.impact === 'moderate').length;
      const minorCount = violations.filter((v) => v.impact === 'minor').length;
      const passesCount = passes?.length || 0;
      const incompleteCount = incomplete?.length || 0;

      const totalChecks = violations.length + passesCount + incompleteCount;
      const conformanceScore = totalChecks > 0 ? Math.round((passesCount / totalChecks) * 100) : 0;

      // Insert scan result
      execute(
        `INSERT INTO a11y_scan_results
          (page_url, page_title, scan_tool, total_violations, critical_count, serious_count,
           moderate_count, minor_count, passes_count, incomplete_count, conformance_score,
           details, scanned_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pageUrl,
          pageTitle || null,
          scanTool || 'axe-core',
          violations.length,
          criticalCount,
          seriousCount,
          moderateCount,
          minorCount,
          passesCount,
          incompleteCount,
          conformanceScore,
          JSON.stringify({ violations, passes, incomplete }),
          req.user.id,
        ]
      );

      const scanRow = queryOne('SELECT last_insert_rowid() as id');
      const scanId = scanRow.id;

      // Auto-create remediation items for violations
      let remediationCount = 0;
      for (const violation of violations) {
        const wcagTags = violation.tags?.filter((t) => t.startsWith('wcag')).join(', ') || null;

        for (const node of violation.nodes || [{ html: '', target: [] }]) {
          execute(
            `INSERT INTO a11y_remediation
              (scan_id, page_url, rule_id, impact, description, wcag_criteria,
               element_selector, element_html, fix_suggestion, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              scanId,
              pageUrl,
              violation.id,
              violation.impact,
              violation.description || violation.help,
              wcagTags,
              Array.isArray(node.target) ? node.target.join(' > ') : '',
              (node.html || '').substring(0, 500),
              violation.helpUrl || '',
              violation.impact === 'critical'
                ? 'critical'
                : violation.impact === 'serious'
                  ? 'high'
                  : 'normal',
            ]
          );
          remediationCount++;
        }
      }

      logger.info('Accessibility scan recorded', {
        pageUrl,
        violations: violations.length,
        conformanceScore,
        remediationItems: remediationCount,
      });

      res.status(201).json({
        success: true,
        data: {
          scanId,
          conformanceScore,
          violations: violations.length,
          passes: passesCount,
          remediationItemsCreated: remediationCount,
        },
      });
    } catch (err) {
      logger.error('Scan submission failed', { error: err.message });
      res.status(500).json({ success: false, message: 'Scan submission failed' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// GET /api/accessibility/trends — Trend data over time
// ────────────────────────────────────────────────────────────

router.get('/trends', authenticateToken, (req, res) => {
  try {
    const { pageUrl, days = 90 } = req.query;
    let where = `WHERE created_at >= datetime('now', '-${parseInt(days)} days')`;
    const params = [];

    if (pageUrl) {
      where += ' AND page_url = ?';
      params.push(pageUrl);
    }

    const trends = query(
      `SELECT
        DATE(created_at) as scan_date,
        page_url,
        AVG(conformance_score) as avg_score,
        SUM(total_violations) as total_violations,
        SUM(critical_count) as critical_count,
        COUNT(*) as scan_count
       FROM a11y_scan_results
       ${where}
       GROUP BY DATE(created_at), page_url
       ORDER BY scan_date ASC`,
      params
    );

    res.json({ success: true, data: trends });
  } catch (err) {
    logger.error('Trends query failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load trends' });
  }
});

// ────────────────────────────────────────────────────────────
// Remediation Endpoints
// ────────────────────────────────────────────────────────────

router.get('/remediation', authenticateToken, (req, res) => {
  try {
    const { status, impact, page_url, page = 1, limit = 25 } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
    if (impact) {
      where += ' AND impact = ?';
      params.push(impact);
    }
    if (page_url) {
      where += ' AND page_url = ?';
      params.push(page_url);
    }

    const countRow = queryOne(`SELECT COUNT(*) as total FROM a11y_remediation ${where}`, params);
    const total = countRow?.total || 0;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const items = query(
      `SELECT * FROM a11y_remediation ${where}
       ORDER BY
         CASE impact WHEN 'critical' THEN 1 WHEN 'serious' THEN 2 WHEN 'moderate' THEN 3 ELSE 4 END,
         created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: { items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    logger.error('Remediation list failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to list remediation items' });
  }
});

router.post(
  '/remediation',
  authenticateToken,
  [
    body('page_url').isString().notEmpty(),
    body('rule_id').isString().notEmpty(),
    body('impact').isIn(['critical', 'serious', 'moderate', 'minor']),
    body('description').isString().notEmpty(),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const b = req.body;
      execute(
        `INSERT INTO a11y_remediation
          (page_url, rule_id, impact, description, wcag_criteria, element_selector,
           fix_suggestion, priority)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.page_url,
          b.rule_id,
          b.impact,
          b.description,
          b.wcag_criteria || null,
          b.element_selector || null,
          b.fix_suggestion || null,
          b.impact === 'critical' ? 'critical' : b.impact === 'serious' ? 'high' : 'normal',
        ]
      );

      const row = queryOne('SELECT last_insert_rowid() as id');
      res.status(201).json({ success: true, data: { id: row.id } });
    } catch (err) {
      logger.error('Remediation creation failed', { error: err.message });
      res.status(500).json({ success: false, message: 'Creation failed' });
    }
  }
);

router.put(
  '/remediation/:id',
  authenticateToken,
  [
    param('id').isInt(),
    body('status')
      .optional()
      .isIn(['open', 'in-progress', 'resolved', 'wont-fix'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['critical', 'high', 'serious', 'moderate', 'medium', 'minor', 'low'])
      .withMessage('Invalid priority'),
    body('assigned_to').optional().isInt().withMessage('assigned_to must be an integer'),
    body('resolution_notes').optional().isString().trim(),
    body('fix_suggestion').optional().isString().trim(),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const existing = queryOne('SELECT * FROM a11y_remediation WHERE id = ?', [
        parseInt(req.params.id),
      ]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Remediation item not found' });
      }

      const b = req.body;
      const fields = [];
      const values = [];
      const allowed = ['status', 'priority', 'assigned_to', 'resolution_notes', 'fix_suggestion'];

      for (const field of allowed) {
        if (b[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(b[field]);
        }
      }

      if (b.status === 'resolved') {
        fields.push('resolved_by = ?', 'resolved_at = CURRENT_TIMESTAMP');
        values.push(req.user.id);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(parseInt(req.params.id));

      execute(`UPDATE a11y_remediation SET ${fields.join(', ')} WHERE id = ?`, values);

      res.json({ success: true, message: 'Remediation item updated' });
    } catch (err) {
      logger.error('Remediation update failed', { error: err.message });
      res.status(500).json({ success: false, message: 'Update failed' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// GET /api/accessibility/vpat-data — Data for VPAT/ACR generation
// ────────────────────────────────────────────────────────────

router.get('/vpat-data', authenticateToken, (_req, res) => {
  try {
    // Get all latest scan results per page
    const scans = query(`
      SELECT s.* FROM a11y_scan_results s
      INNER JOIN (
        SELECT page_url, MAX(created_at) as max_date
        FROM a11y_scan_results GROUP BY page_url
      ) latest ON s.page_url = latest.page_url AND s.created_at = latest.max_date
    `);

    // Get all remediation items grouped by WCAG criteria
    const criteria = query(`
      SELECT wcag_criteria,
        COUNT(*) as total_issues,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
        SUM(CASE WHEN status IN ('open','in-progress') THEN 1 ELSE 0 END) as open_issues,
        GROUP_CONCAT(DISTINCT impact) as impact_levels
      FROM a11y_remediation
      WHERE wcag_criteria IS NOT NULL
      GROUP BY wcag_criteria
      ORDER BY wcag_criteria
    `);

    res.json({
      success: true,
      data: {
        productName: 'Structured for Growth',
        evaluationDate: new Date().toISOString().split('T')[0],
        evaluationMethods: [
          'Automated scanning (axe-core)',
          'Manual testing',
          'Screen reader testing',
        ],
        wcagLevel: 'AA',
        scans,
        criteriaStatus: criteria.map((c) => ({
          criteria: c.wcag_criteria,
          totalIssues: c.total_issues,
          resolved: c.resolved,
          openIssues: c.open_issues,
          conformanceLevel:
            c.open_issues === 0
              ? 'Supports'
              : c.resolved > c.open_issues
                ? 'Partially Supports'
                : 'Does Not Support',
        })),
      },
    });
  } catch (err) {
    logger.error('VPAT data query failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to generate VPAT data' });
  }
});

export default router;
