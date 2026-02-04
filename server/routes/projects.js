import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../models/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all projects
router.get('/', (req, res) => {
    const db = getDatabase();
    
    try {
        const projects = db.prepare(`
            SELECT p.*, c.name as client_name, c.company as client_company
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            ORDER BY p.created_at DESC
        `).all();
        
        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve projects'
        });
    }
});

// Get single project
router.get('/:id', (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    try {
        const project = db.prepare(`
            SELECT p.*, c.name as client_name, c.email as client_email, c.company as client_company
            FROM projects p
            LEFT JOIN clients c ON p.client_id = c.id
            WHERE p.id = ?
        `).get(id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        res.json({
            success: true,
            project
        });
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve project'
        });
    }
});

// Create new project
router.post('/',
    [
        body('name').trim().notEmpty().withMessage('Project name is required'),
        body('client_id').isInt().withMessage('Valid client ID is required'),
        body('description').optional().trim(),
        body('status').optional().isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
        body('start_date').optional().isISO8601().withMessage('Valid start date required'),
        body('end_date').optional().isISO8601().withMessage('Valid end date required'),
        body('budget').optional().isFloat({ min: 0 }).withMessage('Budget must be positive')
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
        
        const { name, client_id, description, status, start_date, end_date, budget } = req.body;
        const db = getDatabase();
        
        try {
            // Verify client exists
            const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(client_id);
            if (!client) {
                return res.status(404).json({
                    success: false,
                    message: 'Client not found'
                });
            }
            
            const result = db.prepare(`
                INSERT INTO projects (name, client_id, description, status, start_date, end_date, budget)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                name,
                client_id,
                description || null,
                status || 'planning',
                start_date || null,
                end_date || null,
                budget || null
            );
            
            const newProject = db.prepare(`
                SELECT p.*, c.name as client_name, c.company as client_company
                FROM projects p
                LEFT JOIN clients c ON p.client_id = c.id
                WHERE p.id = ?
            `).get(result.lastInsertRowid);
            
            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                project: newProject
            });
        } catch (error) {
            console.error('Create project error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create project'
            });
        }
    }
);

// Update project
router.put('/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('client_id').optional().isInt(),
        body('description').optional().trim(),
        body('status').optional().isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled']),
        body('start_date').optional().isISO8601(),
        body('end_date').optional().isISO8601(),
        body('budget').optional().isFloat({ min: 0 })
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
            const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
            
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }
            
            // Verify client exists if changing client_id
            if (req.body.client_id) {
                const client = db.prepare('SELECT id FROM clients WHERE id = ?').get(req.body.client_id);
                if (!client) {
                    return res.status(404).json({
                        success: false,
                        message: 'Client not found'
                    });
                }
            }
            
            const fields = [];
            const values = [];
            
            ['name', 'client_id', 'description', 'status', 'start_date', 'end_date', 'budget'].forEach(field => {
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
                UPDATE projects
                SET ${fields.join(', ')}
                WHERE id = ?
            `).run(...values);
            
            const updatedProject = db.prepare(`
                SELECT p.*, c.name as client_name, c.company as client_company
                FROM projects p
                LEFT JOIN clients c ON p.client_id = c.id
                WHERE p.id = ?
            `).get(id);
            
            res.json({
                success: true,
                message: 'Project updated successfully',
                project: updatedProject
            });
        } catch (error) {
            console.error('Update project error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update project'
            });
        }
    }
);

// Delete project
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const db = getDatabase();
    
    try {
        const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }
        
        db.prepare('DELETE FROM projects WHERE id = ?').run(id);
        
        res.json({
            success: true,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete project'
        });
    }
});

export default router;
