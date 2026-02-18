import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { requireOwnership } from '../middleware/ownershipGuard.js';
import { execute, logActivity, query, queryOne } from '../models/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all conversations (grouped by client)
router.get('/', (req, res) => {
  try {
    const conversations = query(`
            SELECT
                c.id as client_id,
                c.name as client_name,
                c.email as client_email,
                c.company,
                COUNT(m.id) as message_count,
                SUM(CASE WHEN m.read_at IS NULL AND m.direction = 'inbound' THEN 1 ELSE 0 END) as unread_count,
                MAX(m.created_at) as last_message_at,
                (SELECT content FROM messages WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message
            FROM clients c
            LEFT JOIN messages m ON c.id = m.client_id
            GROUP BY c.id
            HAVING message_count > 0
            ORDER BY last_message_at DESC
        `);

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
    });
  }
});

// Get unread count
router.get('/unread/count', (req, res) => {
  try {
    const result = queryOne(`
            SELECT COUNT(*) as count FROM messages
            WHERE direction = 'inbound' AND read_at IS NULL
        `);

    res.json({
      success: true,
      count: result?.count || 0,
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
    });
  }
});

// Get messages for a specific client
router.get('/client/:clientId', (req, res) => {
  const { clientId } = req.params;

  try {
    const client = queryOne('SELECT * FROM clients WHERE id = ?', [clientId]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found',
      });
    }

    const messages = query(
      `
            SELECT m.*, u.username as sender_name
            FROM messages m
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.client_id = ?
            ORDER BY m.created_at ASC
        `,
      [clientId]
    );

    // Mark inbound messages as read
    execute(
      `
            UPDATE messages SET read_at = CURRENT_TIMESTAMP
            WHERE client_id = ? AND direction = 'inbound' AND read_at IS NULL
        `,
      [clientId]
    );

    res.json({
      success: true,
      client,
      messages,
    });
  } catch (error) {
    console.error('Get client messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
    });
  }
});

// Send message to client
router.post(
  '/client/:clientId',
  [
    body('subject').optional().trim(),
    body('content').trim().notEmpty().withMessage('Message content is required'),
    body('sent_via').optional().isIn(['email', 'sms', 'portal']),
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

    const { clientId } = req.params;
    const { subject, content, sent_via = 'email' } = req.body;

    try {
      const client = queryOne('SELECT * FROM clients WHERE id = ?', [clientId]);

      if (!client) {
        return res.status(404).json({
          success: false,
          message: 'Client not found',
        });
      }

      const result = execute(
        `
                INSERT INTO messages (client_id, user_id, direction, subject, content, sent_via)
                VALUES (?, ?, 'outbound', ?, ?, ?)
            `,
        [clientId, req.user.userId, subject || null, content, sent_via]
      );

      const message = queryOne('SELECT * FROM messages WHERE id = ?', [result.lastInsertRowid]);

      logActivity(
        req.user.userId,
        'SEND_MESSAGE',
        'message',
        result.lastInsertRowid,
        `Sent message to ${client.name} via ${sent_via}`
      );

      // Email/SMS service integration point - configure in production

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
      });
    }
  }
);

// Bulk message to multiple clients
router.post(
  '/bulk',
  [
    body('client_ids').isArray().withMessage('Client IDs must be an array'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
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

    const { client_ids, subject, content } = req.body;

    try {
      let sentCount = 0;

      for (const clientId of client_ids) {
        const client = queryOne('SELECT * FROM clients WHERE id = ?', [clientId]);
        if (client) {
          // Personalize content
          const personalizedContent = content
            .replace(/{{clientName}}/g, client.name)
            .replace(/{{firstName}}/g, client.name.split(' ')[0])
            .replace(/{{company}}/g, client.company || '')
            .replace(/{{email}}/g, client.email);

          execute(
            `
                        INSERT INTO messages (client_id, user_id, direction, subject, content, sent_via)
                        VALUES (?, ?, 'outbound', ?, ?, 'email')
                    `,
            [clientId, req.user.userId, subject, personalizedContent]
          );

          sentCount++;
        }
      }

      logActivity(
        req.user.userId,
        'BULK_MESSAGE',
        'message',
        null,
        `Sent bulk message to ${sentCount} clients`
      );

      res.json({
        success: true,
        message: `Message sent to ${sentCount} clients`,
        sent_count: sentCount,
      });
    } catch (error) {
      console.error('Bulk message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send bulk message',
      });
    }
  }
);

// Delete a message
router.delete('/:id', requireOwnership('message', 'id'), (req, res) => {
  const { id } = req.params;

  try {
    const message = queryOne('SELECT * FROM messages WHERE id = ?', [id]);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    execute('DELETE FROM messages WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
    });
  }
});

export default router;
