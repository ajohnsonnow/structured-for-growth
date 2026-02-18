/**
 * Glossary Page Controller (P6.1.5)
 * ──────────────────────────────────
 * Interactive glossary page with:
 *  • Searchable (live filtering as you type)
 *  • Filterable by category
 *  • Alphabetical index with jump links
 *  • Deep-linkable anchors (#term-id)
 *  • Keyboard navigable
 *  • Related terms cross-linking
 */

import { initGlossaryTooltips } from './modules/glossaryTooltip.js';
import { initIcons } from './modules/icons.js';
import { escapeHTML } from './modules/sanitize.js';
import { initUnifiedNav } from './modules/unifiedNav.js';

// ─── Init page chrome ──────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  initUnifiedNav();
  initIcons();
  initGlossaryTooltips();
  await initGlossaryPage();
});

// ─── State ──────────────────────────────────────────────────────

/** @type {Object[]} All glossary terms */
let allTerms = [];

/** @type {string} Current search query */
let currentSearch = '';

/** @type {string} Current category filter */
let currentCategory = 'all';

// ─── Load Data ──────────────────────────────────────────────────

async function loadGlossaryData() {
  try {
    const res = await fetch('/api/glossary');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    allTerms = data.terms.sort((a, b) => a.term.localeCompare(b.term));

    // Update term count
    const countEl = document.getElementById('termCount');
    if (countEl) {
      countEl.textContent = `${allTerms.length}`;
    }

    return allTerms;
  } catch (err) {
    console.error('[glossary-page] Failed to load:', err);
    return [];
  }
}

// ─── Render ─────────────────────────────────────────────────────

/**
 * Render the alphabetical index bar.
 */
function renderAlphaIndex() {
  const indexEl = document.getElementById('alphaIndex');
  if (!indexEl) {
    return;
  }

  const letters = new Set(
    allTerms.map((t) => {
      const first = t.term.charAt(0).toUpperCase();
      return /[A-Z]/.test(first) ? first : '#';
    })
  );

  const allLetters = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  indexEl.innerHTML = allLetters
    .map((letter) => {
      const hasTerms = letters.has(letter);
      return hasTerms
        ? `<li><a href="#letter-${letter}" class="alpha-link">${letter}</a></li>`
        : `<li><span class="alpha-link disabled" aria-disabled="true">${letter}</span></li>`;
    })
    .join('');
}

/**
 * Render the filtered/searched term list.
 */
function renderTermList() {
  const listEl = document.getElementById('glossaryList');
  const noResultsEl = document.getElementById('noResults');
  const countEl = document.getElementById('searchResultsCount');
  if (!listEl) {
    return;
  }

  // Filter
  let filtered = allTerms;

  if (currentCategory !== 'all') {
    filtered = filtered.filter((t) => t.category === currentCategory);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        (t.fullForm && t.fullForm.toLowerCase().includes(q)) ||
        t.definition.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q))
    );
  }

  // Update count
  if (countEl) {
    countEl.textContent =
      filtered.length !== allTerms.length ? `${filtered.length} of ${allTerms.length} terms` : '';
  }

  // No results
  if (filtered.length === 0) {
    listEl.innerHTML = '';
    if (noResultsEl) {
      noResultsEl.hidden = false;
    }
    return;
  }
  if (noResultsEl) {
    noResultsEl.hidden = true;
  }

  // Group by first letter
  const groups = new Map();
  filtered.forEach((term) => {
    const first = term.term.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : '#';
    if (!groups.has(letter)) {
      groups.set(letter, []);
    }
    groups.get(letter).push(term);
  });

  // Sort groups alphabetically (# first)
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    if (a === '#') {
      return -1;
    }
    if (b === '#') {
      return 1;
    }
    return a.localeCompare(b);
  });

  let html = '';
  for (const letter of sortedKeys) {
    const terms = groups.get(letter);
    html += `<div class="glossary-letter-group" id="letter-${letter}">
      <h3 class="glossary-letter-heading">${letter}</h3>
      <div class="glossary-letter-terms">`;

    for (const term of terms) {
      const highlightSearch = currentSearch
        ? highlightMatch(term.term, currentSearch)
        : escapeHTML(term.term);
      const highlightFull = term.fullForm
        ? currentSearch
          ? highlightMatch(term.fullForm, currentSearch)
          : escapeHTML(term.fullForm)
        : '';
      const highlightDef = currentSearch
        ? highlightMatch(term.definition, currentSearch)
        : escapeHTML(term.definition);

      const relatedHtml = term.related?.length
        ? `<div class="glossary-related">
            <span class="related-label">Related:</span>
            ${term.related.map((r) => `<a href="#${escapeHTML(r)}" class="related-link">${escapeHTML(r)}</a>`).join(' ')}
          </div>`
        : '';

      const sourcesHtml = term.sources?.length
        ? `<div class="glossary-sources">Source: ${term.sources.map((s) => escapeHTML(s)).join(', ')}</div>`
        : '';

      html += `
        <article class="glossary-card" id="${escapeHTML(term.id)}" role="listitem" data-category="${escapeHTML(term.category)}">
          <div class="glossary-card-header">
            <h4 class="glossary-card-term">
              <a href="#${escapeHTML(term.id)}" class="glossary-anchor" aria-label="Link to ${escapeHTML(term.term)}">#</a>
              ${highlightSearch}
            </h4>
            <span class="badge badge-${categoryBadgeColor(term.category)}">${escapeHTML(term.category)}</span>
          </div>
          ${highlightFull ? `<p class="glossary-card-full">${highlightFull}</p>` : ''}
          <p class="glossary-card-definition">${highlightDef}</p>
          ${relatedHtml}
          ${sourcesHtml}
        </article>`;
    }

    html += '</div></div>';
  }

  listEl.innerHTML = html;

  // If there's a hash, scroll to it
  scrollToHash();
}

/**
 * Highlight search matches in text.
 * @param {string} text
 * @param {string} query
 * @returns {string}
 */
function highlightMatch(text, query) {
  if (!query) {
    return escapeHTML(text);
  }
  text = escapeHTML(text);
  query = escapeHTML(query);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Map category to badge color.
 * @param {string} category
 * @returns {string}
 */
function categoryBadgeColor(category) {
  const map = {
    accessibility: 'info',
    security: 'danger',
    compliance: 'warning',
    development: 'primary',
    government: 'secondary',
    ai: 'success',
    networking: 'info',
    documentation: 'secondary',
    'project-management': 'warning',
    data: 'primary',
  };
  return map[category] || 'secondary';
}

/**
 * Scroll to hash target if present.
 */
function scrollToHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    return;
  }

  requestAnimationFrame(() => {
    const target = document.getElementById(hash);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('glossary-highlight');
      setTimeout(() => target.classList.remove('glossary-highlight'), 2000);
    }
  });
}

// ─── Event Handlers ─────────────────────────────────────────────

function initSearch() {
  const input = document.getElementById('glossarySearch');
  if (!input) {
    return;
  }

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentSearch = input.value.trim();
      renderTermList();
    }, 200);
  });

  // Clear on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      input.value = '';
      currentSearch = '';
      renderTermList();
    }
  });
}

function initFilters() {
  const buttons = document.querySelectorAll('.filter-btn[data-category]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderTermList();
    });
  });
}

function initRelatedLinks() {
  // Delegate clicks on related links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('.related-link');
    if (!link) {
      return;
    }

    e.preventDefault();
    const termId = link.getAttribute('href').replace('#', '');
    window.location.hash = termId;

    // Clear search and filter to show the term
    currentSearch = '';
    currentCategory = 'all';

    const searchInput = document.getElementById('glossarySearch');
    if (searchInput) {
      searchInput.value = '';
    }

    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    document.querySelector('.filter-btn[data-category="all"]')?.classList.add('active');

    renderTermList();
  });
}

// ─── Init ───────────────────────────────────────────────────────

async function initGlossaryPage() {
  await loadGlossaryData();
  renderAlphaIndex();
  renderTermList();
  initSearch();
  initFilters();
  initRelatedLinks();

  // Handle hash changes
  window.addEventListener('hashchange', scrollToHash);

  // Prefill search from URL params
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    const input = document.getElementById('glossarySearch');
    if (input) {
      input.value = q;
      currentSearch = q;
      renderTermList();
    }
  }
}
