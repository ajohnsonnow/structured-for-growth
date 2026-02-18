/**
 * Records Management Routes (P3.3)
 *
 * Implements document metadata tracking, retention schedules,
 * legal hold management, disposition logging, and document
 * version control with diff tracking (P3.3.5).
 *
 * Supports NARA retention schedules and compliance with
 * Federal Records Act and 36 CFR 1220-1239.
 *
 * Endpoints:
 *   GET    /api/records                — List records with metadata
 *   POST   /api/records               — Create record metadata
 *   GET    /api/records/:id           — Get record with full metadata
 *   PUT    /api/records/:id           — Update record metadata
 *   DELETE /api/records/:id           — Dispose of record (with logging)
 *   POST   /api/records/:id/hold     — Place legal hold
 *   DELETE /api/records/:id/hold     — Release legal hold
 *   GET    /api/records/holds        — List all active holds
 *   GET    /api/records/disposition   — Get disposition log
 *   GET    /api/records/retention     — Get retention schedules
 *   GET    /api/records/:id/versions — List all versions of a record
 *   GET    /api/records/:id/versions/:version — Get specific version
 *   GET    /api/records/:id/diff/:v1/:v2 — Diff two versions
 */

import express from 'express';
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

const router = express.Router();

/**
 * Initialize records management tables if they don't exist
 */
export function initRecordsTables() {
  execute(`
    CREATE TABLE IF NOT EXISTS record_metadata (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      record_type TEXT NOT NULL DEFAULT 'document',
      category TEXT,
      classification TEXT DEFAULT 'unclassified',
      cui_category TEXT,
      cui_marking TEXT,
      retention_schedule TEXT,
      retention_years INTEGER DEFAULT 3,
      retention_start_date TEXT,
      disposition_date TEXT,
      disposition_action TEXT DEFAULT 'destroy',
      legal_hold INTEGER DEFAULT 0,
      legal_hold_reason TEXT,
      legal_hold_date TEXT,
      legal_hold_by INTEGER,
      status TEXT DEFAULT 'active',
      created_by INTEGER,
      updated_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_demo INTEGER DEFAULT 0
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS disposition_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      reason TEXT,
      performed_by INTEGER,
      performed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      details TEXT,
      FOREIGN KEY (record_id) REFERENCES record_metadata(id)
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS retention_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      authority TEXT,
      retention_years INTEGER NOT NULL,
      disposition_action TEXT NOT NULL DEFAULT 'destroy',
      record_types TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // P3.3.5 — Document version control table
  execute(`
    CREATE TABLE IF NOT EXISTS record_versions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      record_id INTEGER NOT NULL,
      version_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      classification TEXT,
      cui_category TEXT,
      cui_marking TEXT,
      content_snapshot TEXT,
      change_summary TEXT,
      changed_by INTEGER,
      changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (record_id) REFERENCES record_metadata(id),
      UNIQUE(record_id, version_number)
    )
  `);

  // Seed default NARA retention schedules
  const existingSchedules = queryOne('SELECT COUNT(*) as count FROM retention_schedules');
  if (!existingSchedules || existingSchedules.count === 0) {
    const defaultSchedules = [
      [
        'GRS-5.2-020',
        'Transitory Records',
        'Records of short-term interest',
        'GRS 5.2, item 020',
        1,
        'destroy',
        'transitory',
      ],
      [
        'GRS-5.1-010',
        'Common Office Records',
        'Routine administrative correspondence',
        'GRS 5.1, item 010',
        3,
        'destroy',
        'correspondence',
      ],
      [
        'GRS-4.2-020',
        'Information Technology Records',
        'System documentation and specs',
        'GRS 4.2, item 020',
        5,
        'destroy',
        'technical',
      ],
      [
        'GRS-6.1-010',
        'Email Records',
        'Federal email records management',
        'GRS 6.1, item 010',
        7,
        'destroy',
        'email',
      ],
      [
        'GRS-2.7-010',
        'Employee Training Records',
        'Individual training records',
        'GRS 2.7, item 010',
        5,
        'destroy',
        'training',
      ],
      [
        'GRS-3.1-010',
        'General Technology Management',
        'IT project management records',
        'GRS 3.1, item 010',
        5,
        'destroy',
        'project',
      ],
      [
        'GRS-4.1-010',
        'Contract Records',
        'Contract and procurement records',
        'GRS 4.1, item 010',
        6,
        'destroy',
        'contract',
      ],
      [
        'NARA-PERM-01',
        'Permanent Records',
        'Records of permanent historical value',
        'NARA Manual',
        0,
        'transfer',
        'permanent',
      ],
    ];

    for (const [scheduleId, name, desc, authority, years, action, types] of defaultSchedules) {
      execute(
        'INSERT OR IGNORE INTO retention_schedules (schedule_id, name, description, authority, retention_years, disposition_action, record_types) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [scheduleId, name, desc, authority, years, action, types]
      );
    }
  }
}

// Defer table init until database is ready
let tablesReady = false;
function ensureTables() {
  if (tablesReady) {
    return;
  }
  try {
    initRecordsTables();
    tablesReady = true;
  } catch {
    /* retry next request */
  }
}
router.use((_req, _res, next) => {
  ensureTables();
  next();
});

/**
 * GET /
 * List all records with metadata
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, type, category, hold, page = 1, limit = 50 } = req.query;
    let sql = 'SELECT * FROM record_metadata WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (type) {
      sql += ' AND record_type = ?';
      params.push(type);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (hold === 'true') {
      sql += ' AND legal_hold = 1';
    }

    sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const records = query(sql, params);
    const total = queryOne('SELECT COUNT(*) as count FROM record_metadata')?.count || 0;

    res.json({
      success: true,
      records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('List records error:', error);
    res.status(500).json({ success: false, message: 'Failed to list records' });
  }
});

/**
 * POST /
 * Create new record metadata
 */
router.post(
  '/',
  authenticateToken,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('record_type')
      .optional()
      .isString()
      .isIn([
        'document',
        'email',
        'correspondence',
        'technical',
        'training',
        'project',
        'contract',
        'transitory',
        'permanent',
      ])
      .withMessage('Invalid record_type'),
    body('classification')
      .optional()
      .isString()
      .isIn(['unclassified', 'cui', 'confidential', 'secret', 'top_secret'])
      .withMessage('Invalid classification'),
    body('retention_years')
      .optional()
      .isInt({ min: 0 })
      .withMessage('retention_years must be a non-negative integer'),
    body('disposition_action')
      .optional()
      .isIn(['destroy', 'transfer', 'archive'])
      .withMessage('Invalid disposition_action'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const {
        title,
        description,
        record_type = 'document',
        category,
        classification = 'unclassified',
        cui_category,
        cui_marking,
        retention_schedule,
        retention_years = 3,
        disposition_action = 'destroy',
      } = req.body;

      if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }

      // Look up retention schedule if provided
      let retYears = retention_years;
      let dispAction = disposition_action;
      if (retention_schedule) {
        const schedule = queryOne(
          'SELECT retention_years, disposition_action FROM retention_schedules WHERE schedule_id = ?',
          [retention_schedule]
        );
        if (schedule) {
          retYears = schedule.retention_years;
          dispAction = schedule.disposition_action;
        }
      }

      const retentionStart = new Date().toISOString().split('T')[0];
      const dispositionDate =
        retYears > 0
          ? new Date(Date.now() + retYears * 365.25 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0]
          : null;

      const result = execute(
        `INSERT INTO record_metadata
        (title, description, record_type, category, classification, cui_category, cui_marking,
         retention_schedule, retention_years, retention_start_date, disposition_date, disposition_action, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          record_type,
          category,
          classification,
          cui_category,
          cui_marking,
          retention_schedule,
          retYears,
          retentionStart,
          dispositionDate,
          dispAction,
          req.user.userId,
        ]
      );

      logActivity(
        req.user.userId,
        'RECORD_CREATE',
        'record',
        result.lastInsertRowid,
        `Record created: ${title}`
      );

      res.status(201).json({
        success: true,
        message: 'Record created',
        recordId: result.lastInsertRowid,
      });
    } catch (error) {
      console.error('Create record error:', error);
      res.status(500).json({ success: false, message: 'Failed to create record' });
    }
  }
);

/**
 * GET /:id
 * Get a single record with full metadata
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const record = queryOne('SELECT * FROM record_metadata WHERE id = ?', [req.params.id]);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Get disposition history
    const dispositionHistory = query(
      'SELECT * FROM disposition_log WHERE record_id = ? ORDER BY performed_at DESC',
      [req.params.id]
    );

    res.json({
      success: true,
      record,
      dispositionHistory,
    });
  } catch (error) {
    console.error('Get record error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve record' });
  }
});

/**
 * PUT /:id
 * Update record metadata
 */
router.put(
  '/:id',
  authenticateToken,
  requireOwnership('record', 'id'),
  [
    param('id').isInt().withMessage('Record ID must be an integer'),
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('classification')
      .optional()
      .isIn(['unclassified', 'cui', 'confidential', 'secret', 'top_secret'])
      .withMessage('Invalid classification'),
    body('status')
      .optional()
      .isIn(['active', 'archived', 'disposed', 'draft'])
      .withMessage('Invalid status'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const existing = queryOne('SELECT * FROM record_metadata WHERE id = ?', [req.params.id]);

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      if (existing.legal_hold) {
        return res.status(403).json({
          success: false,
          message: 'Record is under legal hold and cannot be modified',
        });
      }

      const {
        title = existing.title,
        description = existing.description,
        category = existing.category,
        classification = existing.classification,
        cui_category = existing.cui_category,
        cui_marking = existing.cui_marking,
        status = existing.status,
      } = req.body;

      // P3.3.5 — Create version snapshot before updating
      createVersionSnapshot(
        req.params.id,
        req.user.userId,
        req.body.change_summary || 'Record updated'
      );

      execute(
        `UPDATE record_metadata
       SET title = ?, description = ?, category = ?, classification = ?,
           cui_category = ?, cui_marking = ?, status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
        [
          title,
          description,
          category,
          classification,
          cui_category,
          cui_marking,
          status,
          req.user.userId,
          req.params.id,
        ]
      );

      logActivity(
        req.user.userId,
        'RECORD_UPDATE',
        'record',
        req.params.id,
        `Record updated: ${title}`
      );

      res.json({ success: true, message: 'Record updated' });
    } catch (error) {
      console.error('Update record error:', error);
      res.status(500).json({ success: false, message: 'Failed to update record' });
    }
  }
);

/**
 * DELETE /:id
 * Dispose of a record (soft delete with logging)
 */
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const record = queryOne('SELECT * FROM record_metadata WHERE id = ?', [req.params.id]);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (record.legal_hold) {
      return res.status(403).json({
        success: false,
        message: 'Cannot dispose record under legal hold',
      });
    }

    const reason = req.body?.reason || 'Retention period expired';

    // Log the disposition
    execute(
      'INSERT INTO disposition_log (record_id, action, reason, performed_by, details) VALUES (?, ?, ?, ?, ?)',
      [
        req.params.id,
        record.disposition_action || 'destroy',
        reason,
        req.user.userId,
        JSON.stringify({ title: record.title, retention_years: record.retention_years }),
      ]
    );

    // Mark as disposed
    execute(
      'UPDATE record_metadata SET status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['disposed', req.user.userId, req.params.id]
    );

    logActivity(
      req.user.userId,
      'RECORD_DISPOSE',
      'record',
      req.params.id,
      `Record disposed: ${record.title}`
    );

    res.json({ success: true, message: 'Record disposed and logged' });
  } catch (error) {
    console.error('Dispose record error:', error);
    res.status(500).json({ success: false, message: 'Failed to dispose record' });
  }
});

/**
 * POST /:id/hold
 * Place a legal hold on a record
 */
router.post(
  '/:id/hold',
  authenticateToken,
  requireRole('admin'),
  [
    param('id').isInt().withMessage('Record ID must be an integer'),
    body('reason')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Reason must be at most 500 characters'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const record = queryOne('SELECT * FROM record_metadata WHERE id = ?', [req.params.id]);

      if (!record) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      const reason = req.body?.reason || 'Legal hold placed';

      execute(
        `UPDATE record_metadata
       SET legal_hold = 1, legal_hold_reason = ?, legal_hold_date = CURRENT_TIMESTAMP,
           legal_hold_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
        [reason, req.user.userId, req.params.id]
      );

      // Log the hold
      execute(
        'INSERT INTO disposition_log (record_id, action, reason, performed_by) VALUES (?, ?, ?, ?)',
        [req.params.id, 'legal_hold', reason, req.user.userId]
      );

      logActivity(
        req.user.userId,
        'LEGAL_HOLD',
        'record',
        req.params.id,
        `Legal hold placed: ${record.title}`
      );

      res.json({ success: true, message: 'Legal hold placed' });
    } catch (error) {
      console.error('Legal hold error:', error);
      res.status(500).json({ success: false, message: 'Failed to place legal hold' });
    }
  }
);

/**
 * DELETE /:id/hold
 * Release a legal hold
 */
router.delete('/:id/hold', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const record = queryOne('SELECT * FROM record_metadata WHERE id = ?', [req.params.id]);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    if (!record.legal_hold) {
      return res.status(400).json({ success: false, message: 'No legal hold on this record' });
    }

    execute(
      `UPDATE record_metadata
       SET legal_hold = 0, legal_hold_reason = NULL, legal_hold_date = NULL,
           legal_hold_by = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.params.id]
    );

    // Log the release
    execute(
      'INSERT INTO disposition_log (record_id, action, reason, performed_by) VALUES (?, ?, ?, ?)',
      [req.params.id, 'hold_released', req.body?.reason || 'Hold released', req.user.userId]
    );

    logActivity(
      req.user.userId,
      'HOLD_RELEASED',
      'record',
      req.params.id,
      `Legal hold released: ${record.title}`
    );

    res.json({ success: true, message: 'Legal hold released' });
  } catch (error) {
    console.error('Release hold error:', error);
    res.status(500).json({ success: false, message: 'Failed to release hold' });
  }
});

/**
 * GET /holds
 * List all records under legal hold
 */
router.get('/holds/active', authenticateToken, (req, res) => {
  try {
    const holds = query(
      'SELECT * FROM record_metadata WHERE legal_hold = 1 ORDER BY legal_hold_date DESC'
    );

    res.json({ success: true, holds });
  } catch (error) {
    console.error('List holds error:', error);
    res.status(500).json({ success: false, message: 'Failed to list holds' });
  }
});

/**
 * GET /disposition
 * Get disposition log entries
 */
router.get('/disposition/log', authenticateToken, (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const entries = query(
      `SELECT dl.*, rm.title as record_title
       FROM disposition_log dl
       LEFT JOIN record_metadata rm ON dl.record_id = rm.id
       ORDER BY dl.performed_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );

    const total = queryOne('SELECT COUNT(*) as count FROM disposition_log')?.count || 0;

    res.json({
      success: true,
      entries,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Disposition log error:', error);
    res.status(500).json({ success: false, message: 'Failed to get disposition log' });
  }
});

/**
 * GET /retention
 * Get all retention schedules
 */
router.get('/retention/schedules', authenticateToken, (req, res) => {
  try {
    const schedules = query('SELECT * FROM retention_schedules ORDER BY schedule_id');
    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Retention schedules error:', error);
    res.status(500).json({ success: false, message: 'Failed to get retention schedules' });
  }
});

// ═══════════════════════════════════════════════════
// P3.3.5 — Document Version Control with Diff Tracking
// Standard: MIL-HDBK-61A Configuration Management
// ═══════════════════════════════════════════════════

/**
 * Create a version snapshot of a record's current state.
 * Called automatically on updates, or manually for explicit versioning.
 */
function createVersionSnapshot(recordId, userId, changeSummary = '') {
  const record = queryOne('SELECT * FROM record_metadata WHERE id = ?', [recordId]);
  if (!record) {
    return null;
  }

  // Get next version number
  const latest = queryOne(
    'SELECT MAX(version_number) as maxVer FROM record_versions WHERE record_id = ?',
    [recordId]
  );
  const nextVersion = (latest?.maxVer || 0) + 1;

  const result = execute(
    `INSERT INTO record_versions
      (record_id, version_number, title, description, category, classification,
       cui_category, cui_marking, content_snapshot, change_summary, changed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      recordId,
      nextVersion,
      record.title,
      record.description,
      record.category,
      record.classification,
      record.cui_category,
      record.cui_marking,
      JSON.stringify({
        record_type: record.record_type,
        retention_schedule: record.retention_schedule,
        retention_years: record.retention_years,
        disposition_action: record.disposition_action,
        status: record.status,
      }),
      changeSummary,
      userId,
    ]
  );

  return { versionId: result.lastInsertRowid, versionNumber: nextVersion };
}

/**
 * Compute a simple diff between two version snapshots.
 * Returns an array of { field, from, to } changes.
 */
function diffVersions(v1, v2) {
  const trackFields = [
    'title',
    'description',
    'category',
    'classification',
    'cui_category',
    'cui_marking',
  ];

  const changes = [];

  for (const field of trackFields) {
    if (v1[field] !== v2[field]) {
      changes.push({
        field,
        from: v1[field] ?? null,
        to: v2[field] ?? null,
      });
    }
  }

  // Also diff the content snapshot (stringified metadata)
  try {
    const snap1 = JSON.parse(v1.content_snapshot || '{}');
    const snap2 = JSON.parse(v2.content_snapshot || '{}');
    for (const key of Object.keys({ ...snap1, ...snap2 })) {
      if (snap1[key] !== snap2[key]) {
        changes.push({
          field: `metadata.${key}`,
          from: snap1[key] ?? null,
          to: snap2[key] ?? null,
        });
      }
    }
  } catch {
    // If snapshots aren't parseable, skip metadata diff
  }

  return changes;
}

/**
 * GET /:id/versions
 * List all versions of a record (newest first).
 */
router.get('/:id/versions', authenticateToken, (req, res) => {
  try {
    const record = queryOne('SELECT id, title FROM record_metadata WHERE id = ?', [req.params.id]);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    const versions = query(
      `SELECT id, record_id, version_number, title, change_summary, changed_by, changed_at
       FROM record_versions WHERE record_id = ? ORDER BY version_number DESC`,
      [req.params.id]
    );

    res.json({
      success: true,
      record: { id: record.id, title: record.title },
      versions,
      totalVersions: versions.length,
    });
  } catch (error) {
    console.error('List versions error:', error);
    res.status(500).json({ success: false, message: 'Failed to list versions' });
  }
});

/**
 * GET /:id/versions/:version
 * Get a specific version snapshot.
 */
router.get('/:id/versions/:version', authenticateToken, (req, res) => {
  try {
    const version = queryOne(
      'SELECT * FROM record_versions WHERE record_id = ? AND version_number = ?',
      [req.params.id, req.params.version]
    );

    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    // Parse the content snapshot for readability
    try {
      version.content_snapshot = JSON.parse(version.content_snapshot);
    } catch {
      /* leave as string */
    }

    res.json({ success: true, version });
  } catch (error) {
    console.error('Get version error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve version' });
  }
});

/**
 * GET /:id/diff/:v1/:v2
 * Compute diff between two versions of a record.
 */
router.get('/:id/diff/:v1/:v2', authenticateToken, (req, res) => {
  try {
    const version1 = queryOne(
      'SELECT * FROM record_versions WHERE record_id = ? AND version_number = ?',
      [req.params.id, req.params.v1]
    );
    const version2 = queryOne(
      'SELECT * FROM record_versions WHERE record_id = ? AND version_number = ?',
      [req.params.id, req.params.v2]
    );

    if (!version1 || !version2) {
      return res.status(404).json({
        success: false,
        message: 'One or both versions not found',
      });
    }

    const changes = diffVersions(version1, version2);

    res.json({
      success: true,
      recordId: Number(req.params.id),
      from: { version: Number(req.params.v1), changedAt: version1.changed_at },
      to: { version: Number(req.params.v2), changedAt: version2.changed_at },
      changes,
      totalChanges: changes.length,
    });
  } catch (error) {
    console.error('Diff versions error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute diff' });
  }
});

/**
 * POST /:id/versions
 * Manually create a version snapshot (checkpoint).
 */
router.post(
  '/:id/versions',
  authenticateToken,
  [
    param('id').isInt().withMessage('Record ID must be an integer'),
    body('change_summary')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Change summary must be at most 500 characters'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const record = queryOne('SELECT id, title FROM record_metadata WHERE id = ?', [
        req.params.id,
      ]);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      const { change_summary = 'Manual checkpoint' } = req.body;
      const versionInfo = createVersionSnapshot(req.params.id, req.user.userId, change_summary);

      if (!versionInfo) {
        return res.status(500).json({ success: false, message: 'Failed to create version' });
      }

      logActivity(
        req.user.userId,
        'RECORD_VERSION',
        'record',
        req.params.id,
        `Version ${versionInfo.versionNumber} created: ${change_summary}`
      );

      res.status(201).json({
        success: true,
        message: `Version ${versionInfo.versionNumber} created`,
        ...versionInfo,
      });
    } catch (error) {
      console.error('Create version error:', error);
      res.status(500).json({ success: false, message: 'Failed to create version' });
    }
  }
);

export { createVersionSnapshot };

export default router;
