import express from 'express';
import { body, validationResult } from 'express-validator';
import { sendContactEmail } from '../controllers/contactController.js';

const router = express.Router();

// Contact form submission
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').trim().isEmail().withMessage('Please provide a valid email'),
    body('subject')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Subject must be at least 3 characters'),
    body('message')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Message must be at least 10 characters'),
    body('company').optional().trim(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    try {
      await sendContactEmail(req.body);

      res.status(200).json({
        success: true,
        message: 'Message sent successfully',
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
      });
    }
  }
);

export default router;
