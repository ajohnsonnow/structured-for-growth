/**
 * Glossary Tooltip Component (P6.1.3 / P6.1.6 / P6.1.9)
 * ────────────────────────────────────────────────────────
 * Accessible tooltip system that provides definitions for
 * acronyms and technical terms throughout the site.
 *
 * Features:
 *  • Hover on desktop, tap on mobile (bottom-sheet pattern)
 *  • Accessible: role="tooltip", aria-describedby, Escape to dismiss
 *  • Keyboard: Tab to focus, Enter/Space to open, Escape to close
 *  • Auto-positions to stay in viewport
 *  • Touch-friendly: doesn't block scrolling
 *  • Print: renders as parenthetical definitions
 *
 * Usage:
 *   import { initGlossaryTooltips } from './modules/glossaryTooltip.js';
 *   initGlossaryTooltips();
 *
 * The auto-detection module (glossaryAutoDetect.js) wraps recognized
 * terms in <abbr data-glossary-term="..."> and this component
 * attaches tooltip behaviour to them.
 */

import { escapeHTML } from './sanitize.js';

/** @type {Map<string, Object>} Cached glossary terms by ID */
const glossaryCache = new Map();

/** @type {HTMLElement|null} Currently visible tooltip element */
let activeTooltip = null;

/** @type {HTMLElement|null} Currently active trigger element */
let activeTrigger = null;

/** Counter for unique tooltip IDs */
let tooltipIdCounter = 0;

/**
 * Load the glossary dictionary from JSON.
 * Caches results in memory.
 * @returns {Promise<Map<string, Object>>}
 */
export async function loadGlossary() {
  if (glossaryCache.size > 0) {
    return glossaryCache;
  }

  try {
    const response = await fetch('/api/glossary');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();

    data.terms.forEach((term) => {
      glossaryCache.set(term.id, term);
      // Also index by uppercase term for case-insensitive lookup
      glossaryCache.set(term.term.toUpperCase(), term);
      if (term.fullForm) {
        glossaryCache.set(term.fullForm.toUpperCase(), term);
      }
    });

    return glossaryCache;
  } catch (err) {
    console.warn('[glossary] Failed to load glossary:', err.message);
    return glossaryCache;
  }
}

/**
 * Look up a glossary term by ID, term text, or full form.
 * @param {string} key - Term ID, acronym, or full form
 * @returns {Object|undefined}
 */
export function lookupTerm(key) {
  return glossaryCache.get(key) || glossaryCache.get(key.toUpperCase());
}

/**
 * Create the tooltip DOM element.
 * @param {Object} termData - Glossary term object
 * @param {string} tooltipId - Unique ID for aria-describedby linkage
 * @returns {HTMLElement}
 */
function createTooltipElement(termData, tooltipId) {
  const el = document.createElement('div');
  el.id = tooltipId;
  el.className = 'glossary-tooltip';
  el.setAttribute('role', 'tooltip');
  el.setAttribute('aria-hidden', 'true');

  const fullForm = termData.fullForm
    ? `<span class="tooltip-full-form">${escapeHTML(termData.fullForm)}</span>`
    : '';
  const category = termData.category
    ? `<span class="tooltip-category">${escapeHTML(termData.category)}</span>`
    : '';
  const sources = termData.sources?.length
    ? `<span class="tooltip-sources">Source: ${escapeHTML(termData.sources.join(', '))}</span>`
    : '';

  el.innerHTML = `
    <div class="tooltip-header">
      <strong class="tooltip-term">${escapeHTML(termData.term)}</strong>
      ${category}
    </div>
    ${fullForm}
    <p class="tooltip-definition">${escapeHTML(termData.definition)}</p>
    ${sources}
    <a href="/glossary#${escapeHTML(termData.id)}" class="tooltip-link">View in glossary →</a>
    <button class="tooltip-close" aria-label="Close tooltip" type="button">&times;</button>
  `;

  return el;
}

/**
 * Position the tooltip relative to the trigger element.
 * Prefers appearing above, but flips below if there's not enough space.
 * On mobile, uses a bottom-sheet pattern instead.
 * @param {HTMLElement} tooltip
 * @param {HTMLElement} trigger
 */
function positionTooltip(tooltip, trigger) {
  const isMobileView = window.innerWidth <= 768;

  if (isMobileView) {
    // Bottom-sheet style for mobile
    tooltip.classList.add('tooltip-mobile');
    tooltip.style.removeProperty('top');
    tooltip.style.removeProperty('left');
    tooltip.style.removeProperty('transform');
    return;
  }

  tooltip.classList.remove('tooltip-mobile');

  const triggerRect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const padding = 8;

  // Try above
  let top = triggerRect.top + scrollY - tooltipRect.height - padding;
  let left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;

  // Flip below if not enough space above
  if (top < scrollY + padding) {
    top = triggerRect.bottom + scrollY + padding;
    tooltip.classList.add('tooltip-below');
    tooltip.setAttribute('data-position', 'below');
  } else {
    tooltip.classList.remove('tooltip-below');
    tooltip.setAttribute('data-position', 'above');
  }

  // Clamp horizontally
  const maxLeft = document.documentElement.clientWidth - tooltipRect.width - padding;
  left = Math.max(padding, Math.min(left, maxLeft + scrollX));

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
  tooltip.style.transform = 'none';
}

/**
 * Show tooltip for a trigger element.
 * @param {HTMLElement} trigger
 */
function showTooltip(trigger) {
  // Don't re-show if same trigger
  if (activeTrigger === trigger && activeTooltip) {
    return;
  }

  // Dismiss any existing tooltip
  hideTooltip();

  const termId = trigger.getAttribute('data-glossary-id') || trigger.textContent.trim();
  const termData = lookupTerm(termId);
  if (!termData) {
    return;
  }

  tooltipIdCounter++;
  const tooltipId = `glossary-tooltip-${tooltipIdCounter}`;

  const tooltip = createTooltipElement(termData, tooltipId);
  document.body.appendChild(tooltip);

  // Link trigger to tooltip for ARIA
  trigger.setAttribute('aria-describedby', tooltipId);

  // Position (needs to be visible first for measurements)
  tooltip.style.visibility = 'hidden';
  tooltip.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    positionTooltip(tooltip, trigger);
    tooltip.style.visibility = '';

    // Close button handler
    const closeBtn = tooltip.querySelector('.tooltip-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hideTooltip();
      });
    }
  });

  activeTooltip = tooltip;
  activeTrigger = trigger;

  // Announce to screen readers
  const announcer = document.getElementById('liveAnnouncer');
  if (announcer) {
    announcer.textContent = `${termData.term}: ${termData.definition}`;
  }
}

/**
 * Hide the currently active tooltip.
 */
function hideTooltip() {
  if (activeTooltip) {
    activeTooltip.setAttribute('aria-hidden', 'true');
    activeTooltip.remove();
    activeTooltip = null;
  }
  if (activeTrigger) {
    activeTrigger.removeAttribute('aria-describedby');
    activeTrigger = null;
  }
}

/**
 * Attach tooltip event listeners to a trigger element.
 * @param {HTMLElement} trigger
 */
function attachTooltipEvents(trigger) {
  let hoverTimeout = null;
  const HOVER_DELAY = 300;

  // Desktop: hover with delay
  trigger.addEventListener('mouseenter', () => {
    hoverTimeout = setTimeout(() => showTooltip(trigger), HOVER_DELAY);
  });

  trigger.addEventListener('mouseleave', (e) => {
    clearTimeout(hoverTimeout);
    // Don't hide if mouse moves to tooltip
    const related = e.relatedTarget;
    if (activeTooltip && (activeTooltip === related || activeTooltip.contains(related))) {
      return;
    }
    // Small delay to allow mouse to move to tooltip
    setTimeout(() => {
      if (activeTooltip && !activeTooltip.matches(':hover') && activeTrigger === trigger) {
        hideTooltip();
      }
    }, 200);
  });

  // Keep tooltip open while hovering on it
  // (handled via document-level mousedown below)

  // Mobile: tap to toggle
  trigger.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      e.preventDefault();
      e.stopPropagation();
      if (activeTrigger === trigger && activeTooltip) {
        hideTooltip();
      } else {
        showTooltip(trigger);
      }
    }
  });

  // Keyboard: Enter/Space to open, Escape handled globally
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (activeTrigger === trigger && activeTooltip) {
        hideTooltip();
      } else {
        showTooltip(trigger);
      }
    }
  });

  // Make focusable if not already
  if (!trigger.hasAttribute('tabindex')) {
    trigger.setAttribute('tabindex', '0');
  }
  trigger.setAttribute('role', 'button');
}

/**
 * Initialize glossary tooltips.
 * Finds all elements with data-glossary-term or <abbr> with data-glossary-id
 * and attaches tooltip behaviour.
 *
 * Call after glossary auto-detection has run.
 */
export function initGlossaryTooltips() {
  // Global: Escape closes tooltip
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeTooltip) {
      e.preventDefault();
      const trigger = activeTrigger;
      hideTooltip();
      if (trigger) {
        trigger.focus();
      }
    }
  });

  // Global: click outside closes tooltip
  document.addEventListener('mousedown', (e) => {
    if (activeTooltip && !activeTooltip.contains(e.target) && e.target !== activeTrigger) {
      hideTooltip();
    }
  });

  // Reposition on scroll/resize
  let repositionTimer;
  const reposition = () => {
    clearTimeout(repositionTimer);
    repositionTimer = setTimeout(() => {
      if (activeTooltip && activeTrigger) {
        positionTooltip(activeTooltip, activeTrigger);
      }
    }, 50);
  };
  window.addEventListener('scroll', reposition, { passive: true });
  window.addEventListener('resize', reposition, { passive: true });

  // Attach to existing glossary triggers
  attachToExistingTriggers();
}

/**
 * Find and attach tooltip behaviour to all glossary trigger elements.
 * Can be called multiple times (e.g., after dynamic content loads).
 */
export function attachToExistingTriggers() {
  const triggers = document.querySelectorAll(
    '[data-glossary-id]:not([data-glossary-initialized]), ' +
      'abbr[data-glossary-term]:not([data-glossary-initialized])'
  );

  triggers.forEach((trigger) => {
    attachTooltipEvents(trigger);
    trigger.setAttribute('data-glossary-initialized', 'true');
  });
}

export default {
  initGlossaryTooltips,
  loadGlossary,
  lookupTerm,
  attachToExistingTriggers,
};
