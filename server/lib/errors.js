/**
 * Custom Error Classes with Error Codes
 *
 * Provides structured, machine-readable errors for the API layer.
 * Every error carries a numeric `statusCode`, a stable `code` string,
 * and a human-readable `message`.
 *
 * Usage:
 *   import { NotFoundError, ValidationError } from '../lib/errors.js';
 *   throw new NotFoundError('Client not found');
 *   throw new ValidationError('Email is required', 'MISSING_FIELD');
 */

/** Base application error — every custom error extends this. */
export class AppError extends Error {
  /**
   * @param {string}  message    — human-readable description
   * @param {number}  statusCode — HTTP status code (default 500)
   * @param {string}  code       — stable machine-readable code (default 'INTERNAL_ERROR')
   * @param {Object}  [details]  — optional structured details (validation fields, etc.)
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  /** Serialize for JSON API response (RFC 7807-inspired). */
  toJSON() {
    const obj = {
      error: {
        code: this.code,
        message: this.message,
        status: this.statusCode,
      },
    };
    if (this.details) {
      obj.error.details = this.details;
    }
    return obj;
  }
}

// ── 400 Bad Request ──

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST', details) {
    super(message, 400, code, details);
  }
}

export class ValidationError extends AppError {
  /**
   * @param {string}  message
   * @param {Array}   [fields] — per-field errors [{ field, message, value? }]
   */
  constructor(message = 'Validation failed', fields) {
    super(message, 400, 'VALIDATION_ERROR', fields ? { fields } : undefined);
  }
}

// ── 401 Unauthorized ──

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = 'Invalid username or password') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor(message = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED');
  }
}

export class MFARequiredError extends AppError {
  constructor(message = 'MFA verification required') {
    super(message, 403, 'MFA_REQUIRED');
  }
}

// ── 403 Forbidden ──

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions', code = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

// ── 404 Not Found ──

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id) {
    const msg = id ? `${resource} (${id}) not found` : `${resource} not found`;
    super(msg, 404, 'NOT_FOUND', { resource, id });
  }
}

// ── 409 Conflict ──

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class DuplicateError extends ConflictError {
  constructor(field, value) {
    super(`${field} "${value}" already exists`, 'DUPLICATE');
  }
}

// ── 422 Unprocessable Entity ──

export class UnprocessableError extends AppError {
  constructor(message = 'Request could not be processed', code = 'UNPROCESSABLE') {
    super(message, 422, code);
  }
}

// ── 429 Rate Limited ──

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests', 429, 'RATE_LIMITED', { retryAfterSeconds: retryAfter });
  }
}

// ── 500 Internal Server Error ──

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database error') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

// ── 503 Service Unavailable ──

export class ServiceUnavailableError extends AppError {
  constructor(service = 'Service', message) {
    super(message || `${service} is temporarily unavailable`, 503, 'SERVICE_UNAVAILABLE', {
      service,
    });
  }
}

// ── Error handler middleware (use as last middleware in Express) ──

/**
 * Express error-handling middleware.
 * Catches AppError subclasses and returns structured JSON.
 * Unknown errors get a generic 500.
 *
 * Usage: app.use(errorHandler);
 */
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid token', status: 401 },
    });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: { code: 'TOKEN_EXPIRED', message: 'Token has expired', status: 401 },
    });
  }

  // express-validator / body-parser errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Invalid JSON in request body', status: 400 },
    });
  }

  // Unknown errors — log full stack, return generic message
  const logger = req.app?.locals?.logger;
  if (logger) {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      requestId: req.id,
      method: req.method,
      path: req.path,
    });
  } else {
    console.error('Unhandled error:', err);
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 },
  });
}
