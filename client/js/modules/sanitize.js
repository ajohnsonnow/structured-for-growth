/**
 * HTML Sanitizer Module (P1.2.8 — XSS Prevention)
 *
 * Provides safe DOM manipulation utilities that prevent XSS attacks.
 * Replaces raw innerHTML with sanitized equivalents.
 *
 * Two modes:
 *  - safeHTML() — escapes ALL HTML (for user-generated content)
 *  - safeRender() — allows a whitelist of tags/attributes (for template rendering)
 *
 * Standards: OWASP A03 (Injection), CWE-79 (XSS)
 * @module sanitize
 */

/**
 * Allowlist of safe HTML tags for template rendering.
 * Anything not in this set is stripped by safeRender().
 */
const ALLOWED_TAGS = new Set([
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
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
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'kbd',
  'li',
  'mark',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'samp',
  'section',
  'small',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
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
    'data-icon',
    'data-icon-size',
    'data-tab',
    'data-category',
    'data-pillar',
    'data-status',
    'data-priority',
  ],
  a: ['href', 'target', 'rel', 'aria-current'],
  img: ['src', 'alt', 'width', 'height', 'loading'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope'],
  time: ['datetime'],
  ol: ['start', 'type'],
  details: ['open'],
  del: ['datetime'],
  ins: ['datetime'],
};

/** Protocols allowed in href/src attributes */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', '#', '/'];

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
 *
 * @param {string} html — untrusted HTML string
 * @returns {string} — sanitized HTML safe for innerHTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') {
    return '';
  }

  // Use the browser's DOMParser for correct parsing
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return sanitizeNode(doc.body);
}

/**
 * Recursively sanitize a DOM node and return safe HTML string.
 * @param {Node} node
 * @returns {string}
 */
function sanitizeNode(node) {
  let out = '';

  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      out += escapeHTML(child.textContent);
      continue;
    }

    if (child.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const tag = child.tagName.toLowerCase();

    // Strip disallowed tags entirely (but keep their text children)
    if (!ALLOWED_TAGS.has(tag)) {
      out += sanitizeNode(child);
      continue;
    }

    // Build attribute string with only allowed attrs
    let attrs = '';
    const globalAllowed = ALLOWED_ATTRS['*'] || [];
    const tagAllowed = ALLOWED_ATTRS[tag] || [];
    const allowed = [...globalAllowed, ...tagAllowed];

    for (const attr of child.attributes) {
      const name = attr.name.toLowerCase();
      if (!allowed.includes(name)) {
        continue;
      }

      const value = attr.value;

      // Sanitize URL attributes
      if (['href', 'src'].includes(name)) {
        if (!isSafeURL(value)) {
          continue;
        }
      }

      // Block event handlers that snuck through
      if (name.startsWith('on')) {
        continue;
      }

      attrs += ` ${escapeHTML(name)}="${escapeHTML(value)}"`;
    }

    // Self-closing tags
    const voidElements = new Set(['br', 'hr', 'img', 'col', 'wbr']);
    if (voidElements.has(tag)) {
      out += `<${tag}${attrs}>`;
    } else {
      out += `<${tag}${attrs}>${sanitizeNode(child)}</${tag}>`;
    }
  }

  return out;
}

/**
 * Check if a URL is safe (no javascript:, data:, etc.)
 * @param {string} url
 * @returns {boolean}
 */
function isSafeURL(url) {
  if (!url) {
    return false;
  }
  const trimmed = url.trim().toLowerCase();
  // Allow relative URLs and anchors
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('.')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed, 'https://placeholder.local');
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Safely set innerHTML on an element, sanitizing the content first.
 *
 * @param {HTMLElement} el — target element
 * @param {string} html — untrusted HTML string
 */
export function safeInnerHTML(el, html) {
  if (!el) {
    return;
  }
  el.innerHTML = sanitizeHTML(html);
}

/**
 * Create a document fragment from a sanitized HTML string.
 * Useful for batch DOM insertion.
 *
 * @param {string} html — untrusted HTML string
 * @returns {DocumentFragment}
 */
export function createSafeFragment(html) {
  const sanitized = sanitizeHTML(html);
  const template = document.createElement('template');
  template.innerHTML = sanitized;
  return template.content;
}
