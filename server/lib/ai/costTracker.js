/**
 * AI Cost Tracker & Token Usage Monitoring (P4.1.7)
 *
 * Tracks token consumption, estimated costs, and budget enforcement
 * across all AI-powered features and agents.
 *
 * Standards: FinOps best practices, NIST AI RMF
 */

import { createLogger } from '../logger.js';

const logger = createLogger('ai-cost-tracker');

// ────────────────────────────────────────────────────────────
// Pricing tables (USD per 1K tokens — updated Feb 2026)
// ────────────────────────────────────────────────────────────

const MODEL_PRICING = {
  'gpt-4o': { prompt: 0.0025, completion: 0.01 },
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
  'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'claude-3-opus': { prompt: 0.015, completion: 0.075 },
  'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
  'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 },
  'claude-3.5-sonnet': { prompt: 0.003, completion: 0.015 },
  'claude-4-opus': { prompt: 0.015, completion: 0.075 },
  'llama-3-70b': { prompt: 0.0008, completion: 0.0008 },
  'llama-3-8b': { prompt: 0.0002, completion: 0.0002 },
  'mistral-large': { prompt: 0.002, completion: 0.006 },
  default: { prompt: 0.005, completion: 0.015 },
};

// ────────────────────────────────────────────────────────────
// In-memory usage store (aggregated by day / user / agent)
// ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} UsageBucket
 * @property {number} promptTokens
 * @property {number} completionTokens
 * @property {number} totalTokens
 * @property {number} estimatedCostUsd
 * @property {number} requestCount
 */

/** @type {Map<string, UsageBucket>} key = "YYYY-MM-DD:userId:agentId" */
const usageStore = new Map();

/** @type {Map<string, number>} Budget limits per userId (USD) */
const budgetLimits = new Map();

// Default daily budget per user (USD)
const DEFAULT_DAILY_BUDGET = parseFloat(process.env.AI_DAILY_BUDGET_USD || '5.00');

// Default monthly budget (USD)
const _DEFAULT_MONTHLY_BUDGET = parseFloat(process.env.AI_MONTHLY_BUDGET_USD || '100.00');

// ────────────────────────────────────────────────────────────
// Core Functions
// ────────────────────────────────────────────────────────────

/**
 * Calculate the cost of a single AI request.
 *
 * @param {Object} params
 * @param {string} params.model - Model identifier
 * @param {number} params.promptTokens - Number of input tokens
 * @param {number} params.completionTokens - Number of output tokens
 * @returns {{ estimatedCostUsd: number, pricing: Object }}
 */
export function calculateCost({ model, promptTokens = 0, completionTokens = 0 }) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING.default;
  const promptCost = (promptTokens / 1000) * pricing.prompt;
  const completionCost = (completionTokens / 1000) * pricing.completion;
  const estimatedCostUsd = Math.round((promptCost + completionCost) * 1000000) / 1000000;

  return { estimatedCostUsd, pricing };
}

/**
 * Record token usage for a request.
 *
 * @param {Object} params
 * @param {string} params.userId - User making the request
 * @param {string} params.agentId - Agent handling the request
 * @param {string} params.model - Model used
 * @param {number} params.promptTokens
 * @param {number} params.completionTokens
 * @returns {{ recorded: boolean, costUsd: number, dailyTotalUsd: number, budgetRemaining: number }}
 */
export function recordUsage({
  userId,
  agentId = 'default',
  model,
  promptTokens = 0,
  completionTokens = 0,
}) {
  const today = new Date().toISOString().split('T')[0];
  const bucketKey = `${today}:${userId}:${agentId}`;
  const _dailyKey = `${today}:${userId}`;

  const { estimatedCostUsd } = calculateCost({ model, promptTokens, completionTokens });

  // Update per-agent bucket
  const bucket = usageStore.get(bucketKey) || {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    requestCount: 0,
  };

  bucket.promptTokens += promptTokens;
  bucket.completionTokens += completionTokens;
  bucket.totalTokens += promptTokens + completionTokens;
  bucket.estimatedCostUsd += estimatedCostUsd;
  bucket.requestCount += 1;
  usageStore.set(bucketKey, bucket);

  // Calculate daily total for this user
  const dailyTotal = getDailyTotal(userId);
  const budgetLimit = budgetLimits.get(userId) || DEFAULT_DAILY_BUDGET;
  const budgetRemaining = Math.max(0, budgetLimit - dailyTotal);

  logger.debug('AI usage recorded', {
    userId,
    agentId,
    model,
    tokens: promptTokens + completionTokens,
    costUsd: estimatedCostUsd,
    dailyTotalUsd: dailyTotal,
    budgetRemaining,
  });

  return {
    recorded: true,
    costUsd: estimatedCostUsd,
    dailyTotalUsd: dailyTotal,
    budgetRemaining,
  };
}

/**
 * Check whether a user has budget remaining for an AI request.
 *
 * @param {string} userId
 * @param {number} [estimatedCost=0] - Estimated cost of the upcoming request
 * @returns {{ allowed: boolean, dailyTotalUsd: number, budgetLimitUsd: number, budgetRemaining: number }}
 */
export function checkBudget(userId, estimatedCost = 0) {
  const dailyTotal = getDailyTotal(userId);
  const budgetLimit = budgetLimits.get(userId) || DEFAULT_DAILY_BUDGET;
  const budgetRemaining = budgetLimit - dailyTotal;
  const allowed = budgetRemaining >= estimatedCost;

  if (!allowed) {
    logger.warn('AI budget exceeded', { userId, dailyTotal, budgetLimit, estimatedCost });
  }

  return {
    allowed,
    dailyTotalUsd: dailyTotal,
    budgetLimitUsd: budgetLimit,
    budgetRemaining: Math.max(0, budgetRemaining),
  };
}

/**
 * Set a custom daily budget for a user.
 *
 * @param {string} userId
 * @param {number} limitUsd
 */
export function setBudgetLimit(userId, limitUsd) {
  budgetLimits.set(userId, limitUsd);
  logger.info('AI budget limit set', { userId, limitUsd });
}

/**
 * Get usage report for a user.
 *
 * @param {string} userId
 * @param {Object} [options]
 * @param {string} [options.startDate] - YYYY-MM-DD
 * @param {string} [options.endDate] - YYYY-MM-DD
 * @returns {{ daily: Object[], totals: UsageBucket, byAgent: Object }}
 */
export function getUsageReport(userId, options = {}) {
  const { startDate, endDate } = options;
  const daily = {};
  const byAgent = {};
  const totals = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    estimatedCostUsd: 0,
    requestCount: 0,
  };

  for (const [key, bucket] of usageStore.entries()) {
    const [date, uid, agentId] = key.split(':');
    if (uid !== userId) {
      continue;
    }
    if (startDate && date < startDate) {
      continue;
    }
    if (endDate && date > endDate) {
      continue;
    }

    // Aggregate by day
    if (!daily[date]) {
      daily[date] = {
        date,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        requestCount: 0,
      };
    }
    daily[date].promptTokens += bucket.promptTokens;
    daily[date].completionTokens += bucket.completionTokens;
    daily[date].totalTokens += bucket.totalTokens;
    daily[date].estimatedCostUsd += bucket.estimatedCostUsd;
    daily[date].requestCount += bucket.requestCount;

    // Aggregate by agent
    if (!byAgent[agentId]) {
      byAgent[agentId] = {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCostUsd: 0,
        requestCount: 0,
      };
    }
    byAgent[agentId].promptTokens += bucket.promptTokens;
    byAgent[agentId].completionTokens += bucket.completionTokens;
    byAgent[agentId].totalTokens += bucket.totalTokens;
    byAgent[agentId].estimatedCostUsd += bucket.estimatedCostUsd;
    byAgent[agentId].requestCount += bucket.requestCount;

    // Grand totals
    totals.promptTokens += bucket.promptTokens;
    totals.completionTokens += bucket.completionTokens;
    totals.totalTokens += bucket.totalTokens;
    totals.estimatedCostUsd += bucket.estimatedCostUsd;
    totals.requestCount += bucket.requestCount;
  }

  totals.estimatedCostUsd = Math.round(totals.estimatedCostUsd * 1000000) / 1000000;

  return {
    daily: Object.values(daily).sort((a, b) => a.date.localeCompare(b.date)),
    totals,
    byAgent,
  };
}

/**
 * Get all users' usage summary for admin dashboard.
 *
 * @returns {Array<{ userId: string, dailyTotalUsd: number, budgetLimitUsd: number, requestCount: number }>}
 */
export function getAllUsersUsageSummary() {
  const today = new Date().toISOString().split('T')[0];
  const userMap = new Map();

  for (const [key, bucket] of usageStore.entries()) {
    const [date, userId] = key.split(':');
    if (date !== today) {
      continue;
    }

    if (!userMap.has(userId)) {
      userMap.set(userId, { userId, dailyTotalUsd: 0, requestCount: 0 });
    }
    const u = userMap.get(userId);
    u.dailyTotalUsd += bucket.estimatedCostUsd;
    u.requestCount += bucket.requestCount;
  }

  return Array.from(userMap.values()).map((u) => ({
    ...u,
    dailyTotalUsd: Math.round(u.dailyTotalUsd * 1000000) / 1000000,
    budgetLimitUsd: budgetLimits.get(u.userId) || DEFAULT_DAILY_BUDGET,
  }));
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function getDailyTotal(userId) {
  const today = new Date().toISOString().split('T')[0];
  let total = 0;
  for (const [key, bucket] of usageStore.entries()) {
    if (key.startsWith(`${today}:${userId}:`)) {
      total += bucket.estimatedCostUsd;
    }
  }
  return Math.round(total * 1000000) / 1000000;
}

export default {
  calculateCost,
  recordUsage,
  checkBudget,
  setBudgetLimit,
  getUsageReport,
  getAllUsersUsageSummary,
  MODEL_PRICING,
};
