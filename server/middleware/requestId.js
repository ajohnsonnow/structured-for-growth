/**
 * Request ID Middleware (P3.1.2)
 * Assigns a unique correlation ID to each HTTP request
 * Enables distributed tracing and log correlation
 *
 * Standard: OWASP A09, NIST AU-3
 */
import { randomUUID } from 'crypto';

export function requestId(req, res, next) {
  // Use existing header if provided (e.g., from load balancer)
  req.id = req.headers['x-request-id'] || randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

export default { requestId };
