import bcrypt from 'bcryptjs';
import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import {
  issueTokenPair,
  revokeAllUserTokens,
  revokeSingleToken,
  rotateRefreshToken,
} from '../lib/session.js';
import { authenticateToken, getJwtSecret, requireRole } from '../middleware/auth.js';
import { execute, logActivity, query, queryOne } from '../models/database.js';

const router = express.Router();

// Register new user
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = queryOne('SELECT id FROM users WHERE username = ? OR email = ?', [
        username,
        email,
      ]);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if this is the first user (make them admin)
      const userCount = queryOne('SELECT COUNT(*) as count FROM users')?.count || 0;
      const role = userCount === 0 ? 'admin' : 'user';

      // Insert user
      const result = execute(
        `
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `,
        [username, email, hashedPassword, role]
      );

      logActivity(
        result.lastInsertRowid,
        'REGISTER',
        'user',
        result.lastInsertRowid,
        `New user registered: ${username}`
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully' + (role === 'admin' ? ' as administrator' : ''),
        userId: result.lastInsertRowid,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
      });
    }
  }
);

// Login
router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, password } = req.body;

    try {
      // Find user
      const user = queryOne('SELECT * FROM users WHERE username = ? OR email = ?', [
        username,
        username,
      ]);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Account is disabled',
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Update last login
      execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      // P3.2.3 — Issue short-lived access token + rotatable refresh token
      const tokens = issueTokenPair(user);

      logActivity(user.id, 'LOGIN', 'user', user.id, `User logged in: ${username}`, req.ip);

      res.json({
        success: true,
        message: 'Login successful',
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
      });
    }
  }
);

// Verify token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    // Get fresh user data
    const user = queryOne('SELECT id, username, email, role, is_active FROM users WHERE id = ?', [
      decoded.userId,
    ]);

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or disabled',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (_error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
});

// Change password
router.post(
  '/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.userId]);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      execute('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [
        hashedPassword,
        req.user.userId,
      ]);

      // P3.2.3 — Revoke all sessions on password change
      revokeAllUserTokens(req.user.userId, 'PASSWORD_CHANGE', req.ip);

      logActivity(req.user.userId, 'PASSWORD_CHANGE', 'user', req.user.userId, 'Password changed');

      res.json({
        success: true,
        message: 'Password changed successfully. All sessions revoked — please log in again.',
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  }
);

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
  try {
    const user = queryOne(
      'SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
    });
  }
});

// P3.2.3 — Refresh access token using a valid refresh token (rotation)
router.post(
  '/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token is required')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    try {
      const result = rotateRefreshToken(req.body.refreshToken);

      if (!result) {
        return res
          .status(401)
          .json({ success: false, message: 'Invalid or expired refresh token' });
      }

      logActivity(result.user.id, 'TOKEN_REFRESH', 'user', result.user.id, 'Token rotated', req.ip);

      res.json({
        success: true,
        token: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
        user: result.user,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ success: false, message: 'Token refresh failed' });
    }
  }
);

// P3.2.3 — Logout: revoke refresh token(s)
router.post(
  '/logout',
  [body('refreshToken').optional().isString().withMessage('refreshToken must be a string')],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { refreshToken } = req.body;

    try {
      if (refreshToken) {
        // Revoke the specific refresh token
        revokeSingleToken(refreshToken);
      }

      // If authenticated, also revoke all tokens for the user
      const authHeader = req.headers.authorization;
      if (authHeader) {
        const accessToken = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(accessToken, getJwtSecret());
          revokeAllUserTokens(decoded.userId, 'LOGOUT', req.ip);
        } catch {
          // Token invalid — still clear the refresh token above
        }
      }

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }
);

// ============ ADMIN ROUTES ============

// Get all users (admin only)
router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const users = query(`
            SELECT u.id, u.username, u.email, u.role, u.client_id, u.is_active, u.created_at, u.last_login,
                   c.name as client_name
            FROM users u
            LEFT JOIN clients c ON u.client_id = c.id
            ORDER BY u.created_at DESC
        `);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
    });
  }
});

// Create user (admin only)
router.post(
  '/users',
  authenticateToken,
  requireRole('admin'),
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['admin', 'user']),
    body('client_id').optional().isInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { username, email, password, role = 'user', client_id, is_active = true } = req.body;

    try {
      // Check if user already exists
      const existingUser = queryOne('SELECT id FROM users WHERE username = ? OR email = ?', [
        username,
        email,
      ]);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists',
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = execute(
        `
                INSERT INTO users (username, email, password, role, client_id, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
        [username, email, hashedPassword, role, client_id || null, is_active ? 1 : 0]
      );

      logActivity(
        req.user.userId,
        'CREATE_USER',
        'user',
        result.lastInsertRowid,
        `Created user: ${username}`
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        userId: result.lastInsertRowid,
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user',
      });
    }
  }
);

// Update user (admin only)
router.put(
  '/users/:id',
  authenticateToken,
  requireRole('admin'),
  [
    body('role').optional().isIn(['admin', 'user']),
    body('is_active').optional().isBoolean(),
    body('client_id').optional().isInt(),
    body('username').optional().trim().isLength({ min: 3 }),
    body('email').optional().trim().isEmail(),
    body('password').optional().isLength({ min: 8 }),
  ],
  async (req, res) => {
    const { id } = req.params;
    const { role, is_active, client_id, username, email, password } = req.body;

    try {
      const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Prevent self-demotion
      if (req.user.userId === parseInt(id) && role && role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote yourself',
        });
      }

      const updates = [];
      const params = [];

      if (role !== undefined) {
        updates.push('role = ?');
        params.push(role);
      }
      if (is_active !== undefined) {
        updates.push('is_active = ?');
        params.push(is_active ? 1 : 0);
      }
      if (client_id !== undefined) {
        updates.push('client_id = ?');
        params.push(client_id || null);
      }
      if (username !== undefined) {
        updates.push('username = ?');
        params.push(username);
      }
      if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
      }
      if (password !== undefined) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update',
        });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

      const updatedUser = queryOne(
        'SELECT id, username, email, role, client_id, is_active FROM users WHERE id = ?',
        [id]
      );

      logActivity(req.user.userId, 'UPDATE_USER', 'user', id, `Updated user: ${user.username}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user',
      });
    }
  }
);

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const { id } = req.params;

  try {
    // Prevent self-deletion
    if (req.user.userId === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete yourself',
      });
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    execute('DELETE FROM users WHERE id = ?', [id]);

    logActivity(req.user.userId, 'DELETE_USER', 'user', id, `Deleted user: ${user.username}`);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    });
  }
});

// Get activity log (admin only) — supports search, filter, pagination
router.get('/activity', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0,
      search = '',
      action = '',
      user: userFilter = '',
      startDate = '',
      endDate = '',
    } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(u.username LIKE ? OR a.action LIKE ? OR a.details LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (action) {
      conditions.push('a.action = ?');
      params.push(action);
    }
    if (userFilter) {
      conditions.push('u.username = ?');
      params.push(userFilter);
    }
    if (startDate) {
      conditions.push('a.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('a.created_at <= ?');
      params.push(endDate + 'T23:59:59.999Z');
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const activities = query(
      `
            SELECT a.*, u.username
            FROM activity_log a
            LEFT JOIN users u ON a.user_id = u.id
            ${where}
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `,
      [...params, parseInt(limit), parseInt(offset)]
    );

    const totalRow = queryOne(
      `
            SELECT COUNT(*) as count
            FROM activity_log a
            LEFT JOIN users u ON a.user_id = u.id
            ${where}
        `,
      params
    );
    const total = totalRow?.count || 0;

    // Provide distinct action types and users for filter dropdowns
    const actionTypes = query('SELECT DISTINCT action FROM activity_log ORDER BY action').map(
      (r) => r.action
    );
    const users = query(
      'SELECT DISTINCT u.username FROM activity_log a LEFT JOIN users u ON a.user_id = u.id WHERE u.username IS NOT NULL ORDER BY u.username'
    ).map((r) => r.username);

    res.json({
      success: true,
      activities,
      pagination: { total, limit: parseInt(limit), offset: parseInt(offset) },
      filters: { actionTypes, users },
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity log',
    });
  }
});

// Export activity log as CSV (admin only)
router.get('/activity/export', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const {
      search = '',
      action = '',
      user: userFilter = '',
      startDate = '',
      endDate = '',
      format = 'csv',
    } = req.query;

    const conditions = [];
    const params = [];
    if (search) {
      conditions.push('(u.username LIKE ? OR a.action LIKE ? OR a.details LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (action) {
      conditions.push('a.action = ?');
      params.push(action);
    }
    if (userFilter) {
      conditions.push('u.username = ?');
      params.push(userFilter);
    }
    if (startDate) {
      conditions.push('a.created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      conditions.push('a.created_at <= ?');
      params.push(endDate + 'T23:59:59.999Z');
    }
    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const rows = query(
      `
            SELECT a.id, u.username, a.action, a.entity_type, a.entity_id, a.details, a.ip_address, a.created_at
            FROM activity_log a
            LEFT JOIN users u ON a.user_id = u.id
            ${where}
            ORDER BY a.created_at DESC
        `,
      params
    );

    if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.json"');
      res.json(rows);
      return;
    }

    // CSV format (default)
    const header = 'ID,Username,Action,Entity Type,Entity ID,Details,IP Address,Timestamp\n';
    const csv = rows
      .map((r) =>
        [
          r.id,
          r.username || '',
          r.action,
          r.entity_type || '',
          r.entity_id || '',
          `"${(r.details || '').replace(/"/g, '""')}"`,
          r.ip_address || '',
          r.created_at,
        ].join(',')
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
    res.send(header + csv);
  } catch (error) {
    console.error('Export activity error:', error);
    res.status(500).json({ success: false, message: 'Failed to export activity log' });
  }
});

export default router;
