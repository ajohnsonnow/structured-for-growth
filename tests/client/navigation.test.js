// @vitest-environment jsdom
/**
 * Navigation Module Tests
 * Tests the responsive nav menu: open/close, ARIA states, keyboard handling, resize behavior.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// We need to dynamically import the module after setting up the DOM
let initNavigation;

function setupDOM() {
  document.body.innerHTML = `
    <nav class="navbar">
      <button class="mobile-menu-toggle" aria-label="Toggle menu">☰</button>
      <ul class="nav-menu">
        <li><a href="#about" class="nav-link">About</a></li>
        <li><a href="#services" class="nav-link">Services</a></li>
        <li><a href="/contact" class="nav-link nav-highlight">Contact</a></li>
      </ul>
    </nav>
    <section id="about"><h2>About</h2></section>
    <section id="services"><h2>Services</h2></section>
  `;
}

describe('Navigation Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    setupDOM();

    // Stub matchMedia (jsdom doesn't support it)
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    // Stub scrollIntoView (jsdom doesn't implement it)
    Element.prototype.scrollIntoView = vi.fn();

    // Make innerWidth simulate mobile
    Object.defineProperty(window, 'innerWidth', { value: 500, writable: true, configurable: true });

    const mod = await import('../../client/js/modules/navigation.js');
    initNavigation = mod.initNavigation;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return early if nav-menu or toggle is missing', () => {
    document.body.innerHTML = '<div>No nav here</div>';
    // Should not throw
    expect(() => initNavigation()).not.toThrow();
  });

  it('should create a backdrop element', () => {
    initNavigation();
    const backdrop = document.querySelector('.nav-backdrop');
    expect(backdrop).toBeTruthy();
    expect(backdrop.getAttribute('aria-hidden')).toBe('true');
  });

  it('should set initial ARIA attributes on toggle and menu', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe('nav-menu');
    expect(menu.getAttribute('role')).toBe('navigation');
    expect(menu.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should open menu on toggle click and set ARIA expanded', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');

    toggle.click();

    expect(menu.classList.contains('active')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(menu.getAttribute('aria-hidden')).toBe('false');
    expect(document.body.classList.contains('nav-open')).toBe(true);
  });

  it('should close menu on second toggle click', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');

    toggle.click(); // open
    toggle.click(); // close

    expect(menu.classList.contains('active')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(menu.getAttribute('aria-hidden')).toBe('true');
  });

  it('should close menu on backdrop click', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    const backdrop = document.querySelector('.nav-backdrop');
    const menu = document.querySelector('.nav-menu');

    toggle.click(); // open
    backdrop.click(); // close

    expect(menu.classList.contains('active')).toBe(false);
  });

  it('should close menu on Escape key', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');

    toggle.click(); // open

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(menu.classList.contains('active')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('should not close if Escape is pressed but menu is already closed', () => {
    initNavigation();
    const menu = document.querySelector('.nav-menu');

    // Menu starts closed — Escape shouldn't throw or change state
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(menu.classList.contains('active')).toBe(false);
  });

  it('should trap tab inside mobile menu (forward Tab wraps)', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    toggle.click(); // open

    const links = document.querySelectorAll('.nav-menu a, .nav-menu button');
    const lastLink = links[links.length - 1];

    // Focus the last focusable element inside menu
    lastLink.focus();

    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventSpy = vi.spyOn(tabEvent, 'preventDefault');

    // Simulate active element being the last link
    Object.defineProperty(document, 'activeElement', { value: lastLink, configurable: true });

    document.dispatchEvent(tabEvent);

    expect(preventSpy).toHaveBeenCalled();
  });

  it('should close mobile nav when a link is clicked', () => {
    initNavigation();
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.nav-menu');
    const link = document.querySelector('.nav-link');

    toggle.click(); // open
    expect(menu.classList.contains('active')).toBe(true);

    link.click();

    expect(menu.classList.contains('active')).toBe(false);
  });
});
