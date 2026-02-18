/**
 * Skills Page — Interactive Visualization (v2)
 * ─────────────────────────────────────────────
 * Three views:
 *  1. Map View  — Category clusters with skill chips + connection highlighting
 *  2. Grid View — Polished skill cards sorted by proficiency
 *  3. Client Journeys — Narrative pathways with step-by-step flows
 *
 * Data source: /api/skills
 */

import { initIcons } from './modules/icons.js';
import { escapeHTML } from './modules/sanitize.js';
import { initUnifiedNav } from './modules/unifiedNav.js';

/* ── State ──────────────────────────────────── */
let skillsData = null;
let activeSkillId = null;
let activeCategory = 'all';

/* ── DOM helpers ────────────────────────────── */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

/* ── Boot ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  initUnifiedNav();
  await loadSkillsData();
  if (!skillsData) {
    return;
  }
  renderFilters();
  renderMapView();
  renderGridView();
  renderJourneysView();
  bindEvents();
  initIcons();
});

/* ── Data ───────────────────────────────────── */
async function loadSkillsData() {
  try {
    const res = await fetch('/api/skills');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    skillsData = await res.json();
    const countEl = $('#skillCount');
    const catEl = $('#categoryCount');
    if (countEl) {
      countEl.textContent = skillsData.skills.length;
    }
    if (catEl) {
      catEl.textContent = skillsData.categories.length;
    }
  } catch (err) {
    console.error('[skills] Failed to load:', err);
  }
}

/* ── Filters ────────────────────────────────── */
function renderFilters() {
  const container = $('.skills-filters');
  if (!container) {
    return;
  }

  skillsData.categories.forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;
    btn.style.setProperty('--filter-color', cat.color);
    container.appendChild(btn);
  });
}

/* ── Map View — Category Cluster Grid ───────── */
function renderMapView() {
  const container = $('#skillsNodes');
  if (!container) {
    return;
  }
  container.innerHTML = '';

  const skills = getFilteredSkills();

  // Group by category
  const groups = {};
  skills.forEach((s) => {
    if (!groups[s.category]) {
      groups[s.category] = [];
    }
    groups[s.category].push(s);
  });

  // Ordered by data definition
  const orderedCats = skillsData.categories.filter((c) => groups[c.id]);

  orderedCats.forEach((cat) => {
    const cluster = document.createElement('div');
    cluster.className = 'skill-cluster';
    cluster.style.setProperty('--cluster-color', cat.color);

    const header = document.createElement('div');
    header.className = 'cluster-header';
    header.innerHTML = `
      <span class="cluster-indicator"></span>
      <h3 class="cluster-title">${escapeHTML(cat.label)}</h3>
      <span class="cluster-count">${groups[cat.id].length} skills</span>
    `;
    cluster.appendChild(header);

    const chipList = document.createElement('div');
    chipList.className = 'cluster-chips';

    groups[cat.id]
      .sort((a, b) => b.level - a.level)
      .forEach((skill) => {
        const chip = document.createElement('button');
        chip.className = 'skill-chip';
        chip.dataset.skillId = skill.id;
        chip.setAttribute('aria-label', `${skill.name} — Level ${skill.level} of 5`);

        const dots = Array.from(
          { length: 5 },
          (_, i) => `<span class="chip-dot${i < skill.level ? ' filled' : ''}"></span>`
        ).join('');

        chip.innerHTML = `
          <span class="chip-name">${escapeHTML(skill.name)}</span>
          <span class="chip-level" aria-hidden="true">${dots}</span>
        `;
        chipList.appendChild(chip);
      });

    cluster.appendChild(chipList);
    container.appendChild(cluster);
  });
}

/* ── Grid View — Cards ──────────────────────── */
function renderGridView() {
  const grid = $('#skillsGrid');
  if (!grid) {
    return;
  }
  grid.innerHTML = '';

  const skills = getFilteredSkills()
    .slice()
    .sort((a, b) => b.level - a.level);
  const catMap = Object.fromEntries(skillsData.categories.map((c) => [c.id, c]));

  skills.forEach((skill) => {
    const cat = catMap[skill.category];
    const card = document.createElement('article');
    card.className = 'skill-card';
    card.dataset.skillId = skill.id;
    card.tabIndex = 0;
    card.style.setProperty('--card-accent', cat?.color || '#6b7280');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for ${skill.name}`);

    const dots = Array.from(
      { length: 5 },
      (_, i) => `<span class="card-dot${i < skill.level ? ' filled' : ''}"></span>`
    ).join('');

    const related = (skill.related || [])
      .map((rid) => skillsData.skills.find((s) => s.id === rid))
      .filter(Boolean)
      .slice(0, 4)
      .map((r) => `<span class="card-tag">${escapeHTML(r.name)}</span>`)
      .join('');

    card.innerHTML = `
      <div class="card-top">
        <span class="card-badge" style="background:${cat?.color || '#6b7280'}">${escapeHTML(cat?.label || '')}</span>
        <span class="card-dots" aria-label="Level ${skill.level} of 5">${dots}</span>
      </div>
      <h3 class="card-title">${escapeHTML(skill.name)}</h3>
      <p class="card-summary">${escapeHTML(skill.summary)}</p>
      <div class="card-value">
        <p>${escapeHTML(skill.clientValue)}</p>
      </div>
      ${related ? `<div class="card-tags">${related}</div>` : ''}
    `;
    grid.appendChild(card);
  });
}

/* ── Journeys View — Timeline ───────────────── */
function renderJourneysView() {
  const list = $('#journeysList');
  if (!list || !skillsData.clientJourneys) {
    return;
  }
  list.innerHTML = '';

  const catMap = Object.fromEntries(skillsData.categories.map((c) => [c.id, c]));
  const skillMap = Object.fromEntries(skillsData.skills.map((s) => [s.id, s]));

  skillsData.clientJourneys.forEach((journey, ji) => {
    const card = document.createElement('article');
    card.className = 'journey-card';

    const steps = journey.skills
      .map((sid, i) => {
        const s = skillMap[sid];
        if (!s) {
          return '';
        }
        const cat = catMap[s.category];
        const color = cat?.color || '#6b7280';
        return `
        <div class="journey-step">
          <div class="step-marker" style="background:${color}">${i + 1}</div>
          <button class="step-label" data-skill-id="${escapeHTML(sid)}" style="--step-color:${color}">
            ${escapeHTML(s.name)}
          </button>
        </div>
        ${i < journey.skills.length - 1 ? '<div class="step-connector"></div>' : ''}
      `;
      })
      .join('');

    card.innerHTML = `
      <div class="journey-header">
        <span class="journey-num">${String(ji + 1).padStart(2, '0')}</span>
        <div class="journey-meta">
          <h3 class="journey-title">${escapeHTML(journey.title)}</h3>
          <p class="journey-desc">${escapeHTML(journey.description)}</p>
        </div>
      </div>
      <div class="journey-flow">${steps}</div>
      <div class="journey-outcome">
        <span class="outcome-icon" aria-hidden="true">&#127919;</span>
        <div class="outcome-body">
          <span class="outcome-label">Outcome</span>
          <p class="outcome-text">${escapeHTML(journey.outcome)}</p>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

/* ── Detail Panel ───────────────────────────── */
function showDetail(skillId) {
  const panel = $('#skillDetail');
  if (!panel) {
    return;
  }

  const skill = skillsData.skills.find((s) => s.id === skillId);
  if (!skill) {
    return;
  }

  const catMap = Object.fromEntries(skillsData.categories.map((c) => [c.id, c]));
  const cat = catMap[skill.category];
  activeSkillId = skillId;

  const badge = $('#detailCategory');
  if (badge) {
    badge.textContent = cat?.label || skill.category;
    badge.style.background = cat?.color || '#6b7280';
  }

  const nameEl = $('#detailName');
  if (nameEl) {
    nameEl.textContent = skill.name;
  }

  const summaryEl = $('#detailSummary');
  if (summaryEl) {
    summaryEl.textContent = skill.summary;
  }

  const valueEl = $('#detailClientValue');
  if (valueEl) {
    valueEl.textContent = skill.clientValue;
  }

  // Level dots
  const levelEl = $('#detailLevel');
  if (levelEl) {
    levelEl.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
      const dot = document.createElement('span');
      dot.className = `skill-level-dot${i <= skill.level ? ' filled' : ''}`;
      dot.setAttribute('aria-hidden', 'true');
      levelEl.appendChild(dot);
    }
    levelEl.setAttribute('aria-label', `Proficiency ${skill.level} of 5`);
  }

  // Use cases
  const usesEl = $('#detailUseCases');
  if (usesEl) {
    usesEl.innerHTML = '';
    skill.useCases.forEach((uc) => {
      const li = document.createElement('li');
      li.textContent = uc;
      usesEl.appendChild(li);
    });
  }

  // Related chips
  const relEl = $('#detailRelated');
  if (relEl) {
    relEl.innerHTML = '';
    (skill.related || []).forEach((rid) => {
      const rel = skillsData.skills.find((s) => s.id === rid);
      if (!rel) {
        return;
      }
      const relCat = catMap[rel.category];
      const chip = document.createElement('button');
      chip.className = 'skill-related-chip';
      chip.dataset.skillId = rid;
      chip.style.setProperty('--chip-color', relCat?.color || '#6b7280');
      chip.textContent = rel.name;
      relEl.appendChild(chip);
    });
  }

  panel.hidden = false;
  highlightConnections(skillId);
}

function highlightConnections(skillId) {
  const skill = skillsData.skills.find((s) => s.id === skillId);
  if (!skill) {
    return;
  }

  const connected = new Set(skill.related || []);
  connected.add(skillId);

  $$('.skill-chip').forEach((chip) => {
    const nid = chip.dataset.skillId;
    chip.classList.toggle('active', nid === skillId);
    chip.classList.toggle('connected', nid !== skillId && connected.has(nid));
    chip.classList.toggle('dimmed', !connected.has(nid));
  });
}

function clearHighlights() {
  activeSkillId = null;
  $$('.skill-chip').forEach((n) => n.classList.remove('active', 'connected', 'dimmed'));
  const panel = $('#skillDetail');
  if (panel) {
    panel.hidden = true;
  }
}

/* ── Filtering ──────────────────────────────── */
function getFilteredSkills() {
  if (activeCategory === 'all') {
    return skillsData.skills;
  }
  return skillsData.skills.filter((s) => s.category === activeCategory);
}

function applyFilter(category) {
  activeCategory = category;
  $$('.skills-filters .filter-btn').forEach((btn) =>
    btn.classList.toggle('active', btn.dataset.category === category)
  );
  clearHighlights();
  renderMapView();
  renderGridView();
}

/* ── View Switching ─────────────────────────── */
function switchView(view) {
  $$('.view-btn').forEach((btn) => {
    const isActive = btn.dataset.view === view;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', String(isActive));
  });

  const webSection = $('#skillsWebView');
  const gridSection = $('#skillsGridView');
  const journeysSection = $('#skillsJourneysView');

  if (webSection) {
    webSection.hidden = view !== 'web';
  }
  if (gridSection) {
    gridSection.hidden = view !== 'grid';
  }
  if (journeysSection) {
    journeysSection.hidden = view !== 'journeys';
  }
}

/* ── Events ─────────────────────────────────── */
function bindEvents() {
  document.addEventListener('click', (e) => {
    const filterBtn = e.target.closest('.skills-filters .filter-btn');
    if (filterBtn) {
      applyFilter(filterBtn.dataset.category);
      return;
    }

    const viewBtn = e.target.closest('.view-btn');
    if (viewBtn) {
      switchView(viewBtn.dataset.view);
      return;
    }

    const chip = e.target.closest('.skill-chip');
    if (chip) {
      const id = chip.dataset.skillId;
      if (activeSkillId === id) {
        clearHighlights();
      } else {
        showDetail(id);
      }
      return;
    }

    const card = e.target.closest('.skill-card');
    if (card) {
      showDetail(card.dataset.skillId);
      return;
    }

    const stepLabel = e.target.closest('.step-label');
    if (stepLabel) {
      showDetail(stepLabel.dataset.skillId);
      switchView('web');
      return;
    }

    const relChip = e.target.closest('.skill-related-chip');
    if (relChip) {
      showDetail(relChip.dataset.skillId);
      return;
    }

    const closeBtn = e.target.closest('.skill-detail-close');
    if (closeBtn) {
      clearHighlights();
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const card = e.target.closest('.skill-card');
      if (card) {
        showDetail(card.dataset.skillId);
      }
    }
    if (e.key === 'Escape') {
      clearHighlights();
    }
  });
}
