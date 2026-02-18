/**
 * CSRF Protection Middleware (P1.2.3)
 * Double-submit cookie pattern — no session dependency
 *
 * How it works:
 * 1. Client calls GET /api/csrf-token to get a token
 * 2. Server sets token in a cookie AND returns it in the response body
 * 3. Client sends the token in X-CSRF-Token header on state-changing requests
 * 4. Server compares header value to cookie value
 *
 * Standard: OWASP A01
 */
import { randomBytes } from 'crypto';

/**
 * Generate and return a CSRF token
 * Sets a cookie and returns the token in the response
 */
export function csrfToken(req, res) {
  const token = randomBytes(32).toString('hex');
  res.cookie('_csrf', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
    maxAge: 3600000, // 1 hour
  });
  res.json({ csrfToken: token });
}

/**
 * Validate CSRF token on state-changing requests
 * Compares X-CSRF-Token header to _csrf cookie
 */
export function csrfProtection(req, res, next) {
  // Skip for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip for API endpoints authenticated via Bearer token (JWT)
  // JWT-authenticated APIs don't need CSRF since they're not cookie-based
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const cookieToken = req.cookies?._csrf;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
    });
  }

  next();
}

export default { csrfToken, csrfProtection };
