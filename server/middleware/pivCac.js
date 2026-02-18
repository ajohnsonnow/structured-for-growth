/**
 * PIV/CAC Authentication Middleware (P4.4.2)
 *
 * Supports Department of Defense Common Access Card (CAC) and
 * Federal PIV (Personal Identity Verification) card authentication
 * using mutual TLS (mTLS) client certificates.
 *
 * How it works (in plain English):
 * - A PIV or CAC card contains a digital certificate (like an ID badge)
 * - The web server (nginx/reverse proxy) performs the TLS handshake and
 *   passes the client certificate info in headers
 * - This middleware reads those headers and maps the certificate to a user
 *
 * Standards:
 * - FIPS 201-3 (PIV standard)
 * - HSPD-12 (Homeland Security Presidential Directive)
 * - OMB M-22-09 (Federal Zero Trust Strategy)
 * - NIST SP 800-73 (PIV interfaces)
 * - NIST SP 800-63B (AAL3 — hardware crypto authenticator)
 */

import { createLogger } from '../lib/logger.js';
import { query, queryOne, execute, logActivity } from '../models/database.js';

const logger = createLogger('piv-cac');

// ────────────────────────────────────────────────────────────
// Database Schema
// ────────────────────────────────────────────────────────────

export function initPivCacTables() {
  execute(`
    CREATE TABLE IF NOT EXISTS piv_certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject_dn TEXT NOT NULL,
      issuer_dn TEXT NOT NULL,
      serial_number TEXT NOT NULL UNIQUE,
      edipi TEXT,
      email TEXT,
      common_name TEXT,
      not_before TEXT,
      not_after TEXT,
      certificate_type TEXT DEFAULT 'PIV',
      status TEXT DEFAULT 'active',
      registered_at TEXT DEFAULT (datetime('now')),
      last_used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  execute(`
    CREATE TABLE IF NOT EXISTS piv_auth_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_dn TEXT,
      serial_number TEXT,
      user_id INTEGER,
      result TEXT NOT NULL,
      reason TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
}

// Tables are initialized lazily on first use (database may not be ready at import time)
let tablesInitialized = false;
function ensureTables() {
  if (tablesInitialized) {
    return;
  }
  try {
    initPivCacTables();
    tablesInitialized = true;
  } catch {
    // Database not ready yet — will retry on next call
  }
}

// ────────────────────────────────────────────────────────────
// Certificate Parsing
// ────────────────────────────────────────────────────────────

/**
 * Standard headers set by reverse proxies (nginx, Apache, Envoy)
 * when mTLS is configured. The proxy terminates TLS and forwards
 * the client cert info as HTTP headers.
 */
const CERT_HEADERS = {
  // nginx: proxy_set_header X-SSL-Client-S-DN $ssl_client_s_dn;
  subjectDN: ['x-ssl-client-s-dn', 'x-client-cert-s-dn', 'x-forwarded-client-cert-subject'],
  issuerDN: ['x-ssl-client-i-dn', 'x-client-cert-i-dn'],
  serial: ['x-ssl-client-serial', 'x-client-cert-serial'],
  verified: ['x-ssl-client-verify', 'x-client-cert-verify'],
  notBefore: ['x-ssl-client-not-before'],
  notAfter: ['x-ssl-client-not-after'],
  fingerprint: ['x-ssl-client-fingerprint', 'x-client-cert-fingerprint'],
};

/**
 * Extract client certificate info from proxy headers.
 * Returns null if no certificate was presented.
 */
function extractCertInfo(req) {
  // Try each header variant
  const getHeader = (variants) => {
    for (const name of variants) {
      const val = req.headers[name];
      if (val) {
        return val;
      }
    }
    return null;
  };

  const subjectDN = getHeader(CERT_HEADERS.subjectDN);
  if (!subjectDN) {
    return null;
  } // No client cert

  const verified = getHeader(CERT_HEADERS.verified);
  const issuerDN = getHeader(CERT_HEADERS.issuerDN);
  const serial = getHeader(CERT_HEADERS.serial);
  const notBefore = getHeader(CERT_HEADERS.notBefore);
  const notAfter = getHeader(CERT_HEADERS.notAfter);
  const fingerprint = getHeader(CERT_HEADERS.fingerprint);

  // Parse subject DN fields
  const fields = parseDistinguishedName(subjectDN);

  return {
    subjectDN,
    issuerDN,
    serial,
    verified: verified === 'SUCCESS' || verified === '0' || verified === 'NONE',
    notBefore,
    notAfter,
    fingerprint,
    commonName: fields.CN || '',
    email: fields.emailAddress || fields.E || '',
    organization: fields.O || '',
    organizationalUnit: fields.OU || '',
    // DoD EDIPI is typically the last 10 digits in the CN
    edipi: extractEdipi(fields.CN || ''),
  };
}

/**
 * Parse an X.509 Distinguished Name string into key-value pairs.
 * Input: "CN=DOE.JOHN.M.1234567890,OU=DoD,O=U.S. Government,C=US"
 * Output: { CN: "DOE.JOHN.M.1234567890", OU: "DoD", ... }
 */
function parseDistinguishedName(dn) {
  const fields = {};
  if (!dn) {
    return fields;
  }

  // Handle both "/" and "," separators
  const separator = dn.includes('/') ? '/' : ',';
  const parts = dn.split(separator).filter(Boolean);

  for (const part of parts) {
    const eqIndex = part.indexOf('=');
    if (eqIndex > 0) {
      const key = part.substring(0, eqIndex).trim();
      const value = part.substring(eqIndex + 1).trim();
      fields[key] = value;
    }
  }

  return fields;
}

/**
 * Extract DoD EDIPI (Electronic Data Interchange Personal Identifier)
 * from the Common Name field. EDIPI is a 10-digit number.
 * Example CN: "DOE.JOHN.M.1234567890"
 */
function extractEdipi(cn) {
  const match = cn.match(/\.(\d{10})$/);
  return match ? match[1] : null;
}

// ────────────────────────────────────────────────────────────
// Trusted Issuers (DoD PKI Certificate Authorities)
// ────────────────────────────────────────────────────────────

const TRUSTED_ISSUERS = [
  // DoD Root CAs
  'CN=DoD Root CA 3',
  'CN=DoD Root CA 4',
  'CN=DoD Root CA 5',
  'CN=DoD Root CA 6',
  // DoD Intermediate CAs
  'CN=DOD ID CA-59',
  'CN=DOD ID CA-62',
  'CN=DOD ID CA-63',
  'CN=DOD ID CA-64',
  'CN=DOD ID CA-65',
  'CN=DOD EMAIL CA-59',
  'CN=DOD EMAIL CA-62',
  'CN=DOD EMAIL CA-63',
  'CN=DOD SW CA-60',
  'CN=DOD SW CA-61',
  // Federal Bridge CAs
  'CN=Federal Bridge CA G4',
  'CN=Federal Common Policy CA G2',
  // Test / development (only in non-production)
  ...(process.env.NODE_ENV !== 'production' ? ['CN=Test PIV CA', 'CN=Development CA'] : []),
];

/**
 * Check if the issuer is in our trusted CA list.
 */
function isTrustedIssuer(issuerDN) {
  if (!issuerDN) {
    return false;
  }
  return TRUSTED_ISSUERS.some((trusted) => issuerDN.includes(trusted));
}

// ────────────────────────────────────────────────────────────
// Authentication Middleware
// ────────────────────────────────────────────────────────────

/**
 * PIV/CAC authentication middleware.
 *
 * This checks for a client certificate (forwarded by the reverse proxy),
 * validates it against our trusted issuers, and looks up the associated
 * user account. If found, sets `req.user` and `req.pivAuth = true`.
 *
 * If no certificate is present, the request passes through (allowing
 * fallback to JWT auth). Use `requirePivAuth` to mandate PIV/CAC.
 *
 * Usage:
 *   app.use(pivCacAuth);                    // Optional PIV auth
 *   app.get('/secure', requirePivAuth, handler); // Required PIV auth
 */
export function pivCacAuth(req, res, next) {
  ensureTables();
  const certInfo = extractCertInfo(req);

  // No certificate — pass through to other auth methods
  if (!certInfo) {
    return next();
  }

  const ip = req.ip || req.socket?.remoteAddress;
  const userAgent = req.headers['user-agent'];

  // Check: proxy verified the cert?
  if (!certInfo.verified) {
    logAuthAttempt(
      certInfo.subjectDN,
      certInfo.serial,
      null,
      'failed',
      'Certificate verification failed at proxy',
      ip,
      userAgent
    );
    logger.warn('PIV/CAC: certificate not verified by proxy', { subjectDN: certInfo.subjectDN });
    return next(); // Fall through to JWT auth
  }

  // Check: trusted issuer?
  if (!isTrustedIssuer(certInfo.issuerDN)) {
    logAuthAttempt(
      certInfo.subjectDN,
      certInfo.serial,
      null,
      'rejected',
      `Untrusted issuer: ${certInfo.issuerDN}`,
      ip,
      userAgent
    );
    logger.warn('PIV/CAC: untrusted certificate issuer', { issuerDN: certInfo.issuerDN });
    return next();
  }

  // Check: certificate not expired?
  if (certInfo.notAfter) {
    const expiry = new Date(certInfo.notAfter);
    if (expiry < new Date()) {
      logAuthAttempt(
        certInfo.subjectDN,
        certInfo.serial,
        null,
        'expired',
        `Expired: ${certInfo.notAfter}`,
        ip,
        userAgent
      );
      logger.warn('PIV/CAC: expired certificate', {
        subjectDN: certInfo.subjectDN,
        expiry: certInfo.notAfter,
      });
      return next();
    }
  }

  // Look up registered certificate
  const registration = queryOne(
    'SELECT * FROM piv_certificates WHERE serial_number = ? AND status = ?',
    [certInfo.serial, 'active']
  );

  if (!registration) {
    logAuthAttempt(
      certInfo.subjectDN,
      certInfo.serial,
      null,
      'unregistered',
      'Certificate not registered',
      ip,
      userAgent
    );
    logger.info('PIV/CAC: valid certificate but not registered', {
      subjectDN: certInfo.subjectDN,
      serial: certInfo.serial,
    });
    // Attach cert info so registration endpoints can use it
    req.pivCertInfo = certInfo;
    return next();
  }

  // Look up associated user
  const user = queryOne('SELECT id, email, role, name FROM users WHERE id = ?', [
    registration.user_id,
  ]);

  if (!user) {
    logAuthAttempt(
      certInfo.subjectDN,
      certInfo.serial,
      registration.user_id,
      'orphaned',
      'User account not found',
      ip,
      userAgent
    );
    logger.error('PIV/CAC: certificate registered to missing user', {
      userId: registration.user_id,
    });
    return next();
  }

  // Success — set authenticated user
  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    mfaVerified: true, // PIV/CAC is AAL3 — equivalent to hardware MFA
  };
  req.pivAuth = true;
  req.pivCertInfo = certInfo;

  // Update last-used timestamp
  execute("UPDATE piv_certificates SET last_used_at = datetime('now') WHERE id = ?", [
    registration.id,
  ]);

  logAuthAttempt(certInfo.subjectDN, certInfo.serial, user.id, 'success', null, ip, userAgent);
  logActivity(user.id, 'piv_auth', `PIV/CAC login via ${certInfo.commonName}`);

  logger.info('PIV/CAC: authentication successful', { userId: user.id, cn: certInfo.commonName });
  next();
}

/**
 * Middleware that REQUIRES PIV/CAC authentication.
 * Use after `pivCacAuth` for routes that must only accept smart card auth.
 */
export function requirePivAuth(req, res, next) {
  if (!req.pivAuth) {
    return res.status(401).json({
      error: 'PIV/CAC smart card authentication required',
      code: 'PIV_REQUIRED',
      hint: 'Insert your CAC or PIV card and ensure client certificate is configured',
    });
  }
  next();
}

// ────────────────────────────────────────────────────────────
// Certificate Registration (admin API helpers)
// ────────────────────────────────────────────────────────────

/**
 * Register a new PIV/CAC certificate for a user.
 * Called by admin endpoints to bind a cert to an account.
 */
export function registerCertificate(userId, certInfo, type = 'PIV') {
  // Check for duplicates
  const existing = queryOne('SELECT id FROM piv_certificates WHERE serial_number = ?', [
    certInfo.serial,
  ]);
  if (existing) {
    return { success: false, error: 'Certificate already registered' };
  }

  execute(
    `INSERT INTO piv_certificates (user_id, subject_dn, issuer_dn, serial_number, edipi, email, common_name, not_before, not_after, certificate_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      certInfo.subjectDN,
      certInfo.issuerDN,
      certInfo.serial,
      certInfo.edipi,
      certInfo.email,
      certInfo.commonName,
      certInfo.notBefore,
      certInfo.notAfter,
      type,
    ]
  );

  logActivity(userId, 'piv_register', `Registered ${type} certificate: ${certInfo.commonName}`);
  logger.info('PIV/CAC: certificate registered', {
    userId,
    cn: certInfo.commonName,
    serial: certInfo.serial,
  });

  return { success: true };
}

/**
 * Revoke a PIV/CAC certificate.
 */
export function revokeCertificate(certId, reason = 'Administrative revocation') {
  execute('UPDATE piv_certificates SET status = ? WHERE id = ?', ['revoked', certId]);
  logger.info('PIV/CAC: certificate revoked', { certId, reason });
  return { success: true };
}

/**
 * List certificates for a user.
 */
export function getUserCertificates(userId) {
  return query('SELECT * FROM piv_certificates WHERE user_id = ? ORDER BY registered_at DESC', [
    userId,
  ]);
}

// ────────────────────────────────────────────────────────────
// Audit Helpers
// ────────────────────────────────────────────────────────────

function logAuthAttempt(subjectDn, serial, userId, result, reason, ip, userAgent) {
  try {
    execute(
      `INSERT INTO piv_auth_log (subject_dn, serial_number, user_id, result, reason, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [subjectDn, serial, userId, result, reason, ip, userAgent]
    );
  } catch (err) {
    logger.error('Failed to log PIV auth attempt', { error: err.message });
  }
}

export default {
  pivCacAuth,
  requirePivAuth,
  registerCertificate,
  revokeCertificate,
  getUserCertificates,
  initPivCacTables,
};
