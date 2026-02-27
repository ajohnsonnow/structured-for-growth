/**
 * HTML Sanitizer Module (P1.2.8 — XSS Prevention)
 *
 * Provides safe DOM manipulation utilities that prevent XSS attacks.
 * Replaces raw innerHTML with sanitized equivalents.
 *
 * Uses DOMPurify under the hood for industry-standard sanitization.
 *
 * Two modes:
 *  - safeHTML() — escapes ALL HTML (for user-generated content)
 *  - safeRender() — allows a whitelist of tags/attributes (for template rendering)
 *
 * Standards: OWASP A03 (Injection), CWE-79 (XSS)
 * @module sanitize
 */

import DOMPurify from 'dompurify';

/**
 * Allowlist of safe HTML tags for template rendering.
 * Anything not in this set is stripped by safeRender().
 */
const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'article',
  'aside',
  'b',
  'blockquote',
  'br',
  'button',
  'caption',
  'cite',
  'code',
  'col',
  'colgroup',
  'dd',
  'del',
  'details',
  'dfn',
  'div',
  'dl',
  'dt',
  'em',
  'figcaption',
  'figure',
  'footer',
  'form',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'header',
  'hr',
  'i',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'li',
  'mark',
  'nav',
  'ol',
  'option',
  'p',
  'pre',
  'progress',
  'q',
  's',
  'samp',
  'section',
  'select',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'u',
  'ul',
  'var',
  'wbr',
]);

/**
 * Allowlist of safe attributes per tag.
 * '*' key applies to all allowed tags.
 */
const ALLOWED_ATTRS = {
  '*': [
    'class',
    'id',
    'title',
    'lang',
    'dir',
    'role',
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-hidden',
    'aria-live',
    'aria-atomic',
    'aria-current',
    'aria-disabled',
    'aria-expanded',
    'aria-selected',
    'data-icon',
    'data-icon-size',
    'data-tab',
    'data-category',
    'data-pillar',
    'data-status',
    'data-priority',
    'data-id',
    'hidden',
    'tabindex',
  ],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
  time: ['datetime'],
  ol: ['start', 'type'],
  details: ['open'],
  del: ['datetime'],
  ins: ['datetime'],
  button: ['type', 'disabled'],
  input: [
    'type',
    'name',
    'placeholder',
    'value',
    'disabled',
    'readonly',
    'checked',
    'min',
    'max',
    'step',
  ],
  label: ['for'],
  form: ['action', 'method'],
  select: ['name', 'disabled'],
  option: ['value', 'selected'],
  textarea: ['name', 'placeholder', 'rows', 'cols', 'disabled', 'readonly'],
  progress: ['value', 'max'],
};

/** Protocols allowed in href/src attributes */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', '#', '/'];

/**
 * Validate that a URL uses only an allowed protocol.
 * Complements DOMPurify's ALLOWED_URI_REGEXP with an explicit allow-list check.
 *
 * @param {string} url — URL string to validate
 * @returns {boolean} — true when the URL protocol is in SAFE_PROTOCOLS
 */
export function isSafeUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') {
    return false;
  }
  const trimmed = url.trim().toLowerCase();
  return SAFE_PROTOCOLS.some((proto) =>
    proto === '#'
      ? trimmed === '#' || trimmed.startsWith('#')
      : proto === '/'
        ? trimmed.startsWith('/')
        : trimmed.startsWith(proto)
  );
}

/**
 * Flatten all allowed attributes into a single array for DOMPurify config.
 * @returns {string[]}
 */
function getAllowedAttrs() {
  const attrs = new Set();
  for (const list of Object.values(ALLOWED_ATTRS)) {
    for (const attr of list) {
      attrs.add(attr);
    }
  }
  return [...attrs];
}

/** Centralized DOMPurify configuration */
const PURIFY_CONFIG = {
  ALLOWED_TAGS: [...ALLOWED_TAGS],
  ALLOWED_ATTR: getAllowedAttrs(),
  ALLOW_DATA_ATTR: true,
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Escape all HTML entities — makes a string completely inert.
 * Use for any user-generated text content.
 *
 * @param {string} str — raw string
 * @returns {string} — escaped string safe for innerHTML
 *
 * @example
 * el.textContent = safeText(userInput);   // preferred
 * el.innerHTML = escapeHTML(userInput);     // when textContent won't work
 */
export function escapeHTML(str) {
  if (typeof str !== 'string') {
    return String(str ?? '');
  }
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitize an HTML string, allowing only whitelisted tags and attributes.
 * Strips event handlers, javascript: URIs, and unknown tags.
 * Uses DOMPurify for industry-standard, Snyk-recognized sanitization.
 *
 * @param {string} html — untrusted HTML string
 * @returns {string} — sanitized HTML safe for innerHTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Safely set innerHTML on an element, sanitizing the content first.
 * Uses DOMPurify for industry-standard sanitization.
 *
 * @param {HTMLElement} el — target element
 * @param {string} html — untrusted HTML string
 */
export function safeInnerHTML(el, html) {
  if (!el) {
    return;
  }
  el.innerHTML = DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Create a document fragment from a sanitized HTML string.
 * Useful for batch DOM insertion.
 * Uses DOMPurify for industry-standard sanitization.
 *
 * @param {string} html — untrusted HTML string
 * @returns {DocumentFragment}
 */
export function createSafeFragment(html) {
  const sanitized = DOMPurify.sanitize(html, {
    ...PURIFY_CONFIG,
    RETURN_DOM_FRAGMENT: true,
  });
  return sanitized;
}
