# HTML & CSS Standards (P5.6.4)

> Standards for all HTML and CSS in Structured for Growth. Covers semantic markup, accessibility, BEM naming, and Stylelint configuration.

---

## HTML Standards

### Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title — Structured for Growth</title>
  <meta name="description" content="Page description under 160 chars.">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#2563eb">
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
  <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to content</a>
  <nav aria-label="Main navigation">...</nav>
  <main id="main-content">...</main>
  <footer>...</footer>
  <script type="module" src="/js/page.js"></script>
</body>
</html>
```

### Semantic Elements

| Use | Instead of |
|-----|-----------|
| `<nav>` | `<div class="nav">` |
| `<main>` | `<div class="main">` |
| `<header>` | `<div class="header">` |
| `<footer>` | `<div class="footer">` |
| `<section>` with heading | `<div class="section">` |
| `<article>` | `<div class="post">` |
| `<button>` | `<a href="#">` or `<div onclick>` |
| `<time datetime="...">` | `<span class="date">` |

### Accessibility Requirements (Section 508 / WCAG 2.1 AA)

1. **Skip link:** Every page must have a "Skip to content" link as first focusable element.
2. **Headings:** Proper hierarchy (h1 → h2 → h3). One `<h1>` per page.
3. **Images:** All `<img>` must have `alt` text (empty `alt=""` for decorative).
4. **Forms:** Every input needs a visible `<label>` with matching `for`/`id`.
5. **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text.
6. **Touch targets:** Minimum 44×44px for all interactive elements.
7. **Focus indicators:** Never remove `:focus` outlines without replacement.
8. **ARIA:** Use ARIA only when native HTML semantics are insufficient.
9. **Language:** Set `lang` attribute on `<html>`.
10. **Keyboard:** All functionality must work with keyboard only.

### Attributes

- Use double quotes for attribute values.
- Boolean attributes: just the name, no value (`disabled`, not `disabled="true"`).
- Self-closing tags: no slash (`<img>`, not `<img />`).

---

## CSS Standards

### Architecture

- CSS custom properties (variables) for design tokens.
- BEM naming convention for components.
- Component files in `client/styles/` (one per page/component).
- Shared styles in `main.css` and `components.css`.

### Custom Properties (Design Tokens)

```css
:root {
  /* Colors */
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-bg: #f8fafc;
  --color-surface: #ffffff;
  --color-border: #e2e8f0;
  --color-error: #ef4444;
  --color-success: #22c55e;

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'SF Mono', 'Fira Code', monospace;

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* Borders */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
}
```

### BEM Naming

```css
/* Block */
.card { ... }

/* Element (part of the block) */
.card__title { ... }
.card__body { ... }
.card__footer { ... }

/* Modifier (variation of block or element) */
.card--featured { ... }
.card__title--large { ... }
```

### Responsive Design

- Mobile-first: base styles for mobile, `@media (min-width)` for larger.
- Breakpoints: `640px` (sm), `768px` (md), `1024px` (lg), `1280px` (xl).
- Use `rem`/`em` for spacing, never `px` for font sizes.

```css
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

### Motion & Accessibility

```css
/* Always provide reduced-motion alternative */
.fade-in {
  animation: fadeIn 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .fade-in { animation: none; }
}

/* Focus styles — never remove, always enhance */
:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Things to Avoid

- No `!important` (unless overriding third-party styles).
- No inline styles (`style="..."`).
- No ID selectors for styling (`#header` — use classes).
- No `float` for layout (use flexbox or grid).
- No vendor prefixes manually (use Autoprefixer).

---

## Stylelint Configuration

```json
{
  "extends": ["stylelint-config-standard"],
  "rules": {
    "selector-class-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)*(--[a-z0-9]+(-[a-z0-9]+)*)?$",
    "custom-property-pattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
    "declaration-no-important": true,
    "selector-max-id": 0,
    "color-named": "never",
    "font-weight-notation": "numeric",
    "shorthand-property-no-redundant-values": true
  }
}
```
