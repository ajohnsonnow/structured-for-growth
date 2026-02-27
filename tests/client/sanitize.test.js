// @vitest-environment jsdom
/**
 * Sanitize Module Tests
 * Tests the XSS prevention utilities: escapeHTML, sanitizeHTML, safeInnerHTML, createSafeFragment, isSafeUrl.
 */
import { beforeEach, describe, expect, it } from 'vitest';

let escapeHTML, sanitizeHTML, safeInnerHTML, createSafeFragment, isSafeUrl;

describe('Sanitize Module', () => {
  beforeEach(async () => {
    const mod = await import('../../client/js/modules/sanitize.js');
    escapeHTML = mod.escapeHTML;
    sanitizeHTML = mod.sanitizeHTML;
    safeInnerHTML = mod.safeInnerHTML;
    createSafeFragment = mod.createSafeFragment;
    isSafeUrl = mod.isSafeUrl;
  });

  describe('escapeHTML()', () => {
    it('should escape angle brackets', () => {
      expect(escapeHTML('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHTML('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHTML('"hello" & \'world\'')).toBe('&quot;hello&quot; &amp; &#x27;world&#x27;');
    });

    it('should return empty string for null/undefined', () => {
      expect(escapeHTML(null)).toBe('');
      expect(escapeHTML(undefined)).toBe('');
    });

    it('should convert non-string values to string', () => {
      expect(escapeHTML(42)).toBe('42');
      expect(escapeHTML(true)).toBe('true');
    });

    it('should leave safe text unchanged', () => {
      expect(escapeHTML('Hello world')).toBe('Hello world');
    });
  });

  describe('sanitizeHTML()', () => {
    it('should allow safe tags like <b>, <em>, <p>', () => {
      const result = sanitizeHTML('<p>Hello <b>world</b></p>');
      expect(result).toContain('<p>');
      expect(result).toContain('<b>');
    });

    it('should remove <script> tags', () => {
      const result = sanitizeHTML('<p>Hello</p><script>alert("xss")</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>Hello</p>');
    });

    it('should remove event handlers', () => {
      const result = sanitizeHTML('<img src="x" onerror="alert(1)">');
      expect(result).not.toContain('onerror');
    });

    it('should remove javascript: URLs', () => {
      const result = sanitizeHTML('<a href="javascript:alert(1)">click</a>');
      expect(result).not.toContain('javascript:');
    });

    it('should return empty string for null/undefined', () => {
      expect(sanitizeHTML(null)).toBe('');
      expect(sanitizeHTML(undefined)).toBe('');
    });
  });

  describe('safeInnerHTML()', () => {
    it('should set innerHTML with sanitized content', () => {
      const el = document.createElement('div');
      safeInnerHTML(el, '<p>Safe</p><script>bad</script>');
      expect(el.innerHTML).toContain('<p>Safe</p>');
      expect(el.innerHTML).not.toContain('<script>');
    });

    it('should handle null element gracefully', () => {
      expect(() => safeInnerHTML(null, '<p>test</p>')).not.toThrow();
    });
  });

  describe('createSafeFragment()', () => {
    it('should create a DocumentFragment from sanitized HTML', () => {
      const frag = createSafeFragment('<p>Hello</p><script>xss</script>');
      expect(frag).toBeInstanceOf(DocumentFragment);
      expect(frag.querySelector('p')).not.toBeNull();
      expect(frag.querySelector('script')).toBeNull();
    });
  });

  describe('isSafeUrl()', () => {
    it('should allow https:// URLs', () => {
      expect(isSafeUrl('https://example.com')).toBe(true);
    });

    it('should allow http:// URLs', () => {
      expect(isSafeUrl('http://example.com')).toBe(true);
    });

    it('should allow mailto: URLs', () => {
      expect(isSafeUrl('mailto:user@example.com')).toBe(true);
    });

    it('should allow root-relative paths', () => {
      expect(isSafeUrl('/some/path')).toBe(true);
    });

    it('should allow hash anchors', () => {
      expect(isSafeUrl('#section')).toBe(true);
    });

    it('should block javascript: URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    });

    it('should block data: URLs', () => {
      expect(isSafeUrl('data:text/html,<script>xss</script>')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isSafeUrl('')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(isSafeUrl(null)).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
    });
  });
});
