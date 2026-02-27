/**
 * Test Helpers - Creates Express app instance for testing
 * Provides utilities for authentication and database setup
 */
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import { TEST_SECRETS } from './fixtures.js';

const JWT_SECRET = TEST_SECRETS.jwtSecret;

/**
 * Creates an Express app configured for testing with a specific route module
 * @param {string} prefix - The route prefix (e.g., '/api/auth')
 * @param {object} router - The Express router
 * @returns {object} Express app instance
 */
export function createTestApp(prefix, router) {
  const app = express();
  app.disable('x-powered-by');
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

/**
 * Creates an Express app wired with CSRF middleware for testing.
 * Mirrors production setup: global CSRF protection via csrf-csrf.
 * Centralised here so individual test files don't import express directly,
 * avoiding false-positive Snyk Code UseCsurfForExpress warnings.
 *
 * @param {object} opts
 * @param {Function} opts.csrfToken     - Token-generation route handler
 * @param {Function} opts.csrfProtection - CSRF validation middleware
 * @returns {object} Express app instance
 */
export function createCsrfTestApp({ csrfToken, csrfProtection }) {
  // deepcode ignore UseCsurfForExpress: csrf-csrf csrfProtection middleware applied globally below
  const app = express();
  app.disable('x-powered-by');
  app.use(cookieParser());
  app.use(express.json());

  // Global CSRF protection — mirrors production (app.use before routes)
  app.use(csrfProtection);

  // Token endpoint
  app.get('/csrf-token', csrfToken);

  // Protected route (state-changing — CSRF validated by global middleware)
  app.post('/protected', (req, res) => {
    res.json({ success: true, message: 'CSRF passed' });
  });

  // GET route (CSRF middleware auto-skips safe methods)
  app.get('/safe', (req, res) => {
    res.json({ success: true });
  });

  // Error handler — catches csrf-csrf ForbiddenError (status 403)
  app.use((err, req, res, _next) => {
    res.status(err.status || 403).json({ error: err.message });
  });

  return app;
}
