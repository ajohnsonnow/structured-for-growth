/**
 * USACE/DoD Integration Routes (P4.2)
 *
 * Provides endpoints for USACE document templates, Standard Form 298 generation,
 * distribution statement management, DrChecks export, MIL-STD-498 templates,
 * CDRL tracking, and NEPA document templates.
 *
 * Endpoints:
 *   GET    /api/usace/templates                    — List USACE document templates (4.2.1)
 *   GET    /api/usace/templates/:type              — Get specific template
 *   POST   /api/usace/sf298/generate               — Generate SF 298 page (4.2.2)
 *   GET    /api/usace/distribution-statements      — Get distribution statements (4.2.3)
 *   POST   /api/usace/distribution-statements/mark — Generate marking text
 *   POST   /api/usace/drchecks/export              — Export DrChecks format (4.2.4)
 *   GET    /api/usace/mil-std-498                   — List MIL-STD-498 templates (4.2.5)
 *   GET    /api/usace/mil-std-498/:type             — Get specific MIL-STD-498 DID
 *   POST   /api/usace/cdrl                          — Create CDRL entry (4.2.6)
 *   GET    /api/usace/cdrl                          — List CDRLs
 *   GET    /api/usace/cdrl/:id                      — Get CDRL detail
 *   PUT    /api/usace/cdrl/:id                      — Update CDRL
 *   DELETE /api/usace/cdrl/:id                      — Delete CDRL
 *   GET    /api/usace/nepa                          — List NEPA templates (4.2.7)
 *   GET    /api/usace/nepa/:type                    — Get specific NEPA template
 *
 * Standards: ER 25-1-100, EP 25-1-100, DoD Dir 5230.24, MIL-STD-498, DFARS, CEQ 40 CFR
 */

import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createLogger } from '../lib/logger.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { requireOwnership } from '../middleware/ownershipGuard.js';
import { execute, query, queryOne } from '../models/database.js';

const router = Router();
const logger = createLogger('usace-routes');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data/usace');

// ────────────────────────────────────────────────────────────
// Database Setup — CDRL Tracking (4.2.6)
// ────────────────────────────────────────────────────────────

function initUsaceTables() {
  execute(`
    CREATE TABLE IF NOT EXISTS cdrl_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cdrl_sequence TEXT NOT NULL,
      contract_number TEXT,
      contractor TEXT,
      data_item_title TEXT NOT NULL,
      data_item_subtitle TEXT,
      did_number TEXT,
      authority TEXT,
      require_date TEXT,
      distribution_statement TEXT DEFAULT 'A',
      frequency TEXT DEFAULT 'ONE/R',
      delivery_event TEXT,
      delivery_date TEXT,
      status TEXT DEFAULT 'pending',
      approval_status TEXT DEFAULT 'not-submitted',
      notes TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS cdrl_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cdrl_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      actor_id INTEGER,
      old_status TEXT,
      new_status TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  logger.debug('USACE tables initialized');
}

// Defer table init until database is ready
let tablesReady = false;
function ensureTables() {
  if (tablesReady) {
    return;
  }
  try {
    initUsaceTables();
    tablesReady = true;
  } catch {
    /* retry next request */
  }
}
router.use((_req, _res, next) => {
  ensureTables();
  next();
});

// Validation helper
function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

// Helper: load JSON data file
async function loadDataFile(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// ────────────────────────────────────────────────────────────
// 4.2.1 — USACE Document Template Library
// ────────────────────────────────────────────────────────────

router.get('/templates', authenticateToken, async (_req, res) => {
  try {
    const data = await loadDataFile('document-templates.json');
    const templates = Object.entries(data.templates).map(([key, t]) => ({
      type: key,
      id: t.id,
      name: t.name,
      authority: t.authority,
      description: t.description,
      sectionCount: t.sections.length,
    }));
    res.json({ success: true, data: templates });
  } catch (err) {
    logger.error('Failed to load USACE templates', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load templates' });
  }
});

router.get('/templates/:type', authenticateToken, async (req, res) => {
  try {
    const data = await loadDataFile('document-templates.json');
    const template = data.templates[req.params.type.toUpperCase()];
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: `Template type "${req.params.type}" not found` });
    }
    res.json({ success: true, data: template });
  } catch (err) {
    logger.error('Failed to load USACE template', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load template' });
  }
});

// ────────────────────────────────────────────────────────────
// 4.2.2 — Standard Form 298 Generator
// ────────────────────────────────────────────────────────────

router.get('/sf298', authenticateToken, async (_req, res) => {
  try {
    const template = await loadDataFile('sf298-template.json');
    res.json({ success: true, data: template });
  } catch (err) {
    logger.error('Failed to load SF 298 template', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load SF 298 template' });
  }
});

router.post(
  '/sf298/generate',
  authenticateToken,
  [body('data').isObject().withMessage('SF 298 field data is required')],
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const template = await loadDataFile('sf298-template.json');
      const { data: formData } = req.body;

      // Validate required fields
      const missingFields = [];
      for (const field of template.fields) {
        if (field.required && !field.subBlocks) {
          if (!formData[field.name]) {
            missingFields.push(field.label);
          }
        }
        if (field.subBlocks) {
          for (const sub of field.subBlocks) {
            if (sub.required && !formData[sub.name]) {
              missingFields.push(sub.label);
            }
          }
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
          missingFields,
        });
      }

      // Generate the SF 298 output as structured data
      const sf298 = {
        formTitle: template.formTitle,
        generatedAt: new Date().toISOString(),
        blocks: template.fields.map((field) => {
          if (field.subBlocks) {
            return {
              block: field.block,
              label: field.label || `Block ${field.block}`,
              entries: field.subBlocks.map((sub) => ({
                label: sub.label,
                value: formData[sub.name] || '',
              })),
            };
          }
          return {
            block: field.block,
            label: field.label,
            value: formData[field.name] || '',
          };
        }),
      };

      res.json({ success: true, data: sf298 });
    } catch (err) {
      logger.error('SF 298 generation failed', { error: err.message });
      res.status(500).json({ success: false, message: 'SF 298 generation failed' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// 4.2.3 — Distribution Statement Selector
// ────────────────────────────────────────────────────────────

router.get('/distribution-statements', authenticateToken, async (_req, res) => {
  try {
    const data = await loadDataFile('distribution-statements.json');
    res.json({ success: true, data: data.distributionStatements });
  } catch (err) {
    logger.error('Failed to load distribution statements', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load distribution statements' });
  }
});

router.post(
  '/distribution-statements/mark',
  authenticateToken,
  [
    body('letter')
      .isIn(['A', 'B', 'C', 'D', 'E', 'F', 'X'])
      .withMessage('Invalid distribution statement letter'),
    body('reason').optional().isString(),
    body('date').optional().isString(),
    body('office').optional().isString(),
  ],
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const data = await loadDataFile('distribution-statements.json');
      const { letter, reason, date, office } = req.body;
      const stmt = data.distributionStatements[letter];

      if (!stmt) {
        return res
          .status(404)
          .json({ success: false, message: 'Distribution statement not found' });
      }

      // Build the marking text
      let marking = `DISTRIBUTION STATEMENT ${letter}. ${stmt.text}.`;

      if (stmt.requiresReason) {
        if (!reason) {
          return res.status(400).json({
            success: false,
            message: `Distribution Statement ${letter} requires a reason`,
            validReasons: stmt.reasons,
          });
        }
        marking += ` Reason: ${reason}.`;
      }
      if (date) {
        marking += ` ${date}.`;
      }
      if (office) {
        marking += ` ${office}.`;
      }

      res.json({
        success: true,
        data: {
          letter,
          label: stmt.label,
          marking: marking.trim(),
          fullStatement: stmt,
        },
      });
    } catch (err) {
      logger.error('Distribution statement marking failed', { error: err.message });
      res.status(500).json({ success: false, message: 'Marking generation failed' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// 4.2.4 — DrChecks-Compatible Export
// ────────────────────────────────────────────────────────────

router.post(
  '/drchecks/export',
  authenticateToken,
  [
    body('projectName').isString().notEmpty(),
    body('reviewType').isString().notEmpty(),
    body('comments').isArray({ min: 1 }).withMessage('At least one comment is required'),
    body('comments.*.discipline').isString().notEmpty(),
    body('comments.*.sheetRef').optional().isString(),
    body('comments.*.specSection').optional().isString(),
    body('comments.*.commentText').isString().notEmpty(),
    body('comments.*.classification').isIn(['Critical', 'Major', 'Minor', 'Informational']),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const { projectName, reviewType, comments, reviewer } = req.body;

      // Generate DrChecks-compatible XML-like format
      const drChecksExport = {
        header: {
          projectName,
          reviewType,
          reviewer: reviewer || 'Structured for Growth Platform',
          exportDate: new Date().toISOString(),
          commentCount: comments.length,
          standard: 'ER 1110-1-8159',
        },
        comments: comments.map((c, i) => ({
          commentId: `C-${String(i + 1).padStart(4, '0')}`,
          discipline: c.discipline,
          sheetReference: c.sheetRef || 'N/A',
          specSection: c.specSection || 'N/A',
          classification: c.classification,
          comment: c.commentText,
          suggestedAction: c.suggestedAction || '',
          status: 'Open',
          response: '',
          responseStatus: 'Pending',
        })),
        summary: {
          critical: comments.filter((c) => c.classification === 'Critical').length,
          major: comments.filter((c) => c.classification === 'Major').length,
          minor: comments.filter((c) => c.classification === 'Minor').length,
          informational: comments.filter((c) => c.classification === 'Informational').length,
        },
      };

      res.json({ success: true, data: drChecksExport });
    } catch (err) {
      logger.error('DrChecks export failed', { error: err.message });
      res.status(500).json({ success: false, message: 'Export failed' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// 4.2.5 — MIL-STD-498 Templates
// ────────────────────────────────────────────────────────────

router.get('/mil-std-498', authenticateToken, async (_req, res) => {
  try {
    const data = await loadDataFile('mil-std-498-templates.json');
    const templates = Object.entries(data.templates).map(([type, t]) => ({
      type,
      id: t.id,
      did: t.did,
      name: t.name,
      description: t.description,
      sectionCount: t.sections.length,
    }));
    res.json({ success: true, data: { standard: data.standard, title: data.title, templates } });
  } catch (err) {
    logger.error('Failed to load MIL-STD-498 templates', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load templates' });
  }
});

router.get('/mil-std-498/:type', authenticateToken, async (req, res) => {
  try {
    const data = await loadDataFile('mil-std-498-templates.json');
    const template = data.templates[req.params.type.toUpperCase()];
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: `MIL-STD-498 template "${req.params.type}" not found` });
    }
    res.json({ success: true, data: template });
  } catch (err) {
    logger.error('Failed to load MIL-STD-498 template', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load template' });
  }
});

// ────────────────────────────────────────────────────────────
// 4.2.6 — CDRL Management Tracker (DD Form 1423)
// ────────────────────────────────────────────────────────────

router.post(
  '/cdrl',
  authenticateToken,
  [
    body('cdrl_sequence')
      .isString()
      .notEmpty()
      .withMessage('CDRL sequence (e.g., A001) is required'),
    body('data_item_title').isString().notEmpty().withMessage('Data item title is required'),
    body('did_number').optional().isString(),
    body('contract_number').optional().isString(),
    body('contractor').optional().isString(),
    body('frequency').optional().isString(),
    body('distribution_statement').optional().isIn(['A', 'B', 'C', 'D', 'E', 'F', 'X']),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const b = req.body;
      execute(
        `INSERT INTO cdrl_items
          (cdrl_sequence, contract_number, contractor, data_item_title, data_item_subtitle,
           did_number, authority, frequency, distribution_statement, delivery_event,
           delivery_date, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          b.cdrl_sequence,
          b.contract_number || null,
          b.contractor || null,
          b.data_item_title,
          b.data_item_subtitle || null,
          b.did_number || null,
          b.authority || null,
          b.frequency || 'ONE/R',
          b.distribution_statement || 'A',
          b.delivery_event || null,
          b.delivery_date || null,
          b.notes || null,
          req.user.id,
        ]
      );

      const row = queryOne('SELECT last_insert_rowid() as id');

      execute(
        'INSERT INTO cdrl_history (cdrl_id, action, actor_id, new_status, notes) VALUES (?, ?, ?, ?, ?)',
        [row.id, 'created', req.user.id, 'pending', 'CDRL item created']
      );

      res.status(201).json({ success: true, data: { id: row.id, status: 'pending' } });
    } catch (err) {
      logger.error('CDRL creation failed', { error: err.message });
      res.status(500).json({ success: false, message: 'CDRL creation failed' });
    }
  }
);

router.get('/cdrl', authenticateToken, (req, res) => {
  try {
    const { status, contract_number, page = 1, limit = 20 } = req.query;
    let where = 'WHERE 1=1';
    const params = [];

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
    if (contract_number) {
      where += ' AND contract_number = ?';
      params.push(contract_number);
    }

    const countRow = queryOne(`SELECT COUNT(*) as total FROM cdrl_items ${where}`, params);
    const total = countRow?.total || 0;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const items = query(
      `SELECT * FROM cdrl_items ${where} ORDER BY cdrl_sequence ASC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: { items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    logger.error('CDRL list failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to list CDRLs' });
  }
});

router.get('/cdrl/:id', authenticateToken, param('id').isInt(), (req, res) => {
  const valErr = handleValidation(req, res);
  if (valErr) {
    return;
  }

  try {
    const item = queryOne('SELECT * FROM cdrl_items WHERE id = ?', [parseInt(req.params.id)]);
    if (!item) {
      return res.status(404).json({ success: false, message: 'CDRL item not found' });
    }

    const history = query('SELECT * FROM cdrl_history WHERE cdrl_id = ? ORDER BY created_at DESC', [
      parseInt(req.params.id),
    ]);

    res.json({ success: true, data: { ...item, history } });
  } catch (err) {
    logger.error('CDRL detail failed', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to get CDRL' });
  }
});

router.put(
  '/cdrl/:id',
  authenticateToken,
  requireOwnership('cdrl', 'id'),
  [
    param('id').isInt(),
    body('cdrl_sequence')
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage('cdrl_sequence cannot be empty'),
    body('status')
      .optional()
      .isIn(['draft', 'submitted', 'approved', 'rejected', 'revision'])
      .withMessage('Invalid status'),
    body('approval_status')
      .optional()
      .isIn(['pending', 'approved', 'rejected', 'conditionally-approved'])
      .withMessage('Invalid approval_status'),
    body('distribution_statement')
      .optional()
      .isIn(['A', 'B', 'C', 'D', 'E', 'F', 'X'])
      .withMessage('Invalid distribution statement'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const existing = queryOne('SELECT * FROM cdrl_items WHERE id = ?', [parseInt(req.params.id)]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'CDRL item not found' });
      }

      const b = req.body;
      const fields = [];
      const values = [];

      const allowed = [
        'cdrl_sequence',
        'contract_number',
        'contractor',
        'data_item_title',
        'data_item_subtitle',
        'did_number',
        'authority',
        'frequency',
        'distribution_statement',
        'delivery_event',
        'delivery_date',
        'status',
        'approval_status',
        'notes',
      ];

      for (const field of allowed) {
        if (b[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(b[field]);
        }
      }

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(parseInt(req.params.id));

      execute(`UPDATE cdrl_items SET ${fields.join(', ')} WHERE id = ?`, values);

      // Track status changes
      if (b.status && b.status !== existing.status) {
        execute(
          'INSERT INTO cdrl_history (cdrl_id, action, actor_id, old_status, new_status, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [
            parseInt(req.params.id),
            'status_change',
            req.user.id,
            existing.status,
            b.status,
            b.notes || null,
          ]
        );
      }

      res.json({ success: true, message: 'CDRL updated' });
    } catch (err) {
      logger.error('CDRL update failed', { error: err.message });
      res.status(500).json({ success: false, message: 'CDRL update failed' });
    }
  }
);

router.delete(
  '/cdrl/:id',
  authenticateToken,
  requireRole('admin'),
  param('id').isInt(),
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }

    try {
      const existing = queryOne('SELECT * FROM cdrl_items WHERE id = ?', [parseInt(req.params.id)]);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'CDRL item not found' });
      }

      execute('DELETE FROM cdrl_history WHERE cdrl_id = ?', [parseInt(req.params.id)]);
      execute('DELETE FROM cdrl_items WHERE id = ?', [parseInt(req.params.id)]);

      res.json({ success: true, message: 'CDRL deleted' });
    } catch (err) {
      logger.error('CDRL delete failed', { error: err.message });
      res.status(500).json({ success: false, message: 'CDRL delete failed' });
    }
  }
);

// ────────────────────────────────────────────────────────────
// 4.2.7 — NEPA Document Templates
// ────────────────────────────────────────────────────────────

router.get('/nepa', authenticateToken, async (_req, res) => {
  try {
    const data = await loadDataFile('nepa-templates.json');
    const templates = Object.entries(data.nepaTemplates).map(([type, t]) => ({
      type,
      id: t.id,
      name: t.name,
      authority: t.authority,
      description: t.description,
      sectionCount: t.sections.length,
    }));
    res.json({ success: true, data: templates });
  } catch (err) {
    logger.error('Failed to load NEPA templates', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load NEPA templates' });
  }
});

router.get('/nepa/:type', authenticateToken, async (req, res) => {
  try {
    const data = await loadDataFile('nepa-templates.json');
    const template = data.nepaTemplates[req.params.type.toUpperCase()];
    if (!template) {
      return res
        .status(404)
        .json({ success: false, message: `NEPA template "${req.params.type}" not found` });
    }
    res.json({ success: true, data: template });
  } catch (err) {
    logger.error('Failed to load NEPA template', { error: err.message });
    res.status(500).json({ success: false, message: 'Failed to load NEPA template' });
  }
});

export default router;
