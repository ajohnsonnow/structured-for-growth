/**
 * MBAi Methodology - Frontend Module
 * Fetches data from /api/mbai and renders interactive template cards,
 * category tabs, search, and a detail modal for each template.
 */

import { initNavigation } from './modules/navigation.js';

let allTemplates = [];
let manifest = null;
let currentCategory = 'all';

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  loadManifest();
  loadTemplates();
  setupSearch();
  setupModal();
});

// ── Data Loading ───────────────────────────────────────────
async function loadManifest() {
  try {
    const res = await fetch('/api/mbai/manifest');
    manifest = await res.json();
    renderStats(manifest);
    renderCategoryTabs(manifest.categories || []);
  } catch (err) {
    console.error('[mbai] Failed to load manifest:', err);
  }
}

async function loadTemplates() {
  try {
    const res = await fetch('/api/mbai/templates');
    const data = await res.json();
    allTemplates = data.templates || [];
    renderGrid(allTemplates);
  } catch (err) {
    console.error('[mbai] Failed to load templates:', err);
    document.getElementById('mbaiGrid').innerHTML =
      '<p class="error-msg">Unable to load MBAi templates. Is the server running?</p>';
  }
}

// ── Stats ──────────────────────────────────────────────────
function renderStats(m) {
  const el = id => document.getElementById(id);
  el('templateCount').textContent = (m.templates || []).length;
  el('categoryCount').textContent = (m.categories || []).length;
  // Collect unique frameworks across all templates
  const fws = new Set();
  allTemplates.forEach(t => (t.frameworks || []).forEach(f => fws.add(f)));
  // We'll update framework count after templates load
  const updateFw = () => {
    const set = new Set();
    allTemplates.forEach(t => (t.frameworks || []).forEach(f => set.add(f)));
    el('frameworkCount').textContent = set.size || '-';
  };
  setTimeout(updateFw, 1500);
}

// ── Category Tabs ──────────────────────────────────────────
function renderCategoryTabs(categories) {
  const tabsEl = document.getElementById('mbaiTabs');
  if (!tabsEl) return;

  let html = '<button class="mbai-tab active" data-category="all">All</button>';
  categories.forEach(cat => {
    html += `<button class="mbai-tab" data-category="${cat.id}">${cat.icon} ${cat.name}</button>`;
  });
  tabsEl.innerHTML = html;

  tabsEl.addEventListener('click', e => {
    const tab = e.target.closest('.mbai-tab');
    if (!tab) return;
    tabsEl.querySelectorAll('.mbai-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentCategory = tab.dataset.category;
    filterAndRender();
  });
}

// ── Search ─────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('mbaiSearch');
  if (!input) return;
  input.addEventListener('input', () => filterAndRender());
}

function filterAndRender() {
  const query = (document.getElementById('mbaiSearch')?.value || '').toLowerCase();
  let filtered = allTemplates;

  if (currentCategory !== 'all') {
    filtered = filtered.filter(t => t.category === currentCategory);
  }

  if (query) {
    filtered = filtered.filter(t => {
      const haystack = [
        t.title, t.description, t.category, t.methodology,
        ...(t.frameworks || [])
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }

  renderGrid(filtered);
}

// ── Grid Rendering ─────────────────────────────────────────
function renderGrid(templates) {
  const grid = document.getElementById('mbaiGrid');
  if (!grid) return;

  if (!templates.length) {
    grid.innerHTML = '<p class="empty-state">No templates match your filter.</p>';
    return;
  }

  grid.innerHTML = templates.map(t => `
    <div class="mbai-card" data-id="${t.id}">
      <div class="mbai-card-header">
        <span class="mbai-card-icon">${t.icon || '📄'}</span>
        <div>
          <h3 class="mbai-card-title">${t.title}</h3>
          <span class="mbai-card-category">${formatCategory(t.category)}</span>
        </div>
      </div>
      <p class="mbai-card-desc">${t.description}</p>
      <div class="mbai-card-meta">
        <span class="badge badge-mbai">${t.methodology?.split('+')[0]?.trim() || 'MBAi'}</span>
        ${(t.frameworks || []).slice(0, 3).map(f => `<span class="badge badge-framework">${f}</span>`).join('')}
        ${(t.frameworks || []).length > 3 ? `<span class="badge badge-more">+${t.frameworks.length - 3}</span>` : ''}
      </div>
      <button class="btn btn-secondary btn-sm mbai-card-btn">View Template →</button>
    </div>
  `).join('');

  // Card click → open modal
  grid.querySelectorAll('.mbai-card').forEach(card => {
    card.addEventListener('click', () => {
      const tpl = allTemplates.find(t => t.id === card.dataset.id);
      if (tpl) openModal(tpl);
    });
  });
}

function formatCategory(cat) {
  if (!cat) return '';
  return cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Modal ──────────────────────────────────────────────────
function setupModal() {
  const modal = document.getElementById('mbaiModal');
  const closeBtn = document.getElementById('mbaiModalClose');
  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('active');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') modal.classList.remove('active');
  });
}

function openModal(tpl) {
  const modal = document.getElementById('mbaiModal');
  document.getElementById('mbaiModalTitle').textContent = tpl.title;
  document.getElementById('mbaiModalDesc').textContent = tpl.description;

  // Meta badges
  const metaEl = document.getElementById('mbaiModalMeta');
  metaEl.innerHTML = `
    <span class="badge badge-mbai">${tpl.methodology || ''}</span>
    ${(tpl.frameworks || []).map(f => `<span class="badge badge-framework">${f}</span>`).join('')}
    <span class="badge badge-category">${tpl.icon} ${formatCategory(tpl.category)}</span>
  `;

  // Body - render template-specific tables
  const bodyEl = document.getElementById('mbaiModalBody');
  bodyEl.innerHTML = renderTemplateBody(tpl);

  modal.classList.add('active');
}

// ── Template-Specific Renderers ────────────────────────────
function renderTemplateBody(tpl) {
  switch (tpl.id) {
    case 'sbsc-strategic-matrix': return renderSBSC(tpl);
    case 'circular-supply-chain': return renderCircular(tpl);
    case 'tbl-impact-model': return renderTBL(tpl);
    case 'marketing-audit': return renderMarketing(tpl);
    case 'servant-leadership-coaching': return renderCoaching(tpl);
    case 'servant-leadership-rubric': return renderRubric(tpl);
    case 'sustainable-sdlc': return renderSDLC(tpl);
    case 'grc-ai-integration': return renderGRC(tpl);
    default: return `<pre>${JSON.stringify(tpl, null, 2)}</pre>`;
  }
}

function renderSBSC(tpl) {
  let html = '';
  (tpl.perspectives || []).forEach(p => {
    html += `<div class="mbai-section">
      <h3 class="mbai-section-title perspective-${p.name.toLowerCase().replace(/[^a-z]/g, '')}">${p.name} Perspective</h3>
      <div class="mbai-table-wrap"><table class="mbai-table">
        <thead><tr>
          <th>Strategic Objective</th><th>KPI</th><th>Target</th><th>AI Automation Vector</th><th>Servant Leadership</th>
        </tr></thead>
        <tbody>${p.objectives.map(o => `<tr>
          <td>${o.objective}</td><td>${o.kpi}</td><td><span class="target-badge">${o.target}</span></td>
          <td>${o.aiVector}</td><td>${o.servantLeadership}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
  });
  return html;
}

function renderCircular(tpl) {
  return `<div class="mbai-table-wrap"><table class="mbai-table">
    <thead><tr>
      <th>Phase</th><th>Action</th><th>AI Enablement</th><th>Circular KPI</th><th>Servant Leadership</th>
    </tr></thead>
    <tbody>${(tpl.phases || []).map(ph => `<tr>
      <td><strong>${ph.name}</strong></td><td>${ph.action}</td><td>${ph.aiEnablement}</td>
      <td>${ph.kpi}</td><td>${ph.servantLeadership}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderTBL(tpl) {
  let html = `<p class="mbai-initiative"><strong>Strategic Initiative:</strong> ${tpl.initiative}</p>`;
  (tpl.dimensions || []).forEach(dim => {
    html += `<div class="mbai-section">
      <h3 class="mbai-section-title tbl-${dim.name.split(' ')[0].toLowerCase()}">${dim.name}</h3>
      <div class="mbai-table-wrap"><table class="mbai-table">
        <thead><tr>
          <th>Metric</th><th>Baseline</th><th>Projected (36-mo)</th><th>AI Enablement</th><th>Servant Leadership</th>
        </tr></thead>
        <tbody>${dim.metrics.map(m => `<tr>
          <td>${m.metric}</td><td>${m.baseline}</td><td><span class="target-badge">${m.projected}</span></td>
          <td>${m.aiEnablement}</td><td>${m.servantLeadership}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>`;
  });
  return html;
}

function renderMarketing(tpl) {
  return `<div class="mbai-table-wrap"><table class="mbai-table">
    <thead><tr>
      <th>Audit Phase</th><th>Criteria</th><th>AI Enablement</th><th>Ethical Alignment</th><th>Evidence</th>
    </tr></thead>
    <tbody>${(tpl.phases || []).map(ph => `<tr>
      <td><strong>${ph.name}</strong></td><td>${ph.criteria}</td><td>${ph.aiEnablement}</td>
      <td>${ph.servantLeadership}</td><td><span class="badge badge-evidence">${ph.evidenceLink}</span></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderCoaching(tpl) {
  let html = `<div class="mbai-meeting-meta">
    <span class="badge badge-mbai">⏰ ${tpl.duration}</span>
    <span class="badge badge-framework">📅 ${tpl.frequency}</span>
    <span class="badge badge-category">👤 Owner: ${tpl.primaryOwner}</span>
  </div>`;
  html += `<div class="coaching-segments">`;
  (tpl.segments || []).forEach((seg, i) => {
    html += `<div class="coaching-segment">
      <div class="segment-header">
        <span class="segment-number">${i + 1}</span>
        <div>
          <h4>${seg.name}</h4>
          <span class="seg-focus">${seg.focus}</span>
        </div>
      </div>
      <div class="segment-prompts">
        <strong>Exemplary Prompts:</strong>
        <ul>${seg.prompts.map(p => `<li>"${p}"</li>`).join('')}</ul>
      </div>
      <div class="segment-ai">
        <strong>AI Support:</strong> ${seg.aiSupport}
      </div>
    </div>`;
  });
  html += `</div>`;
  return html;
}

function renderRubric(tpl) {
  let html = `<p class="mbai-initiative"><strong>Scoring:</strong> ${tpl.scoringSystem}</p>`;
  html += `<div class="mbai-table-wrap"><table class="mbai-table">
    <thead><tr>
      <th>Competency</th><th>Developing (1)</th><th>Competent (2)</th><th>Proficient (3)</th><th>Exemplary (4)</th><th>Evidence Source</th>
    </tr></thead>
    <tbody>${(tpl.competencies || []).map(c => `<tr>
      <td><strong>${c.name}</strong></td><td>${c.developing || '-'}</td><td>${c.competent || '-'}</td><td>${c.proficient}</td><td>${c.exemplary}</td>
      <td>${c.evidenceSource}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
  return html;
}

function renderSDLC(tpl) {
  return `<div class="mbai-table-wrap"><table class="mbai-table">
    <thead><tr>
      <th>Phase</th><th>Action</th><th>AI Vector</th><th>GreenOps Metric</th><th>Servant Leadership</th>
    </tr></thead>
    <tbody>${(tpl.phases || []).map(ph => `<tr>
      <td><strong>${ph.name}</strong></td><td>${ph.action}</td><td>${ph.aiVector}</td>
      <td>${ph.greenOpsMetric}</td><td>${ph.servantLeadership}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function renderGRC(tpl) {
  return `<div class="mbai-table-wrap"><table class="mbai-table">
    <thead><tr>
      <th>NIST AI RMF Function</th><th>Action</th><th>AI Enablement</th><th>Servant Leadership</th><th>Documentation</th>
    </tr></thead>
    <tbody>${(tpl.functions || []).map(fn => `<tr>
      <td><strong>${fn.name}</strong></td><td>${fn.action}</td><td>${fn.aiEnablement}</td>
      <td>${fn.servantLeadership}</td><td>${fn.documentation}</td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}
