// @vitest-environment jsdom
/**
 * Contact Form Module Tests
 * Tests form validation, submission, error display, and loading states.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let initContactForm;

function setupDOM() {
  document.body.innerHTML = `
    <form id="contactForm">
      <div class="form-group">
        <input id="name" name="name" />
        <span class="error-message"></span>
      </div>
      <div class="form-group">
        <input id="email" name="email" />
        <span class="error-message"></span>
      </div>
      <div class="form-group">
        <input id="company" name="company" />
        <span class="error-message"></span>
      </div>
      <div class="form-group">
        <input id="subject" name="subject" />
        <span class="error-message"></span>
      </div>
      <div class="form-group">
        <textarea id="message" name="message"></textarea>
        <span class="error-message"></span>
      </div>
      <button type="submit">
        <span class="btn-text">Send</span>
        <span class="btn-loading" style="display:none;">Sending...</span>
      </button>
    </form>
    <div class="form-message" style="display:none;"></div>
  `;
}

function fillForm(overrides = {}) {
  const defaults = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    company: 'Acme',
    subject: 'Hello World',
    message: 'This is a test message that is long enough.',
  };
  const data = { ...defaults, ...overrides };
  const form = document.getElementById('contactForm');
  form.querySelector('#name').value = data.name;
  form.querySelector('#email').value = data.email;
  form.querySelector('#company').value = data.company;
  form.querySelector('#subject').value = data.subject;
  form.querySelector('#message').value = data.message;
}

describe('Contact Form Module', () => {
  beforeEach(async () => {
    vi.resetModules();
    setupDOM();

    // Stub scrollIntoView (jsdom doesn't implement it)
    Element.prototype.scrollIntoView = vi.fn();

    // jsdom doesn't support named element access on forms the same way browsers do.
    // In browsers, form.name returns the <input name="name"> element, but jsdom
    // returns the form's built-in 'name' property. Patch the form so the module works.
    const form = document.getElementById('contactForm');
    const fieldNames = ['name', 'email', 'company', 'subject', 'message'];
    for (const name of fieldNames) {
      Object.defineProperty(form, name, {
        get() {
          return form.querySelector(`#${name}`);
        },
        configurable: true,
      });
    }

    const mod = await import('../../client/js/modules/contactForm.js');
    initContactForm = mod.initContactForm;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return early if no contact form exists', () => {
    document.body.innerHTML = '<div>No form</div>';
    expect(() => initContactForm()).not.toThrow();
  });

  it('should attach submit handler to form', () => {
    const spy = vi.spyOn(document.getElementById('contactForm'), 'addEventListener');
    initContactForm();
    expect(spy).toHaveBeenCalledWith('submit', expect.any(Function));
  });

  it('should show error for name shorter than 2 chars', () => {
    initContactForm();
    fillForm({ name: 'J' });

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const nameGroup = document.getElementById('name').closest('.form-group');
    expect(nameGroup.classList.contains('error')).toBe(true);
    expect(nameGroup.querySelector('.error-message').textContent).toContain(
      'at least 2 characters'
    );
  });

  it('should show error for invalid email', () => {
    initContactForm();
    fillForm({ email: 'not-an-email' });

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const emailGroup = document.getElementById('email').closest('.form-group');
    expect(emailGroup.classList.contains('error')).toBe(true);
    expect(emailGroup.querySelector('.error-message').textContent).toContain('valid email');
  });

  it('should show error for subject shorter than 3 chars', () => {
    initContactForm();
    fillForm({ subject: 'Hi' });

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const subjectGroup = document.getElementById('subject').closest('.form-group');
    expect(subjectGroup.classList.contains('error')).toBe(true);
  });

  it('should show error for message shorter than 10 chars', () => {
    initContactForm();
    fillForm({ message: 'Short' });

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const msgGroup = document.getElementById('message').closest('.form-group');
    expect(msgGroup.classList.contains('error')).toBe(true);
  });

  it('should submit valid form data via fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Sent' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    initContactForm();
    fillForm();

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Wait for async submit handler
    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should show success message on ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Sent' }),
      })
    );

    initContactForm();
    fillForm();

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      const msg = document.querySelector('.form-message');
      expect(msg.classList.contains('success')).toBe(true);
      expect(msg.textContent).toContain('Thank you');
    });
  });

  it('should show error message on failed response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ message: 'Rate limit' }),
      })
    );

    initContactForm();
    fillForm();

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      const msg = document.querySelector('.form-message');
      expect(msg.classList.contains('error')).toBe(true);
      expect(msg.textContent).toContain('Rate limit');
    });
  });

  it('should show error message on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    initContactForm();
    fillForm();

    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    await vi.waitFor(() => {
      const msg = document.querySelector('.form-message');
      expect(msg.classList.contains('error')).toBe(true);
      expect(msg.textContent).toContain('Failed to send');
    });
  });

  it('should clear previous errors on resubmit', () => {
    initContactForm();

    // First submit with bad data
    fillForm({ name: '' });
    const form = document.getElementById('contactForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    const nameGroup = document.getElementById('name').closest('.form-group');
    expect(nameGroup.classList.contains('error')).toBe(true);

    // Second submit with good data — errors should clear
    fillForm();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'ok' }),
      })
    );
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(nameGroup.classList.contains('error')).toBe(false);
  });
});
