/**
 * AI Guardrails Layer (P4.1.2)
 *
 * Input validation, output filtering, and prompt injection defense
 * for all AI-powered features in the platform.
 *
 * Standards: OWASP LLM Top 10, NIST AI RMF
 */

import { BadRequestError } from '../errors.js';
import { createLogger } from '../logger.js';

const logger = createLogger('ai-guardrails');

// ────────────────────────────────────────────────────────────
// Prompt Injection Patterns
// ────────────────────────────────────────────────────────────

/**
 * Known prompt injection patterns (case-insensitive).
 * These catch common "jailbreak" attempts that try to override
 * the system prompt or make the model ignore its instructions.
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+(instructions|prompts|rules)/i,
  /disregard\s+(all\s+)?prior\s+(instructions|prompts|context)/i,
  /you\s+are\s+now\s+(a|an|the)\s+/i,
  /forget\s+(everything|all|your)\s+(you|instructions|rules)/i,
  /override\s+(your|system|the)\s+(instructions|prompt|rules)/i,
  /system\s*:\s*/i,
  /\[\s*INST\s*\]/i,
  /<\|?(system|assistant|user)\|?>/i,
  /act\s+as\s+(if|though)\s+you\s+(have\s+)?no\s+(restrictions|rules|limits)/i,
  /pretend\s+(that\s+)?you\s+(are|can|have)/i,
  /reveal\s+(your|the|system)\s+(prompt|instructions|system\s+message)/i,
  /what\s+(are|is)\s+your\s+(system\s+)?(prompt|instructions)/i,
  /repeat\s+(the|your)\s+(system\s+)?(prompt|instructions|message)/i,
  /do\s+anything\s+now/i,
  /DAN\s+mode/i,
  /jailbreak/i,
  /bypass\s+(content\s+)?(filter|policy|safety)/i,
];

/**
 * Sensitive content patterns to filter from AI outputs
 */
const OUTPUT_FILTER_PATTERNS = [
  /-----BEGIN\s+(RSA|PGP|PRIVATE|CERTIFICATE)/i,
  /password\s*[:=]\s*\S+/i,
  /api[_-]?key\s*[:=]\s*\S+/i,
  /secret\s*[:=]\s*\S+/i,
  /bearer\s+[A-Za-z0-9._~+/=-]+/i,
  /(sk|pk)[-_](?:live|test)[-_][A-Za-z0-9]{20,}/i,
];

// ────────────────────────────────────────────────────────────
// Input Validation
// ────────────────────────────────────────────────────────────

/**
 * Maximum allowed lengths for different input types
 */
const MAX_LENGTHS = {
  prompt: 8000,
  systemMessage: 4000,
  context: 16000,
  documentContent: 50000,
};

/**
 * Validate and sanitize user input before sending to an AI model.
 *
 * @param {string} input - Raw user input
 * @param {Object} [options]
 * @param {string} [options.type='prompt'] - Input type (prompt | systemMessage | context | documentContent)
 * @param {boolean} [options.allowCodeBlocks=true] - Whether to allow code block markdown
 * @returns {{ sanitized: string, warnings: string[] }} Cleaned input + any warnings
 * @throws {BadRequestError} If input is empty or contains definite injection
 */
export function validateInput(input, options = {}) {
  const { type = 'prompt', allowCodeBlocks = true } = options;
  const warnings = [];

  if (!input || typeof input !== 'string') {
    throw new BadRequestError('AI input must be a non-empty string', 'AI_INPUT_REQUIRED');
  }

  const maxLen = MAX_LENGTHS[type] || MAX_LENGTHS.prompt;
  if (input.length > maxLen) {
    throw new BadRequestError(
      `Input exceeds maximum length of ${maxLen} characters for type "${type}"`,
      'AI_INPUT_TOO_LONG'
    );
  }

  // Check for prompt injection
  const injectionResults = detectPromptInjection(input);
  if (injectionResults.blocked) {
    logger.warn('Prompt injection blocked', {
      matchedPatterns: injectionResults.matchedPatterns,
      inputPreview: input.substring(0, 100),
    });
    throw new BadRequestError(
      'Input contains patterns that are not allowed',
      'AI_PROMPT_INJECTION_DETECTED'
    );
  }

  if (injectionResults.suspicious) {
    warnings.push('Input contains potentially suspicious patterns — proceeding with caution');
    logger.info('Suspicious AI input detected', {
      matchedPatterns: injectionResults.matchedPatterns,
      inputPreview: input.substring(0, 100),
    });
  }

  let sanitized = input;

  // Strip null bytes and control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Optionally strip code blocks if not allowed
  if (!allowCodeBlocks) {
    sanitized = sanitized.replace(/```[\s\S]*?```/g, '[code block removed]');
  }

  return { sanitized, warnings };
}

/**
 * Detect prompt injection attempts in text.
 *
 * @param {string} text - Text to analyze
 * @returns {{ blocked: boolean, suspicious: boolean, matchedPatterns: string[] }}
 */
export function detectPromptInjection(text) {
  const matchedPatterns = [];
  let score = 0;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      matchedPatterns.push(pattern.source);
      score += 1;
    }
  }

  // High-confidence injection (≥2 matches) → block
  // Single match → suspicious but allow
  return {
    blocked: score >= 2,
    suspicious: score === 1,
    matchedPatterns,
    score,
  };
}

// ────────────────────────────────────────────────────────────
// Output Filtering
// ────────────────────────────────────────────────────────────

/**
 * Filter AI model output to remove sensitive data before returning to user.
 *
 * @param {string} output - Raw model output
 * @returns {{ filtered: string, redactions: number }}
 */
export function filterOutput(output) {
  if (!output || typeof output !== 'string') {
    return { filtered: '', redactions: 0 };
  }

  let filtered = output;
  let redactions = 0;

  for (const pattern of OUTPUT_FILTER_PATTERNS) {
    const match = filtered.match(pattern);
    if (match) {
      filtered = filtered.replace(pattern, '[REDACTED]');
      redactions++;
    }
  }

  if (redactions > 0) {
    logger.warn('AI output contained sensitive patterns — redacted', { redactions });
  }

  return { filtered, redactions };
}

// ────────────────────────────────────────────────────────────
// Content Safety
// ────────────────────────────────────────────────────────────

/**
 * Content safety categories and their severity weights
 */
const SAFETY_CATEGORIES = {
  harmful: { weight: 10, label: 'Harmful content' },
  illegal: { weight: 10, label: 'Illegal activity' },
  pii_exposure: { weight: 8, label: 'PII exposure' },
  bias: { weight: 5, label: 'Biased content' },
  hallucination_risk: { weight: 3, label: 'Hallucination risk' },
};

/**
 * Evaluate content safety of an AI response.
 * Returns a risk score and list of flagged categories.
 *
 * @param {string} content - AI-generated content to evaluate
 * @returns {{ safe: boolean, score: number, flags: Array<{ category: string, label: string }> }}
 */
export function evaluateContentSafety(content) {
  const flags = [];
  let score = 0;

  if (!content) {
    return { safe: true, score: 0, flags: [] };
  }

  // Check for possible PII patterns in output
  const piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{16}\b/, // Credit card (simple)
    /\b[A-Z]{1,2}\d{6,9}\b/, // Passport-ish numbers
  ];

  for (const p of piiPatterns) {
    if (p.test(content)) {
      flags.push({ category: 'pii_exposure', label: SAFETY_CATEGORIES.pii_exposure.label });
      score += SAFETY_CATEGORIES.pii_exposure.weight;
      break;
    }
  }

  // Check for hallucination risk signals (made-up citations, urls)
  if (/\bhttps?:\/\/(?:www\.)?example\.(com|org|net)/i.test(content)) {
    flags.push({
      category: 'hallucination_risk',
      label: SAFETY_CATEGORIES.hallucination_risk.label,
    });
    score += SAFETY_CATEGORIES.hallucination_risk.weight;
  }

  return {
    safe: score < 8,
    score,
    flags,
  };
}

// ────────────────────────────────────────────────────────────
// Express Middleware
// ────────────────────────────────────────────────────────────

/**
 * Express middleware that validates AI request body fields:
 * - `prompt` — user's question or instruction
 * - `context` — optional additional context
 *
 * Attaches `req.aiInput` with sanitized values on success.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function aiInputGuard(req, res, next) {
  try {
    const { prompt, context, systemMessage } = req.body || {};

    if (!prompt) {
      return res
        .status(400)
        .json({ error: { code: 'AI_INPUT_REQUIRED', message: 'prompt field is required' } });
    }

    const promptResult = validateInput(prompt, { type: 'prompt' });
    const contextResult = context ? validateInput(context, { type: 'context' }) : null;
    const systemResult = systemMessage
      ? validateInput(systemMessage, { type: 'systemMessage' })
      : null;

    req.aiInput = {
      prompt: promptResult.sanitized,
      context: contextResult?.sanitized || null,
      systemMessage: systemResult?.sanitized || null,
      warnings: [
        ...promptResult.warnings,
        ...(contextResult?.warnings || []),
        ...(systemResult?.warnings || []),
      ],
    };

    next();
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json(err.toJSON());
    }
    next(err);
  }
}

export default {
  validateInput,
  detectPromptInjection,
  filterOutput,
  evaluateContentSafety,
  aiInputGuard,
};
