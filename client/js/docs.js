/**
 * Docs Page - Client-side renderer
 * Loads the auto-generated docs-manifest.json and renders
 * a searchable, tabbed documentation experience.
 */

import { initNavigation } from './modules/navigation.js';

let manifest = null;
let activeTab = 'overview';
let activeApiModule = 'all';
let activeTemplateCategory = 'all';

/* ── Bootstrap ──────────────────────────────── */

async function init() {
  try {
    let res = await fetch('/docs-manifest.json');
    if (!res.ok) {
      // Fallback for dev server where assets dir is also accessible
      res = await fetch('/assets/docs-manifest.json');
    }
    if (!res.ok) throw new Error(`${res.status}`);
    manifest = await res.json();
  } catch (err) {
    document.getElementById('docs-content').innerHTML =
      `<div class="container"><div class="no-results">Could not load documentation manifest.<br>Run <code>npm run docs:generate</code> first.</div></div>`;
    return;
  }

  renderMeta();
  renderOverview();
  renderFeatures();
  renderApi();
  renderTemplates();
  renderCompliance();
  renderArchitecture();
  bindTabs();
  bindSearch();
}

/* ── Meta badges in hero ────────────────────── */

function renderMeta() {
  const s = manifest.summary;
  document.getElementById('docsMeta').innerHTML = [
    `<span class="meta-badge"><strong>${s.totalFeatures}</strong> Features</span>`,
    `<span class="meta-badge"><strong>${s.totalRoutes}</strong> API Routes</span>`,
    `<span class="meta-badge"><strong>${s.totalTemplates}</strong> Templates</span>`,
    `<span class="meta-badge"><strong>${s.totalFrameworks}</strong> Frameworks</span>`,
    `<span class="meta-badge">v<strong>${manifest.version}</strong></span>`,
  ].join('');

  const ts = new Date(manifest.generated);
  document.getElementById('genTimestamp').textContent =
    ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' at ' + ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/* ── Overview panel ─────────────────────────── */

function renderOverview() {
  const s = manifest.summary;
  document.getElementById('overviewStats').innerHTML = [
    stat(s.totalFeatures, 'Features'),
    stat(s.totalRoutes, 'API Endpoints'),
    stat(s.totalTemplates, 'Code Templates'),
    stat(s.totalFrameworks, 'Compliance Frameworks'),
    stat(s.totalPages, 'Client Pages'),
    stat(s.totalDocs, 'Doc Files'),
  ].join('');

  document.getElementById('docsFileList').innerHTML = manifest.docs.map(d => `
    <div class="doc-file-card" data-search="${d.file} ${d.headings.join(' ')}">
      <div class="doc-filename">${d.file}</div>
      <div class="doc-words">${d.wordCount.toLocaleString()} words</div>
      <div class="doc-headings">${d.headings.slice(0, 6).join(' · ')}${d.headings.length > 6 ? ' …' : ''}</div>
    </div>
  `).join('');
}

function stat(val, label) {
  return `<div class="stat-card"><div class="stat-value">${val}</div><div class="stat-label">${label}</div></div>`;
}

/* ── Features panel ─────────────────────────── */

function renderFeatures() {
  document.getElementById('featuresList').innerHTML = manifest.features.map(f => {
    const routeCount = Array.isArray(f.relatedRoutes) ? f.relatedRoutes.length : 0;
    const pages = (f.relatedPages || []).join(', ');
    return `
    <div class="feature-card" data-search="${f.name} ${f.description} ${f.category} ${pages}">
      <h3>${f.name}</h3>
      <p>${f.description}</p>
      <div class="feature-meta">
        <span class="feature-badge ${f.category}">${f.category}</span>
        <span class="feature-badge stable">${f.status}</span>
      </div>
      ${pages ? `<div class="feature-routes">Pages: ${pages}</div>` : ''}
      ${routeCount ? `<div class="feature-routes">${routeCount} related endpoint${routeCount > 1 ? 's' : ''}</div>` : ''}
    </div>`;
  }).join('');
}

/* ── API Reference panel ────────────────────── */

function renderApi() {
  const modules = ['all', ...new Set(manifest.routes.map(r => r.module))];
  document.getElementById('apiFilters').innerHTML = modules.map(m =>
    `<button class="api-filter-btn${m === 'all' ? ' active' : ''}" data-module="${m}">${m === 'all' ? 'All Modules' : m}</button>`
  ).join('');

  renderApiRows('all');

  document.getElementById('apiFilters').addEventListener('click', e => {
    const btn = e.target.closest('.api-filter-btn');
    if (!btn) return;
    activeApiModule = btn.dataset.module;
    document.querySelectorAll('.api-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderApiRows(activeApiModule);
  });
}

function renderApiRows(module) {
  const rows = module === 'all' ? manifest.routes : manifest.routes.filter(r => r.module === module);
  document.getElementById('apiTableBody').innerHTML = rows.map(r => `
    <tr data-search="${r.method} ${r.path} ${r.auth} ${r.module} ${r.description}">
      <td><span class="method-badge method-${r.method}">${r.method}</span></td>
      <td class="path-cell">${r.path}</td>
      <td class="auth-cell">${r.auth}</td>
      <td>${r.module}</td>
      <td>${r.description || '-'}</td>
    </tr>
  `).join('');
}

/* ── Templates panel ────────────────────────── */

function renderTemplates() {
  const cats = ['all', ...new Set(manifest.templates.map(t => t.category))];
  document.getElementById('templateFilters').innerHTML = cats.map(c =>
    `<button class="api-filter-btn${c === 'all' ? ' active' : ''}" data-cat="${c}">${c === 'all' ? 'All Categories' : c}</button>`
  ).join('');

  renderTemplateCards('all');

  document.getElementById('templateFilters').addEventListener('click', e => {
    const btn = e.target.closest('.api-filter-btn');
    if (!btn) return;
    activeTemplateCategory = btn.dataset.cat;
    document.querySelectorAll('#templateFilters .api-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTemplateCards(activeTemplateCategory);
  });
}

function renderTemplateCards(category) {
  const items = category === 'all' ? manifest.templates : manifest.templates.filter(t => t.category === category);
  document.getElementById('templateGrid').innerHTML = items.map(t => `
    <div class="template-doc-card" data-search="${t.id} ${t.title} ${t.category} ${t.description} ${t.language}">
      <h4>${t.title}</h4>
      <p>${t.description}</p>
      <div class="tmpl-meta">
        <span class="cat-badge">${t.category}</span>
        <span class="cat-badge">${t.language}</span>
        ${t.timeSaved ? `<span class="cat-badge">⏱ ${t.timeSaved}</span>` : ''}
      </div>
    </div>
  `).join('');
}

/* ── Compliance panel ───────────────────────── */

function renderCompliance() {
  document.getElementById('frameworkList').innerHTML = manifest.compliance.frameworks.map(fw => `
    <div class="fw-doc-card" data-search="${fw.id} ${fw.name} ${fw.description}">
      <h4>${fw.name}</h4>
      <p>${fw.description}</p>
      <div class="fw-meta">
        ${fw.version ? `<span class="cat-badge">v${fw.version}</span>` : ''}
        <span class="cat-badge">${fw.controlCount} controls</span>
      </div>
    </div>
  `).join('');

  const oscalHtml = manifest.compliance.oscal.map(o =>
    `<span class="cat-badge" style="margin:0.2rem">${o.id.toUpperCase()}</span>`
  ).join('');
  const mapHtml = manifest.compliance.mappings.map(m =>
    `<div class="dep-row"><span class="dep-name">${m.file}</span><span class="dep-ver">${m.entries} entries</span></div>`
  ).join('');

  document.getElementById('complianceSupport').innerHTML = `
    <div class="arch-columns">
      <div><h4 style="color:var(--text-secondary);margin-bottom:0.5rem">OSCAL Catalogs</h4>${oscalHtml}</div>
      <div><h4 style="color:var(--text-secondary);margin-bottom:0.5rem">Cross-Framework Mappings</h4>${mapHtml}</div>
    </div>`;
}

/* ── Architecture panel ─────────────────────── */

function renderArchitecture() {
  const pkg = manifest.pkg;

  document.getElementById('pkgInfo').innerHTML = `
    <div class="pkg-info-grid">
      <div class="pkg-row"><span class="pkg-label">Name</span><span class="pkg-value">${pkg.name}</span></div>
      <div class="pkg-row"><span class="pkg-label">Version</span><span class="pkg-value">${pkg.version}</span></div>
      <div class="pkg-row"><span class="pkg-label">Node</span><span class="pkg-value">${pkg.nodeEngine}</span></div>
      ${pkg.description ? `<div class="pkg-row"><span class="pkg-label">Description</span><span class="pkg-value">${pkg.description}</span></div>` : ''}
    </div>`;

  document.getElementById('scriptsList').innerHTML = pkg.scripts.map(s =>
    `<div class="script-row" data-search="${s.name} ${s.command}"><span class="script-name">${s.name}</span><span class="script-cmd" title="${esc(s.command)}">${esc(s.command)}</span></div>`
  ).join('');

  const allDeps = [...pkg.dependencies.map(d => ({ ...d, dev: false })), ...pkg.devDependencies.map(d => ({ ...d, dev: true }))];
  document.getElementById('depsList').innerHTML = allDeps.map(d =>
    `<div class="dep-row" data-search="${d.name} ${d.version}"><span class="dep-name">${d.name}${d.dev ? ' <small style="color:var(--text-muted)">(dev)</small>' : ''}</span><span class="dep-ver">${d.version}</span></div>`
  ).join('');

  document.getElementById('stylesList').innerHTML = manifest.styles.map(s =>
    `<div class="style-row" data-search="${s.file}"><span class="dep-name">${s.file}</span><span class="dep-ver">${s.selectors} rules / ${s.customProperties} vars</span></div>`
  ).join('');

  document.getElementById('pagesList').innerHTML = manifest.pages.map(p =>
    `<div class="page-row" data-search="${p.file} ${p.title} ${p.slug}">
      <span class="dep-name">${p.title}</span>
      <span class="dep-ver">${p.slug} &nbsp;·&nbsp; ${p.sections}§ ${p.forms}f ${p.modals}m</span>
    </div>`
  ).join('');
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Tabs ────────────────────────────────────── */

function bindTabs() {
  document.querySelector('.docs-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.docs-tab');
    if (!tab) return;
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.docs-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.docs-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`panel-${activeTab}`).classList.add('active');
    // Clear search when switching tabs
    document.getElementById('docsSearch').value = '';
    clearSearch();
  });
}

/* ── Search ──────────────────────────────────── */

function bindSearch() {
  const input = document.getElementById('docsSearch');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { clearSearch(); return; }
    applySearch(q);
  });

  // Ctrl+K shortcut
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      input.focus();
      input.select();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      input.value = '';
      clearSearch();
      input.blur();
    }
  });
}

function applySearch(query) {
  const panel = document.getElementById(`panel-${activeTab}`);
  const searchables = panel.querySelectorAll('[data-search]');
  let visible = 0;

  searchables.forEach(el => {
    const text = el.dataset.search.toLowerCase();
    if (text.includes(query)) {
      el.classList.remove('search-hidden');
      visible++;
    } else {
      el.classList.add('search-hidden');
    }
  });

  // Also search table rows
  const rows = panel.querySelectorAll('tr[data-search]');
  rows.forEach(tr => {
    const text = tr.dataset.search.toLowerCase();
    if (text.includes(query)) {
      tr.classList.remove('search-hidden');
      visible++;
    } else {
      tr.classList.add('search-hidden');
    }
  });

  document.getElementById('searchCount').textContent =
    `${visible} result${visible !== 1 ? 's' : ''} for "${query}"`;
}

function clearSearch() {
  document.querySelectorAll('.search-hidden').forEach(el => el.classList.remove('search-hidden'));
  document.getElementById('searchCount').textContent = '';
}

/* ── Go ──────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  init();
});
