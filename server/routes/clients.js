import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all clients
router.get('/', (req, res) => {
    const db = getDatabase();
    
    try {
        const clients = db.prepare(`
            SELECT c.*, u.username as created_by_username
            FROM clients c
            LEFT JOIN users u ON c.created_by = u.id
            ORDER BY c.created_at DESC
        `).all();
        
        res.json({
            success: true,
            clients
        });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve clients'
        });
    }
});

// Get single client
router.get('/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    try {
        const client = db.prepare(`
            SELECT c.*, u.username as created_by_username
            FROM clients c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `).get(id);
        
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }
        
        // Get client projects
        const projects = db.prepare(`
            SELECT * FROM projects
            WHERE client_id = ?
            ORDER BY created_at DESC
        `).all(id);
        
        res.json({
            success: true,
            client: {
                ...client,
                projects
            }
        });
    } catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve client'
        });
    }
});

// Create new client
router.post('/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Valid email is required'),
        body('phone').optional().trim(),
        body('company').optional().trim(),
        body('notes').optional().trim()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const { name, email, phone, company, notes } = req.body;
        const db = getDatabase();
        
        try {
            const result = db.prepare(`
                INSERT INTO clients (name, email, phone, company, notes, created_by, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(name, email, phone || null, company || null, notes || null, req.user.userId, 'active');
            
            const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
            
            res.status(201).json({
                success: true,
                message: 'Client created successfully',
                client: newClient
            });
        } catch (error) {
            console.error('Create client error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create client'
            });
        }
    }
);

// Update client
router.put('/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('email').optional().trim().isEmail(),
        body('phone').optional().trim(),
        body('company').optional().trim(),
        body('status').optional().isIn(['active', 'inactive', 'archived']),
        body('notes').optional().trim()
    ],
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }
        
        const { id } = req.params;
        const db = getDatabase();
        
        try {
            const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(id);
            
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
            
            const fields = [];
            const values = [];
            
            ['name', 'email', 'phone', 'company', 'status', 'notes'].forEach(field => {
                if (req.body[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(req.body[field]);
                }
            });
            
            if (fields.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields to update'
                });
            }
            
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            
            db.prepare(`
                UPDATE clients
                SET ${fields.join(', ')}
                WHERE id = ?
            `).run(...values);
            
            const updatedClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
            
            res.json({
                success: true,
                message: 'Client updated successfully',
                client: updatedClient
            });
        } catch (error) {
            console.error('Update client error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update client'
            });
        }
    }
);

// Delete client
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    
    try {
        const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(id);
        
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }
        
        db.prepare('DELETE FROM clients WHERE id = ?').run(id);
        
        res.json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete client'
        });
    }
});

export default router;
