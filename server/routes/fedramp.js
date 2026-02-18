/**
 * FedRAMP Routes (P4.4.3 + P4.4.4)
 *
 * P4.4.3 — FedRAMP SSP Template Generator
 *   Auto-populates a System Security Plan from platform configuration.
 *
 * P4.4.4 — Continuous Monitoring (ConMon) Dashboard
 *   Real-time vulnerability status, POA&M tracking, scan results.
 *
 * Standards: FedRAMP Authorization, NIST SP 800-53 Rev 5,
 *            FedRAMP Continuous Monitoring Strategy Guide,
 *            OMB A-130, FISMA
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { createLogger } from '../lib/logger.js';
import { authenticateToken } from '../middleware/auth.js';
import { getZeroTrustStatus } from '../middleware/zeroTrust.js';
import { execute, logActivity, query, queryOne } from '../models/database.js';

const router = Router();
const logger = createLogger('fedramp');

// P1.2.9 — All FedRAMP routes require authentication
router.use(authenticateToken);

// ────────────────────────────────────────────────────────────
// Database Tables
// ────────────────────────────────────────────────────────────

function initFedRampTables() {
  // POA&M (Plan of Action & Milestones) items
  execute(`
    CREATE TABLE IF NOT EXISTS poam_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      poam_id TEXT NOT NULL UNIQUE,
      weakness TEXT NOT NULL,
      control_id TEXT,
      risk_level TEXT DEFAULT 'moderate',
      status TEXT DEFAULT 'open',
      scheduled_completion TEXT,
      actual_completion TEXT,
      milestones TEXT,
      responsible_party TEXT,
      resources_required TEXT,
      vendor_dependency TEXT DEFAULT 'no',
      deviation_rationale TEXT,
      created_by INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Vulnerability scan results
  execute(`
    CREATE TABLE IF NOT EXISTS scan_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      scan_type TEXT NOT NULL,
      scanner TEXT,
      scan_date TEXT DEFAULT (datetime('now')),
      total_findings INTEGER DEFAULT 0,
      critical_count INTEGER DEFAULT 0,
      high_count INTEGER DEFAULT 0,
      medium_count INTEGER DEFAULT 0,
      low_count INTEGER DEFAULT 0,
      informational_count INTEGER DEFAULT 0,
      findings_json TEXT,
      scan_target TEXT,
      status TEXT DEFAULT 'completed',
      uploaded_by INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // ConMon significant changes
  execute(`
    CREATE TABLE IF NOT EXISTS conmon_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change_type TEXT NOT NULL,
      description TEXT NOT NULL,
      impact_level TEXT DEFAULT 'low',
      control_impact TEXT,
      approval_status TEXT DEFAULT 'pending',
      approved_by INTEGER,
      requested_by INTEGER,
      requested_at TEXT DEFAULT (datetime('now')),
      approved_at TEXT
    )
  `);
}

// Defer table creation until database is ready
let tablesReady = false;
function ensureTables() {
  if (tablesReady) {
    return;
  }
  try {
    initFedRampTables();
    tablesReady = true;
  } catch {
    // Database not ready yet — will retry on next request
  }
}

// Middleware to ensure tables exist before any route handler
router.use((_req, _res, next) => {
  ensureTables();
  next();
});

// ────────────────────────────────────────────────────────────
// P4.4.3 — FedRAMP SSP Template Generator
// ────────────────────────────────────────────────────────────

/**
 * GET /api/fedramp/ssp
 * Generate a pre-populated System Security Plan from platform config.
 *
 * Think of this as a "fill in the blanks" for the massive FedRAMP SSP
 * document. We auto-populate what we can from the system's own config.
 */
router.get('/ssp', (req, res) => {
  try {
    const systemConfig = buildSystemConfig();
    const ssp = generateSSP(systemConfig);

    res.json({ success: true, ssp });
  } catch (err) {
    logger.error('SSP generation failed', { error: err.message });
    res.status(500).json({ success: false, error: 'Failed to generate SSP' });
  }
});

/**
 * GET /api/fedramp/ssp/controls
 * List all NIST 800-53 controls with implementation status.
 */
router.get('/ssp/controls', (req, res) => {
  const { family, status } = req.query;
  let controls = SSP_CONTROLS;

  if (family) {
    controls = controls.filter((c) => c.family === family.toUpperCase());
  }
  if (status) {
    controls = controls.filter((c) => c.implementationStatus === status);
  }

  const families = [...new Set(SSP_CONTROLS.map((c) => c.family))].sort();

  res.json({
    success: true,
    total: controls.length,
    families,
    controls,
  });
});

/**
 * GET /api/fedramp/ssp/control/:controlId
 * Get detailed control implementation narrative.
 */
router.get('/ssp/control/:controlId', param('controlId').trim().notEmpty(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const control = SSP_CONTROLS.find(
    (c) => c.controlId.toLowerCase() === req.params.controlId.toLowerCase()
  );

  if (!control) {
    return res.status(404).json({ error: 'Control not found' });
  }

  res.json({ success: true, control });
});

// ────────────────────────────────────────────────────────────
// P4.4.4 — Continuous Monitoring Dashboard
// ────────────────────────────────────────────────────────────

/**
 * GET /api/fedramp/conmon/dashboard
 * Main ConMon dashboard data — aggregates all monitoring feeds.
 */
router.get('/conmon/dashboard', (req, res) => {
  try {
    // POA&M summary
    const poamOpen = queryOne('SELECT COUNT(*) as count FROM poam_items WHERE status = ?', [
      'open',
    ]);
    const poamOverdue = queryOne(
      "SELECT COUNT(*) as count FROM poam_items WHERE status = ? AND scheduled_completion < datetime('now')",
      ['open']
    );
    const poamByRisk = query(
      'SELECT risk_level, COUNT(*) as count FROM poam_items WHERE status = ? GROUP BY risk_level',
      ['open']
    );

    // Recent scan results
    const latestScans = query(
      'SELECT id, scan_type, scanner, scan_date, total_findings, critical_count, high_count, medium_count, low_count, status FROM scan_results ORDER BY scan_date DESC LIMIT 10'
    );

    // Vulnerability trend (last 30 days)
    const vulnTrend = query(
      `SELECT date(scan_date) as day,
              SUM(critical_count) as critical,
              SUM(high_count) as high,
              SUM(medium_count) as medium,
              SUM(low_count) as low
       FROM scan_results
       WHERE scan_date >= datetime('now', '-30 days')
       GROUP BY date(scan_date)
       ORDER BY day`
    );

    // Pending changes
    const pendingChanges = queryOne(
      'SELECT COUNT(*) as count FROM conmon_changes WHERE approval_status = ?',
      ['pending']
    );

    // Zero Trust posture
    const ztStatus = getZeroTrustStatus();

    // System uptime (from process)
    const uptime = process.uptime();

    res.json({
      success: true,
      dashboard: {
        poam: {
          openItems: poamOpen?.count || 0,
          overdueItems: poamOverdue?.count || 0,
          byRiskLevel: Object.fromEntries((poamByRisk || []).map((r) => [r.risk_level, r.count])),
        },
        vulnerabilities: {
          latestScans,
          trend: vulnTrend || [],
        },
        changes: {
          pendingApproval: pendingChanges?.count || 0,
        },
        zeroTrust: ztStatus,
        system: {
          uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (err) {
    logger.error('ConMon dashboard error', { error: err.message });
    res.status(500).json({ success: false, error: 'Failed to load dashboard data' });
  }
});

// ── POA&M Management ──

/**
 * GET /api/fedramp/conmon/poam
 * List all POA&M items with optional filters.
 */
router.get('/conmon/poam', (req, res) => {
  const { status, risk } = req.query;
  let sql = 'SELECT * FROM poam_items WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (risk) {
    sql += ' AND risk_level = ?';
    params.push(risk);
  }

  sql +=
    " ORDER BY CASE risk_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'moderate' THEN 3 WHEN 'low' THEN 4 END, scheduled_completion ASC";

  const items = query(sql, params);
  res.json({ success: true, total: items?.length || 0, items: items || [] });
});

/**
 * POST /api/fedramp/conmon/poam
 * Create a new POA&M item.
 */
router.post(
  '/conmon/poam',
  [
    body('weakness').trim().notEmpty().withMessage('Weakness description required'),
    body('controlId').optional().trim(),
    body('riskLevel').optional().isIn(['critical', 'high', 'moderate', 'low']),
    body('scheduledCompletion').optional().isISO8601(),
    body('responsibleParty').optional().trim(),
    body('milestones').optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poamId = `POAM-${Date.now().toString(36).toUpperCase()}`;

    execute(
      `INSERT INTO poam_items (poam_id, weakness, control_id, risk_level, scheduled_completion, responsible_party, milestones, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        poamId,
        req.body.weakness,
        req.body.controlId || null,
        req.body.riskLevel || 'moderate',
        req.body.scheduledCompletion || null,
        req.body.responsibleParty || null,
        req.body.milestones || null,
        req.user?.id || null,
      ]
    );

    logActivity(req.user?.id, 'poam_create', `Created POA&M: ${poamId}`);
    logger.info('POA&M created', { poamId });

    res.status(201).json({ success: true, poamId });
  }
);

/**
 * PATCH /api/fedramp/conmon/poam/:id
 * Update a POA&M item (e.g., close it, change risk level).
 */
router.patch(
  '/conmon/poam/:id',
  [
    param('id').isInt(),
    body('status').optional().isIn(['open', 'closed', 'risk-accepted', 'deferred']),
    body('riskLevel').optional().isIn(['critical', 'high', 'moderate', 'low']),
    body('milestones').optional().trim(),
    body('deviationRationale').optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const item = queryOne('SELECT * FROM poam_items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'POA&M item not found' });
    }

    const updates = [];
    const params = [];

    for (const [field, column] of [
      ['status', 'status'],
      ['riskLevel', 'risk_level'],
      ['milestones', 'milestones'],
      ['deviationRationale', 'deviation_rationale'],
      ['scheduledCompletion', 'scheduled_completion'],
      ['responsibleParty', 'responsible_party'],
    ]) {
      if (req.body[field] !== undefined) {
        updates.push(`${column} = ?`);
        params.push(req.body[field]);
      }
    }

    if (req.body.status === 'closed') {
      updates.push("actual_completion = datetime('now')");
    }

    updates.push("updated_at = datetime('now')");
    params.push(req.params.id);

    execute(`UPDATE poam_items SET ${updates.join(', ')} WHERE id = ?`, params);

    logActivity(
      req.user?.id,
      'poam_update',
      `Updated POA&M ${item.poam_id}: ${updates.join(', ')}`
    );

    res.json({ success: true, message: 'POA&M updated' });
  }
);

// ── Vulnerability Scans ──

/**
 * POST /api/fedramp/conmon/scans
 * Upload vulnerability scan results.
 */
router.post(
  '/conmon/scans',
  [
    body('scanType')
      .trim()
      .notEmpty()
      .isIn(['infrastructure', 'web-application', 'database', 'container', 'dependency']),
    body('scanner').optional().trim(),
    body('scanTarget').optional().trim(),
    body('findings').isArray(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const findings = req.body.findings;
    const counts = {
      critical: findings.filter((f) => f.severity === 'critical').length,
      high: findings.filter((f) => f.severity === 'high').length,
      medium: findings.filter((f) => f.severity === 'medium').length,
      low: findings.filter((f) => f.severity === 'low').length,
      informational: findings.filter((f) => f.severity === 'informational').length,
    };

    execute(
      `INSERT INTO scan_results (scan_type, scanner, total_findings, critical_count, high_count, medium_count, low_count, informational_count, findings_json, scan_target, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.body.scanType,
        req.body.scanner || 'manual',
        findings.length,
        counts.critical,
        counts.high,
        counts.medium,
        counts.low,
        counts.informational,
        JSON.stringify(findings),
        req.body.scanTarget || null,
        req.user?.id || null,
      ]
    );

    // Auto-create POA&M items for critical/high findings
    let autoPoamCount = 0;
    for (const finding of findings) {
      if (finding.severity === 'critical' || finding.severity === 'high') {
        const poamId = `POAM-SCAN-${Date.now().toString(36).toUpperCase()}-${autoPoamCount}`;
        execute(
          `INSERT INTO poam_items (poam_id, weakness, risk_level, status, created_by)
           VALUES (?, ?, ?, 'open', ?)`,
          [
            poamId,
            `[${finding.severity.toUpperCase()}] ${finding.title || finding.description || 'Scan finding'}`,
            finding.severity,
            req.user?.id || null,
          ]
        );
        autoPoamCount++;
      }
    }

    logActivity(
      req.user?.id,
      'scan_upload',
      `Uploaded ${req.body.scanType} scan: ${findings.length} findings`
    );
    logger.info('Scan results uploaded', {
      type: req.body.scanType,
      total: findings.length,
      autoPoam: autoPoamCount,
    });

    res.status(201).json({
      success: true,
      message: `Scan uploaded with ${findings.length} findings`,
      counts,
      autoPoamCreated: autoPoamCount,
    });
  }
);

/**
 * GET /api/fedramp/conmon/scans
 * List scan results.
 */
router.get('/conmon/scans', (req, res) => {
  const { type, limit } = req.query;
  let sql =
    'SELECT id, scan_type, scanner, scan_date, total_findings, critical_count, high_count, medium_count, low_count, informational_count, scan_target, status FROM scan_results';
  const params = [];

  if (type) {
    sql += ' WHERE scan_type = ?';
    params.push(type);
  }

  sql += ' ORDER BY scan_date DESC';

  if (limit) {
    sql += ' LIMIT ?';
    params.push(parseInt(limit, 10));
  }

  const scans = query(sql, params);
  res.json({ success: true, scans: scans || [] });
});

// ── Significant Changes ──

/**
 * POST /api/fedramp/conmon/changes
 * Report a significant change (FedRAMP requires notification).
 */
router.post(
  '/conmon/changes',
  [
    body('changeType')
      .trim()
      .notEmpty()
      .isIn([
        'boundary-change',
        'new-interconnection',
        'new-service',
        'infrastructure-change',
        'key-personnel-change',
        'incident',
        'policy-update',
      ]),
    body('description').trim().notEmpty(),
    body('impactLevel').optional().isIn(['low', 'moderate', 'high']),
    body('controlImpact').optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    execute(
      `INSERT INTO conmon_changes (change_type, description, impact_level, control_impact, requested_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.body.changeType,
        req.body.description,
        req.body.impactLevel || 'low',
        req.body.controlImpact || null,
        req.user?.id || null,
      ]
    );

    logActivity(req.user?.id, 'conmon_change', `Significant change: ${req.body.changeType}`);
    logger.info('Significant change reported', { type: req.body.changeType });

    res.status(201).json({ success: true, message: 'Change recorded and pending review' });
  }
);

/**
 * GET /api/fedramp/conmon/changes
 * List significant changes.
 */
router.get('/conmon/changes', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT * FROM conmon_changes';
  const params = [];

  if (status) {
    sql += ' WHERE approval_status = ?';
    params.push(status);
  }

  sql += ' ORDER BY requested_at DESC';

  const changes = query(sql, params);
  res.json({ success: true, changes: changes || [] });
});

/**
 * PATCH /api/fedramp/conmon/changes/:id/approve
 * Approve a significant change.
 */
router.patch('/conmon/changes/:id/approve', param('id').isInt(), (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  execute(
    "UPDATE conmon_changes SET approval_status = ?, approved_by = ?, approved_at = datetime('now') WHERE id = ?",
    ['approved', req.user?.id || null, req.params.id]
  );

  res.json({ success: true, message: 'Change approved' });
});

// ────────────────────────────────────────────────────────────
// SSP Generation Helpers
// ────────────────────────────────────────────────────────────

function buildSystemConfig() {
  return {
    systemName: process.env.SYSTEM_NAME || 'Structured for Growth',
    systemIdentifier: process.env.SYSTEM_ID || 'SFG-001',
    fipsCategory: process.env.FIPS_CATEGORY || 'Moderate',
    cloudServiceModel: process.env.CLOUD_MODEL || 'SaaS',
    cloudDeploymentModel: process.env.CLOUD_DEPLOYMENT || 'Public Cloud',
    serviceProvider: 'Structured for Growth LLC',
    authorizedBy: process.env.AO_NAME || '[Authorizing Official Name]',
    systemOwner: process.env.SYSTEM_OWNER || '[System Owner Name]',
    isscp: process.env.ISSCP_CONTACT || '[ISSO/ISSM Contact]',
    environment: process.env.NODE_ENV || 'development',
    leveragedAuthorizations: process.env.LEVERAGED_AUTH || 'Render.com (IaaS)',
  };
}

function generateSSP(config) {
  return {
    metadata: {
      title: `System Security Plan — ${config.systemName}`,
      version: '1.0',
      date: new Date().toISOString().split('T')[0],
      preparedBy: 'Structured for Growth Compliance Engine',
      classification: 'CUI//SP-FEDCON',
    },
    sections: [
      {
        id: '1',
        title: 'System Identification',
        content: {
          systemName: config.systemName,
          systemIdentifier: config.systemIdentifier,
          systemType: 'Major Application',
          cloudServiceModel: config.cloudServiceModel,
          cloudDeploymentModel: config.cloudDeploymentModel,
          leveragedAuthorizations: config.leveragedAuthorizations,
          operationalStatus: 'Operational',
          fipsCategorization: {
            confidentiality: config.fipsCategory,
            integrity: config.fipsCategory,
            availability: config.fipsCategory,
            overall: config.fipsCategory,
          },
        },
      },
      {
        id: '2',
        title: 'System Description',
        content: {
          purpose: `${config.systemName} is a compliance management platform for government contractors, providing document management, compliance tracking, and security assessment capabilities.`,
          capabilities: [
            'NIST 800-171 Rev 3 compliance tracking',
            'CUI handling and marking',
            'Document template management',
            'USACE/DoD document generation',
            'AI-assisted compliance analysis',
            'Accessibility compliance (WCAG 2.1 AA)',
            'Continuous monitoring dashboard',
          ],
          boundaries: {
            internalComponents: [
              'Express.js application server',
              'SQLite database (sql.js)',
              'Vite frontend build system',
              'Winston logging subsystem',
            ],
            externalInterfaces: [
              'HTTPS (TLS 1.2+) — user browser connections',
              'Render.com hosting platform',
            ],
          },
          usersAndRoles: [
            { role: 'admin', description: 'System administrator — full access', count: '[TBD]' },
            {
              role: 'editor',
              description: 'Content editor — read/write to projects and compliance',
              count: '[TBD]',
            },
            { role: 'user', description: 'Standard user — read access + own data', count: '[TBD]' },
          ],
        },
      },
      {
        id: '3',
        title: 'System Environment',
        content: {
          hardware: 'Cloud-hosted (Render.com managed infrastructure)',
          software: {
            operatingSystem: 'Linux (container)',
            runtime: `Node.js ${process.version}`,
            framework: 'Express.js 4.x',
            database: 'SQLite via sql.js (in-memory + file persistence)',
            frontend: 'Vanilla JavaScript + Vite',
          },
          network: {
            protocol: 'HTTPS only (TLS 1.2+)',
            ports: ['443 (HTTPS)'],
            firewalls: 'Render.com managed network security',
          },
        },
      },
      {
        id: '4',
        title: 'Security Controls Implementation',
        content: {
          controlFamilies: Object.entries(
            SSP_CONTROLS.reduce((acc, c) => {
              acc[c.family] = (acc[c.family] || 0) + 1;
              return acc;
            }, {})
          ).map(([family, count]) => ({ family, controlCount: count })),
          implementedCount: SSP_CONTROLS.filter((c) => c.implementationStatus === 'implemented')
            .length,
          partialCount: SSP_CONTROLS.filter((c) => c.implementationStatus === 'partial').length,
          plannedCount: SSP_CONTROLS.filter((c) => c.implementationStatus === 'planned').length,
          notApplicableCount: SSP_CONTROLS.filter(
            (c) => c.implementationStatus === 'not-applicable'
          ).length,
        },
      },
      {
        id: '5',
        title: 'Roles & Responsibilities',
        content: {
          authorizingOfficial: config.authorizedBy,
          systemOwner: config.systemOwner,
          isso: config.isscp,
          applicationTeam: 'Structured for Growth Development Team',
        },
      },
      {
        id: '6',
        title: 'Continuous Monitoring Strategy',
        content: {
          vulnerabilityScanning: 'Monthly infrastructure + web application scans',
          poamManagement: 'POA&M items tracked in ConMon dashboard',
          significantChanges: 'All changes reported via /api/fedramp/conmon/changes',
          incidentResponse: 'US-CERT reporting within 1 hour for incidents',
          annualAssessment: 'Annual third-party security assessment',
        },
      },
    ],
  };
}

// ────────────────────────────────────────────────────────────
// NIST 800-53 Control Implementations
// (Subset relevant to the platform — FedRAMP Moderate baseline)
// ────────────────────────────────────────────────────────────

const SSP_CONTROLS = [
  // Access Control (AC)
  {
    controlId: 'AC-1',
    family: 'AC',
    title: 'Access Control Policy and Procedures',
    implementationStatus: 'implemented',
    narrative:
      'Access control policies documented in ADMIN-GUIDE.md. Role-based access (admin, editor, user) enforced via JWT middleware.',
  },
  {
    controlId: 'AC-2',
    family: 'AC',
    title: 'Account Management',
    implementationStatus: 'implemented',
    narrative:
      'User accounts managed via /api/auth endpoints. Admin-only registration approval. Activity logging via logActivity().',
  },
  {
    controlId: 'AC-3',
    family: 'AC',
    title: 'Access Enforcement',
    implementationStatus: 'implemented',
    narrative:
      'authenticateToken + requireRole middleware enforce access on all protected routes. Zero Trust scoring adds continuous verification.',
  },
  {
    controlId: 'AC-7',
    family: 'AC',
    title: 'Unsuccessful Logon Attempts',
    implementationStatus: 'implemented',
    narrative:
      'Rate limiting on /api/auth/login (100 requests per 15 minutes). Failed attempts logged to audit trail.',
  },
  {
    controlId: 'AC-8',
    family: 'AC',
    title: 'System Use Notification',
    implementationStatus: 'implemented',
    narrative: 'Login page displays system use notification banner per DoD requirements.',
  },
  {
    controlId: 'AC-17',
    family: 'AC',
    title: 'Remote Access',
    implementationStatus: 'implemented',
    narrative:
      'All access via HTTPS. PIV/CAC authentication available for smart card users (P4.4.2). VPN not required — Zero Trust model.',
  },

  // Audit and Accountability (AU)
  {
    controlId: 'AU-2',
    family: 'AU',
    title: 'Audit Events',
    implementationStatus: 'implemented',
    narrative:
      'Winston structured logging captures all API requests, auth events, data changes, and errors. AI audit trail tracks AI interactions.',
  },
  {
    controlId: 'AU-3',
    family: 'AU',
    title: 'Content of Audit Records',
    implementationStatus: 'implemented',
    narrative:
      'Audit records include: timestamp, user ID, request ID, method, URL, status code, duration, IP, user agent.',
  },
  {
    controlId: 'AU-6',
    family: 'AU',
    title: 'Audit Review, Analysis, and Reporting',
    implementationStatus: 'implemented',
    narrative:
      'Error monitoring dashboard (/api/errors) provides real-time log analysis. ConMon dashboard aggregates security events.',
  },

  // Configuration Management (CM)
  {
    controlId: 'CM-2',
    family: 'CM',
    title: 'Baseline Configuration',
    implementationStatus: 'implemented',
    narrative:
      'package.json + package-lock.json define software baseline. Render.yaml defines deployment configuration.',
  },
  {
    controlId: 'CM-6',
    family: 'CM',
    title: 'Configuration Settings',
    implementationStatus: 'implemented',
    narrative:
      'Helmet CSP, HSTS, cookie flags, rate limits configured in server/index.js. Environment variables for sensitive values.',
  },

  // Identification and Authentication (IA)
  {
    controlId: 'IA-2',
    family: 'IA',
    title: 'Identification and Authentication',
    implementationStatus: 'implemented',
    narrative:
      'JWT-based authentication with bcrypt password hashing. MFA via TOTP (P3). PIV/CAC support (P4.4.2) for AAL3.',
  },
  {
    controlId: 'IA-5',
    family: 'IA',
    title: 'Authenticator Management',
    implementationStatus: 'implemented',
    narrative:
      'Passwords: bcrypt with salt rounds. JWT: refresh token rotation, 15-min access tokens. PIV/CAC: X.509 certificate lifecycle management.',
  },

  // Incident Response (IR)
  {
    controlId: 'IR-4',
    family: 'IR',
    title: 'Incident Handling',
    implementationStatus: 'partial',
    narrative:
      'Error monitoring captures incidents. Manual escalation process documented. Automated US-CERT reporting not yet implemented.',
  },
  {
    controlId: 'IR-6',
    family: 'IR',
    title: 'Incident Reporting',
    implementationStatus: 'planned',
    narrative:
      'ConMon significant change reporting available. Automated FedRAMP incident report format planned.',
  },

  // Risk Assessment (RA)
  {
    controlId: 'RA-5',
    family: 'RA',
    title: 'Vulnerability Monitoring and Scanning',
    implementationStatus: 'implemented',
    narrative:
      'ConMon dashboard tracks vulnerability scan results. Auto-creates POA&M items for critical/high findings.',
  },

  // System and Communications Protection (SC)
  {
    controlId: 'SC-7',
    family: 'SC',
    title: 'Boundary Protection',
    implementationStatus: 'implemented',
    narrative:
      'Helmet CSP, CORS restrictions, rate limiting. Zero Trust micro-segmentation via route-level access policies.',
  },
  {
    controlId: 'SC-8',
    family: 'SC',
    title: 'Transmission Confidentiality and Integrity',
    implementationStatus: 'implemented',
    narrative:
      'HTTPS-only with HSTS (1 year, includeSubdomains, preload). TLS 1.2+ enforced by Render.com.',
  },
  {
    controlId: 'SC-13',
    family: 'SC',
    title: 'Cryptographic Protection',
    implementationStatus: 'implemented',
    narrative:
      'FIPS-validated TLS via hosting platform. bcrypt for passwords. JWT with HS256 or RS256 signing.',
  },
  {
    controlId: 'SC-28',
    family: 'SC',
    title: 'Protection of Information at Rest',
    implementationStatus: 'partial',
    narrative:
      'SQLite database file on encrypted storage (Render.com managed). Application-level encryption for CUI fields planned.',
  },

  // System and Information Integrity (SI)
  {
    controlId: 'SI-2',
    family: 'SI',
    title: 'Flaw Remediation',
    implementationStatus: 'implemented',
    narrative:
      'npm audit for dependency vulnerabilities. POA&M tracking for identified flaws. Render auto-deploy on commit.',
  },
  {
    controlId: 'SI-4',
    family: 'SI',
    title: 'System Monitoring',
    implementationStatus: 'implemented',
    narrative:
      'Structured logging (Winston), error monitoring dashboard, health check endpoints (/healthz, /readyz), Zero Trust analytics.',
  },
  {
    controlId: 'SI-10',
    family: 'SI',
    title: 'Information Input Validation',
    implementationStatus: 'implemented',
    narrative:
      'express-validator on all API inputs. AI guardrails layer for prompt injection defense. CSRF double-submit cookie protection.',
  },
];

export default router;
