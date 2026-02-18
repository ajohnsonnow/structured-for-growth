/**
 * Input Validation Schemas (P5.1.5)
 *
 * Centralized validation schemas using express-validator chains.
 * Instead of scattering validation rules across every route file,
 * we define reusable schemas here — like a dictionary of "what does
 * valid data look like?" for every API endpoint.
 *
 * Standards: OWASP Input Validation, NIST SI-10
 */

import { body, param, query } from 'express-validator';

// ────────────────────────────────────────────────────────────
// Shared Field Validators
// ────────────────────────────────────────────────────────────

export const fields = {
  // Identity
  id: param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  uuid: param('id').isUUID().withMessage('ID must be a valid UUID'),

  // Strings
  name: (field = 'name') =>
    body(field)
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage(`${field} is required (1-255 chars)`),
  title: (field = 'title') =>
    body(field)
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage(`${field} is required (1-500 chars)`),
  description: (field = 'description') =>
    body(field)
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage(`${field} must be under 5000 chars`),
  longText: (field) =>
    body(field)
      .optional()
      .trim()
      .isLength({ max: 50000 })
      .withMessage(`${field} must be under 50000 chars`),

  // Auth
  email: body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  password: body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must contain a special character'),
  username: body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage('Username: 3-50 chars, letters/numbers/._- only'),

  // Pagination
  page: query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be ≥ 1'),
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be 1-100'),

  // Dates
  date: (field) => body(field).optional().isISO8601().withMessage(`${field} must be ISO 8601 date`),
  dateRequired: (field) => body(field).isISO8601().withMessage(`${field} is required (ISO 8601)`),

  // Enums
  role: body('role')
    .optional()
    .isIn(['user', 'editor', 'admin'])
    .withMessage('Role must be user, editor, or admin'),
  status: (field, values) =>
    body(field)
      .optional()
      .isIn(values)
      .withMessage(`${field} must be one of: ${values.join(', ')}`),

  // Boolean
  bool: (field) => body(field).optional().isBoolean().toBoolean(),
};

// ────────────────────────────────────────────────────────────
// Endpoint-Specific Schemas
// ────────────────────────────────────────────────────────────

export const schemas = {
  // Auth
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],

  register: [fields.username, fields.email, fields.password, fields.role],

  // Contact
  contactForm: [
    fields.name(),
    fields.email,
    body('message')
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Message: 10-5000 characters'),
    body('company').optional().trim().isLength({ max: 255 }),
    body('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'),
  ],

  // Client
  createClient: [
    fields.name(),
    fields.email,
    body('company').optional().trim().isLength({ max: 255 }),
    body('industry').optional().trim().isLength({ max: 100 }),
    body('phone').optional().trim(),
  ],

  updateClient: [
    fields.id,
    body('name').optional().trim().isLength({ min: 1, max: 255 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('company').optional().trim(),
    body('industry').optional().trim(),
  ],

  // Project
  createProject: [
    fields.name(),
    fields.description(),
    body('clientId').isInt({ min: 1 }).withMessage('Client ID required'),
    fields.status('status', ['planning', 'active', 'review', 'completed', 'archived']),
    fields.date('startDate'),
    fields.date('endDate'),
  ],

  // Message
  sendMessage: [
    body('recipientId').isInt({ min: 1 }).withMessage('Recipient ID required'),
    body('subject').trim().isLength({ min: 1, max: 255 }).withMessage('Subject required'),
    body('body').trim().isLength({ min: 1, max: 10000 }).withMessage('Message body required'),
  ],

  // Compliance Evidence
  submitEvidence: [
    body('framework').trim().notEmpty().withMessage('Framework required'),
    body('controlId').trim().notEmpty().withMessage('Control ID required'),
    body('evidenceType').isIn(['document', 'screenshot', 'configuration', 'log', 'attestation']),
    body('description').trim().isLength({ min: 10, max: 5000 }),
  ],

  // POA&M
  createPoam: [
    body('weakness').trim().notEmpty().withMessage('Weakness description required'),
    body('controlId').optional().trim(),
    body('riskLevel').optional().isIn(['critical', 'high', 'moderate', 'low']),
    fields.date('scheduledCompletion'),
    body('responsibleParty').optional().trim(),
  ],

  // AI
  aiOrchestrate: [
    body('message')
      .trim()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Message required (max 10000 chars)'),
    body('agent').optional().isIn(['compliance', 'document', 'guidance', 'audit']),
    body('context').optional().isObject(),
  ],

  // Scan Upload
  scanUpload: [
    body('scanType').isIn([
      'infrastructure',
      'web-application',
      'database',
      'container',
      'dependency',
    ]),
    body('scanner').optional().trim(),
    body('findings').isArray().withMessage('Findings must be an array'),
  ],
};

// ────────────────────────────────────────────────────────────
// Validation Result Middleware
// ────────────────────────────────────────────────────────────

import { validationResult } from 'express-validator';
import { ValidationError } from '../lib/problemDetails.js';

/**
 * Middleware that checks validation results and throws RFC 7807
 * ValidationError if any field failed.
 *
 * Usage:
 *   router.post('/foo', ...schemas.createClient, validate, handler);
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const ve = new ValidationError(
      errors.array().map((e) => ({
        field: e.path || e.param,
        message: e.msg,
        value: e.value,
      }))
    );
    return res.status(422).json({
      type: ve.type,
      title: ve.title,
      status: ve.status,
      detail: ve.detail,
      errors: ve.extra.errors,
      traceId: req.id,
    });
  }
  next();
}

export default { fields, schemas, validate };
