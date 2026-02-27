/**
 * CSRF Protection Middleware (P1.2.3)
 * Double-submit cookie pattern powered by csrf-csrf (HMAC-signed tokens)
 *
 * How it works:
 * 1. Client calls GET /api/csrf-token to obtain a token
 * 2. Server HMAC-signs the token, sets it in an httpOnly cookie, and returns it
 * 3. Client sends the token back in the X-CSRF-Token header on state-changing requests
 * 4. Server validates the HMAC signature and compares the header to the cookie
 *
 * Bearer-authenticated (JWT) requests are automatically bypassed —
 * JWT APIs are not vulnerable to CSRF because credentials aren't sent via cookies.
 *
 * Standards: OWASP A01, NIST 800-53 SC-23
 */
import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'csrf-secret-change-in-production',
  getSessionIdentifier: () => '', // Stateless — no server-side session dependency
  cookieName: '__csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
  getCsrfTokenFromRequest: (req) =>
    req.headers['x-csrf-token'] || req.headers['x-xsrf-token'] || req.body?._csrf,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  skipCsrfProtection: (req) => {
    // JWT-authenticated requests are immune to CSRF by design
    const authHeader = req.headers['authorization'];
    return !!(authHeader && authHeader.startsWith('Bearer '));
  },
});

/**
 * Express middleware — validates CSRF tokens on state-changing requests.
 * Automatically skips GET/HEAD/OPTIONS and Bearer-authenticated requests.
 */
export const csrfProtection = doubleCsrfProtection;

/**
 * Route handler — generates a new CSRF token and returns it to the client.
 * Also sets the __csrf httpOnly cookie for the double-submit pattern.
 */
export function csrfToken(req, res) {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
}

export default { csrfProtection, csrfToken };
