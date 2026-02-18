import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { requireOwnership } from '../middleware/ownershipGuard.js';
import { execute, logActivity, query, queryOne } from '../models/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all clients with optional filtering
router.get('/', (req, res) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query;

    let sql = `
            SELECT c.*, u.username as created_by_username,
                   (SELECT COUNT(*) FROM projects WHERE client_id = c.id) as project_count
            FROM clients c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE 1=1
        `;
    const params = [];

    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }

    if (search) {
      sql += ` AND (c.name LIKE ? OR c.email LIKE ? OR c.company LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` ORDER BY c.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const clients = query(sql, params);

    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM clients WHERE 1=1`;
    const countParams = [];
    if (status) {
      countSql += ` AND status = ?`;
      countParams.push(status);
    }
    if (search) {
      countSql += ` AND (name LIKE ? OR email LIKE ? OR company LIKE ?)`;
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    const total = queryOne(countSql, countParams)?.total || 0;

    res.json({
      success: true,
      clients,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve clients',
    });
  }
});

// Get client statistics
router.get('/stats/overview', (req, res) => {
  try {
    const totalClients = queryOne('SELECT COUNT(*) as count FROM clients')?.count || 0;
    const activeClients =
      queryOne("SELECT COUNT(*) as count FROM clients WHERE status = 'active'")?.count || 0;
    const totalProjects = queryOne('SELECT COUNT(*) as count FROM projects')?.count || 0;
    const activeProjects =
      queryOne("SELECT COUNT(*) as count FROM projects WHERE status IN ('planning', 'in-progress')")
        ?.count || 0;

    // Monthly revenue (sum of monthly retainers for active clients)
    const monthlyRevenue =
      queryOne(
        "SELECT SUM(monthly_retainer) as total FROM clients WHERE status = 'active' AND monthly_retainer IS NOT NULL"
      )?.total || 0;

    // Retainer client count
    const retainerClients =
      queryOne(
        "SELECT COUNT(*) as count FROM clients WHERE status = 'active' AND monthly_retainer IS NOT NULL AND monthly_retainer > 0"
      )?.count || 0;

    // Project revenue (sum of budgets for active/planning projects - one-off work)
    const projectRevenue =
      queryOne(
        "SELECT SUM(budget) as total FROM projects WHERE status IN ('planning', 'in-progress') AND budget IS NOT NULL AND budget > 0"
      )?.total || 0;

    // One-off project count (projects with budgets, excluding retainer overlap)
    const oneOffProjects =
      queryOne(
        "SELECT COUNT(*) as count FROM projects WHERE status IN ('planning', 'in-progress') AND budget IS NOT NULL AND budget > 0"
      )?.count || 0;

    // Completed project revenue
    const completedRevenue =
      queryOne(
        "SELECT SUM(budget) as total FROM projects WHERE status = 'completed' AND budget IS NOT NULL AND budget > 0"
      )?.total || 0;

    // New clients this month
    const newThisMonth =
      queryOne(`
            SELECT COUNT(*) as count FROM clients
            WHERE created_at >= date('now', 'start of month')
        `)?.count || 0;

    res.json({
      success: true,
      stats: {
        totalClients,
        activeClients,
        totalProjects,
        activeProjects,
        monthlyRevenue,
        retainerClients,
        projectRevenue,
        oneOffProjects,
        completedRevenue,
        newThisMonth,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
    });
  }
});

// Get single client with projects
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const client = queryOne(
      `
            SELECT c.*, u.username as created_by_username
            FROM clients c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `,
      [id]
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    // Get client projects
    const projects = query(
      `
            SELECT * FROM projects
            WHERE client_id = ?
            ORDER BY created_at DESC
        `,
      [id]
    );

    // Get recent activity
    const activity = query(
      `
            SELECT * FROM activity_log
            WHERE entity_type = 'client' AND entity_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        `,
      [id]
    );

    res.json({
      success: true,
      client: {
        ...client,
        projects,
        activity,
      },
    });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve client',
    });
  }
});

// Create new client
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim(),
    body('company').optional().trim(),
    body('website').optional().trim(),
    body('address').optional().trim(),
    body('notes').optional().trim(),
    body('monthly_retainer').optional().isNumeric(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      phone,
      company,
      website,
      address,
      notes,
      monthly_retainer,
      contract_start,
      contract_end,
    } = req.body;

    try {
      const result = execute(
        `
                INSERT INTO clients (name, email, phone, company, website, address, notes, monthly_retainer, contract_start, contract_end, created_by, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          name,
          email,
          phone || null,
          company || null,
          website || null,
          address || null,
          notes || null,
          monthly_retainer || null,
          contract_start || null,
          contract_end || null,
          req.user.userId,
          'active',
        ]
      );

      const newClient = queryOne('SELECT * FROM clients WHERE id = ?', [result.lastInsertRowid]);

      logActivity(
        req.user.userId,
        'CREATE',
        'client',
        result.lastInsertRowid,
        `Created client: ${name}`
      );

      res.status(201).json({
        success: true,
        message: 'Client created successfully',
        client: newClient,
      });
    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create client',
      });
    }
  }
);

// Update client
router.put(
  '/:id',
  requireOwnership('client', 'id'),
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().trim().isEmail(),
    body('phone').optional().trim(),
    body('company').optional().trim(),
    body('website').optional().trim(),
    body('address').optional().trim(),
    body('status').optional().isIn(['active', 'inactive', 'archived']),
    body('notes').optional().trim(),
    body('monthly_retainer').optional().isNumeric(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    try {
      const client = queryOne('SELECT id, name FROM clients WHERE id = ?', [id]);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found',
        });
      }

      const {
        name,
        email,
        phone,
        company,
        website,
        address,
        status,
        notes,
        monthly_retainer,
        contract_start,
        contract_end,
      } = req.body;

      // Build dynamic update query
      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        params.push(phone);
      }
      if (company !== undefined) {
        updates.push('company = ?');
        params.push(company);
      }
      if (website !== undefined) {
        updates.push('website = ?');
        params.push(website);
      }
      if (address !== undefined) {
        updates.push('address = ?');
        params.push(address);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }
      if (notes !== undefined) {
        updates.push('notes = ?');
        params.push(notes);
      }
      if (monthly_retainer !== undefined) {
        updates.push('monthly_retainer = ?');
        params.push(monthly_retainer);
      }
      if (contract_start !== undefined) {
        updates.push('contract_start = ?');
        params.push(contract_start);
      }
      if (contract_end !== undefined) {
        updates.push('contract_end = ?');
        params.push(contract_end);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      execute(`UPDATE clients SET ${updates.join(', ')} WHERE id = ?`, params);

      const updatedClient = queryOne('SELECT * FROM clients WHERE id = ?', [id]);

      logActivity(req.user.userId, 'UPDATE', 'client', id, `Updated client: ${updatedClient.name}`);

      res.json({
        success: true,
        message: 'Client updated successfully',
        client: updatedClient,
      });
    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update client',
      });
    }
  }
);

// Delete client
router.delete('/:id', requireOwnership('client', 'id'), (req, res) => {
  const { id } = req.params;

  try {
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [id]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    execute('DELETE FROM clients WHERE id = ?', [id]);

    logActivity(req.user.userId, 'DELETE', 'client', id, `Deleted client: ${client.name}`);

    res.json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete client',
    });
  }
});

export default router;
