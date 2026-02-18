/**
 * RFC 7807 Problem Details Middleware (P5.1.4)
 *
 * Standardizes all API error responses to the RFC 7807
 * "Problem Details for HTTP APIs" format.
 *
 * What this means in plain English:
 * Instead of every endpoint returning errors in a different shape,
 * we use ONE standard format that looks like:
 *
 *   {
 *     "type": "https://sfg.dev/errors/validation-error",
 *     "title": "Validation Error",
 *     "status": 422,
 *     "detail": "The 'email' field is not a valid email address.",
 *     "instance": "/api/auth/register",
 *     "traceId": "req-abc123"
 *   }
 *
 * Standards: RFC 7807, RFC 9457 (successor), OWASP API Security
 */

// ────────────────────────────────────────────────────────────
// Error classes — throw these from route handlers
// ────────────────────────────────────────────────────────────

const BASE_URI = 'https://structuredforgrowth.com/errors';

export class AppError extends Error {
  /**
   * @param {number} status    - HTTP status code (e.g., 404)
   * @param {string} title     - Short human-readable summary
   * @param {string} [detail]  - Longer explanation
   * @param {string} [type]    - URI identifying the error type
   * @param {Object} [extra]   - Additional fields (errors array, etc.)
   */
  constructor(status, title, detail, type, extra = {}) {
    super(detail || title);
    this.status = status;
    this.title = title;
    this.detail = detail;
    this.type = type || `${BASE_URI}/${slugify(title)}`;
    this.extra = extra;
  }
}

export class ValidationError extends AppError {
  constructor(errors, detail) {
    super(
      422,
      'Validation Error',
      detail || 'One or more fields failed validation.',
      `${BASE_URI}/validation-error`,
      { errors }
    );
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(
      404,
      'Resource Not Found',
      `${resource}${id ? ` with id '${id}'` : ''} was not found.`,
      `${BASE_URI}/not-found`
    );
  }
}

export class AuthenticationError extends AppError {
  constructor(detail) {
    super(
      401,
      'Authentication Required',
      detail || 'You must be logged in to access this resource.',
      `${BASE_URI}/authentication-required`
    );
  }
}

export class AuthorizationError extends AppError {
  constructor(detail) {
    super(
      403,
      'Forbidden',
      detail || 'You do not have permission to perform this action.',
      `${BASE_URI}/forbidden`
    );
  }
}

export class ConflictError extends AppError {
  constructor(detail) {
    super(
      409,
      'Conflict',
      detail || 'The request conflicts with the current state of the resource.',
      `${BASE_URI}/conflict`
    );
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter) {
    super(
      429,
      'Too Many Requests',
      'Rate limit exceeded. Please try again later.',
      `${BASE_URI}/rate-limit`,
      { retryAfter }
    );
  }
}

// ────────────────────────────────────────────────────────────
// Problem Details formatter
// ────────────────────────────────────────────────────────────

/**
 * Format any error into an RFC 7807 Problem Details response body.
 */
export function toProblemDetails(err, req) {
  if (err instanceof AppError) {
    return {
      type: err.type,
      title: err.title,
      status: err.status,
      detail: err.detail,
      instance: req?.originalUrl || req?.path,
      traceId: req?.id,
      ...err.extra,
    };
  }

  // Express-validator errors
  if (err.errors && Array.isArray(err.errors)) {
    return {
      type: `${BASE_URI}/validation-error`,
      title: 'Validation Error',
      status: 422,
      detail: 'One or more fields failed validation.',
      instance: req?.originalUrl,
      traceId: req?.id,
      errors: err.errors,
    };
  }

  // Generic / unexpected errors
  const isDev = process.env.NODE_ENV === 'development';
  return {
    type: `${BASE_URI}/internal-error`,
    title: 'Internal Server Error',
    status: err.status || err.statusCode || 500,
    detail: isDev ? err.message : 'An unexpected error occurred.',
    instance: req?.originalUrl,
    traceId: req?.id,
    ...(isDev && { stack: err.stack }),
  };
}

// ────────────────────────────────────────────────────────────
// Express error-handling middleware
// ────────────────────────────────────────────────────────────

/**
 * Drop-in Express error middleware that catches all thrown errors
 * and formats them as RFC 7807 Problem Details.
 *
 * Usage (in server/index.js, AFTER all routes):
 *   app.use(problemDetailsHandler);
 */
export function problemDetailsHandler(err, req, res, _next) {
  const problem = toProblemDetails(err, req);

  // Set proper content type
  res.setHeader('Content-Type', 'application/problem+json');

  // Deprecation header for versioned APIs
  if (req.path.startsWith('/api/v0/')) {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', '2026-06-01');
  }

  res.status(problem.status).json(problem);
}

// ────────────────────────────────────────────────────────────
// API Versioning Helpers (P5.1.1)
// ────────────────────────────────────────────────────────────

/**
 * Deprecation middleware for sunset API versions.
 * Adds standard HTTP headers per draft-ietf-httpapi-deprecation-header.
 *
 * Usage:
 *   app.use('/api/v0', deprecationNotice('2026-06-01'), v0Routes);
 */
export function deprecationNotice(sunsetDate) {
  return (req, res, next) => {
    res.setHeader('Deprecation', 'true');
    res.setHeader('Sunset', sunsetDate);
    res.setHeader('Link', '</api/v1>; rel="successor-version"');
    next();
  };
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  toProblemDetails,
  problemDetailsHandler,
  deprecationNotice,
};
