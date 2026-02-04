import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../models/database.js';

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
        const db = getDatabase();
        
        try {
            // Check if user already exists
            const existingUser = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
            
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Username or email already exists'
                });
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Insert user
            const result = db.prepare(`
                INSERT INTO users (username, email, password, role)
                VALUES (?, ?, ?, ?)
            `).run(username, email, hashedPassword, 'user');
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
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
        const db = getDatabase();
        
        try {
            // Find user
            const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
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
            
            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '7d' }
            );
            
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
        
        res.json({
            success: true,
            user: decoded
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

export default router;
