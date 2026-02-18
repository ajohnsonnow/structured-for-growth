# SFG Project Style Sheet

> **Version:** 1.0 — June 2025
> **Applies to:** All documentation in the `docs/` directory, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, and inline JSDoc comments.
> **Authority:** GPO Style Manual (2016), Microsoft Writing Style Guide, Plain Writing Act of 2010.

---

## 1. Product & Company Names

| Term | Usage | Never |
|------|-------|-------|
| **Structured for Growth** | First use on any page. Full name + (SFG). | "Structured For Growth" (cap "For") |
| **SFG** | Subsequent references after first full mention. | "S.F.G." or "sfg" |
| **Structured for Growth (SFG)** | Title pages and formal documents. | |

---

## 2. Voice & Tone

- **Active voice** — preferred in all contexts.
  - ✅ "The system logs the event."
  - ❌ "The event is logged by the system."
- **Second person ("you")** — for user guides and READMEs.
- **Third person** — for formal compliance docs (SSP, POA&M, VPAT).
- **Plain language** — target Flesch-Kincaid ≤ Grade 8 for public content.
- **Imperative mood** — for step-by-step instructions ("Run `npm install`.", not "You should run…").

---

## 3. Abbreviations & Acronyms

Expand on first use, then abbreviate. Keep an alphabetized list:

| Acronym | Expansion |
|---------|-----------|
| ACR | Accessibility Conformance Report |
| ADR | Architecture Decision Record |
| ATO | Authority to Operate |
| BOM | Bill of Materials |
| C3PAO | CMMC Third-Party Assessment Organization |
| CI/CD | Continuous Integration / Continuous Deployment |
| CMMC | Cybersecurity Maturity Model Certification |
| CSP | Content Security Policy |
| CUI | Controlled Unclassified Information |
| DAST | Dynamic Application Security Testing |
| DIB | Defense Industrial Base |
| FCI | Federal Contract Information |
| FedRAMP | Federal Risk and Authorization Management Program |
| FISMA | Federal Information Security Modernization Act |
| GRS | General Records Schedule |
| HSTS | HTTP Strict Transport Security |
| JWT | JSON Web Token |
| MFA | Multi-Factor Authentication |
| NARA | National Archives and Records Administration |
| NIST | National Institute of Standards and Technology |
| OSCAL | Open Security Controls Assessment Language |
| OWASP | Open Worldwide Application Security Project |
| POA&M | Plan of Action and Milestones |
| RBAC | Role-Based Access Control |
| SAST | Static Application Security Testing |
| SBOM | Software Bill of Materials |
| SPRS | Supplier Performance Risk System |
| SSP | System Security Plan |
| TOTP | Time-Based One-Time Password |
| VPAT | Voluntary Product Accessibility Template |
| WCAG | Web Content Accessibility Guidelines |

---

## 4. Punctuation & Formatting

| Rule | Example |
|------|---------|
| **Serial (Oxford) comma** — always | "lint, test, and build" |
| **Em dashes** — no spaces | "SFG — the compliance platform" → "SFG—the compliance platform" |
| **Hyphens** for compound modifiers | "role-based access control" |
| **Code literals** in backticks | `npm install`, `JWT_SECRET` |
| **File names** in backticks | `server/index.js` |
| **Headings** in Title Case (H1–H2), sentence case (H3+) | ## Access Control Policy / ### How to configure MFA |
| **Lists** — capitalize first word, no period unless full sentence | |

---

## 5. Numbers

- Spell out one through nine; use numerals for 10 and above.
- Always use numerals with units: "8 hours", "3 MB", "15 minutes".
- Use commas for thousands: 1,000 / 10,000.

---

## 6. Code Documentation

- **JSDoc** for all exported functions — include `@param`, `@returns`, `@throws`.
- **Module-level block comment** at the top of every file describing purpose and P-ID.
- **Inline comments** for non-obvious logic only — code should be self-documenting.

---

## 7. Compliance Document Conventions

- Reference standards by full designation on first use: "NIST Special Publication 800-171 Revision 3 (NIST SP 800-171 Rev 3)".
- POA&M item IDs: `POAM-XXXX` (zero-padded four digits).
- Control IDs: use the framework's canonical format (e.g., `AC-2`, `3.1.1`, `AC.L2-3.1.1`).
- CUI markings: follow 32 CFR Part 2002 — `CUI//SP-CTI` format.

---

## 8. Git Commit Messages

Follow Conventional Commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `security`.
Scope: module or P-ID (e.g., `auth`, `P3.2.3`, `compliance`).

---

## 9. Prohibited Terms

These words should never appear in SFG documentation:

| Avoid | Reason |
|-------|--------|
| FOUO | Superseded by CUI program |
| simply / just / easy | Dismissive to readers unfamiliar with the topic |
| obviously / clearly | Assumes reader knowledge |
| hack / hacker | Use "workaround" or "security researcher" |
| master / slave | Use "primary / replica" or "leader / follower" |
| whitelist / blacklist | Use "allowlist / blocklist" |
| sanity check | Use "validation" or "smoke test" |
| dummy | Use "placeholder" or "stub" |
