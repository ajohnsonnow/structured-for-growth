/**
 * Zero Trust Architecture Middleware (P4.4.1)
 *
 * Implements NIST SP 800-207 Zero Trust principles:
 *  1. Never trust, always verify — every request is authenticated & authorized
 *  2. Least privilege — minimum permissions per request
 *  3. Assume breach — log everything, limit blast radius
 *  4. Continuous verification — re-evaluate trust on each access
 *
 * This middleware wraps around existing auth and adds:
 * - Device posture checks
 * - Session risk scoring
 * - Dynamic access policy evaluation
 * - Micro-segmentation enforcement (route-level)
 * - Continuous session monitoring
 *
 * Standards: NIST SP 800-207, OMB M-22-09, CISA Zero Trust Maturity Model
 */

import { createLogger } from '../lib/logger.js';

const logger = createLogger('zero-trust');

// ────────────────────────────────────────────────────────────
// Trust Score Engine
// ────────────────────────────────────────────────────────────

/**
 * Compute a trust score (0-100) for the current request.
 * Higher = more trusted. Below threshold → deny or step-up.
 *
 * Think of it like a credit score for each API request:
 * - Valid JWT? +30
 * - Known device? +15
 * - Same IP as last request? +10
 * - MFA completed? +20
 * - Request looks normal? +15
 * - Within business hours? +10
 */
export function computeTrustScore(req) {
  let score = 0;
  const factors = [];

  // Factor 1: Authenticated identity (+30)
  if (req.user && req.user.id) {
    score += 30;
    factors.push({ factor: 'identity', points: 30, detail: 'Authenticated user' });
  }

  // Factor 2: MFA verified (+20)
  if (req.user?.mfaVerified) {
    score += 20;
    factors.push({ factor: 'mfa', points: 20, detail: 'MFA completed' });
  }

  // Factor 3: Known device fingerprint (+15)
  const deviceId = req.headers['x-device-id'] || req.cookies?.device_id;
  if (deviceId && req.user?.knownDevices?.includes(deviceId)) {
    score += 15;
    factors.push({ factor: 'device', points: 15, detail: 'Known device' });
  } else if (deviceId) {
    score += 5;
    factors.push({ factor: 'device', points: 5, detail: 'Unknown device with ID' });
  }

  // Factor 4: IP consistency (+10)
  const currentIp = req.ip || req.socket?.remoteAddress;
  if (req.user?.lastKnownIp === currentIp) {
    score += 10;
    factors.push({ factor: 'ip_consistency', points: 10, detail: 'Same IP as previous session' });
  }

  // Factor 5: Request anomaly check (+15)
  const anomalyScore = checkRequestAnomaly(req);
  score += anomalyScore;
  factors.push({
    factor: 'anomaly',
    points: anomalyScore,
    detail: anomalyScore >= 10 ? 'Normal request' : 'Anomalous patterns detected',
  });

  // Factor 6: Time-based trust (+10)
  const hour = new Date().getUTCHours();
  const isBusinessHours = hour >= 8 && hour <= 20; // Generous window for US time zones
  if (isBusinessHours) {
    score += 10;
    factors.push({ factor: 'temporal', points: 10, detail: 'Business hours' });
  } else {
    score += 3;
    factors.push({ factor: 'temporal', points: 3, detail: 'Outside business hours' });
  }

  return { score: Math.min(score, 100), factors };
}

/**
 * Check request for anomalous patterns.
 * Returns 0–15 points (higher = less anomalous).
 */
function checkRequestAnomaly(req) {
  let points = 15;

  // Suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      points -= 3;
    }
  }

  // Unusually large body
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > 1_000_000) {
    points -= 5;
  }

  // Missing standard headers
  if (!req.headers['user-agent']) {
    points -= 3;
  }

  return Math.max(points, 0);
}

// ────────────────────────────────────────────────────────────
// Access Policy Engine
// ────────────────────────────────────────────────────────────

/**
 * Access policies define minimum trust scores for resource categories.
 * Think of it like security zones — public wifi vs corporate network.
 */
const DEFAULT_POLICIES = {
  // Public endpoints — no authentication needed
  public: {
    minTrustScore: 0,
    requireAuth: false,
    requireMfa: false,
    allowedRoles: ['*'],
  },
  // Standard authenticated endpoints
  standard: {
    minTrustScore: 25,
    requireAuth: true,
    requireMfa: false,
    allowedRoles: ['user', 'editor', 'admin'],
  },
  // Sensitive data — requires MFA and higher trust
  sensitive: {
    minTrustScore: 50,
    requireAuth: true,
    requireMfa: true,
    allowedRoles: ['editor', 'admin'],
  },
  // Admin operations — highest trust required
  critical: {
    minTrustScore: 70,
    requireAuth: true,
    requireMfa: true,
    allowedRoles: ['admin'],
  },
  // CUI-marked content — strict controls per NIST 800-171
  cui: {
    minTrustScore: 60,
    requireAuth: true,
    requireMfa: true,
    allowedRoles: ['editor', 'admin'],
    requireDeviceId: true,
  },
};

/**
 * Route-to-policy mapping.
 * Associates URL patterns with policy levels.
 */
const ROUTE_POLICIES = [
  // Public routes — no auth required (data feeds for public pages)
  { pattern: /^\/api\/health$/, policy: 'public' },
  { pattern: /^\/healthz$/, policy: 'public' },
  { pattern: /^\/livez$/, policy: 'public' },
  { pattern: /^\/readyz$/, policy: 'public' },
  { pattern: /^\/api\/auth\/login$/, policy: 'public' },
  { pattern: /^\/api\/auth\/register$/, policy: 'public' },
  { pattern: /^\/api\/csrf-token$/, policy: 'public' },
  { pattern: /^\/api\/docs/, policy: 'public' },
  { pattern: /^\/api\/glossary$/, policy: 'public' },
  { pattern: /^\/api\/skills$/, policy: 'public' },
  { pattern: /^\/api\/contact$/, policy: 'public' },
  { pattern: /^\/api\/compliance\/frameworks/, policy: 'public' },
  { pattern: /^\/api\/mbai/, policy: 'public' },

  // Standard authenticated routes
  { pattern: /^\/api\/messages/, policy: 'standard' },
  { pattern: /^\/api\/portal/, policy: 'standard' },
  { pattern: /^\/api\/ai\//, policy: 'standard' },

  // Sensitive routes
  { pattern: /^\/api\/clients/, policy: 'sensitive' },
  { pattern: /^\/api\/projects/, policy: 'sensitive' },
  { pattern: /^\/api\/compliance/, policy: 'sensitive' },
  { pattern: /^\/api\/usace/, policy: 'sensitive' },
  { pattern: /^\/api\/records/, policy: 'sensitive' },
  { pattern: /^\/api\/accessibility/, policy: 'sensitive' },
  { pattern: /^\/api\/fedramp/, policy: 'sensitive' },

  // Critical admin-only routes
  { pattern: /^\/api\/backup/, policy: 'critical' },
  { pattern: /^\/api\/auth\/mfa/, policy: 'critical' },
  { pattern: /^\/api\/errors/, policy: 'critical' },
  { pattern: /^\/api\/ai\/cost\/budget/, policy: 'critical' },
  { pattern: /^\/api\/ai\/evaluation/, policy: 'critical' },
];

/**
 * Resolve the policy for a given request path.
 */
function resolvePolicy(path) {
  for (const mapping of ROUTE_POLICIES) {
    if (mapping.pattern.test(path)) {
      return { name: mapping.policy, ...DEFAULT_POLICIES[mapping.policy] };
    }
  }
  // Default: require standard auth
  return { name: 'standard', ...DEFAULT_POLICIES.standard };
}

// ────────────────────────────────────────────────────────────
// Session Tracking (in-memory for dev, Redis in production)
// ────────────────────────────────────────────────────────────

/** @type {Map<string, { lastSeen: number, trustHistory: number[], requestCount: number, ip: string }>} */
const activeSessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Track & monitor active session behavior.
 * Flags sessions that change IP mid-session (possible hijack).
 */
function trackSession(sessionId, req, trustScore) {
  const existing = activeSessions.get(sessionId);
  const now = Date.now();
  const ip = req.ip || req.socket?.remoteAddress;

  if (existing) {
    // Check for IP change (possible session hijack)
    if (existing.ip !== ip) {
      logger.warn('Session IP changed — possible hijack', {
        sessionId,
        previousIp: existing.ip,
        currentIp: ip,
      });
    }

    existing.lastSeen = now;
    existing.trustHistory.push(trustScore);
    if (existing.trustHistory.length > 20) {
      existing.trustHistory.shift();
    }
    existing.requestCount += 1;
    existing.ip = ip;
  } else {
    activeSessions.set(sessionId, {
      lastSeen: now,
      trustHistory: [trustScore],
      requestCount: 1,
      ip,
    });
  }

  // Prune stale sessions every 100 requests
  if (activeSessions.size % 100 === 0) {
    for (const [key, session] of activeSessions) {
      if (now - session.lastSeen > SESSION_TTL_MS) {
        activeSessions.delete(key);
      }
    }
  }
}

// ────────────────────────────────────────────────────────────
// Express Middleware
// ────────────────────────────────────────────────────────────

/**
 * Zero Trust enforcement middleware.
 *
 * Drop-in middleware that evaluates every request against
 * the access policy engine. It does NOT replace `authenticateToken` —
 * it layers on top of it.
 *
 * Usage:
 *   app.use(zeroTrustEnforce);  // after auth middleware
 *
 * In development mode, this logs warnings but does not block requests
 * (set ZT_ENFORCE=true to enable blocking in dev).
 */
export function zeroTrustEnforce(req, res, next) {
  const policy = resolvePolicy(req.path);

  // Public routes — skip evaluation
  if (policy.name === 'public') {
    return next();
  }

  // Compute trust score
  const { score, factors } = computeTrustScore(req);

  // Attach to request for downstream use
  req.trustScore = score;
  req.trustFactors = factors;
  req.accessPolicy = policy;

  // Track session
  const sessionId = req.user?.id || req.sessionID || req.ip;
  trackSession(sessionId, req, score);

  const enforce = process.env.NODE_ENV === 'production' || process.env.ZT_ENFORCE === 'true';

  // Check: authentication required?
  if (policy.requireAuth && !req.user) {
    logger.warn('Zero Trust: unauthenticated request to protected route', {
      path: req.path,
      policy: policy.name,
      ip: req.ip,
    });
    if (enforce) {
      return res.status(401).json({
        error: 'Authentication required',
        policy: policy.name,
        code: 'ZT_AUTH_REQUIRED',
      });
    }
  }

  // Check: MFA required?
  if (policy.requireMfa && !req.user?.mfaVerified) {
    logger.warn('Zero Trust: MFA not verified for sensitive route', {
      path: req.path,
      policy: policy.name,
      userId: req.user?.id,
    });
    if (enforce) {
      return res.status(403).json({
        error: 'MFA verification required',
        policy: policy.name,
        code: 'ZT_MFA_REQUIRED',
      });
    }
  }

  // Check: role allowed?
  if (policy.allowedRoles[0] !== '*' && req.user) {
    const userRole = req.user.role || 'user';
    if (!policy.allowedRoles.includes(userRole)) {
      logger.warn('Zero Trust: insufficient role', {
        path: req.path,
        policy: policy.name,
        userRole,
        required: policy.allowedRoles,
      });
      if (enforce) {
        return res.status(403).json({
          error: 'Insufficient privileges',
          policy: policy.name,
          code: 'ZT_ROLE_DENIED',
        });
      }
    }
  }

  // Check: trust score meets minimum?
  if (score < policy.minTrustScore) {
    logger.warn('Zero Trust: low trust score', {
      path: req.path,
      policy: policy.name,
      score,
      required: policy.minTrustScore,
      factors,
    });
    if (enforce) {
      return res.status(403).json({
        error: 'Trust score below threshold — additional verification required',
        policy: policy.name,
        code: 'ZT_LOW_TRUST',
        score,
        required: policy.minTrustScore,
      });
    }
  }

  // Check: device ID required?
  if (policy.requireDeviceId) {
    const deviceId = req.headers['x-device-id'] || req.cookies?.device_id;
    if (!deviceId) {
      logger.warn('Zero Trust: device ID missing for CUI route', {
        path: req.path,
        policy: policy.name,
      });
      if (enforce) {
        return res.status(403).json({
          error: 'Device identification required for CUI access',
          policy: policy.name,
          code: 'ZT_DEVICE_REQUIRED',
        });
      }
    }
  }

  // Log access decision
  logger.debug('Zero Trust: access granted', {
    path: req.path,
    policy: policy.name,
    score,
    userId: req.user?.id,
  });

  next();
}

/**
 * Zero Trust status endpoint data — returns active session metrics
 * and policy configuration. Used by the ConMon dashboard.
 */
export function getZeroTrustStatus() {
  return {
    activeSessions: activeSessions.size,
    policies: Object.entries(DEFAULT_POLICIES).map(([name, p]) => ({
      name,
      minTrustScore: p.minTrustScore,
      requireAuth: p.requireAuth,
      requireMfa: p.requireMfa,
    })),
    routeMappings: ROUTE_POLICIES.length,
  };
}

export default { zeroTrustEnforce, computeTrustScore, getZeroTrustStatus };
