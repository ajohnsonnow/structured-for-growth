import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { requireOwnership } from '../middleware/ownershipGuard.js';
import { execute, logActivity, query, queryOne } from '../models/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all projects with filtering
router.get('/', (req, res) => {
  try {
    const { status, client_id, limit = 100, offset = 0 } = req.query;

    let sql = `
            SELECT p.*, c.name as client_name, c.company as client_company,
                   (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
                   (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'completed') as tasks_completed
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            WHERE 1=1
        `;
    const params = [];

    if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    if (client_id) {
      sql += ` AND p.client_id = ?`;
      params.push(client_id);
    }

    sql += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const projects = query(sql, params);

    res.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve projects',
    });
  }
});

// Get single project with tasks
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const project = queryOne(
      `
            SELECT p.*, c.name as client_name, c.email as client_email, c.company as client_company
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            WHERE p.id = ?
        `,
      [id]
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Get project tasks
    const tasks = query(
      `
            SELECT t.*, u.username as assigned_to_name
            FROM tasks t
            LEFT JOIN users u ON t.assigned_to = u.id
            WHERE t.project_id = ?
            ORDER BY t.priority DESC, t.due_date ASC
        `,
      [id]
    );

    // Get time entries
    const timeEntries = query(
      `
            SELECT te.*, u.username
            FROM time_entries te
            LEFT JOIN users u ON te.user_id = u.id
            WHERE te.project_id = ?
            ORDER BY te.entry_date DESC
            LIMIT 20
        `,
      [id]
    );

    // Calculate totals
    const totalHours =
      query(
        `
            SELECT SUM(hours) as total FROM time_entries WHERE project_id = ?
        `,
        [id]
      )[0]?.total || 0;

    res.json({
      success: true,
      project: {
        ...project,
        tasks,
        timeEntries,
        totalHours,
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve project',
    });
  }
});

// Create new project
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Project title is required'),
    body('client_id').isInt().withMessage('Valid client ID is required'),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('start_date').optional(),
    body('end_date').optional(),
    body('budget').optional().isFloat({ min: 0 }),
    body('hours_estimated').optional().isInt({ min: 0 }),
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
      title,
      client_id,
      description,
      status,
      priority,
      start_date,
      end_date,
      budget,
      hours_estimated,
    } = req.body;

    try {
      // Verify client exists
      const client = queryOne('SELECT id, name FROM clients WHERE id = ?', [client_id]);
      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found',
        });
      }

      const result = execute(
        `
                INSERT INTO projects (title, client_id, description, status, priority, start_date, end_date, budget, hours_estimated, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          title,
          client_id,
          description || null,
          status || 'planning',
          priority || 'medium',
          start_date || null,
          end_date || null,
          budget || null,
          hours_estimated || null,
          req.user.userId,
        ]
      );

      const newProject = queryOne('SELECT * FROM projects WHERE id = ?', [result.lastInsertRowid]);

      logActivity(
        req.user.userId,
        'CREATE',
        'project',
        result.lastInsertRowid,
        `Created project: ${title} for ${client.name}`
      );

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        project: newProject,
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create project',
      });
    }
  }
);

// Update project
router.put(
  '/:id',
  requireOwnership('project', 'id'),
  [
    body('title').optional().trim().notEmpty(),
    body('description').optional().trim(),
    body('status')
      .optional()
      .isIn(['planning', 'in-progress', 'on-hold', 'completed', 'cancelled']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('budget').optional().isFloat({ min: 0 }),
    body('hours_estimated').optional().isInt({ min: 0 }),
    body('hours_actual').optional().isInt({ min: 0 }),
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
      const project = queryOne('SELECT * FROM projects WHERE id = ?', [id]);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const {
        title,
        description,
        status,
        priority,
        start_date,
        end_date,
        budget,
        hours_estimated,
        hours_actual,
        completion_date,
      } = req.body;

      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }
      if (priority !== undefined) {
        updates.push('priority = ?');
        params.push(priority);
      }
      if (start_date !== undefined) {
        updates.push('start_date = ?');
        params.push(start_date);
      }
      if (end_date !== undefined) {
        updates.push('end_date = ?');
        params.push(end_date);
      }
      if (budget !== undefined) {
        updates.push('budget = ?');
        params.push(budget);
      }
      if (hours_estimated !== undefined) {
        updates.push('hours_estimated = ?');
        params.push(hours_estimated);
      }
      if (hours_actual !== undefined) {
        updates.push('hours_actual = ?');
        params.push(hours_actual);
      }
      if (completion_date !== undefined) {
        updates.push('completion_date = ?');
        params.push(completion_date);
      }

      // Auto-set completion date when status changes to completed
      if (status === 'completed' && project.status !== 'completed') {
        updates.push('completion_date = CURRENT_TIMESTAMP');
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      execute(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, params);

      const updatedProject = queryOne('SELECT * FROM projects WHERE id = ?', [id]);

      logActivity(
        req.user.userId,
        'UPDATE',
        'project',
        id,
        `Updated project: ${updatedProject.title}`
      );

      res.json({
        success: true,
        message: 'Project updated successfully',
        project: updatedProject,
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update project',
      });
    }
  }
);

// Delete project
router.delete('/:id', requireOwnership('project', 'id'), (req, res) => {
  const { id } = req.params;

  try {
    const project = queryOne('SELECT * FROM projects WHERE id = ?', [id]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    execute('DELETE FROM projects WHERE id = ?', [id]);

    logActivity(req.user.userId, 'DELETE', 'project', id, `Deleted project: ${project.title}`);

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
    });
  }
});

// ============ TASK ROUTES ============

// Create task
router.post(
  '/:projectId/tasks',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description').optional().trim(),
    body('status').optional().isIn(['pending', 'in-progress', 'completed', 'cancelled']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
    body('hours_estimated').optional().isInt({ min: 0 }),
    body('due_date').optional(),
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

    const { projectId } = req.params;
    const { title, description, status, priority, hours_estimated, due_date, assigned_to } =
      req.body;

    try {
      // Verify project exists
      const project = queryOne('SELECT id FROM projects WHERE id = ?', [projectId]);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const result = execute(
        `
                INSERT INTO tasks (project_id, title, description, status, priority, hours_estimated, due_date, assigned_to)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
        [
          projectId,
          title,
          description || null,
          status || 'pending',
          priority || 'medium',
          hours_estimated || null,
          due_date || null,
          assigned_to || null,
        ]
      );

      const newTask = queryOne('SELECT * FROM tasks WHERE id = ?', [result.lastInsertRowid]);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task: newTask,
      });
    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create task',
      });
    }
  }
);

// Update task
router.put(
  '/:projectId/tasks/:taskId',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('status')
      .optional()
      .isIn(['pending', 'in-progress', 'completed', 'on-hold'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'critical'])
      .withMessage('Invalid priority'),
    body('hours_estimated')
      .optional()
      .isInt({ min: 0 })
      .withMessage('hours_estimated must be a non-negative integer'),
    body('hours_actual')
      .optional()
      .isInt({ min: 0 })
      .withMessage('hours_actual must be a non-negative integer'),
    body('assigned_to').optional().isInt().withMessage('assigned_to must be an integer'),
  ],
  requireOwnership('project', 'projectId'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { taskId } = req.params;
    const {
      title,
      description,
      status,
      priority,
      hours_estimated,
      hours_actual,
      due_date,
      assigned_to,
    } = req.body;

    try {
      const task = queryOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found',
        });
      }

      const updates = [];
      const params = [];

      if (title !== undefined) {
        updates.push('title = ?');
        params.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }
      if (priority !== undefined) {
        updates.push('priority = ?');
        params.push(priority);
      }
      if (hours_estimated !== undefined) {
        updates.push('hours_estimated = ?');
        params.push(hours_estimated);
      }
      if (hours_actual !== undefined) {
        updates.push('hours_actual = ?');
        params.push(hours_actual);
      }
      if (due_date !== undefined) {
        updates.push('due_date = ?');
        params.push(due_date);
      }
      if (assigned_to !== undefined) {
        updates.push('assigned_to = ?');
        params.push(assigned_to);
      }

      // Auto-set completed_at when status changes to completed
      if (status === 'completed' && task.status !== 'completed') {
        updates.push('completed_at = CURRENT_TIMESTAMP');
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(taskId);

      execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);

      const updatedTask = queryOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

      res.json({
        success: true,
        message: 'Task updated successfully',
        task: updatedTask,
      });
    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update task',
      });
    }
  }
);

// Delete task
router.delete('/:projectId/tasks/:taskId', requireOwnership('project', 'projectId'), (req, res) => {
  const { taskId } = req.params;

  try {
    const task = queryOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    execute('DELETE FROM tasks WHERE id = ?', [taskId]);

    res.json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
    });
  }
});

// ============ TIME ENTRY ROUTES ============

// Add time entry
router.post(
  '/:projectId/time',
  [
    body('hours').isFloat({ min: 0.25 }).withMessage('Hours must be at least 0.25'),
    body('description').optional().trim(),
    body('entry_date').notEmpty().withMessage('Entry date is required'),
    body('billable').optional().isBoolean(),
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

    const { projectId } = req.params;
    const { hours, description, entry_date, billable, task_id } = req.body;

    try {
      const project = queryOne('SELECT id FROM projects WHERE id = ?', [projectId]);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const result = execute(
        `
                INSERT INTO time_entries (project_id, task_id, user_id, hours, description, entry_date, billable)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
        [
          projectId,
          task_id || null,
          req.user.userId,
          hours,
          description || null,
          entry_date,
          billable !== false ? 1 : 0,
        ]
      );

      // Update project hours_actual
      const totalHours =
        queryOne('SELECT SUM(hours) as total FROM time_entries WHERE project_id = ?', [projectId])
          ?.total || 0;
      execute('UPDATE projects SET hours_actual = ? WHERE id = ?', [totalHours, projectId]);

      const newEntry = queryOne('SELECT * FROM time_entries WHERE id = ?', [
        result.lastInsertRowid,
      ]);

      res.status(201).json({
        success: true,
        message: 'Time entry added successfully',
        timeEntry: newEntry,
      });
    } catch (error) {
      console.error('Add time entry error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add time entry',
      });
    }
  }
);

export default router;
