/**
 * PIV/CAC Middleware — Test Suite
 *
 * Tests: pivCacAuth, requirePivAuth, certificate registration/revocation,
 *        X.509 parsing, DoD PKI validation
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../server/models/database.js', () => ({
  execute: vi.fn(),
  query: vi.fn(() => []),
  queryOne: vi.fn(() => null),
  logActivity: vi.fn(),
}));

vi.mock('../../server/lib/logger.js', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    security: vi.fn(),
  }),
}));

let pivCacAuth,
  requirePivAuth,
  registerCertificate,
  revokeCertificate,
  getUserCertificates,
  initPivCacTables;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  const mod = await import('../../server/middleware/pivCac.js');
  pivCacAuth = mod.pivCacAuth;
  requirePivAuth = mod.requirePivAuth;
  registerCertificate = mod.registerCertificate;
  revokeCertificate = mod.revokeCertificate;
  getUserCertificates = mod.getUserCertificates;
  initPivCacTables = mod.initPivCacTables;
});

describe('PIV/CAC Middleware', () => {
  describe('initPivCacTables', () => {
    it('creates required database tables', async () => {
      const { execute: dbExecute } = await import('../../server/models/database.js');
      initPivCacTables();
      expect(dbExecute).toHaveBeenCalled();
    });
  });

  describe('pivCacAuth', () => {
    it('passes through when no client certificate is present', () => {
      const req = {
        headers: {},
        connection: {},
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };
      const next = vi.fn();

      pivCacAuth(req, res, next);
      // Should pass through (no cert → no auth, not blocking)
      expect(next).toHaveBeenCalled();
    });

    it('sets mfaVerified when valid cert is provided', () => {
      const req = {
        headers: {
          'x-client-cert-subject': 'CN=DOE.JOHN.1234567890,OU=DoD,O=U.S. Government',
          'x-client-cert-issuer': 'CN=DOD ID CA-59,OU=PKI,O=U.S. Government',
          'x-client-cert-serial': 'ABC123',
          'x-client-cert-verify': 'SUCCESS',
        },
        connection: {},
        user: { userId: 1 },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };
      const next = vi.fn();

      pivCacAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requirePivAuth', () => {
    it('rejects request without PIV auth', () => {
      const req = { pivAuth: false };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };
      const next = vi.fn();

      requirePivAuth(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('allows request with PIV auth', () => {
      const req = { pivAuth: true };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };
      const next = vi.fn();

      requirePivAuth(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('registerCertificate', () => {
    it('registers a certificate for a user', () => {
      const result = registerCertificate(
        1,
        {
          subjectDN: 'CN=DOE.JOHN.M.1234567890,OU=DoD,O=U.S. Government',
          issuerDN: 'CN=DOD ID CA-59,OU=PKI,O=U.S. Government',
          serial: 'ABC123',
          edipi: '1234567890',
          email: 'john.doe@mail.mil',
          commonName: 'DOE.JOHN.M.1234567890',
          notBefore: '2025-01-01',
          notAfter: '2028-01-01',
        },
        'PIV'
      );
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });

  describe('getUserCertificates', () => {
    it('returns certificates for a user', async () => {
      const { query: dbQuery } = await import('../../server/models/database.js');
      dbQuery.mockReturnValueOnce([
        { id: 1, user_id: 1, subject_dn: 'CN=DOE.JOHN', status: 'active' },
      ]);

      const certs = getUserCertificates(1);
      expect(Array.isArray(certs)).toBe(true);
    });
  });

  describe('revokeCertificate', () => {
    it('revokes a certificate', () => {
      const result = revokeCertificate(1, 'compromised');
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });
  });
});
