/**
 * Environment Configuration Validation (P5.1.10)
 *
 * Validates and provides typed access to environment variables.
 * Think of it like a "type checker" for your .env file — it catches
 * missing or invalid config before the server starts, instead of
 * crashing randomly at runtime.
 *
 * Standards: Twelve-Factor App (Config), OWASP Configuration
 */

import dotenv from 'dotenv';
import { createLogger } from './logger.js';

dotenv.config();
const logger = createLogger('config');

// ────────────────────────────────────────────────────────────
// Schema Definition
// ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} EnvVar
 * @property {string} key - Environment variable name
 * @property {boolean} required - Whether the var is required
 * @property {string} [default] - Default value if not set
 * @property {'string'|'number'|'boolean'|'url'|'email'} [type] - Expected type
 * @property {string} description - What this variable does
 */

/** @type {EnvVar[]} */
const ENV_SCHEMA = [
  // Server
  {
    key: 'PORT',
    required: false,
    default: '3000',
    type: 'number',
    description: 'HTTP server port',
  },
  {
    key: 'NODE_ENV',
    required: false,
    default: 'development',
    type: 'string',
    description: 'Runtime environment (development, production, test)',
  },

  // Security
  {
    key: 'JWT_SECRET',
    required: true,
    type: 'string',
    description: 'Secret key for JWT signing (min 32 chars in production)',
  },
  {
    key: 'JWT_EXPIRES_IN',
    required: false,
    default: '15m',
    type: 'string',
    description: 'JWT access token expiry (e.g., 15m, 1h)',
  },
  {
    key: 'JWT_REFRESH_EXPIRES_IN',
    required: false,
    default: '7d',
    type: 'string',
    description: 'JWT refresh token expiry (e.g., 7d, 30d)',
  },

  // Database
  {
    key: 'DB_PATH',
    required: false,
    default: './data/database.db',
    type: 'string',
    description: 'Path to SQLite database file',
  },

  // CORS
  {
    key: 'CORS_ORIGINS',
    required: false,
    default: 'http://localhost:5173',
    type: 'string',
    description: 'Comma-separated allowed CORS origins',
  },

  // Email
  { key: 'EMAIL_HOST', required: false, type: 'string', description: 'SMTP server hostname' },
  { key: 'EMAIL_PORT', required: false, default: '587', type: 'number', description: 'SMTP port' },
  { key: 'EMAIL_USER', required: false, type: 'string', description: 'SMTP username' },
  {
    key: 'EMAIL_PASSWORD',
    required: false,
    type: 'string',
    description: 'SMTP password (use app-specific password)',
  },
  { key: 'EMAIL_FROM', required: false, type: 'email', description: 'Default from address' },
  { key: 'EMAIL_TO', required: false, type: 'email', description: 'Default recipient address' },

  // AI (P4.1)
  {
    key: 'AI_DAILY_BUDGET_USD',
    required: false,
    default: '10',
    type: 'number',
    description: 'Daily AI API spend limit in USD',
  },
  {
    key: 'OPENAI_API_KEY',
    required: false,
    type: 'string',
    description: 'OpenAI API key for AI features',
  },
  {
    key: 'ANTHROPIC_API_KEY',
    required: false,
    type: 'string',
    description: 'Anthropic API key for Claude models',
  },

  // FedRAMP (P4.4)
  {
    key: 'SYSTEM_NAME',
    required: false,
    default: 'Structured for Growth',
    type: 'string',
    description: 'System name for SSP generation',
  },
  {
    key: 'SYSTEM_ID',
    required: false,
    default: 'SFG-001',
    type: 'string',
    description: 'System identifier for SSP',
  },
  {
    key: 'FIPS_CATEGORY',
    required: false,
    default: 'Moderate',
    type: 'string',
    description: 'FIPS 199 categorization level',
  },

  // Zero Trust (P4.4.1)
  {
    key: 'ZT_ENFORCE',
    required: false,
    default: 'false',
    type: 'boolean',
    description: 'Enforce Zero Trust in development mode',
  },

  // PWA (P5.2)
  {
    key: 'VAPID_PUBLIC_KEY',
    required: false,
    type: 'string',
    description: 'VAPID public key for push notifications',
  },
  {
    key: 'VAPID_PRIVATE_KEY',
    required: false,
    type: 'string',
    description: 'VAPID private key for push notifications',
  },

  // Performance
  {
    key: 'LOG_LEVEL',
    required: false,
    default: 'info',
    type: 'string',
    description: 'Winston log level (error, warn, info, http, debug)',
  },
];

// ────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────

/**
 * Validate all environment variables against the schema.
 * Returns typed config object + any validation errors.
 */
export function validateEnv() {
  const errors = [];
  const warnings = [];
  const config = {};

  for (const def of ENV_SCHEMA) {
    const raw = process.env[def.key] ?? def.default;

    // Required check
    if (def.required && !raw) {
      errors.push(`Missing required env var: ${def.key} — ${def.description}`);
      continue;
    }

    if (!raw) {
      config[def.key] = undefined;
      continue;
    }

    // Type coercion
    switch (def.type) {
      case 'number': {
        const num = Number(raw);
        if (isNaN(num)) {
          errors.push(`${def.key} must be a number, got: "${raw}"`);
        } else {
          config[def.key] = num;
        }
        break;
      }
      case 'boolean':
        config[def.key] = raw === 'true' || raw === '1';
        break;
      case 'url':
        try {
          new URL(raw);
          config[def.key] = raw;
        } catch {
          errors.push(`${def.key} must be a valid URL, got: "${raw}"`);
        }
        break;
      case 'email':
        if (!raw.includes('@')) {
          warnings.push(`${def.key} doesn't look like an email: "${raw}"`);
        }
        config[def.key] = raw;
        break;
      default:
        config[def.key] = raw;
    }
  }

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
  }

  return { config, errors, warnings, schema: ENV_SCHEMA };
}

/**
 * Validate env and log results. Call during server startup.
 * In production, throws on errors. In dev, just warns.
 */
export function validateEnvOrDie() {
  const { config, errors, warnings } = validateEnv();

  for (const w of warnings) {
    logger.warn(`Config warning: ${w}`);
  }

  if (errors.length > 0) {
    for (const e of errors) {
      logger.error(`Config error: ${e}`);
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Configuration validation failed with ${errors.length} error(s)`);
    } else {
      logger.warn(`${errors.length} config error(s) — ignored in development mode`);
    }
  }

  return config;
}

/**
 * Get typed config value with fallback.
 */
export function env(key, fallback) {
  const { config } = validateEnv();
  return config[key] ?? fallback;
}

/**
 * Generate a .env.example from the schema (for docs).
 */
export function generateEnvExample() {
  const lines = [
    '# Structured for Growth — Environment Configuration',
    `# Generated: ${new Date().toISOString()}`,
    '',
  ];

  let lastGroup = '';
  for (const def of ENV_SCHEMA) {
    const group = def.key.split('_')[0];
    if (group !== lastGroup) {
      lines.push('');
      lastGroup = group;
    }

    lines.push(`# ${def.description}${def.required ? ' (REQUIRED)' : ''}`);
    const value = def.default || `your-${def.key.toLowerCase().replace(/_/g, '-')}`;
    lines.push(`${def.key}=${value}`);
  }

  return lines.join('\n');
}

export default { validateEnv, validateEnvOrDie, env, generateEnvExample, ENV_SCHEMA };
