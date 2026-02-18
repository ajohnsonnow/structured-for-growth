// @vitest-environment jsdom
/**
 * CUI Config UI Module Tests
 * Tests the configuration panel: mount, form binding, change callback, preview.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let CuiConfigUI;

describe('CUI Config UI Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    document.body.innerHTML = '<div id="panel"></div>';
    document.head.innerHTML = '';

    const mod = await import('../../client/js/modules/cuiConfig.js');
    CuiConfigUI = mod.CuiConfigUI || mod.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Mount / unmount ──
  it('should mount the config panel into a container', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    expect(document.querySelector('.cui-config-panel')).toBeTruthy();
    expect(document.querySelector('#cuiEnabled')).toBeTruthy();
    expect(document.querySelector('#cuiDistStatement')).toBeTruthy();
  });

  it('should not throw when mounting with null container', () => {
    const ui = new CuiConfigUI();
    expect(() => ui.mount(null)).not.toThrow();
  });

  it('should unmount cleanly', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));
    expect(document.querySelector('.cui-config-panel')).toBeTruthy();

    ui.unmount();
    expect(document.querySelector('.cui-config-panel')).toBeNull();
  });

  // ── Default config ──
  it('should start with default config', () => {
    const ui = new CuiConfigUI();
    const cfg = ui.getConfig();

    expect(cfg.enabled).toBe(false);
    expect(cfg.type).toBe('CUI');
    expect(cfg.categories).toEqual([]);
    expect(cfg.dissemination).toEqual([]);
    expect(cfg.distributionStatement).toBe('A');
    expect(cfg.controlledBy).toBe('');
    expect(cfg.poc).toBe('');
  });

  it('should accept initial config', () => {
    const ui = new CuiConfigUI({
      initial: { enabled: true, type: 'CUI//SP', categories: ['CTI'] },
    });
    const cfg = ui.getConfig();

    expect(cfg.enabled).toBe(true);
    expect(cfg.type).toBe('CUI//SP');
    expect(cfg.categories).toEqual(['CTI']);
  });

  // ── Enable toggle ──
  it('should toggle enabled state and call onChange', () => {
    const spy = vi.fn();
    const ui = new CuiConfigUI({ onChange: spy });
    ui.mount(document.getElementById('panel'));

    const checkbox = document.querySelector('#cuiEnabled');
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].enabled).toBe(true);
  });

  // ── CUI Type ──
  it('should update CUI type via radio buttons', () => {
    const spy = vi.fn();
    const ui = new CuiConfigUI({ onChange: spy });
    ui.mount(document.getElementById('panel'));

    const specified = document.querySelector('input[name="cuiType"][value="CUI//SP"]');
    specified.checked = true;
    specified.dispatchEvent(new Event('change', { bubbles: true }));

    expect(spy).toHaveBeenCalled();
    expect(ui.getConfig().type).toBe('CUI//SP');
  });

  // ── Categories ──
  it('should populate all category groups', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    const groups = document.querySelectorAll('.cui-config-category-group');
    expect(groups.length).toBeGreaterThanOrEqual(4); // Defense, Privacy, Critical Infra, etc.

    const checkboxes = document.querySelectorAll('input[name="cuiCategory"]');
    expect(checkboxes.length).toBe(11); // 11 categories
  });

  it('should update categories on checkbox change', () => {
    const spy = vi.fn();
    const ui = new CuiConfigUI({ onChange: spy });
    ui.mount(document.getElementById('panel'));

    const ctiCheckbox = document.querySelector('input[name="cuiCategory"][value="CTI"]');
    ctiCheckbox.checked = true;
    ctiCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(ui.getConfig().categories).toEqual(['CTI']);

    const exptCheckbox = document.querySelector('input[name="cuiCategory"][value="EXPT"]');
    exptCheckbox.checked = true;
    exptCheckbox.dispatchEvent(new Event('change', { bubbles: true }));

    expect(ui.getConfig().categories).toEqual(['CTI', 'EXPT']);
  });

  // ── Dissemination controls ──
  it('should populate all dissemination controls', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    const checkboxes = document.querySelectorAll('input[name="cuiDissemination"]');
    expect(checkboxes.length).toBe(7);
  });

  it('should update dissemination controls on change', () => {
    const spy = vi.fn();
    const ui = new CuiConfigUI({ onChange: spy });
    ui.mount(document.getElementById('panel'));

    const cb = document.querySelector('input[name="cuiDissemination"][value="NOFORN"]');
    cb.checked = true;
    cb.dispatchEvent(new Event('change', { bubbles: true }));

    expect(ui.getConfig().dissemination).toEqual(['NOFORN']);
  });

  // ── Distribution statement ──
  it('should have all 7 distribution statement options', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    const options = document.querySelectorAll('#cuiDistStatement option');
    expect(options.length).toBe(7);
  });

  it('should update distribution statement and show description', () => {
    const spy = vi.fn();
    const ui = new CuiConfigUI({ onChange: spy });
    ui.mount(document.getElementById('panel'));

    const select = document.querySelector('#cuiDistStatement');
    select.value = 'D';
    select.dispatchEvent(new Event('change', { bubbles: true }));

    expect(ui.getConfig().distributionStatement).toBe('D');

    const desc = document.querySelector('#cuiDistDescription');
    expect(desc.textContent).toContain('Department of Defense');
  });

  // ── Text inputs ──
  it('should update controlledBy and poc on input', () => {
    const spy = vi.fn();
    const ui = new CuiConfigUI({ onChange: spy });
    ui.mount(document.getElementById('panel'));

    const ctrlInput = document.querySelector('#cuiControlledBy');
    ctrlInput.value = 'USACE';
    ctrlInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(ui.getConfig().controlledBy).toBe('USACE');

    const pocInput = document.querySelector('#cuiPOC');
    pocInput.value = 'admin@usace.mil';
    pocInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(ui.getConfig().poc).toBe('admin@usace.mil');
  });

  // ── Preview ──
  it('should show banner preview with categories and dissemination', () => {
    const ui = new CuiConfigUI({
      initial: { type: 'CUI//SP', categories: ['CTI'], dissemination: ['NOFORN'] },
    });
    ui.mount(document.getElementById('panel'));

    const preview = document.querySelector('#cuiBannerPreview');
    expect(preview.textContent).toBe('CUI//SP//CTI//NOFORN');
  });

  it('should update preview when config changes', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    // Enable and check CTI
    document.querySelector('#cuiEnabled').checked = true;
    document.querySelector('#cuiEnabled').dispatchEvent(new Event('change'));

    const cb = document.querySelector('input[name="cuiCategory"][value="CTI"]');
    cb.checked = true;
    cb.dispatchEvent(new Event('change'));

    const preview = document.querySelector('#cuiBannerPreview');
    expect(preview.textContent).toBe('CUI//CTI');
  });

  // ── ARIA ──
  it('should have proper ARIA attributes for accessibility', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    const panel = document.querySelector('.cui-config-panel');
    expect(panel.getAttribute('role')).toBe('region');
    expect(panel.getAttribute('aria-label')).toBe('CUI Marking Configuration');

    const preview = document.querySelector('.cui-config-preview');
    expect(preview.getAttribute('aria-live')).toBe('polite');
  });

  // ── Fieldset disabled state ──
  it('should disable all fields when CUI is not enabled', () => {
    const ui = new CuiConfigUI();
    ui.mount(document.getElementById('panel'));

    // CUI is off by default — fieldsets should be dimmed
    const fieldsets = document.querySelectorAll('.cui-config-fieldset');
    fieldsets.forEach((fs) => {
      expect(fs.style.opacity).toBe('0.5');
    });
  });
});
