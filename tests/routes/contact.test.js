/**
 * Unit Tests: Contact Routes
 * Tests form submission with validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../server/controllers/contactController.js', () => ({
  sendContactEmail: vi.fn(() => Promise.resolve()),
}));

import request from 'supertest';
import { createTestApp } from '../helpers.js';
import contactRouter from '../../server/routes/contact.js';
import { sendContactEmail } from '../../server/controllers/contactController.js';

const app = createTestApp('/api/contact', contactRouter);

describe('Contact Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/contact', () => {
    it('should reject empty submission', async () => {
      const res = await request(app).post('/api/contact').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject submission with invalid email', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'invalid',
        subject: 'Test Subject',
        message: 'Test message content here',
      });
      expect(res.status).toBe(400);
    });

    it('should reject submission with short name', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'A',
        email: 'test@test.com',
        subject: 'Test Subject',
        message: 'Test message content here',
      });
      expect(res.status).toBe(400);
    });

    it('should reject submission with short message', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@test.com',
        subject: 'Test Subject',
        message: 'Short',
      });
      expect(res.status).toBe(400);
    });

    it('should accept valid submission', async () => {
      const res = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@test.com',
        subject: 'Test Subject',
        message: 'This is a valid test message with enough length',
      });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(sendContactEmail).toHaveBeenCalledOnce();
    });

    it('should handle server errors gracefully', async () => {
      sendContactEmail.mockRejectedValueOnce(new Error('SMTP error'));

      const res = await request(app).post('/api/contact').send({
        name: 'Test User',
        email: 'test@test.com',
        subject: 'Test Subject',
        message: 'This is a valid test message with enough length',
      });
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
});
