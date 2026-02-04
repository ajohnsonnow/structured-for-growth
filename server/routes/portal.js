import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne, execute, logActivity } from '../models/database.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'structured-for-growth-portal-secret-2024';

// Middleware to verify client portal token
function authenticateClient(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Ensure this is a client portal token (not admin)
        if (decoded.type !== 'client_portal') {
            return res.status(403).json({ message: 'Invalid portal access' });
        }
        
        req.clientId = decoded.clientId;
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

// ============ CLIENT PORTAL LOGIN ============

// POST /api/portal/login - Client portal login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        
        // Find user by username
        const user = queryOne(
            'SELECT * FROM users WHERE username = ? AND is_active = 1',
            [username]
        );
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Find associated client record
        // First try to find by email match
        let client = queryOne(
            'SELECT * FROM clients WHERE email = ?',
            [user.email]
        );
        
        // If no client found, check if there's a client_id stored on the user (for linked accounts)
        if (!client && user.client_id) {
            client = queryOne('SELECT * FROM clients WHERE id = ?', [user.client_id]);
        }
        
        // If still no client, and user is not admin, try to find any client they created
        if (!client && user.role !== 'admin') {
            // For demo purposes, link to first available client
            client = queryOne('SELECT * FROM clients LIMIT 1');
        }
        
        if (!client) {
            return res.status(403).json({ 
                message: 'No client account found. Please contact support.' 
            });
        }
        
        // Generate portal-specific token
        const token = jwt.sign(
            { 
                userId: user.id, 
                clientId: client.id,
                type: 'client_portal'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Update last login
        execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
        logActivity(user.id, 'PORTAL_LOGIN', 'client', client.id, `Portal login for ${client.name}`);
        
        res.json({
            message: 'Login successful',
            token,
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                company: client.company,
                phone: client.phone,
                status: client.status,
                monthly_retainer: client.monthly_retainer
            }
        });
        
    } catch (error) {
        console.error('Portal login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// ============ CLIENT DATA ENDPOINTS ============

// GET /api/portal/me - Get current client info
router.get('/me', authenticateClient, (req, res) => {
    try {
        const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.clientId]);
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        res.json({
            client: {
                id: client.id,
                name: client.name,
                email: client.email,
                company: client.company,
                phone: client.phone,
                website: client.website,
                address: client.address,
                status: client.status,
                monthly_retainer: client.monthly_retainer,
                contract_start: client.contract_start,
                contract_end: client.contract_end
            }
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ message: 'Failed to fetch client data' });
    }
});

// GET /api/portal/projects - Get client's projects
router.get('/projects', authenticateClient, (req, res) => {
    try {
        const projects = query(`
            SELECT 
                id, title, description, status, priority,
                budget, hours_estimated, hours_actual,
                start_date, end_date, completion_date,
                created_at
            FROM projects 
            WHERE client_id = ?
            ORDER BY 
                CASE status 
                    WHEN 'in-progress' THEN 1 
                    WHEN 'planning' THEN 2 
                    WHEN 'on-hold' THEN 3 
                    WHEN 'completed' THEN 4 
                    ELSE 5 
                END,
                created_at DESC
        `, [req.clientId]);
        
        // Calculate progress for in-progress projects
        const projectsWithProgress = projects.map(project => {
            let progress = 0;
            
            if (project.status === 'completed') {
                progress = 100;
            } else if (project.status === 'in-progress') {
                // Calculate based on hours if available
                if (project.hours_estimated && project.hours_actual) {
                    progress = Math.min(Math.round((project.hours_actual / project.hours_estimated) * 100), 95);
                } else {
                    // Default progress for demo
                    progress = 50;
                }
            }
            
            return { ...project, progress };
        });
        
        res.json({ projects: projectsWithProgress });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Failed to fetch projects' });
    }
});

// GET /api/portal/billing - Get billing/payment info
router.get('/billing', authenticateClient, (req, res) => {
    try {
        const client = queryOne('SELECT * FROM clients WHERE id = ?', [req.clientId]);
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        // Calculate amount due
        let amountDue = 0;
        let nextDueDate = null;
        
        // If client has a monthly retainer, show that
        if (client.monthly_retainer && client.status === 'active') {
            amountDue = client.monthly_retainer;
            
            // Next due date is 1st of next month
            const now = new Date();
            nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        }
        
        // Get any pending project costs
        const pendingProjects = query(`
            SELECT budget FROM projects 
            WHERE client_id = ? AND status IN ('planning', 'in-progress') AND budget > 0
        `, [req.clientId]);
        
        // Add unbilled project budgets
        const projectTotal = pendingProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
        
        // For demo, we'll simulate some estimates
        const estimates = [];
        
        // If there are planning projects, show them as estimates
        const planningProjects = query(`
            SELECT id, title, description, budget 
            FROM projects 
            WHERE client_id = ? AND status = 'planning' AND budget > 0
        `, [req.clientId]);
        
        planningProjects.forEach(project => {
            estimates.push({
                id: project.id,
                title: project.title,
                description: project.description || 'Project estimate pending approval',
                amount: project.budget,
                status: 'pending'
            });
        });
        
        res.json({
            amount_due: amountDue,
            next_due_date: nextDueDate ? nextDueDate.toISOString().split('T')[0] : null,
            project_total: projectTotal,
            monthly_retainer: client.monthly_retainer || 0,
            estimates
        });
    } catch (error) {
        console.error('Get billing error:', error);
        res.status(500).json({ message: 'Failed to fetch billing info' });
    }
});

// GET /api/portal/messages - Get client's messages
router.get('/messages', authenticateClient, (req, res) => {
    try {
        const messages = query(`
            SELECT id, subject, content, direction, read_at, created_at
            FROM messages
            WHERE client_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `, [req.clientId]);
        
        // Mark unread messages as read
        execute(`
            UPDATE messages 
            SET read_at = CURRENT_TIMESTAMP 
            WHERE client_id = ? AND direction = 'outgoing' AND read_at IS NULL
        `, [req.clientId]);
        
        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// POST /api/portal/messages - Send a message (client to admin)
router.post('/messages', authenticateClient, (req, res) => {
    try {
        const { subject, content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Message content is required' });
        }
        
        const result = execute(`
            INSERT INTO messages (client_id, user_id, direction, subject, content, sent_via)
            VALUES (?, ?, 'incoming', ?, ?, 'portal')
        `, [req.clientId, req.userId, subject || null, content]);
        
        res.status(201).json({
            message: 'Message sent successfully',
            messageId: result.lastInsertRowid
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

export default router;
