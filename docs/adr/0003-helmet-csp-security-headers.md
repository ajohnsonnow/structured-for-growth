# ADR-0003: Helmet + CSP for HTTP Security Headers

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-03-01 |
| **Decision Makers** | Core team |
| **P-ID** | P1.2.1 |

## Context

Federal web applications must implement defense-in-depth HTTP headers per OWASP and NIST guidelines. Key headers include Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options, and Referrer-Policy.

## Decision

Use the **Helmet** Express middleware to set all security headers declaratively. CSP is configured with:

- `default-src: 'self'`
- `script-src: 'self' 'unsafe-inline'` (required for inline analytics snippet)
- `style-src: 'self' 'unsafe-inline'` (required for dynamic styles)
- `frame-src: 'none'`, `object-src: 'none'`
- `upgrade-insecure-requests`

HSTS is set to 1 year with `includeSubDomains` and `preload`.

## Consequences

### Positive

- All OWASP-recommended headers set with a single middleware.
- CSP blocks XSS even if input sanitization fails (defense-in-depth).
- HSTS prevents protocol downgrade attacks.
- `X-Frame-Options: DENY` prevents clickjacking.

### Negative

- `unsafe-inline` in CSP weakens XSS protection. A future ADR should address moving to nonce-based CSP.
- Third-party analytics (GoatCounter) requires explicit `connect-src` and `script-src` entries.

### Risks

- Overly restrictive CSP could break legitimate functionality. Mitigated by `scripts/audit-headers.js` verification script.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Manual header setting | Full control | Error-prone, easy to miss headers |
| Caddy/Nginx headers | Configured at proxy level | Not available in all deployment environments |
| Nonce-based CSP | Eliminates `unsafe-inline` | Requires server rendering of nonce into HTML on every request |

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [Helmet.js documentation](https://helmetjs.github.io/)
- [NIST SP 800-53 SC-8 — Transmission Confidentiality](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
