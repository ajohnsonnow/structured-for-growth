/**
 * MFA (Multi-Factor Authentication) Routes (P3.2)
 *
 * TOTP-based two-factor authentication using speakeasy and qrcode.
 * Provides setup, verification, enable/disable, and login verification.
 *
 * Endpoints:
 *   POST /api/auth/mfa/setup     — Generate TOTP secret + QR code
 *   POST /api/auth/mfa/verify    — Verify and enable MFA
 *   POST /api/auth/mfa/validate  — Validate TOTP during login
 *   DELETE /api/auth/mfa         — Disable MFA
 *   GET /api/auth/mfa/status     — Check MFA status
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import QRCode from 'qrcode';
import speakeasy from 'speakeasy';
import { authenticateToken } from '../middleware/auth.js';
import { execute, queryOne } from '../models/database.js';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  return null;
}

const router = express.Router();

/**
 * POST /mfa/setup
 * Generate a new TOTP secret and QR code for the authenticated user.
 * The secret is stored temporarily (not yet verified).
 */
router.post(
  '/setup',
  authenticateToken,
  [], // validated: no body input required
  async (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const user = queryOne('SELECT id, username, mfa_secret FROM users WHERE id = ?', [
        req.user.userId,
      ]);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Generate a new TOTP secret
      const secret = speakeasy.generateSecret({
        name: `StructuredForGrowth:${user.username}`,
        issuer: 'Structured For Growth',
        length: 20,
      });

      // Store the temp secret (not yet verified)
      execute('UPDATE users SET mfa_temp_secret = ? WHERE id = ?', [secret.base32, user.id]);

      // Generate QR code as data URL
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        success: true,
        message: 'MFA setup initiated. Scan the QR code with your authenticator app, then verify.',
        qrCode: qrCodeUrl,
        manualEntry: secret.base32,
      });
    } catch (error) {
      console.error('MFA setup error:', error);
      res.status(500).json({ success: false, message: 'Failed to set up MFA' });
    }
  }
);

/**
 * POST /mfa/verify
 * Verify the TOTP token and enable MFA for the user.
 * Requires the token from the authenticator app.
 */
router.post(
  '/verify',
  authenticateToken,
  [
    body('token')
      .isString()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('TOTP token must be a 6-digit number'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ success: false, message: 'TOTP token is required' });
      }

      const user = queryOne('SELECT id, mfa_temp_secret FROM users WHERE id = ?', [
        req.user.userId,
      ]);

      if (!user || !user.mfa_temp_secret) {
        return res.status(400).json({
          success: false,
          message: 'No MFA setup in progress. Call /mfa/setup first.',
        });
      }

      // Verify the token against the temp secret
      const verified = speakeasy.totp.verify({
        secret: user.mfa_temp_secret,
        encoding: 'base32',
        token,
        window: 1, // Allow 1 step tolerance (30 seconds)
      });

      if (!verified) {
        return res.status(400).json({
          success: false,
          message: 'Invalid TOTP token. Please try again.',
        });
      }

      // Move temp secret to permanent and enable MFA
      execute(
        'UPDATE users SET mfa_secret = ?, mfa_temp_secret = NULL, mfa_enabled = 1 WHERE id = ?',
        [user.mfa_temp_secret, user.id]
      );

      res.json({
        success: true,
        message:
          'MFA enabled successfully. You will need your authenticator app for future logins.',
      });
    } catch (error) {
      console.error('MFA verify error:', error);
      res.status(500).json({ success: false, message: 'Failed to verify MFA' });
    }
  }
);

/**
 * POST /mfa/validate
 * Validate a TOTP token during the login flow.
 * Called after successful password authentication when MFA is enabled.
 */
router.post(
  '/validate',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('token')
      .isString()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('TOTP token must be a 6-digit number'),
  ],
  (req, res) => {
    const valErr = handleValidation(req, res);
    if (valErr) {
      return;
    }
    try {
      const { userId, token } = req.body;

      if (!userId || !token) {
        return res.status(400).json({
          success: false,
          message: 'userId and token are required',
        });
      }

      const user = queryOne('SELECT id, mfa_secret, mfa_enabled FROM users WHERE id = ?', [userId]);

      if (!user || !user.mfa_enabled || !user.mfa_secret) {
        return res.status(400).json({
          success: false,
          message: 'MFA not enabled for this user',
        });
      }

      const verified = speakeasy.totp.verify({
        secret: user.mfa_secret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!verified) {
        return res.status(401).json({
          success: false,
          message: 'Invalid TOTP token',
        });
      }

      res.json({
        success: true,
        message: 'MFA validation successful',
      });
    } catch (error) {
      console.error('MFA validate error:', error);
      res.status(500).json({ success: false, message: 'MFA validation failed' });
    }
  }
);

/**
 * DELETE /mfa
 * Disable MFA for the authenticated user.
 * Requires current TOTP token for security.
 */
router.delete('/', authenticateToken, (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Current TOTP token is required to disable MFA',
      });
    }

    const user = queryOne('SELECT id, mfa_secret, mfa_enabled FROM users WHERE id = ?', [
      req.user.userId,
    ]);

    if (!user || !user.mfa_enabled || !user.mfa_secret) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled',
      });
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid TOTP token. Cannot disable MFA.',
      });
    }

    execute(
      'UPDATE users SET mfa_secret = NULL, mfa_temp_secret = NULL, mfa_enabled = 0 WHERE id = ?',
      [user.id]
    );

    res.json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ success: false, message: 'Failed to disable MFA' });
  }
});

/**
 * GET /mfa/status
 * Check whether MFA is enabled for the authenticated user.
 */
router.get('/status', authenticateToken, (req, res) => {
  try {
    const user = queryOne('SELECT mfa_enabled FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      mfaEnabled: !!user.mfa_enabled,
    });
  } catch (error) {
    console.error('MFA status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get MFA status' });
  }
});

export default router;
