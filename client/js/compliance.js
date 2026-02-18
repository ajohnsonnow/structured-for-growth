/**
 * Compliance Knowledge Base - SFG Integration Module
 * Fetches framework data from the /api/compliance endpoints and renders
 * the compliance knowledge base page within the SFG site.
 */

import { escapeHTML } from './modules/sanitize.js';
import { initUnifiedNav } from './modules/unifiedNav.js';

// ── Template Registry ──────────────────────────────────────
const COMPLIANCE_TEMPLATES = [
  {
    id: 'irp',
    title: 'Incident Response Plan',
    cat: 'policies',
    icon: '🚨',
    frameworks: ['SOC 2', 'ISO 27001', 'HIPAA', 'GDPR', 'DORA'],
    lang: 'Markdown',
    desc: 'Comprehensive IRP with severity matrix, regulatory notification timelines, communication templates.',
  },
  {
    id: 'aup',
    title: 'Acceptable Use Policy',
    cat: 'policies',
    icon: '📋',
    frameworks: ['SOC 2', 'ISO 27001', 'PCI DSS'],
    lang: 'Markdown',
    desc: 'General use, email, internet, mobile, remote work, prohibited activities.',
  },
  {
    id: 'amp',
    title: 'Access Management Policy',
    cat: 'policies',
    icon: '🔑',
    frameworks: ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI DSS'],
    lang: 'Markdown',
    desc: 'Joiner/Mover/Leaver lifecycle, authentication requirements, access reviews.',
  },
  {
    id: 'dcp',
    title: 'Data Classification Policy',
    cat: 'policies',
    icon: '🏷️',
    frameworks: ['SOC 2', 'ISO 27001', 'HIPAA', 'GDPR'],
    lang: 'Markdown',
    desc: 'Four-level classification with handling requirements matrix.',
  },
  {
    id: 'pwd',
    title: 'Password & Auth Policy',
    cat: 'policies',
    icon: '🔐',
    frameworks: ['SOC 2', 'PCI DSS', 'CMMC'],
    lang: 'Markdown',
    desc: '14-char min, MFA mandate, FIDO2 preferred, SMS prohibited.',
  },
  {
    id: 'drp',
    title: 'Disaster Recovery Plan',
    cat: 'policies',
    icon: '🔄',
    frameworks: ['SOC 2', 'ISO 27001', 'HIPAA', 'DORA'],
    lang: 'Markdown',
    desc: 'Four-tier RTO/RPO matrix, backup strategy, testing schedule.',
  },
  {
    id: 'vmp',
    title: 'Vendor Management Policy',
    cat: 'policies',
    icon: '🤝',
    frameworks: ['SOC 2', 'ISO 27001', 'GDPR', 'DORA'],
    lang: 'Markdown',
    desc: 'Four-tier risk classification, assessment questionnaire, offboarding.',
  },
  {
    id: 'cmp',
    title: 'Change Management Policy',
    cat: 'policies',
    icon: '🔧',
    frameworks: ['SOC 2', 'ISO 27001', 'PCI DSS'],
    lang: 'Markdown',
    desc: 'Standard/Normal/Emergency categories, review requirements, rollback.',
  },
  {
    id: 'drtp',
    title: 'Data Retention Policy',
    cat: 'policies',
    icon: '🗄️',
    frameworks: ['SOC 2', 'GDPR', 'HIPAA', 'PCI DSS'],
    lang: 'Markdown',
    desc: 'Retention schedule, disposal methods, GDPR erasure process.',
  },
  {
    id: 'enc',
    title: 'Encryption Policy',
    cat: 'policies',
    icon: '🔒',
    frameworks: ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI DSS'],
    lang: 'Markdown',
    desc: 'AES-256-GCM, Argon2id approved; MD5, SHA-1 prohibited; TLS 1.2+.',
  },
  {
    id: 'mfa',
    title: 'MFA Middleware',
    cat: 'application',
    icon: '🛡️',
    frameworks: ['SOC 2', 'PCI DSS', 'HIPAA'],
    lang: 'JavaScript',
    desc: 'TOTP + WebAuthn, recovery codes, rate limiting, Express middleware.',
  },
  {
    id: 'audit',
    title: 'Audit Logger',
    cat: 'application',
    icon: '📝',
    frameworks: ['SOC 2', 'PCI DSS', 'HIPAA'],
    lang: 'JavaScript',
    desc: 'Chain-hashed tamper-evident audit trail, PII masking, Express middleware.',
  },
  {
    id: 'encr',
    title: 'Encryption at Rest',
    cat: 'application',
    icon: '🔐',
    frameworks: ['HIPAA', 'PCI DSS', 'GDPR'],
    lang: 'JavaScript',
    desc: 'AES-256-GCM with key rotation, Mongoose plugin for auto-encryption.',
  },
  {
    id: 'mask',
    title: 'Data Masking',
    cat: 'application',
    icon: '🎭',
    frameworks: ['HIPAA', 'PCI DSS', 'GDPR'],
    lang: 'JavaScript',
    desc: '8 masking strategies, PAN masking, HIPAA Safe Harbor, tokenization.',
  },
  {
    id: 'rbac',
    title: 'RBAC Middleware',
    cat: 'application',
    icon: '👥',
    frameworks: ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI DSS'],
    lang: 'JavaScript',
    desc: 'Hierarchical roles, deny-override, ownership checks, permission cache.',
  },
  {
    id: 'phi',
    title: 'HIPAA PHI Filter',
    cat: 'application',
    icon: '🏥',
    frameworks: ['HIPAA'],
    lang: 'JavaScript',
    desc: 'All 18 Safe Harbor identifiers, role-based PHI access profiles.',
  },
  {
    id: 'consent',
    title: 'GDPR Consent Manager',
    cat: 'application',
    icon: '✅',
    frameworks: ['GDPR'],
    lang: 'JavaScript',
    desc: 'Per-purpose consent, DSR workflow (Art. 15-21), Kantara receipts.',
  },
  {
    id: 'card',
    title: 'PCI Card Sanitizer',
    cat: 'application',
    icon: '💳',
    frameworks: ['PCI DSS'],
    lang: 'JavaScript',
    desc: 'Luhn validation, 7 card brands, PCI 3.3 masking, PAN scrubbing.',
  },
  {
    id: 'breach',
    title: 'Breach Notification',
    cat: 'application',
    icon: '📢',
    frameworks: ['GDPR', 'HIPAA', 'DORA', 'NIS 2'],
    lang: 'JavaScript',
    desc: 'Multi-framework deadlines, severity classification, notification templates.',
  },
  {
    id: 'sess',
    title: 'Session Timeout',
    cat: 'application',
    icon: '⏱️',
    frameworks: ['PCI DSS', 'HIPAA'],
    lang: 'JavaScript',
    desc: 'Idle + absolute timeouts, per-role overrides, PCI 8.2.8 compliant.',
  },
  {
    id: 's3',
    title: 'AWS S3 Encrypted',
    cat: 'infrastructure',
    icon: '☁️',
    frameworks: ['SOC 2', 'HIPAA', 'PCI DSS'],
    lang: 'Terraform',
    desc: 'KMS CMK auto-rotation, versioning, public access block, TLS-only.',
  },
  {
    id: 'trail',
    title: 'AWS CloudTrail',
    cat: 'infrastructure',
    icon: '📊',
    frameworks: ['SOC 2', 'PCI DSS', 'CMMC'],
    lang: 'Terraform',
    desc: 'Multi-region, KMS encryption, CIS Benchmark alarms, SNS alerts.',
  },
  {
    id: 'azstor',
    title: 'Azure Storage',
    cat: 'infrastructure',
    icon: '☁️',
    frameworks: ['SOC 2', 'ISO 27001', 'GDPR'],
    lang: 'ARM/JSON',
    desc: 'Double encryption, GRS, TLS 1.2, OAuth-only, diagnostics.',
  },
  {
    id: 'k8snet',
    title: 'K8s Network Policy',
    cat: 'infrastructure',
    icon: '🌐',
    frameworks: ['SOC 2', 'PCI DSS'],
    lang: 'YAML',
    desc: 'Default-deny, zero-trust microsegmentation, tiered access.',
  },
  {
    id: 'k8spod',
    title: 'K8s Pod Security',
    cat: 'infrastructure',
    icon: '🔒',
    frameworks: ['SOC 2', 'PCI DSS', 'CMMC'],
    lang: 'YAML',
    desc: 'Restricted PSS, non-root, read-only rootfs, seccomp, quotas.',
  },
  {
    id: 'docker',
    title: 'Hardened Dockerfile',
    cat: 'infrastructure',
    icon: '🐳',
    frameworks: ['SOC 2', 'PCI DSS'],
    lang: 'Dockerfile',
    desc: 'Multi-stage, distroless, non-root, dumb-init PID 1, HEALTHCHECK.',
  },
  {
    id: 'cl-soc2',
    title: 'SOC 2 Type II Checklist',
    cat: 'checklists',
    icon: '✔️',
    frameworks: ['SOC 2'],
    lang: 'Markdown',
    desc: '10 sections, ~90 control items, evidence packaging guide.',
  },
  {
    id: 'cl-iso',
    title: 'ISO 27001 Cert Checklist',
    cat: 'checklists',
    icon: '✔️',
    frameworks: ['ISO 27001'],
    lang: 'Markdown',
    desc: 'Stage 1 + Stage 2, 93 Annex A controls, mandatory docs checklist.',
  },
  {
    id: 'cl-hipaa',
    title: 'HIPAA Readiness Checklist',
    cat: 'checklists',
    icon: '✔️',
    frameworks: ['HIPAA'],
    lang: 'Markdown',
    desc: 'Admin/Physical/Technical Safeguards, Breach Notification, OCR prep.',
  },
  {
    id: 'cl-gdpr',
    title: 'GDPR Compliance Checklist',
    cat: 'checklists',
    icon: '✔️',
    frameworks: ['GDPR'],
    lang: 'Markdown',
    desc: '11 sections: lawful basis, DSR, DPIA, DPO, transfers, breaches.',
  },
  {
    id: 'cl-pci',
    title: 'PCI DSS SAQ Checklist',
    cat: 'checklists',
    icon: '✔️',
    frameworks: ['PCI DSS'],
    lang: 'Markdown',
    desc: 'All 12 requirements, future-dated items flagged, SAQ evidence matrix.',
  },
];

const FRAMEWORK_LABELS = {
  soc2: 'SOC 2',
  iso27001: 'ISO 27001',
  hipaa: 'HIPAA',
  gdpr: 'GDPR',
  'pci-dss': 'PCI DSS',
  dora: 'DORA',
  nis2: 'NIS 2',
  cmmc: 'CMMC',
  'nist-ai-rmf': 'AI RMF',
  iso42001: 'ISO 42001',
};

let frameworks = [];
let crossMapData = null;
let currentTemplateCategory = 'all';

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initUnifiedNav();
  setupTabs();
  setupSearch();
  setupTemplateCategories();
  setupModal();
  loadFrameworks();
  loadCrossMap();
  loadEvidence();
  loadOSCAL();
  renderTemplates(COMPLIANCE_TEMPLATES);
});

// ── Tabs ───────────────────────────────────────────────────
function setupTabs() {
  const tabsEl = document.getElementById('complianceTabs');
  if (!tabsEl) {
    return;
  }
  tabsEl.addEventListener('click', (e) => {
    const tab = e.target.closest('.compliance-tab');
    if (!tab) {
      return;
    }
    tabsEl.querySelectorAll('.compliance-tab').forEach((t) => t.classList.remove('active'));
    document
      .querySelectorAll('.compliance-tab-content')
      .forEach((tc) => tc.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${tab.dataset.tab}`)?.classList.add('active');
  });
}

// ── Search ─────────────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('complianceSearch');
  if (!input) {
    return;
  }
  input.addEventListener('input', () => {
    const query = input.value.toLowerCase();
    // Filter frameworks
    const filteredFw = frameworks.filter((fw) => {
      const haystack = [
        fw.name,
        fw.fullName,
        fw.description,
        fw.jurisdiction,
        ...(fw.tags || []),
        ...(fw.domains || []).map((d) => d.name),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
    renderFrameworkGrid(filteredFw);

    // Filter templates
    const filteredTmpl = COMPLIANCE_TEMPLATES.filter((t) => {
      if (currentTemplateCategory !== 'all' && t.cat !== currentTemplateCategory) {
        return false;
      }
      return [t.title, t.desc, t.lang, ...t.frameworks].join(' ').toLowerCase().includes(query);
    });
    renderTemplates(filteredTmpl);
  });
}

// ── Load Frameworks ────────────────────────────────────────
async function loadFrameworks() {
  try {
    const res = await fetch('/api/compliance/frameworks');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    frameworks = data.frameworks || [];
    renderStats(frameworks);
    renderFrameworkGrid(frameworks);
  } catch (_err) {
    // Fallback: try loading JSON files directly
    const grid = document.getElementById('frameworksGrid');
    grid.innerHTML = `<div class="loading-container" style="grid-column:1/-1;"><p style="color:var(--text-muted);">API unavailable. The compliance API requires the server to be running.</p></div>`;
  }
}

// ── Render Stats ───────────────────────────────────────────
function renderStats(fws) {
  const totalControls = fws.reduce(
    (sum, fw) => sum + (fw.domains || []).reduce((s, d) => s + (d.controls || []).length, 0),
    0
  );
  const el = document.getElementById('complianceStats');
  if (!el) {
    return;
  }
  el.innerHTML = `
    <div class="compliance-stat"><span class="compliance-stat-value">${fws.length}</span><span class="compliance-stat-label">Frameworks</span></div>
    <div class="compliance-stat"><span class="compliance-stat-value">${totalControls}</span><span class="compliance-stat-label">Controls</span></div>
    <div class="compliance-stat"><span class="compliance-stat-value">${COMPLIANCE_TEMPLATES.length}</span><span class="compliance-stat-label">Templates</span></div>
    <div class="compliance-stat"><span class="compliance-stat-value">12</span><span class="compliance-stat-label">Cross-Mappings</span></div>
  `;
}

// ── Render Framework Grid ──────────────────────────────────
function renderFrameworkGrid(fws) {
  const grid = document.getElementById('frameworksGrid');
  if (!fws.length) {
    grid.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No frameworks match your search.</p>';
    return;
  }
  grid.innerHTML = fws
    .map((fw) => {
      const controlCount = (fw.domains || []).reduce((s, d) => s + (d.controls || []).length, 0);
      const domainCount = (fw.domains || []).length;
      const desc = fw.description ? fw.description.substring(0, 120) + '...' : '';
      return `
      <div class="compliance-card" data-fw-id="${escapeHTML(fw.id)}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <span class="compliance-card-title">${escapeHTML(fw.name)}</span>
          <span class="compliance-badge-neutral" style="font-size:0.7rem;">${escapeHTML(fw.version || '')}</span>
        </div>
        <div class="compliance-card-subtitle">${escapeHTML(fw.fullName || '')}</div>
        <div class="compliance-card-desc">${escapeHTML(desc)}</div>
        <div class="compliance-card-badges">
          <span class="compliance-badge">${escapeHTML(fw.jurisdiction || 'Global')}</span>
          ${(fw.tags || [])
            .slice(0, 3)
            .map((t) => `<span class="compliance-badge-neutral">${escapeHTML(t)}</span>`)
            .join('')}
        </div>
        <div class="compliance-card-stats">
          <div class="compliance-card-stat"><span class="compliance-card-stat-value">${domainCount}</span><span class="compliance-card-stat-label">Domains</span></div>
          <div class="compliance-card-stat"><span class="compliance-card-stat-value">${controlCount}</span><span class="compliance-card-stat-label">Controls</span></div>
          <div class="compliance-card-stat"><span class="compliance-card-stat-value">${escapeHTML(fw.certificationDetails?.auditCycle || '-')}</span><span class="compliance-card-stat-label">Cycle</span></div>
        </div>
      </div>`;
    })
    .join('');

  grid.querySelectorAll('.compliance-card[data-fw-id]').forEach((card) => {
    card.addEventListener('click', () => {
      const fw = frameworks.find((f) => f.id === card.dataset.fwId);
      if (fw) {
        showFrameworkModal(fw);
      }
    });
  });
}

// ── Framework Modal ────────────────────────────────────────
function showFrameworkModal(fw) {
  document.getElementById('modalTitle').textContent = fw.name;
  const body = document.getElementById('modalBody');
  const totalControls = (fw.domains || []).reduce((s, d) => s + (d.controls || []).length, 0);

  const domainRows = (fw.domains || [])
    .map((d) => {
      const controls = d.controls || [];
      return `
      <tr>
        <td style="font-weight:600;">${escapeHTML(d.name)}</td>
        <td>${controls.length}</td>
        <td>${controls
          .slice(0, 4)
          .map((c) => escapeHTML(c.id))
          .join(', ')}${controls.length > 4 ? '...' : ''}</td>
      </tr>`;
    })
    .join('');

  body.innerHTML = `
    <p style="color:var(--text-secondary);margin-bottom:var(--spacing-md);">${escapeHTML(fw.description || '')}</p>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:var(--spacing-md);">
      <span class="compliance-badge">${escapeHTML(fw.version || '')}</span>
      <span class="compliance-badge">${escapeHTML(fw.jurisdiction || '')}</span>
      <span class="compliance-badge-accent" style="padding:2px 8px;border-radius:var(--radius-sm);font-size:0.7rem;">${escapeHTML(fw.governingBody || '')}</span>
    </div>
    <h4 style="margin-bottom:var(--spacing-xs);color:var(--forest-green-accent);">Domains & Controls (${totalControls} total)</h4>
    <table class="data-table" style="margin-bottom:var(--spacing-md);">
      <thead><tr><th>Domain</th><th>Controls</th><th>Key IDs</th></tr></thead>
      <tbody>${domainRows}</tbody>
    </table>
    ${
      fw.certificationDetails
        ? `
      <h4 style="margin-bottom:var(--spacing-xs);color:var(--forest-green-accent);">Certification</h4>
      <table class="data-table">
        <tbody>
          <tr><td style="font-weight:600;width:140px;">Type</td><td>${escapeHTML(fw.certificationDetails.type || '-')}</td></tr>
          <tr><td style="font-weight:600;">Assessor</td><td>${escapeHTML(fw.certificationDetails.assessor || '-')}</td></tr>
          <tr><td style="font-weight:600;">Typical Cost</td><td>${escapeHTML(fw.certificationDetails.typicalCost || '-')}</td></tr>
          <tr><td style="font-weight:600;">Cycle</td><td>${escapeHTML(fw.certificationDetails.auditCycle || '-')}</td></tr>
        </tbody>
      </table>
    `
        : ''
    }
  `;

  document.getElementById('detailModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

// ── Template Categories ────────────────────────────────────
function setupTemplateCategories() {
  const nav = document.getElementById('templateCategories');
  if (!nav) {
    return;
  }
  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.cat-btn');
    if (!btn) {
      return;
    }
    nav.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentTemplateCategory = btn.dataset.category;
    const query = (document.getElementById('complianceSearch')?.value || '').toLowerCase();
    let filtered = COMPLIANCE_TEMPLATES;
    if (currentTemplateCategory !== 'all') {
      filtered = filtered.filter((t) => t.cat === currentTemplateCategory);
    }
    if (query) {
      filtered = filtered.filter((t) =>
        [t.title, t.desc, t.lang, ...t.frameworks].join(' ').toLowerCase().includes(query)
      );
    }
    renderTemplates(filtered);
  });
}

// ── Render Templates ───────────────────────────────────────
function renderTemplates(list) {
  const grid = document.getElementById('templatesGrid');
  if (!grid) {
    return;
  }
  if (!list.length) {
    grid.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No templates match your filters.</p>';
    return;
  }
  grid.innerHTML = list
    .map(
      (t) => `
    <div class="compliance-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span class="compliance-card-title">${t.title}</span>
        <span style="font-size:1.3rem;">${t.icon}</span>
      </div>
      <div class="compliance-card-desc">${t.desc}</div>
      <div class="compliance-card-badges">
        ${t.frameworks.map((f) => `<span class="compliance-badge">${f}</span>`).join('')}
        <span class="compliance-badge-accent" style="padding:2px 8px;border-radius:var(--radius-sm);font-size:0.7rem;">${t.lang}</span>
      </div>
    </div>
  `
    )
    .join('');
}

// ── Load Cross-Map ─────────────────────────────────────────
async function loadCrossMap() {
  try {
    const res = await fetch('/api/compliance/crossmap');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    crossMapData = await res.json();
    renderCrossMap(crossMapData.mappings || []);
  } catch {
    document.getElementById('crossmapMatrix').innerHTML =
      '<p style="color:var(--text-muted);text-align:center;">Cross-map data requires the API server.</p>';
  }
}

// ── Render Cross-Map Matrix ────────────────────────────────
function renderCrossMap(mappings) {
  const container = document.getElementById('crossmapMatrix');
  const keys = Object.keys(FRAMEWORK_LABELS);
  const headers = keys.map((k) => `<th>${FRAMEWORK_LABELS[k]}</th>`).join('');
  const rows = mappings
    .map((m) => {
      const cells = keys
        .map((k) => {
          const fw = m.frameworks?.[k];
          if (!fw || !fw.controls?.length) {
            return '<td class="cm-no">-</td>';
          }
          return `<td class="cm-yes">${escapeHTML(fw.controls.join(', '))}</td>`;
        })
        .join('');
      return `<tr><td>${escapeHTML(m.controlObjective)}<br><span style="font-size:0.65rem;color:var(--text-muted);">${escapeHTML(m.category || '')}</span></td>${cells}</tr>`;
    })
    .join('');

  container.innerHTML = `
    <table class="compliance-matrix">
      <thead><tr><th>Control Objective</th>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ── Modal ──────────────────────────────────────────────────
function setupModal() {
  const overlay = document.getElementById('detailModal');
  const closeBtn = document.getElementById('modalClose');
  const closeModal = () => {
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  };
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// ── Evidence Dashboard ─────────────────────────────────────
let evidenceData = [];

async function loadEvidence() {
  const grid = document.getElementById('evidenceGrid');
  const filterNav = document.getElementById('evidenceFilter');
  if (!grid) {
    return;
  }

  try {
    const res = await fetch('/api/compliance/evidence');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    evidenceData = data.evidence || [];

    // Populate framework filter buttons
    const fwIds = [...new Set(evidenceData.map((e) => e.frameworkId))].sort();
    if (filterNav) {
      const buttons = fwIds
        .map((id) => {
          const name = evidenceData.find((e) => e.frameworkId === id)?.frameworkName || id;
          return `<button class="cat-btn" data-framework="${escapeHTML(id)}">${escapeHTML(name)}</button>`;
        })
        .join('');
      filterNav.innerHTML = `<button class="cat-btn active" data-framework="all">All Frameworks</button>${buttons}`;

      filterNav.addEventListener('click', (e) => {
        const btn = e.target.closest('.cat-btn');
        if (!btn) {
          return;
        }
        filterNav.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const fw = btn.dataset.framework;
        const filtered =
          fw === 'all' ? evidenceData : evidenceData.filter((ev) => ev.frameworkId === fw);
        renderEvidence(filtered);
      });
    }

    renderEvidence(evidenceData);
  } catch {
    grid.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">Evidence data requires the API server.</p>';
  }
}

function renderEvidence(list) {
  const grid = document.getElementById('evidenceGrid');
  if (!grid) {
    return;
  }
  if (!list.length) {
    grid.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">No evidence items match your filter.</p>';
    return;
  }

  grid.innerHTML = list
    .map(
      (ev) => `
    <div class="compliance-card">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span class="compliance-card-title" style="font-size:0.85rem;">${escapeHTML(ev.controlId)}</span>
        <span class="compliance-badge">${escapeHTML(ev.frameworkName)}</span>
      </div>
      <div class="compliance-card-subtitle">${escapeHTML(ev.controlName)}</div>
      <div class="compliance-card-desc" style="font-size:0.8rem;">${escapeHTML(ev.domain)}</div>
      <div style="margin-top:0.5rem;">
        ${ev.evidenceRequired.map((e) => `<div style="font-size:0.75rem;color:var(--text-secondary);padding:2px 0;">☐ ${escapeHTML(e)}</div>`).join('')}
      </div>
      <div style="margin-top:0.5rem;">
        <span class="compliance-badge-neutral" style="font-size:0.65rem;">${escapeHTML(ev.automationCapability)}</span>
      </div>
    </div>
  `
    )
    .join('');
}

// ── OSCAL Catalogs ─────────────────────────────────────────
async function loadOSCAL() {
  const grid = document.getElementById('oscalGrid');
  if (!grid) {
    return;
  }

  try {
    const res = await fetch('/api/compliance/oscal');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const catalogs = data.catalogs || [];

    grid.innerHTML = catalogs
      .map(
        (cat) => `
      <div class="compliance-card">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span class="compliance-card-title">${escapeHTML(cat.id.toUpperCase())}</span>
          <span style="font-size:1.3rem;">📄</span>
        </div>
        <div class="compliance-card-desc">NIST OSCAL 1.1.2 catalog for ${escapeHTML(cat.id)}. Machine-readable JSON format compatible with GRC tools and SIEM platforms.</div>
        <div style="margin-top:0.75rem;">
          <a href="${escapeHTML(cat.downloadUrl)}" target="_blank" class="compliance-badge-accent"
             style="padding:4px 12px;border-radius:var(--radius-sm);font-size:0.75rem;text-decoration:none;cursor:pointer;">
            ⬇ Download JSON
          </a>
        </div>
      </div>
    `
      )
      .join('');
  } catch {
    grid.innerHTML =
      '<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;">OSCAL data requires the API server.</p>';
  }
}
