/**
 * Structured Logger (P3.1)
 * Winston-based JSON logger with request correlation IDs
 * Replaces console.log/error throughout the application
 *
 * Standards: NIST AU-2, AU-3, OMB M-21-31
 */
import winston from 'winston';

const { combine, timestamp, json, printf, colorize } = winston.format;

// Custom format for development (human-readable)
const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}] ${message}${metaStr}`;
});

// Production format: structured JSON for log aggregation
const prodFormat = combine(timestamp({ format: 'ISO' }), json());

// Development format: colorized, readable
const developmentFormat = combine(timestamp({ format: 'HH:mm:ss' }), colorize(), devFormat);

/**
 * Create a logger instance with a specific module label
 * @param {string} module - Module name for log categorization
 * @returns {winston.Logger}
 */
export function createLogger(module = 'app') {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  const logger = winston.createLogger({
    level: isTest ? 'error' : isProduction ? 'info' : 'debug',
    defaultMeta: { module },
    format: isProduction ? prodFormat : developmentFormat,
    transports: [
      new winston.transports.Console({
        silent: isTest && !process.env.DEBUG_TESTS,
      }),
    ],
  });

  // Add file transport in production for audit trail
  if (isProduction) {
    logger.add(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true,
      })
    );
    logger.add(
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 10,
        tailable: true,
      })
    );
    // Security events log (P3.1.4)
    logger.add(
      new winston.transports.File({
        filename: 'logs/security.log',
        level: 'warn',
        maxsize: 10 * 1024 * 1024,
        maxFiles: 10,
        tailable: true,
      })
    );
  }

  // Add convenience method for HTTP access logs
  logger.http =
    logger.http ||
    function (msg, meta) {
      logger.log('http', msg, meta);
    };

  // Security event logging helper (P3.1.4)
  logger.security = function (event, details = {}) {
    logger.warn(`SECURITY: ${event}`, {
      securityEvent: true,
      event,
      ...details,
      timestamp: new Date().toISOString(),
    });
  };

  return logger;
}

export default { createLogger };
