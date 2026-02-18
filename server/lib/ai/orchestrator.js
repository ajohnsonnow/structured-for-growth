/**
 * Multi-Agent Orchestrator (P4.1.1)
 *
 * Implements a multi-agent architecture for compliance assistance.
 * An orchestrator routes requests to specialist agents based on intent.
 *
 * Architecture:
 *   User Request → Orchestrator → Intent Classification
 *     → Compliance Agent (gap analysis, control mapping)
 *     → Document Agent  (template filling, generation)
 *     → Guidance Agent  (best practices, recommendations)
 *     → Audit Agent     (evidence review, assessment)
 *
 * Standards: NIST AI RMF, ISO 42001
 */

import { createLogger } from '../logger.js';
import { logAiInteraction } from './auditTrail.js';
import { checkBudget, recordUsage } from './costTracker.js';
import { evaluateContentSafety, filterOutput, validateInput } from './guardrails.js';

const logger = createLogger('ai-orchestrator');

// ────────────────────────────────────────────────────────────
// Agent Registry
// ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} AgentDefinition
 * @property {string} id - Unique agent identifier
 * @property {string} name - Human-readable name
 * @property {string} description - What this agent does
 * @property {string} systemPrompt - Base system prompt for this agent
 * @property {string[]} capabilities - List of capabilities for intent matching
 * @property {string} model - Default model for this agent
 * @property {number} maxTokens - Max completion tokens
 * @property {number} temperature - Model temperature
 */

/** @type {Map<string, AgentDefinition>} */
const agentRegistry = new Map();

// Register the built-in specialist agents
const BUILTIN_AGENTS = [
  {
    id: 'compliance',
    name: 'Compliance Specialist',
    description:
      'Analyzes compliance gaps, maps controls across frameworks, and provides remediation guidance',
    systemPrompt: `You are a compliance specialist for government and enterprise standards.
You have expertise in NIST 800-171, NIST 800-53, CMMC, FedRAMP, ISO 27001, SOC 2, HIPAA, PCI-DSS, GDPR, and DORA.
When analyzing compliance gaps, always reference specific control IDs and provide actionable remediation steps.
Never fabricate control numbers. If unsure, state that explicitly.
Format responses with clear headings, bullet points, and control references.`,
    capabilities: [
      'gap-analysis',
      'control-mapping',
      'compliance-assessment',
      'remediation',
      'cross-framework',
    ],
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.3,
  },
  {
    id: 'document',
    name: 'Document Generator',
    description: 'Generates and fills compliance documents, SSPs, POA&Ms, and USACE templates',
    systemPrompt: `You are a technical document generation specialist for government and military documentation.
You produce documents following exact format requirements for SSP, POA&M, VPAT, USACE ER/EP/ETL formats, and MIL-STD-498 DIDs.
Always maintain proper CUI markings when specified.
Use precise, unambiguous language per government plain writing standards.
Include all required sections — never omit mandatory fields.`,
    capabilities: [
      'document-generation',
      'template-filling',
      'ssp',
      'poam',
      'usace-docs',
      'mil-std-498',
    ],
    model: 'gpt-4o',
    maxTokens: 8192,
    temperature: 0.2,
  },
  {
    id: 'guidance',
    name: 'Guidance Advisor',
    description: 'Provides best practices, recommendations, and implementation guidance',
    systemPrompt: `You are a cybersecurity and compliance guidance advisor.
You help organizations understand requirements, plan implementations, and follow best practices.
Tailor advice to the organization's size, maturity level, and specific regulatory environment.
Cite authoritative sources (NIST SP, OMB memos, CISA advisories) when making recommendations.
Be practical — suggest achievable steps, not theoretical ideals.`,
    capabilities: ['guidance', 'best-practices', 'recommendations', 'planning', 'training'],
    model: 'gpt-4o-mini',
    maxTokens: 2048,
    temperature: 0.5,
  },
  {
    id: 'audit',
    name: 'Audit Reviewer',
    description:
      'Reviews evidence artifacts, assesses control implementation, and identifies findings',
    systemPrompt: `You are a compliance audit reviewer.
You evaluate evidence artifacts against control requirements and determine implementation status.
Use these statuses: Satisfied, Other Than Satisfied, Not Applicable, Not Assessed.
Provide specific findings with objective evidence references.
Flag any inconsistencies or gaps between stated implementation and evidence provided.
Never mark a control as Satisfied without sufficient evidence.`,
    capabilities: ['evidence-review', 'assessment', 'findings', 'audit', 'control-evaluation'],
    model: 'gpt-4o',
    maxTokens: 4096,
    temperature: 0.2,
  },
];

// Initialize registry
for (const agent of BUILTIN_AGENTS) {
  agentRegistry.set(agent.id, agent);
}

// ────────────────────────────────────────────────────────────
// Intent Classification
// ────────────────────────────────────────────────────────────

/**
 * Keyword-based intent classification for routing to the right agent.
 * (In production this would use a trained classifier or LLM call.)
 */
const INTENT_KEYWORDS = {
  compliance: [
    'gap',
    'compliance',
    'control',
    'nist',
    'cmmc',
    'fedramp',
    'iso',
    'soc',
    'mapping',
    'crossmap',
    'framework',
    'requirement',
    'assess',
  ],
  document: [
    'generate',
    'document',
    'template',
    'fill',
    'create',
    'ssp',
    'poam',
    'vpat',
    'report',
    'write',
    'draft',
    'usace',
    'mil-std',
    'form',
  ],
  guidance: [
    'how',
    'what',
    'why',
    'best practice',
    'recommend',
    'should',
    'guide',
    'help',
    'explain',
    'suggest',
    'plan',
    'implement',
    'advice',
  ],
  audit: [
    'evidence',
    'review',
    'audit',
    'finding',
    'assess',
    'evaluate',
    'status',
    'artifact',
    'verify',
    'check',
  ],
};

/**
 * Classify user intent to determine which agent should handle the request.
 *
 * @param {string} prompt - User's prompt text
 * @returns {{ agentId: string, confidence: number, scores: Object }}
 */
export function classifyIntent(prompt) {
  const lower = prompt.toLowerCase();
  const scores = {};

  for (const [agentId, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        score += 1;
      }
    }
    scores[agentId] = score;
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topAgent, topScore] = sorted[0];
  const totalMatches = Object.values(scores).reduce((s, v) => s + v, 0);
  const confidence = totalMatches > 0 ? topScore / totalMatches : 0;

  // Default to guidance if no strong signal
  if (topScore === 0) {
    return { agentId: 'guidance', confidence: 0.25, scores };
  }

  return {
    agentId: topAgent,
    confidence: Math.round(confidence * 100) / 100,
    scores,
  };
}

// ────────────────────────────────────────────────────────────
// Orchestrator
// ────────────────────────────────────────────────────────────

/**
 * Orchestrate an AI request: classify intent, route to agent, apply guardrails.
 *
 * This method doesn't actually call an LLM — it prepares the full agent context
 * and returns everything needed for the caller to make the LLM call. This keeps
 * the orchestrator LLM-agnostic (works with OpenAI, Anthropic, local models, etc.)
 *
 * @param {Object} params
 * @param {string} params.prompt - User's question or instruction
 * @param {string} [params.context] - Additional context (document content, etc.)
 * @param {string} [params.agentId] - Force a specific agent (bypasses classification)
 * @param {string} [params.userId] - Authenticated user ID
 * @param {string} [params.sessionId] - Conversation session ID
 * @returns {Promise<{ agent: AgentDefinition, messages: Array, intent: Object, sessionId: string, warnings: string[] }>}
 */
export async function orchestrate({ prompt, context, agentId, userId, sessionId }) {
  const startTime = Date.now();
  const warnings = [];

  // 1. Validate input through guardrails
  const { sanitized: cleanPrompt, warnings: inputWarnings } = validateInput(prompt, {
    type: 'prompt',
  });
  warnings.push(...inputWarnings);

  let cleanContext = null;
  if (context) {
    const ctxResult = validateInput(context, { type: 'context' });
    cleanContext = ctxResult.sanitized;
    warnings.push(...ctxResult.warnings);
  }

  // 2. Classify intent (or use forced agent)
  const intent = agentId
    ? { agentId, confidence: 1.0, scores: { [agentId]: 1 } }
    : classifyIntent(cleanPrompt);

  // 3. Resolve agent
  const agent = agentRegistry.get(intent.agentId);
  if (!agent) {
    throw new Error(`Unknown agent: ${intent.agentId}`);
  }

  // 4. Check budget
  if (userId) {
    const budget = checkBudget(userId);
    if (!budget.allowed) {
      warnings.push(
        `Daily AI budget exhausted ($${budget.dailyTotalUsd}/$${budget.budgetLimitUsd})`
      );
      // Still allow the request but warn
    }
  }

  // 5. Build message array for LLM
  const messages = [{ role: 'system', content: agent.systemPrompt }];

  if (cleanContext) {
    messages.push({
      role: 'system',
      content: `Additional context provided by the user:\n\n${cleanContext}`,
    });
  }

  messages.push({ role: 'user', content: cleanPrompt });

  // 6. Log the orchestration
  const resolvedSessionId =
    sessionId || `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

  await logAiInteraction({
    sessionId: resolvedSessionId,
    userId,
    agentId: agent.id,
    action: 'orchestrate',
    input: { prompt: cleanPrompt, context: cleanContext ? '[provided]' : null },
    metadata: { intent, warnings },
    latencyMs: Date.now() - startTime,
  });

  logger.info('AI request orchestrated', {
    agentId: agent.id,
    confidence: intent.confidence,
    userId,
    sessionId: resolvedSessionId,
  });

  return {
    agent,
    messages,
    intent,
    sessionId: resolvedSessionId,
    warnings,
  };
}

/**
 * Process an AI response through output guardrails and logging.
 *
 * Call this after receiving the LLM response to filter, evaluate,
 * log the interaction, and record cost.
 *
 * @param {Object} params
 * @param {string} params.sessionId
 * @param {string} params.userId
 * @param {string} params.agentId
 * @param {string} params.model
 * @param {string} params.rawOutput - Raw model response text
 * @param {Object} params.tokens - { prompt, completion, total }
 * @param {number} params.latencyMs
 * @returns {Promise<{ output: string, safety: Object, cost: Object, auditId: string, requiresReview: boolean }>}
 */
export async function processResponse({
  sessionId,
  userId,
  agentId,
  model,
  rawOutput,
  tokens,
  latencyMs,
}) {
  // 1. Filter output
  const { filtered, redactions } = filterOutput(rawOutput);

  // 2. Evaluate safety
  const safety = evaluateContentSafety(filtered);

  // 3. Record cost
  const costResult = userId
    ? recordUsage({
        userId,
        agentId,
        model,
        promptTokens: tokens.prompt,
        completionTokens: tokens.completion,
      })
    : { costUsd: 0, dailyTotalUsd: 0, budgetRemaining: 0 };

  // 4. Determine if human review is needed
  const requiresReview = !safety.safe || redactions > 0;

  // 5. Log to audit trail
  const auditEntry = await logAiInteraction({
    sessionId,
    userId,
    agentId,
    action: 'response',
    output: filtered,
    tokens,
    latencyMs,
    safety,
    model,
    cost: costResult.costUsd,
    metadata: { redactions, requiresReview },
  });

  return {
    output: filtered,
    safety,
    cost: {
      requestCostUsd: costResult.costUsd,
      dailyTotalUsd: costResult.dailyTotalUsd,
      budgetRemaining: costResult.budgetRemaining,
    },
    auditId: auditEntry.id,
    requiresReview,
  };
}

// ────────────────────────────────────────────────────────────
// Agent Management
// ────────────────────────────────────────────────────────────

/**
 * Register a custom agent.
 * @param {AgentDefinition} agentDef
 */
export function registerAgent(agentDef) {
  if (!agentDef.id || !agentDef.systemPrompt) {
    throw new Error('Agent must have id and systemPrompt');
  }
  agentRegistry.set(agentDef.id, agentDef);
  logger.info('Custom agent registered', { agentId: agentDef.id, name: agentDef.name });
}

/**
 * List all registered agents.
 * @returns {AgentDefinition[]}
 */
export function listAgents() {
  return Array.from(agentRegistry.values()).map(({ systemPrompt: _sp, ...rest }) => rest);
}

/**
 * Get a specific agent definition.
 * @param {string} id
 * @returns {AgentDefinition | undefined}
 */
export function getAgent(id) {
  return agentRegistry.get(id);
}

export default {
  orchestrate,
  processResponse,
  classifyIntent,
  registerAgent,
  listAgents,
  getAgent,
};
