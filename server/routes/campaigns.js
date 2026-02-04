import express from 'express';
import { body, validationResult } from 'express-validator';
import { query, queryOne, execute, logActivity } from '../models/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ============ CAMPAIGNS ============

// Get all campaigns
router.get('/', async (req, res) => {
    const { status } = req.query;
    
    try {
        let sql = `
            SELECT c.*, s.name as segment_name, u.username as created_by_name
            FROM campaigns c
            LEFT JOIN segments s ON c.segment_id = s.id
            LEFT JOIN users u ON c.created_by = u.id
        `;
        const params = [];
        
        if (status) {
            sql += ' WHERE c.status = ?';
            params.push(status);
        }
        
        sql += ' ORDER BY c.created_at DESC';
        
        const campaigns = query(sql, params);
        
        res.json({
            success: true,
            campaigns
        });
    } catch (error) {
        console.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get campaigns'
        });
    }
});

// Get single campaign with recipients
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const campaign = queryOne(`
            SELECT c.*, s.name as segment_name, u.username as created_by_name
            FROM campaigns c
            LEFT JOIN segments s ON c.segment_id = s.id
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ?
        `, [id]);
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        
        const recipients = query(`
            SELECT cr.*, c.name as client_name, c.email as client_email
            FROM campaign_recipients cr
            JOIN clients c ON cr.client_id = c.id
            WHERE cr.campaign_id = ?
        `, [id]);
        
        res.json({
            success: true,
            campaign,
            recipients
        });
    } catch (error) {
        console.error('Get campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get campaign'
        });
    }
});

// Create campaign
router.post('/',
    [
        body('name').trim().notEmpty().withMessage('Campaign name is required'),
        body('subject').trim().notEmpty().withMessage('Subject is required'),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('segment_id').optional().isInt()
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
        
        const { name, subject, content, segment_id, scheduled_at } = req.body;
        
        try {
            const result = execute(`
                INSERT INTO campaigns (name, subject, content, segment_id, scheduled_at, created_by)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [name, subject, content, segment_id || null, scheduled_at || null, req.user.userId]);
            
            const campaign = queryOne('SELECT * FROM campaigns WHERE id = ?', [result.lastInsertRowid]);
            
            logActivity(req.user.userId, 'CREATE', 'campaign', result.lastInsertRowid, `Created campaign: ${name}`);
            
            res.status(201).json({
                success: true,
                message: 'Campaign created successfully',
                campaign
            });
        } catch (error) {
            console.error('Create campaign error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create campaign'
            });
        }
    }
);

// Update campaign
router.put('/:id',
    [
        body('name').optional().trim().notEmpty(),
        body('subject').optional().trim().notEmpty(),
        body('content').optional().trim().notEmpty()
    ],
    async (req, res) => {
        const { id } = req.params;
        
        try {
            const campaign = queryOne('SELECT * FROM campaigns WHERE id = ?', [id]);
            
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
            }
            
            if (campaign.status === 'sent') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot edit a sent campaign'
                });
            }
            
            const fields = [];
            const values = [];
            
            ['name', 'subject', 'content', 'segment_id', 'scheduled_at', 'status'].forEach(field => {
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
            
            execute(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`, values);
            
            const updated = queryOne('SELECT * FROM campaigns WHERE id = ?', [id]);
            
            res.json({
                success: true,
                message: 'Campaign updated successfully',
                campaign: updated
            });
        } catch (error) {
            console.error('Update campaign error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update campaign'
            });
        }
    }
);

// Send campaign
router.post('/:id/send', async (req, res) => {
    const { id } = req.params;
    const { client_ids } = req.body; // Optional: specific client IDs, otherwise use segment
    
    try {
        const campaign = queryOne('SELECT * FROM campaigns WHERE id = ?', [id]);
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        
        if (campaign.status === 'sent') {
            return res.status(400).json({
                success: false,
                message: 'Campaign already sent'
            });
        }
        
        // Get recipients
        let recipients = [];
        
        if (client_ids && client_ids.length > 0) {
            recipients = query(`SELECT * FROM clients WHERE id IN (${client_ids.map(() => '?').join(',')})`, client_ids);
        } else if (campaign.segment_id) {
            // Get segment and apply filter
            const segment = queryOne('SELECT * FROM segments WHERE id = ?', [campaign.segment_id]);
            if (segment) {
                const filters = JSON.parse(segment.filter_rules || '{}');
                let sql = 'SELECT * FROM clients WHERE 1=1';
                const params = [];
                
                if (filters.status) {
                    sql += ' AND status = ?';
                    params.push(filters.status);
                }
                if (filters.has_retainer) {
                    sql += ' AND monthly_retainer > 0';
                }
                
                recipients = query(sql, params);
            }
        } else {
            // All active clients
            recipients = query('SELECT * FROM clients WHERE status = ?', ['active']);
        }
        
        // Send to each recipient (individual emails for privacy)
        let sentCount = 0;
        
        for (const client of recipients) {
            // Personalize content
            const personalizedContent = campaign.content
                .replace(/{{clientName}}/g, client.name)
                .replace(/{{firstName}}/g, client.name.split(' ')[0])
                .replace(/{{lastName}}/g, client.name.split(' ').slice(1).join(' ') || '')
                .replace(/{{company}}/g, client.company || '')
                .replace(/{{email}}/g, client.email);
            
            // Record recipient
            execute(`
                INSERT INTO campaign_recipients (campaign_id, client_id, status, sent_at)
                VALUES (?, ?, 'sent', CURRENT_TIMESTAMP)
            `, [id, client.id]);
            
            // Also add to messages for history
            execute(`
                INSERT INTO messages (client_id, user_id, direction, subject, content, sent_via)
                VALUES (?, ?, 'outbound', ?, ?, 'email')
            `, [client.id, req.user.userId, campaign.subject, personalizedContent]);
            
            sentCount++;
            
            // TODO: Actually send email here using SendGrid, Resend, etc.
        }
        
        // Update campaign status
        execute(`
            UPDATE campaigns 
            SET status = 'sent', sent_count = ?, sent_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `, [sentCount, id]);
        
        logActivity(req.user.userId, 'SEND_CAMPAIGN', 'campaign', id, 
            `Sent campaign "${campaign.name}" to ${sentCount} recipients`);
        
        res.json({
            success: true,
            message: `Campaign sent to ${sentCount} recipients`,
            sent_count: sentCount
        });
    } catch (error) {
        console.error('Send campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send campaign'
        });
    }
});

// Delete campaign
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const campaign = queryOne('SELECT * FROM campaigns WHERE id = ?', [id]);
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }
        
        execute('DELETE FROM campaign_recipients WHERE campaign_id = ?', [id]);
        execute('DELETE FROM campaigns WHERE id = ?', [id]);
        
        logActivity(req.user.userId, 'DELETE', 'campaign', id, `Deleted campaign: ${campaign.name}`);
        
        res.json({
            success: true,
            message: 'Campaign deleted successfully'
        });
    } catch (error) {
        console.error('Delete campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete campaign'
        });
    }
});

// ============ SEGMENTS ============

// Get all segments
router.get('/segments/list', async (req, res) => {
    try {
        const segments = query(`
            SELECT s.*, 
                (SELECT COUNT(*) FROM clients c WHERE 
                    (JSON_EXTRACT(s.filter_rules, '$.status') IS NULL OR c.status = JSON_EXTRACT(s.filter_rules, '$.status'))
                    AND (JSON_EXTRACT(s.filter_rules, '$.has_retainer') IS NULL OR (JSON_EXTRACT(s.filter_rules, '$.has_retainer') = 1 AND c.monthly_retainer > 0))
                ) as client_count
            FROM segments s
            ORDER BY s.name
        `);
        
        res.json({
            success: true,
            segments
        });
    } catch (error) {
        console.error('Get segments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get segments'
        });
    }
});

// Create segment
router.post('/segments',
    [
        body('name').trim().notEmpty().withMessage('Segment name is required'),
        body('filter_rules').optional()
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
        
        const { name, description, filter_rules } = req.body;
        
        try {
            const result = execute(`
                INSERT INTO segments (name, description, filter_rules, created_by)
                VALUES (?, ?, ?, ?)
            `, [name, description || null, JSON.stringify(filter_rules || {}), req.user.userId]);
            
            const segment = queryOne('SELECT * FROM segments WHERE id = ?', [result.lastInsertRowid]);
            
            res.status(201).json({
                success: true,
                message: 'Segment created successfully',
                segment
            });
        } catch (error) {
            console.error('Create segment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create segment'
            });
        }
    }
);

// Delete segment
router.delete('/segments/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        execute('DELETE FROM segments WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Segment deleted successfully'
        });
    } catch (error) {
        console.error('Delete segment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete segment'
        });
    }
});

// ============ EMAIL TEMPLATES ============

// Get all templates
router.get('/templates/list', async (req, res) => {
    const { category } = req.query;
    
    try {
        let sql = 'SELECT * FROM email_templates';
        const params = [];
        
        if (category) {
            sql += ' WHERE category = ?';
            params.push(category);
        }
        
        sql += ' ORDER BY name';
        
        const templates = query(sql, params);
        
        res.json({
            success: true,
            templates
        });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get templates'
        });
    }
});

// Create template
router.post('/templates',
    [
        body('name').trim().notEmpty().withMessage('Template name is required'),
        body('subject').trim().notEmpty().withMessage('Subject is required'),
        body('content').trim().notEmpty().withMessage('Content is required')
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
        
        const { name, subject, content, category } = req.body;
        
        try {
            const result = execute(`
                INSERT INTO email_templates (name, subject, content, category, created_by)
                VALUES (?, ?, ?, ?, ?)
            `, [name, subject, content, category || 'general', req.user.userId]);
            
            const template = queryOne('SELECT * FROM email_templates WHERE id = ?', [result.lastInsertRowid]);
            
            res.status(201).json({
                success: true,
                message: 'Template created successfully',
                template
            });
        } catch (error) {
            console.error('Create template error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create template'
            });
        }
    }
);

// Update template
router.put('/templates/:id', async (req, res) => {
    const { id } = req.params;
    const { name, subject, content, category } = req.body;
    
    try {
        execute(`
            UPDATE email_templates 
            SET name = ?, subject = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [name, subject, content, category || 'general', id]);
        
        const template = queryOne('SELECT * FROM email_templates WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Template updated successfully',
            template
        });
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update template'
        });
    }
});

// Delete template
router.delete('/templates/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        execute('DELETE FROM email_templates WHERE id = ?', [id]);
        
        res.json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Delete template error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete template'
        });
    }
});

export default router;
