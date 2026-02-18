/**
 * Test Helpers - Creates Express app instance for testing
 * Provides utilities for authentication and database setup
 */
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

/**
 * Creates an Express app configured for testing with a specific route module
 * @param {string} prefix - The route prefix (e.g., '/api/auth')
 * @param {object} router - The Express router
 * @returns {object} Express app instance
 */
export function createTestApp(prefix, router) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(prefix, router);

  // Error handler
  app.use((err, req, res, _next) => {
    console.error('Test error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  });

  return app;
}

/**
 * Generate a valid JWT token for testing
 * @param {object} payload - Token payload
 * @returns {string} JWT token
 */
export function generateTestToken(payload = {}) {
  const defaultPayload = {
    userId: 1,
    username: 'testadmin',
    email: 'admin@test.com',
    role: 'admin',
    ...payload,
  };
  return jwt.sign(defaultPayload, JWT_SECRET, { expiresIn: '1h' });
}

/**
 * Generate an admin token
 */
export function adminToken() {
  return generateTestToken({ userId: 1, username: 'admin', role: 'admin' });
}

/**
 * Generate a regular user token
 */
export function userToken() {
  return generateTestToken({ userId: 2, username: 'user', role: 'user' });
}

/**
 * Auth header helper
 */
export function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}
