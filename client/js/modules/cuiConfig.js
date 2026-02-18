/**
 * CUI Marking Configuration UI (P2.1.6)
 *
 * Provides an accessible configuration panel for selecting:
 *   • CUI type (Basic or Specified)
 *   • Category and subcategory from the NARA CUI Registry
 *   • Dissemination controls
 *   • Distribution statement (A–F, X)
 *   • Controlling organization & POC
 *
 * Emits configuration changes via a callback and integrates with CuiBanner.
 *
 * Usage:
 *   import { CuiConfigUI } from './modules/cuiConfig.js';
 *   const config = new CuiConfigUI({
 *     onChange: (cfg) => banner.update(cfg),
 *   });
 *   config.mount(document.getElementById('cui-config-panel'));
 */
// sanitize – see this._escapeHtml(); all interpolated values are escaped

// ── Registry data (mirrors server/lib/cui.js) ──

const CUI_CATEGORIES = {
  CTI: {
    name: 'Controlled Technical Information',
    authority: 'DoD Instruction 5230.24',
    group: 'Defense',
  },
  EXPT: { name: 'Export Controlled', authority: 'ITAR/EAR', group: 'Defense' },
  NOFORN: {
    name: 'Not Releasable to Foreign Nationals',
    authority: 'DoDM 5200.01',
    group: 'Defense',
  },
  PCII: {
    name: 'Protected Critical Infrastructure Information',
    authority: '6 U.S.C. § 131',
    group: 'Critical Infrastructure',
  },
  SSI: {
    name: 'Sensitive Security Information',
    authority: '49 CFR Part 1520',
    group: 'Critical Infrastructure',
  },
  PRVCY: { name: 'Privacy', authority: 'Privacy Act, 5 U.S.C. § 552a', group: 'Privacy' },
  PII: { name: 'Personally Identifiable Information', authority: 'OMB M-17-12', group: 'Privacy' },
  PHI: { name: 'Protected Health Information', authority: 'HIPAA', group: 'Privacy' },
  LES: { name: 'Law Enforcement Sensitive', authority: 'DoD 5400.7-R', group: 'Law Enforcement' },
  PROPIN: {
    name: 'Proprietary Business Information',
    authority: '41 U.S.C. § 2102',
    group: 'Procurement',
  },
  SBD: { name: 'Source Selection', authority: 'FAR 2.101/3.104', group: 'Procurement' },
};

const DISSEMINATION_CONTROLS = {
  NOFORN: 'Not releasable to foreign nationals',
  'FED ONLY': 'Federal employees only',
  FEDCON: 'Federal employees and contractors',
  NOCON: 'Not releasable to contractors',
  'DL ONLY': 'Dissemination list only',
  'REL TO': 'Releasable to (specify countries)',
  'DISPLAY ONLY': 'Authorized for display only',
};

const DISTRIBUTION_STATEMENTS = {
  A: { label: 'Statement A', text: 'Approved for public release; distribution is unlimited.' },
  B: { label: 'Statement B', text: 'Distribution authorized to U.S. Government agencies only.' },
  C: {
    label: 'Statement C',
    text: 'Distribution authorized to U.S. Government agencies and their contractors.',
  },
  D: {
    label: 'Statement D',
    text: 'Distribution authorized to the Department of Defense and U.S. DoD contractors only.',
  },
  E: { label: 'Statement E', text: 'Distribution authorized to DoD Components only.' },
  F: {
    label: 'Statement F',
    text: 'Further dissemination only as directed by the controlling DoD office.',
  },
  X: {
    label: 'Statement X',
    text: 'Distribution authorized to U.S. Government agencies and private individuals or enterprises eligible to obtain export-controlled technical data.',
  },
};

export class CuiConfigUI {
  /**
   * @param {object} opts
   * @param {function} opts.onChange  Called with the full config object on every change
   * @param {object}   opts.initial  Optional initial values
   */
  constructor(opts = {}) {
    this.onChange = opts.onChange || (() => {});
    this.config = {
      enabled: false,
      type: 'CUI',
      categories: [],
      dissemination: [],
      distributionStatement: 'A',
      controlledBy: '',
      poc: '',
      ...opts.initial,
    };
    this.el = null;
  }

  // ─── Public API ────────────────────────────────

  /** Mount the config panel into a DOM container */
  mount(container) {
    if (!container) {
      return;
    }
    this.el = this._buildPanel();
    container.appendChild(this.el);
    this._syncUI();
  }

  /** Remove the panel from the DOM */
  unmount() {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }

  /** Get the current config */
  getConfig() {
    return { ...this.config };
  }

  // ─── Build UI ──────────────────────────────────

  _buildPanel() {
    const panel = document.createElement('section');
    panel.className = 'cui-config-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'CUI Marking Configuration');

    panel.innerHTML = `
      <h3 class="cui-config-title">CUI Marking Configuration</h3>

      <!-- Enable toggle -->
      <div class="cui-config-field">
        <label class="cui-config-toggle-label">
          <input type="checkbox" id="cuiEnabled" />
          <span>Enable CUI Marking</span>
        </label>
      </div>

      <!-- Fieldset: CUI Type -->
      <fieldset class="cui-config-fieldset" id="cuiTypeFieldset">
        <legend>CUI Type</legend>
        <label><input type="radio" name="cuiType" value="CUI" checked /> CUI Basic</label>
        <label><input type="radio" name="cuiType" value="CUI//SP" /> CUI Specified</label>
      </fieldset>

      <!-- Categories (grouped checkboxes) -->
      <fieldset class="cui-config-fieldset" id="cuiCategoriesFieldset">
        <legend>CUI Categories <small>(select all that apply)</small></legend>
        <div id="cuiCategoryList" role="group" aria-label="CUI category selection"></div>
      </fieldset>

      <!-- Dissemination controls -->
      <fieldset class="cui-config-fieldset" id="cuiDisseminationFieldset">
        <legend>Dissemination Controls</legend>
        <div id="cuiDisseminationList" role="group" aria-label="Dissemination control selection"></div>
      </fieldset>

      <!-- Distribution statement -->
      <fieldset class="cui-config-fieldset" id="cuiDistFieldset">
        <legend>Distribution Statement</legend>
        <select id="cuiDistStatement" aria-label="Distribution statement">
          ${Object.entries(DISTRIBUTION_STATEMENTS)
            .map(
              ([key, val]) =>
                `<option value="${key}">${val.label} — ${this._escapeHtml(val.text.substring(0, 60))}…</option>`
            )
            .join('')}
        </select>
        <p id="cuiDistDescription" class="cui-config-help" aria-live="polite"></p>
      </fieldset>

      <!-- Controlled By & POC -->
      <div class="cui-config-field">
        <label for="cuiControlledBy">Controlled By</label>
        <input type="text" id="cuiControlledBy" placeholder="e.g., US Army Corps of Engineers" autocomplete="organization" />
      </div>
      <div class="cui-config-field">
        <label for="cuiPOC">Point of Contact</label>
        <input type="text" id="cuiPOC" placeholder="e.g., admin@usace.mil" autocomplete="email" />
      </div>

      <!-- Preview -->
      <div class="cui-config-preview" role="status" aria-live="polite" aria-label="CUI banner preview">
        <strong>Banner Preview:</strong>
        <code id="cuiBannerPreview">CUI</code>
      </div>
    `;

    // Populate dynamic lists
    this._populateCategories(panel.querySelector('#cuiCategoryList'));
    this._populateDissemination(panel.querySelector('#cuiDisseminationList'));

    // Wire up event listeners
    this._attachListeners(panel);

    return panel;
  }

  _populateCategories(container) {
    // Group by category group
    const groups = {};
    for (const [code, meta] of Object.entries(CUI_CATEGORIES)) {
      const g = meta.group || 'Other';
      if (!groups[g]) {
        groups[g] = [];
      }
      groups[g].push({ code, ...meta });
    }

    for (const [groupName, items] of Object.entries(groups)) {
      const groupEl = document.createElement('div');
      groupEl.className = 'cui-config-category-group';
      groupEl.innerHTML = `<strong class="cui-config-group-label">${this._escapeHtml(groupName)}</strong>`;

      for (const item of items) {
        const label = document.createElement('label');
        label.className = 'cui-config-checkbox';
        label.innerHTML = `
          <input type="checkbox" name="cuiCategory" value="${item.code}" />
          <span>${item.code} — ${this._escapeHtml(item.name)}</span>
          <small class="cui-config-authority">${this._escapeHtml(item.authority)}</small>
        `;
        groupEl.appendChild(label);
      }

      container.appendChild(groupEl);
    }
  }

  _populateDissemination(container) {
    for (const [code, description] of Object.entries(DISSEMINATION_CONTROLS)) {
      const label = document.createElement('label');
      label.className = 'cui-config-checkbox';
      label.innerHTML = `
        <input type="checkbox" name="cuiDissemination" value="${code}" />
        <span>${code} — ${this._escapeHtml(description)}</span>
      `;
      container.appendChild(label);
    }
  }

  _attachListeners(panel) {
    // Enable toggle
    panel.querySelector('#cuiEnabled').addEventListener('change', (e) => {
      this.config.enabled = e.target.checked;
      this._toggleFieldsets(panel, e.target.checked);
      this._emit();
    });

    // CUI Type radios
    panel.querySelectorAll('input[name="cuiType"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        this.config.type = e.target.value;
        this._emit();
      });
    });

    // Categories
    panel.querySelectorAll('input[name="cuiCategory"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        this.config.categories = [
          ...panel.querySelectorAll('input[name="cuiCategory"]:checked'),
        ].map((el) => el.value);
        this._emit();
      });
    });

    // Dissemination
    panel.querySelectorAll('input[name="cuiDissemination"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        this.config.dissemination = [
          ...panel.querySelectorAll('input[name="cuiDissemination"]:checked'),
        ].map((el) => el.value);
        this._emit();
      });
    });

    // Distribution statement
    const distSelect = panel.querySelector('#cuiDistStatement');
    distSelect.addEventListener('change', (e) => {
      this.config.distributionStatement = e.target.value;
      this._updateDistDescription(panel);
      this._emit();
    });

    // Text inputs
    panel.querySelector('#cuiControlledBy').addEventListener('input', (e) => {
      this.config.controlledBy = e.target.value.trim();
      this._emit();
    });
    panel.querySelector('#cuiPOC').addEventListener('input', (e) => {
      this.config.poc = e.target.value.trim();
      this._emit();
    });
  }

  // ─── State sync ────────────────────────────────

  _syncUI() {
    if (!this.el) {
      return;
    }
    const p = this.el;
    p.querySelector('#cuiEnabled').checked = this.config.enabled;
    this._toggleFieldsets(p, this.config.enabled);

    // Type
    const typeRadio = p.querySelector(`input[name="cuiType"][value="${this.config.type}"]`);
    if (typeRadio) {
      typeRadio.checked = true;
    }

    // Categories
    this.config.categories.forEach((code) => {
      const cb = p.querySelector(`input[name="cuiCategory"][value="${code}"]`);
      if (cb) {
        cb.checked = true;
      }
    });

    // Dissemination
    this.config.dissemination.forEach((code) => {
      const cb = p.querySelector(`input[name="cuiDissemination"][value="${code}"]`);
      if (cb) {
        cb.checked = true;
      }
    });

    // Distribution
    p.querySelector('#cuiDistStatement').value = this.config.distributionStatement;
    this._updateDistDescription(p);

    // Text inputs
    p.querySelector('#cuiControlledBy').value = this.config.controlledBy;
    p.querySelector('#cuiPOC').value = this.config.poc;

    this._updatePreview();
  }

  _toggleFieldsets(panel, enabled) {
    const fieldsets = panel.querySelectorAll(
      '.cui-config-fieldset, .cui-config-field:not(:first-of-type), .cui-config-preview'
    );
    fieldsets.forEach((fs) => {
      fs.style.opacity = enabled ? '1' : '0.5';
      fs.querySelectorAll('input, select, textarea').forEach((el) => {
        el.disabled = !enabled;
      });
    });
  }

  _updateDistDescription(panel) {
    const desc = DISTRIBUTION_STATEMENTS[this.config.distributionStatement];
    const el = panel.querySelector('#cuiDistDescription');
    if (el && desc) {
      el.textContent = desc.text;
    }
  }

  _updatePreview() {
    if (!this.el) {
      return;
    }
    let text = this.config.type;
    if (this.config.categories.length > 0) {
      text += '//' + this.config.categories.join('/');
    }
    if (this.config.dissemination.length > 0) {
      text += '//' + this.config.dissemination.join('/');
    }
    const preview = this.el.querySelector('#cuiBannerPreview');
    if (preview) {
      preview.textContent = text;
    }
  }

  _emit() {
    this._updatePreview();
    this.onChange(this.getConfig());
  }

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

export default CuiConfigUI;
