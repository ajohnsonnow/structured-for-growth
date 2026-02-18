/**
 * Compliance Assessment Engine Routes (P3.4)
 *
 * Endpoints for evidence tracking, gap scoring, assessment scheduling,
 * and POA&M export.
 *
 * Endpoints:
 *   POST   /api/compliance-engine/evidence           — Submit new evidence artifact
 *   GET    /api/compliance-engine/evidence            — List evidence records
 *   GET    /api/compliance-engine/evidence/:id        — Get single evidence record
 *   PUT    /api/compliance-engine/evidence/:id        — Update evidence record
 *   DELETE /api/compliance-engine/evidence/:id        — Remove evidence record
 *   GET    /api/compliance-engine/gap-score           — Gap score across frameworks
 *   GET    /api/compliance-engine/gap-score/:fw       — Gap score for a single framework
 *   POST   /api/compliance-engine/assessments         — Schedule an assessment
 *   GET    /api/compliance-engine/assessments         — List assessments
 *   PUT    /api/compliance-engine/assessments/:id     — Update assessment
 *   GET    /api/compliance-engine/export/poam         — Export POA&M as JSON
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { requireOwnership } from '../middleware/ownershipGuard.js';
import { execute, logActivity, query, queryOne } from '../models/database.js';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

const router = Router();

// ────────────────────────────────────────────────────────────
// Database bootstrap — run once on import
// ────────────────────────────────────────────────────────────

export function initComplianceEngineTables() {
  execute(`
    CREATE TABLE IF NOT EXISTS compliance_evidence (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      framework TEXT NOT NULL,
      control_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      evidence_type TEXT DEFAULT 'document',
      status TEXT DEFAULT 'draft',
      assessor TEXT,
      assessed_at DATETIME,
      attachment_path TEXT,
      attachment_name TEXT,
      notes TEXT,
      created_by INTEGER,
      updated_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS compliance_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      framework TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      assessment_type TEXT DEFAULT 'self',
      status TEXT DEFAULT 'scheduled',
      scheduled_date DATE NOT NULL,
      completed_date DATE,
      assessor TEXT,
      scope TEXT,
      findings_count INTEGER DEFAULT 0,
      score REAL,
      reminder_days INTEGER DEFAULT 7,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS compliance_control_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      framework TEXT NOT NULL,
      control_id TEXT NOT NULL,
      status TEXT DEFAULT 'not-assessed',
      implementation_pct INTEGER DEFAULT 0,
      notes TEXT,
      poam_id TEXT,
      poam_milestone TEXT,
      poam_due_date DATE,
      updated_by INTEGER,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(framework, control_id)
    )
  `);
}

// Defer table init until database is ready
let tablesReady = false;
function ensureTables() {
  if (tablesReady) {
    return;
  }
  try {
    initComplianceEngineTables();
    tablesReady = true;
  } catch {
    /* retry next request */
  }
}
router.use((_req, _res, next) => {
  ensureTables();
  next();
});

// ────────────────────────────────────────────────────────────
// Evidence CRUD
// ────────────────────────────────────────────────────────────

/** POST /evidence — create evidence artifact */
router.post(
  '/evidence',
  authenticateToken,
  [
    body('framework').trim().notEmpty().withMessage('framework is required'),
    body('control_id').trim().notEmpty().withMessage('control_id is required'),
    body('title').trim().notEmpty().withMessage('title is required'),
    body('description').optional().isString(),
    body('evidence_type')
      .optional()
      .isIn(['document', 'screenshot', 'log', 'policy', 'configuration', 'interview'])
      .withMessage('Invalid evidence_type'),
    body('status')
      .optional()
      .isIn(['draft', 'submitted', 'approved', 'rejected'])
      .withMessage('Invalid status'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const {
        framework,
        control_id,
        title,
        description,
        evidence_type = 'document',
        status = 'draft',
        assessor,
        attachment_path,
        attachment_name,
        notes,
      } = req.body;

      if (!framework || !control_id || !title) {
        return res.status(400).json({
          success: false,
          message: 'framework, control_id, and title are required',
        });
      }

      const result = execute(
        `INSERT INTO compliance_evidence
        (framework, control_id, title, description, evidence_type, status,
         assessor, attachment_path, attachment_name, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          framework,
          control_id,
          title,
          description,
          evidence_type,
          status,
          assessor,
          attachment_path,
          attachment_name,
          notes,
          req.user.userId,
        ]
      );

      logActivity(
        req.user.userId,
        'EVIDENCE_CREATE',
        'evidence',
        result.lastInsertRowid,
        `Evidence submitted for ${framework}/${control_id}: ${title}`
      );

      res.status(201).json({
        success: true,
        message: 'Evidence created',
        evidenceId: result.lastInsertRowid,
      });
    } catch (error) {
      console.error('Create evidence error:', error);
      res.status(500).json({ success: false, message: 'Failed to create evidence' });
    }
  }
);

/** GET /evidence — list evidence (optional filters: framework, control_id, status) */
router.get('/evidence', authenticateToken, (req, res) => {
  try {
    const { framework, control_id, status, page = 1, limit = 50 } = req.query;
    let sql = 'SELECT * FROM compliance_evidence WHERE 1=1';
    const params = [];

    if (framework) {
      sql += ' AND framework = ?';
      params.push(framework);
    }
    if (control_id) {
      sql += ' AND control_id = ?';
      params.push(control_id);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const records = query(sql, params);
    const total = queryOne('SELECT COUNT(*) as count FROM compliance_evidence')?.count || 0;

    res.json({
      success: true,
      evidence: records,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    console.error('List evidence error:', error);
    res.status(500).json({ success: false, message: 'Failed to list evidence' });
  }
});

/** GET /evidence/:id */
router.get('/evidence/:id', authenticateToken, (req, res) => {
  try {
    const ev = queryOne('SELECT * FROM compliance_evidence WHERE id = ?', [req.params.id]);
    if (!ev) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }
    res.json({ success: true, evidence: ev });
  } catch (error) {
    console.error('Get evidence error:', error);
    res.status(500).json({ success: false, message: 'Failed to get evidence' });
  }
});

/** PUT /evidence/:id */
router.put(
  '/evidence/:id',
  authenticateToken,
  requireOwnership('evidence', 'id'),
  [
    param('id').isInt().withMessage('Evidence ID must be an integer'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('evidence_type')
      .optional()
      .isIn(['document', 'screenshot', 'log', 'policy', 'configuration', 'interview'])
      .withMessage('Invalid evidence_type'),
    body('status')
      .optional()
      .isIn(['draft', 'submitted', 'approved', 'rejected'])
      .withMessage('Invalid status'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const existing = queryOne('SELECT * FROM compliance_evidence WHERE id = ?', [req.params.id]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Evidence not found' });
      }

      const {
        title = existing.title,
        description = existing.description,
        evidence_type = existing.evidence_type,
        status = existing.status,
        assessor = existing.assessor,
        notes = existing.notes,
      } = req.body;

      const assessed =
        status === 'approved' && existing.status !== 'approved'
          ? new Date().toISOString()
          : existing.assessed_at;

      execute(
        `UPDATE compliance_evidence
       SET title=?, description=?, evidence_type=?, status=?, assessor=?, assessed_at=?,
           notes=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`,
        [
          title,
          description,
          evidence_type,
          status,
          assessor,
          assessed,
          notes,
          req.user.userId,
          req.params.id,
        ]
      );

      logActivity(
        req.user.userId,
        'EVIDENCE_UPDATE',
        'evidence',
        req.params.id,
        `Evidence updated: ${title}`
      );

      res.json({ success: true, message: 'Evidence updated' });
    } catch (error) {
      console.error('Update evidence error:', error);
      res.status(500).json({ success: false, message: 'Failed to update evidence' });
    }
  }
);

/** DELETE /evidence/:id */
router.delete('/evidence/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const existing = queryOne('SELECT * FROM compliance_evidence WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Evidence not found' });
    }

    execute('DELETE FROM compliance_evidence WHERE id = ?', [req.params.id]);
    logActivity(
      req.user.userId,
      'EVIDENCE_DELETE',
      'evidence',
      req.params.id,
      `Evidence deleted: ${existing.title}`
    );

    res.json({ success: true, message: 'Evidence deleted' });
  } catch (error) {
    console.error('Delete evidence error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete evidence' });
  }
});

// ────────────────────────────────────────────────────────────
// Gap Scoring (P3.4.2)
// ────────────────────────────────────────────────────────────

/**
 * GET /gap-score
 * Returns aggregate gap score across all frameworks that have control_status rows.
 */
router.get('/gap-score', authenticateToken, (req, res) => {
  try {
    const frameworks = query(
      `SELECT framework,
              COUNT(*) as total_controls,
              SUM(CASE WHEN status='implemented' THEN 1 ELSE 0 END) as implemented,
              SUM(CASE WHEN status='partial' THEN 1 ELSE 0 END) as partial,
              SUM(CASE WHEN status='planned' THEN 1 ELSE 0 END) as planned,
              SUM(CASE WHEN status='not-met' THEN 1 ELSE 0 END) as not_met,
              SUM(CASE WHEN status='not-assessed' THEN 1 ELSE 0 END) as not_assessed,
              ROUND(AVG(implementation_pct), 1) as avg_pct
       FROM compliance_control_status
       GROUP BY framework`
    );

    const overall = {
      totalFrameworks: frameworks.length,
      frameworks: frameworks.map((fw) => ({
        framework: fw.framework,
        totalControls: fw.total_controls,
        implemented: fw.implemented,
        partial: fw.partial,
        planned: fw.planned,
        notMet: fw.not_met,
        notAssessed: fw.not_assessed,
        avgImplementationPct: fw.avg_pct,
        score:
          fw.total_controls > 0
            ? Math.round(((fw.implemented + fw.partial * 0.5) / fw.total_controls) * 100)
            : 0,
      })),
    };

    res.json({ success: true, ...overall });
  } catch (error) {
    console.error('Gap score error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute gap score' });
  }
});

/**
 * GET /gap-score/:framework
 * Returns per-control detail for a single framework.
 */
router.get('/gap-score/:framework', authenticateToken, (req, res) => {
  try {
    const controls = query(
      `SELECT * FROM compliance_control_status WHERE framework = ? ORDER BY control_id`,
      [req.params.framework]
    );

    if (controls.length === 0) {
      return res.status(404).json({ success: false, message: 'No data for this framework' });
    }

    const implemented = controls.filter((c) => c.status === 'implemented').length;
    const total = controls.length;

    res.json({
      success: true,
      framework: req.params.framework,
      totalControls: total,
      implemented,
      score:
        total > 0
          ? Math.round(
              ((implemented + controls.filter((c) => c.status === 'partial').length * 0.5) /
                total) *
                100
            )
          : 0,
      controls,
    });
  } catch (error) {
    console.error('Gap score by framework error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute framework gap score' });
  }
});

// ────────────────────────────────────────────────────────────
// Assessment Scheduling (P3.4.3)
// ────────────────────────────────────────────────────────────

/** POST /assessments */
router.post(
  '/assessments',
  authenticateToken,
  [
    body('framework').trim().notEmpty().withMessage('framework is required'),
    body('title').trim().notEmpty().withMessage('title is required'),
    body('scheduled_date').trim().notEmpty().withMessage('scheduled_date is required'),
    body('assessment_type')
      .optional()
      .isIn(['self', 'third-party', 'annual', 'continuous'])
      .withMessage('Invalid assessment_type'),
    body('reminder_days')
      .optional()
      .isInt({ min: 0 })
      .withMessage('reminder_days must be a non-negative integer'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const {
        framework,
        title,
        description,
        assessment_type = 'self',
        scheduled_date,
        assessor,
        scope,
        reminder_days = 7,
      } = req.body;

      if (!framework || !title || !scheduled_date) {
        return res.status(400).json({
          success: false,
          message: 'framework, title, and scheduled_date are required',
        });
      }

      const result = execute(
        `INSERT INTO compliance_assessments
        (framework, title, description, assessment_type, scheduled_date, assessor, scope, reminder_days, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          framework,
          title,
          description,
          assessment_type,
          scheduled_date,
          assessor,
          scope,
          reminder_days,
          req.user.userId,
        ]
      );

      logActivity(
        req.user.userId,
        'ASSESSMENT_SCHEDULE',
        'assessment',
        result.lastInsertRowid,
        `Assessment scheduled: ${title} for ${framework}`
      );

      res
        .status(201)
        .json({
          success: true,
          message: 'Assessment scheduled',
          assessmentId: result.lastInsertRowid,
        });
    } catch (error) {
      console.error('Schedule assessment error:', error);
      res.status(500).json({ success: false, message: 'Failed to schedule assessment' });
    }
  }
);

/** GET /assessments */
router.get('/assessments', authenticateToken, (req, res) => {
  try {
    const { framework, status, page = 1, limit = 50 } = req.query;
    let sql = 'SELECT * FROM compliance_assessments WHERE 1=1';
    const params = [];

    if (framework) {
      sql += ' AND framework = ?';
      params.push(framework);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY scheduled_date ASC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const assessments = query(sql, params);
    const total = queryOne('SELECT COUNT(*) as count FROM compliance_assessments')?.count || 0;

    // Flag upcoming assessments within reminder window
    const now = Date.now();
    for (const a of assessments) {
      const sched = new Date(a.scheduled_date).getTime();
      const reminderMs = (a.reminder_days || 7) * 24 * 60 * 60 * 1000;
      a.isUpcoming = a.status === 'scheduled' && sched - now <= reminderMs && sched >= now;
      a.isOverdue = a.status === 'scheduled' && sched < now;
    }

    res.json({
      success: true,
      assessments,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    console.error('List assessments error:', error);
    res.status(500).json({ success: false, message: 'Failed to list assessments' });
  }
});

/** PUT /assessments/:id */
router.put(
  '/assessments/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Assessment ID must be an integer'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status')
      .optional()
      .isIn(['scheduled', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status'),
    body('findings_count')
      .optional()
      .isInt({ min: 0 })
      .withMessage('findings_count must be a non-negative integer'),
    body('score')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('score must be between 0 and 100'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const existing = queryOne('SELECT * FROM compliance_assessments WHERE id = ?', [
        req.params.id,
      ]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }

      const {
        title = existing.title,
        description = existing.description,
        status = existing.status,
        scheduled_date = existing.scheduled_date,
        completed_date = existing.completed_date,
        assessor = existing.assessor,
        scope = existing.scope,
        findings_count = existing.findings_count,
        score = existing.score,
      } = req.body;

      execute(
        `UPDATE compliance_assessments
       SET title=?, description=?, status=?, scheduled_date=?, completed_date=?,
           assessor=?, scope=?, findings_count=?, score=?, updated_at=CURRENT_TIMESTAMP
       WHERE id=?`,
        [
          title,
          description,
          status,
          scheduled_date,
          completed_date,
          assessor,
          scope,
          findings_count,
          score,
          req.params.id,
        ]
      );

      logActivity(
        req.user.userId,
        'ASSESSMENT_UPDATE',
        'assessment',
        req.params.id,
        `Assessment updated: ${title}`
      );

      res.json({ success: true, message: 'Assessment updated' });
    } catch (error) {
      console.error('Update assessment error:', error);
      res.status(500).json({ success: false, message: 'Failed to update assessment' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// POA&M Export (P3.4.6)
// ────────────────────────────────────────────────────────────

/**
 * GET /export/poam?framework=cmmc
 * Exports all non-implemented controls as a POA&M JSON document.
 */
router.get('/export/poam', authenticateToken, (req, res) => {
  try {
    const { framework } = req.query;
    let sql = `SELECT * FROM compliance_control_status
               WHERE status NOT IN ('implemented', 'not-applicable')`;
    const params = [];

    if (framework) {
      sql += ' AND framework = ?';
      params.push(framework);
    }
    sql += ' ORDER BY framework, control_id';

    const items = query(sql, params);

    const poam = {
      title: 'Plan of Action & Milestones (POA&M)',
      generatedAt: new Date().toISOString(),
      framework: framework || 'all',
      totalItems: items.length,
      items: items.map((item, idx) => ({
        poamId: item.poam_id || `POAM-${String(idx + 1).padStart(4, '0')}`,
        framework: item.framework,
        controlId: item.control_id,
        status: item.status,
        implementationPct: item.implementation_pct,
        milestone: item.poam_milestone || 'To be determined',
        dueDate: item.poam_due_date || null,
        notes: item.notes,
      })),
    };

    res.json({ success: true, poam });
  } catch (error) {
    console.error('POA&M export error:', error);
    res.status(500).json({ success: false, message: 'Failed to export POA&M' });
  }
});

export default router;
