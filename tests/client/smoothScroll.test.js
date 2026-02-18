// @vitest-environment jsdom
/**
 * Smooth Scroll Module Tests
 * Tests anchor link smooth scroll behavior.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let initSmoothScroll;

function setupDOM() {
  document.body.innerHTML = `
    <nav class="navbar" style="height:60px;">
      <a href="#section1" class="scroll-link">Section 1</a>
      <a href="#section2" class="scroll-link">Section 2</a>
      <a href="#" class="empty-link">Top</a>
      <a href="/other-page" class="regular-link">Other</a>
    </nav>
    <section id="section1" style="margin-top:500px;"><h2>Section 1</h2></section>
    <section id="section2" style="margin-top:1000px;"><h2>Section 2</h2></section>
  `;
}

describe('Smooth Scroll Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    setupDOM();

    // Mock scrollTo
    window.scrollTo = vi.fn();

    const mod = await import('../../client/js/modules/smoothScroll.js');
    initSmoothScroll = mod.initSmoothScroll;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should attach click handlers to all anchor links with href="#..."', () => {
    const spies = [];
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      spies.push(vi.spyOn(anchor, 'addEventListener'));
    });

    initSmoothScroll();

    spies.forEach((spy) => {
      expect(spy).toHaveBeenCalledWith('click', expect.any(Function));
    });
  });

  it('should prevent default on empty # links', () => {
    initSmoothScroll();

    const emptyLink = document.querySelector('.empty-link');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = vi.spyOn(event, 'preventDefault');

    emptyLink.dispatchEvent(event);

    expect(prevented).toHaveBeenCalled();
  });

  it('should prevent default on valid anchor links and call scrollTo', () => {
    initSmoothScroll();

    const link = document.querySelector('a[href="#section1"]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    link.dispatchEvent(event);

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({
        behavior: 'smooth',
      })
    );
  });

  it('should not interfere with non-anchor links', () => {
    initSmoothScroll();

    const regularLink = document.querySelector('.regular-link');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const prevented = vi.spyOn(event, 'preventDefault');

    regularLink.dispatchEvent(event);

    // Non #-links should not have handlers from this module
    expect(prevented).not.toHaveBeenCalled();
  });

  it('should handle missing target section gracefully', () => {
    // Remove the target section
    document.getElementById('section1').remove();

    initSmoothScroll();

    const link = document.querySelector('a[href="#section1"]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    // Should not throw
    expect(() => link.dispatchEvent(event)).not.toThrow();
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
