import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne, execute, logActivity } from '../models/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Register new user
router.post('/register',
    [
        body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
        body('email').trim().isEmail().withMessage('Please provide a valid email'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const { username, email, password } = req.body;
        
        try {
            // Check if user already exists
            const existingUser = queryOne('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
            
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Check if this is the first user (make them admin)
            const userCount = queryOne('SELECT COUNT(*) as count FROM users')?.count || 0;
            const role = userCount === 0 ? 'admin' : 'user';
            
            // Insert user
            const result = execute(`
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `, [username, email, hashedPassword, role]);
            
            logActivity(result.lastInsertRowid, 'REGISTER', 'user', result.lastInsertRowid, `New user registered: ${username}`);
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully' + (role === 'admin' ? ' as administrator' : ''),
                userId: result.lastInsertRowid
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Registration failed'
            });
        }
    }
);

// Login
router.post('/login',
    [
        body('username').trim().notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const { username, password } = req.body;
        
        try {
            // Find user
            const user = queryOne('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is disabled'
                });
            }
            
            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
            
            // Update last login
            execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
            
            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );
            
            logActivity(user.id, 'LOGIN', 'user', user.id, `User logged in: ${username}`, req.ip);
            
            res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Login failed'
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
            message: 'No token provided'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get fresh user data
        const user = queryOne('SELECT id, username, email, role, is_active FROM users WHERE id = ?', [decoded.userId]);
        
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'User not found or disabled'
            });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

// Change password
router.post('/change-password', authenticateToken,
    [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const { currentPassword, newPassword } = req.body;
        
        try {
            const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.userId]);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            execute('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, req.user.userId]);
            
            logActivity(req.user.userId, 'PASSWORD_CHANGE', 'user', req.user.userId, 'Password changed');
            
            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    }
);

// Get current user profile
router.get('/profile', authenticateToken, (req, res) => {
    try {
        const user = queryOne('SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?', [req.user.userId]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile'
        });
    }
});

// ============ ADMIN ROUTES ============

// Get all users (admin only)
router.get('/users', authenticateToken, requireRole('admin'), (req, res) => {
    try {
        const users = query(`
            SELECT id, username, email, role, is_active, created_at, last_login 
            FROM users 
            ORDER BY created_at DESC
        `);
        
        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users'
        });
    }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireRole('admin'),
    [
        body('role').optional().isIn(['admin', 'user']),
        body('is_active').optional().isBoolean()
    ],
    (req, res) => {
        const { id } = req.params;
        const { role, is_active } = req.body;
        
        try {
            const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            // Prevent self-demotion
            if (req.user.userId === parseInt(id) && role && role !== 'admin') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot demote yourself'
                });
            }
            
            const updates = [];
            const params = [];
            
            if (role !== undefined) { updates.push('role = ?'); params.push(role); }
            if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
            
            if (updates.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields to update'
                });
            }
            
            updates.push('updated_at = CURRENT_TIMESTAMP');
            params.push(id);
            
            execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
            
            const updatedUser = queryOne('SELECT id, username, email, role, is_active FROM users WHERE id = ?', [id]);
            
            logActivity(req.user.userId, 'UPDATE_USER', 'user', id, `Updated user: ${user.username}`);
            
            res.json({
                success: true,
                message: 'User updated successfully',
                user: updatedUser
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user'
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
                message: 'Cannot delete yourself'
            });
        }
        
        const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        execute('DELETE FROM users WHERE id = ?', [id]);
        
        logActivity(req.user.userId, 'DELETE_USER', 'user', id, `Deleted user: ${user.username}`);
        
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// Get activity log (admin only)
router.get('/activity', authenticateToken, requireRole('admin'), (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const activities = query(`
            SELECT a.*, u.username 
            FROM activity_log a
            LEFT JOIN users u ON a.user_id = u.id
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        const total = queryOne('SELECT COUNT(*) as count FROM activity_log')?.count || 0;
        
        res.json({
            success: true,
            activities,
            pagination: { total, limit: parseInt(limit), offset: parseInt(offset) }
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get activity log'
        });
    }
});

export default router;
