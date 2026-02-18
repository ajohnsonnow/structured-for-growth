/**
 * Glossary Auto-Detection Module (P6.1.4)
 * ────────────────────────────────────────
 * Scans page content and automatically wraps recognized acronyms
 * and terms with tooltip triggers — no manual markup needed per page.
 *
 * How it works:
 *  1. Loads the glossary dictionary (JSON)
 *  2. Builds a regex from all term names and acronyms
 *  3. Walks the DOM text nodes inside <main>
 *  4. Wraps first occurrence of each term in <abbr data-glossary-id="...">
 *  5. Tooltip component attaches interaction behaviour
 *
 * Exclusions:
 *  - Skips <code>, <pre>, <script>, <style>, <nav>, <a>, <button>,
 *    <input>, <textarea>, <select>, headings (<h1>-<h6>), and
 *    elements with data-glossary-ignore
 *  - Only wraps the first occurrence of each term per page
 *    (configurable via maxOccurrences option)
 *  - Requires terms to be whole words (word boundary matching)
 *
 * Usage:
 *   import { initGlossaryAutoDetect } from './modules/glossaryAutoDetect.js';
 *   await initGlossaryAutoDetect();
 */

import { loadGlossary } from './glossaryTooltip.js';

/** Elements to skip when scanning for terms */
const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'CODE',
  'PRE',
  'KBD',
  'SAMP',
  'VAR',
  'NAV',
  'A',
  'BUTTON',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'LABEL',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'ABBR',
  'SVG',
  'MATH',
  'IFRAME',
]);

/** Extra terms to never auto-detect (false positive prevention) */
const EXCLUSION_LIST = new Set([
  'IT', // Too common as a pronoun
  'OR', // Too common as a conjunction
  'IS', // Too common
  'AS', // Too common
  'AT', // Too common
  'IN', // Too common
  'ON', // Too common
  'DO', // Too common
  'IF', // Too common
]);

/**
 * Build a regex that matches any glossary term.
 * Terms are sorted by length (longest first) so longer phrases
 * match before shorter ones (e.g., "NIST SP 800-53" before "NIST").
 *
 * @param {Map<string, Object>} glossary
 * @returns {{ regex: RegExp, termMap: Map<string, Object> }}
 */
function buildTermRegex(glossary) {
  /** @type {Map<string, Object>} Maps normalized match string → term data */
  const termMap = new Map();

  /** @type {Set<string>} Unique match strings */
  const matchStrings = new Set();

  glossary.forEach((termData, _key) => {
    // Skip duplicate keys (the cache stores by ID, term, and fullForm)
    if (typeof termData !== 'object' || !termData.term) {
      return;
    }

    // Add the acronym/short form
    const term = termData.term;
    if (!EXCLUSION_LIST.has(term.toUpperCase()) && term.length >= 2) {
      matchStrings.add(term);
      termMap.set(term.toUpperCase(), termData);
    }

    // Add full form if meaningfully different
    if (termData.fullForm && termData.fullForm !== term && termData.fullForm.length >= 4) {
      matchStrings.add(termData.fullForm);
      termMap.set(termData.fullForm.toUpperCase(), termData);
    }
  });

  // Sort by length descending → longest match first
  const sorted = [...matchStrings].sort((a, b) => b.length - a.length);

  // Escape regex special characters
  const escaped = sorted.map((s) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&'));

  // Build regex with word boundaries; case-insensitive
  const pattern = escaped.join('|');
  const regex = new RegExp(`\\b(${pattern})\\b`, 'gi');

  return { regex, termMap };
}

/**
 * Check if a DOM node should be skipped.
 * @param {Node} node
 * @returns {boolean}
 */
function shouldSkip(node) {
  if (!node || !node.parentElement) {
    return true;
  }

  /** @type {HTMLElement} */
  let el = node.parentElement;

  while (el) {
    if (SKIP_TAGS.has(el.tagName)) {
      return true;
    }
    if (el.hasAttribute('data-glossary-ignore')) {
      return true;
    }
    if (el.hasAttribute('data-glossary-id')) {
      return true;
    }
    if (el.hasAttribute('data-glossary-term')) {
      return true;
    }
    if (el.classList?.contains('glossary-tooltip')) {
      return true;
    }
    if (el.classList?.contains('skip-link')) {
      return true;
    }
    if (el.id === 'liveAnnouncer') {
      return true;
    }

    // Stop walking at main/body
    if (el.tagName === 'MAIN' || el.tagName === 'BODY') {
      break;
    }
    el = el.parentElement;
  }

  return false;
}

/**
 * Walk the DOM tree and collect text nodes.
 * @param {HTMLElement} root
 * @returns {Text[]}
 */
function collectTextNodes(root) {
  /** @type {Text[]} */
  const textNodes = [];

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkip(node)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (node.textContent.trim().length === 0) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  return textNodes;
}

/**
 * Wrap matched terms in <abbr> elements within a text node.
 * Returns true if any wrapping was done.
 *
 * @param {Text} textNode
 * @param {RegExp} regex
 * @param {Map<string, Object>} termMap
 * @param {Set<string>} alreadyWrapped - Terms already wrapped on this page
 * @param {number} maxOccurrences
 * @returns {boolean}
 */
function wrapTermsInNode(textNode, regex, termMap, alreadyWrapped, maxOccurrences) {
  const text = textNode.textContent;
  regex.lastIndex = 0;

  /** @type {{ index: number, length: number, match: string, termData: Object }[]} */
  const matches = [];

  let m;
  while ((m = regex.exec(text)) !== null) {
    const matchText = m[0];
    const key = matchText.toUpperCase();
    const termData = termMap.get(key);

    if (!termData) {
      continue;
    }

    // Track occurrences per term
    const occurrenceKey = termData.id;
    const count = alreadyWrapped.get(occurrenceKey) || 0;
    if (count >= maxOccurrences) {
      continue;
    }

    matches.push({
      index: m.index,
      length: matchText.length,
      match: matchText,
      termData,
    });
  }

  if (matches.length === 0) {
    return false;
  }

  // Build a document fragment with text + <abbr> nodes
  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  for (const match of matches) {
    const occurrenceKey = match.termData.id;
    const count = alreadyWrapped.get(occurrenceKey) || 0;
    if (count >= maxOccurrences) {
      continue;
    }

    // Text before match
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    // Create <abbr> wrapper
    const abbr = document.createElement('abbr');
    abbr.className = 'glossary-term';
    abbr.setAttribute('data-glossary-id', match.termData.id);
    abbr.setAttribute('data-glossary-term', match.termData.term);
    abbr.setAttribute('title', match.termData.fullForm || match.termData.definition);
    abbr.textContent = match.match;

    fragment.appendChild(abbr);

    alreadyWrapped.set(occurrenceKey, count + 1);
    lastIndex = match.index + match.length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
  }

  // Replace original text node
  textNode.parentNode.replaceChild(fragment, textNode);
  return true;
}

/**
 * Initialize glossary auto-detection.
 * Scans the page and wraps recognized terms with tooltip triggers.
 *
 * @param {Object} [options]
 * @param {HTMLElement} [options.root] - Root element to scan (default: <main> or <body>)
 * @param {number} [options.maxOccurrences=1] - Max times to wrap each term per page
 * @returns {Promise<{ termsFound: number, totalWrapped: number }>}
 */
export async function initGlossaryAutoDetect(options = {}) {
  const {
    root = document.querySelector('main') ||
      document.querySelector('#main-content') ||
      document.body,
    maxOccurrences = 1,
  } = options;

  // Load glossary
  const glossary = await loadGlossary();
  if (glossary.size === 0) {
    console.warn('[glossary] No terms loaded — skipping auto-detection');
    return { termsFound: 0, totalWrapped: 0 };
  }

  // Build regex
  const { regex, termMap } = buildTermRegex(glossary);

  // Collect text nodes
  const textNodes = collectTextNodes(root);

  // Wrap terms
  /** @type {Map<string, number>} Tracks how many times each term has been wrapped */
  const alreadyWrapped = new Map();
  let totalWrapped = 0;

  for (const textNode of textNodes) {
    // Clone regex for each node (reset lastIndex)
    const nodeRegex = new RegExp(regex.source, regex.flags);
    const didWrap = wrapTermsInNode(textNode, nodeRegex, termMap, alreadyWrapped, maxOccurrences);
    if (didWrap) {
      totalWrapped++;
    }
  }

  const termsFound = alreadyWrapped.size;
  console.info(
    `[glossary] Auto-detected ${termsFound} unique terms, wrapped in ${totalWrapped} text nodes`
  );

  return { termsFound, totalWrapped };
}

export default { initGlossaryAutoDetect };
