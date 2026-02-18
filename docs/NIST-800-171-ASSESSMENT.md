# NIST SP 800-171 Rev 2 — Self-Assessment

**All 110 Controls — Implementation Status and Evidence**

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Assessment Date** | 2026-02-15 |
| **System Name** | Structured for Growth (SFG) |
| **Assessor** | Automated Code Inspection + Manual Review |
| **CMMC Target** | Level 2 — Advanced (110 controls) |
| **Associated SSP** | `docs/SSP-TEMPLATE.md` |
| **Associated POA&M** | `docs/POAM-TEMPLATE.md` |

> **Purpose:** This document assesses each of the 110 NIST SP 800-171 Rev 2 security requirements against the current implementation of the Structured for Growth platform. Each control receives a status and evidence reference. Controls not fully implemented are tracked in the POA&M.
>
> **Status Legend:**
> - ✅ **Implemented** — Control is fully implemented with evidence
> - 🔶 **Partially Implemented** — Some aspects implemented, gaps remain
> - 📋 **Planned** — Not yet implemented, scheduled for remediation
> - ⬜ **Not Applicable** — Control does not apply (justification required)
>
> **SPRS Scoring:** Each control has a point value (1, 3, or 5). Start at 110 and subtract points for controls that are NOT implemented and NOT on the POA&M.

---

## TABLE OF CONTENTS

- [Summary Dashboard](#summary-dashboard)
- [3.1 Access Control (AC) — 22 Controls](#31-access-control-ac--22-controls)
- [3.2 Awareness and Training (AT) — 3 Controls](#32-awareness-and-training-at--3-controls)
- [3.3 Audit and Accountability (AU) — 9 Controls](#33-audit-and-accountability-au--9-controls)
- [3.4 Configuration Management (CM) — 9 Controls](#34-configuration-management-cm--9-controls)
- [3.5 Identification and Authentication (IA) — 11 Controls](#35-identification-and-authentication-ia--11-controls)
- [3.6 Incident Response (IR) — 3 Controls](#36-incident-response-ir--3-controls)
- [3.7 Maintenance (MA) — 6 Controls](#37-maintenance-ma--6-controls)
- [3.8 Media Protection (MP) — 9 Controls](#38-media-protection-mp--9-controls)
- [3.9 Personnel Security (PS) — 2 Controls](#39-personnel-security-ps--2-controls)
- [3.10 Physical Protection (PE) — 6 Controls](#310-physical-protection-pe--6-controls)
- [3.11 Risk Assessment (RA) — 3 Controls](#311-risk-assessment-ra--3-controls)
- [3.12 Security Assessment (CA) — 4 Controls](#312-security-assessment-ca--4-controls)
- [3.13 System and Communications Protection (SC) — 16 Controls](#313-system-and-communications-protection-sc--16-controls)
- [3.14 System and Information Integrity (SI) — 7 Controls](#314-system-and-information-integrity-si--7-controls)
- [SPRS Score Calculation](#sprs-score-calculation)

---

## Summary Dashboard

| Family | Controls | Implemented | Partial | Planned | N/A | Family Score |
|--------|---------|------------|---------|---------|-----|-------------|
| 3.1 Access Control | 22 | 10 | 6 | 4 | 2 | See below |
| 3.2 Awareness & Training | 3 | 0 | 0 | 3 | 0 | See below |
| 3.3 Audit & Accountability | 9 | 5 | 3 | 1 | 0 | See below |
| 3.4 Configuration Management | 9 | 6 | 2 | 1 | 0 | See below |
| 3.5 Identification & Auth | 11 | 5 | 4 | 2 | 0 | See below |
| 3.6 Incident Response | 3 | 0 | 1 | 2 | 0 | See below |
| 3.7 Maintenance | 6 | 1 | 1 | 3 | 1 | See below |
| 3.8 Media Protection | 9 | 2 | 2 | 3 | 2 | See below |
| 3.9 Personnel Security | 2 | 0 | 0 | 2 | 0 | See below |
| 3.10 Physical Protection | 6 | 0 | 2 | 3 | 1 | See below |
| 3.11 Risk Assessment | 3 | 1 | 1 | 1 | 0 | See below |
| 3.12 Security Assessment | 4 | 2 | 1 | 1 | 0 | See below |
| 3.13 System & Comm Protection | 16 | 6 | 5 | 3 | 2 | See below |
| 3.14 System & Info Integrity | 7 | 3 | 2 | 2 | 0 | See below |
| **TOTAL** | **110** | **41** | **30** | **31** | **8** | — |

---

## 3.1 Access Control (AC) — 22 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 1 | 3.1.1 | Limit system access to authorized users | 5 | ✅ | JWT auth (`server/middleware/auth.js`), RBAC (`requireRole`), all API routes protected |
| 2 | 3.1.2 | Limit access to authorized transactions/functions | 5 | ✅ | `requireRole('admin')` on user mgmt, backup, activity log routes; user role restrictions on all routes |
| 3 | 3.1.3 | Control CUI flow per authorizations | 5 | 🔶 | CUI module (`server/lib/cui.js`, `client/js/modules/cuiBanner.js`) provides marking; no data-layer CUI flow enforcement |
| 4 | 3.1.4 | Separate duties to reduce risk | 1 | 🔶 | Admin/user role separation exists; only 2 roles — no fine-grained duty separation |
| 5 | 3.1.5 | Employ least privilege | 5 | 🔶 | Two roles (admin/user) enforce basic least privilege; no granular per-module permissions |
| 6 | 3.1.6 | Non-privileged accounts for nonsecurity functions | 1 | ✅ | Standard `user` role exists for non-admin operations |
| 7 | 3.1.7 | Prevent non-privileged execution of privileged functions; audit | 3 | ✅ | `requireRole('admin')` blocks non-admin access; all privileged actions logged via `logActivity()` |
| 8 | 3.1.8 | Limit unsuccessful logon attempts | 3 | 📋 | **Gap:** No account lockout. Rate limiting exists (100 req/15 min) but no per-account lockout |
| 9 | 3.1.9 | Privacy/security notices | 1 | ✅ | CUI banners on all pages (`cuiBanner.js`), login consent implied |
| 10 | 3.1.10 | Session lock with pattern-hiding | 3 | 📋 | **Gap:** JWT expiration (7 days) exists but no client-side idle detection or screen lock |
| 11 | 3.1.11 | Terminate session after defined condition | 3 | 🔶 | JWT has 7-day expiry; no idle timeout, no refresh token rotation |
| 12 | 3.1.12 | Monitor/control remote access | 3 | ✅ | All access logged with IP, user-agent, requestId (`server/middleware/requestId.js`, `server/lib/logger.js`) |
| 13 | 3.1.13 | Encrypt remote access sessions | 5 | ✅ | HSTS enforced via Helmet (1 year, includeSubDomains, preload); `upgradeInsecureRequests` enabled |
| 14 | 3.1.14 | Route remote access via managed points | 3 | ✅ | All traffic through reverse proxy (Render.com); no direct server access |
| 15 | 3.1.15 | Authorize remote privileged commands | 3 | 🔶 | Admin API endpoints require auth; no MFA requirement for remote admin sessions |
| 16 | 3.1.16 | Authorize wireless access | 1 | ⬜ | SaaS application — wireless access is end-user responsibility, not system-controlled |
| 17 | 3.1.17 | Protect wireless access | 1 | ⬜ | SaaS application — wireless encryption is end-user/network responsibility |
| 18 | 3.1.18 | Control mobile device connections | 1 | 📋 | No MDM policy documented |
| 19 | 3.1.19 | Encrypt CUI on mobile devices | 1 | 📋 | No mobile device encryption enforcement |
| 20 | 3.1.20 | Control external system connections | 1 | ✅ | CORS restricts origins; no external integrations without explicit configuration |
| 21 | 3.1.21 | Limit portable storage on external systems | 1 | 🔶 | Policy-level control only — no technical enforcement |
| 22 | 3.1.22 | Control CUI on publicly accessible systems | 5 | ✅ | All CUI routes require authentication (`authenticateToken`); public pages contain no CUI |

**AC Sub-Total:** 22 controls · 10 Implemented · 6 Partial · 4 Planned · 2 N/A

---

## 3.2 Awareness and Training (AT) — 3 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 23 | 3.2.1 | Security awareness for all users | 1 | 📋 | Training program not yet documented |
| 24 | 3.2.2 | Security training for assigned duties | 1 | 📋 | Role-based training plan not yet documented |
| 25 | 3.2.3 | Insider threat awareness | 1 | 📋 | Insider threat training not yet documented |

**AT Sub-Total:** 3 controls · 0 Implemented · 0 Partial · 3 Planned · 0 N/A

---

## 3.3 Audit and Accountability (AU) — 9 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 26 | 3.3.1 | Create/retain audit logs | 5 | ✅ | Winston logger (`server/lib/logger.js`) → `logs/error.log`, `logs/combined.log`, `logs/security.log`; `activity_log` DB table via `logActivity()` |
| 27 | 3.3.2 | Unique user traceability | 3 | ✅ | All log entries include user ID (JWT `sub`), `requestId` middleware provides correlation IDs |
| 28 | 3.3.3 | Review/update logged events | 3 | 🔶 | Events are defined in code; no formal review process documented. 20+ event types logged |
| 29 | 3.3.4 | Alert on audit failure | 3 | 📋 | No automated alerting on log write failures |
| 30 | 3.3.5 | Correlate audit records | 3 | ✅ | `requestId` middleware enables cross-log correlation; `scripts/audit.js` provides analysis |
| 31 | 3.3.6 | Audit reduction and reporting | 1 | ✅ | `scripts/audit.js` for reporting; `GET /api/auth/activity` for paginated log queries |
| 32 | 3.3.7 | Time synchronization | 1 | 🔶 | Timestamps use `new Date().toISOString()`; relies on host OS NTP — no explicit NTP config |
| 33 | 3.3.8 | Protect audit information | 3 | 🔶 | Log files have OS-level permissions; no WORM storage, no integrity hashing, no SIEM forwarding |
| 34 | 3.3.9 | Limit audit management to privileged users | 1 | ✅ | Logger config requires code changes (repo access control); activity log admin-only endpoint |

**AU Sub-Total:** 9 controls · 5 Implemented · 3 Partial · 1 Planned · 0 N/A

---

## 3.4 Configuration Management (CM) — 9 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 35 | 3.4.1 | Baseline config and inventory | 3 | ✅ | `package.json` + `package-lock.json` (software), `render.yaml` (infra), SBOM generated per release, `CHANGELOG.md` |
| 36 | 3.4.2 | Security configuration settings | 3 | ✅ | Helmet (CSP, HSTS, X-Frame-Options), CORS, rate limiting, cookie security, engine constraints |
| 37 | 3.4.3 | Track/approve/log changes | 3 | ✅ | Git version control, CI pipeline (`.github/workflows/ci.yml`), `CHANGELOG.md`, Husky pre-commit hooks |
| 38 | 3.4.4 | Security impact analysis before changes | 3 | 🔶 | CI runs tests, lint, security audit, a11y checks; no formal security impact assessment template |
| 39 | 3.4.5 | Access restrictions for changes | 3 | ✅ | Git-based access control; CI required to pass; production env variables required |
| 40 | 3.4.6 | Least functionality | 1 | ✅ | Minimal dependencies in `package.json`; only required services enabled |
| 41 | 3.4.7 | Disable nonessential functions/ports/protocols | 1 | 🔶 | Single HTTPS port exposed; `unsafe-inline` in CSP weakens restriction |
| 42 | 3.4.8 | Software whitelisting/blacklisting | 1 | ✅ | License compliance check blocks GPL-3.0/AGPL-3.0/SSPL/EUPL/CPAL in CI |
| 43 | 3.4.9 | Control user-installed software | 1 | 📋 | No endpoint management documented |

**CM Sub-Total:** 9 controls · 6 Implemented · 2 Partial · 1 Planned · 0 N/A

---

## 3.5 Identification and Authentication (IA) — 11 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 44 | 3.5.1 | Identify users, processes, devices | 5 | ✅ | Unique username + email constraints; JWT `sub` claim for process identification |
| 45 | 3.5.2 | Authenticate identities | 5 | ✅ | Username/password auth at `/api/auth/login`; bcrypt password verification; signed JWT issuance |
| 46 | 3.5.3 | Multifactor authentication | 5 | 🔶 | TOTP MFA fully implemented (`server/routes/mfa.js` — setup, verify, validate, disable); **Gap:** MFA is optional, not enforced for admin accounts |
| 47 | 3.5.4 | Replay-resistant authentication | 3 | ✅ | JWT time-limited tokens; CSRF double-submit cookies; TLS prevents replay |
| 48 | 3.5.5 | Prevent identifier reuse | 1 | 🔶 | Unique constraints on username/email; no policy preventing reuse of deleted usernames |
| 49 | 3.5.6 | Disable inactive identifiers | 1 | 🔶 | `is_active` field exists; no automated deactivation after inactivity period |
| 50 | 3.5.7 | Password complexity | 5 | 🔶 | Minimum 8 characters enforced; **Gap:** No uppercase/lowercase/number/special requirements, no breach database screening |
| 51 | 3.5.8 | Prohibit password reuse | 1 | 📋 | No password history tracking |
| 52 | 3.5.9 | Temporary password change on first use | 1 | 📋 | No forced password change on first login |
| 53 | 3.5.10 | Cryptographically-protected passwords | 5 | ✅ | bcryptjs (salt rounds = 10) for hashing; never stored plaintext; TLS for transmission |
| 54 | 3.5.11 | Obscure authentication feedback | 1 | ✅ | Generic "Invalid credentials" for both invalid username and invalid password |

**IA Sub-Total:** 11 controls · 5 Implemented · 4 Partial · 2 Planned · 0 N/A

---

## 3.6 Incident Response (IR) — 3 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 55 | 3.6.1 | Incident handling capability | 5 | 📋 | No formal Incident Response Plan document; audit logging provides detection/investigation capability |
| 56 | 3.6.2 | Track/document/report incidents | 3 | 🔶 | Audit logs enable tracking; no formal incident reporting procedures, no DC3/DIBNet process documented |
| 57 | 3.6.3 | Test incident response | 3 | 📋 | No tabletop exercises or IR testing documented |

**IR Sub-Total:** 3 controls · 0 Implemented · 1 Partial · 2 Planned · 0 N/A

---

## 3.7 Maintenance (MA) — 6 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 58 | 3.7.1 | Perform system maintenance | 3 | ✅ | Dependabot weekly updates (`.github/dependabot.yml`), CI pipeline validates all changes |
| 59 | 3.7.2 | Control maintenance tools/personnel | 3 | 🔶 | Git access controls for code changes; no formal approved tools list |
| 60 | 3.7.3 | Sanitize equipment for off-site maintenance | 1 | 📋 | No sanitization procedure documented |
| 61 | 3.7.4 | Check diagnostic media for malware | 1 | 📋 | No diagnostic media scanning procedure |
| 62 | 3.7.5 | MFA for nonlocal maintenance | 3 | 📋 | No MFA requirement for remote admin/maintenance sessions |
| 63 | 3.7.6 | Supervise unauthorized maintenance personnel | 1 | ⬜ | SaaS platform — no on-site maintenance personnel |

**MA Sub-Total:** 6 controls · 1 Implemented · 1 Partial · 3 Planned · 1 N/A

---

## 3.8 Media Protection (MP) — 9 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 64 | 3.8.1 | Protect system media (physical/digital) | 1 | 🔶 | Cloud hosting provides physical security (Render.com); no documented media handling policy |
| 65 | 3.8.2 | Limit media access to authorized users | 1 | ✅ | Database access restricted to application service account; backup routes require authentication |
| 66 | 3.8.3 | Sanitize/destroy media before disposal | 3 | 📋 | No NIST SP 800-88 sanitization procedure documented |
| 67 | 3.8.4 | Mark media with CUI markings | 1 | ✅ | CUI marking system (`server/lib/cui.js`, `cuiBanner.js`) provides banner, portion, and print markings |
| 68 | 3.8.5 | Control media transport accountability | 1 | ⬜ | SaaS — no physical media transport |
| 69 | 3.8.6 | Encrypt media during transport | 3 | 🔶 | TLS for all data in transit; no portable media encryption policy |
| 70 | 3.8.7 | Control removable media | 1 | ⬜ | SaaS — removable media not applicable to cloud-hosted application |
| 71 | 3.8.8 | Prohibit unidentified portable storage | 1 | 📋 | No portable storage policy for developer workstations |
| 72 | 3.8.9 | Protect backup CUI confidentiality | 3 | 📋 | **Gap:** Backups are plain JSON, unencrypted, stored locally. No encryption-at-rest for backups |

**MP Sub-Total:** 9 controls · 2 Implemented · 2 Partial · 3 Planned · 2 N/A

---

## 3.9 Personnel Security (PS) — 2 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 73 | 3.9.1 | Screen individuals before CUI access | 1 | 📋 | No personnel screening policy documented |
| 74 | 3.9.2 | Protect systems during personnel actions | 1 | 📋 | Account disablement (`is_active`) exists; no formal offboarding checklist |

**PS Sub-Total:** 2 controls · 0 Implemented · 0 Partial · 2 Planned · 0 N/A

---

## 3.10 Physical Protection (PE) — 6 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 75 | 3.10.1 | Limit physical access | 5 | 🔶 | Cloud provider (Render.com) handles data center physical security; developer workstation physical security not documented |
| 76 | 3.10.2 | Protect/monitor physical facility | 1 | 🔶 | Deferred to cloud provider; developer office physical security not documented |
| 77 | 3.10.3 | Escort visitors | 1 | ⬜ | SaaS — no physical visitor access to servers |
| 78 | 3.10.4 | Physical access audit logs | 1 | 📋 | No physical access logging documented for developer workstations |
| 79 | 3.10.5 | Control physical access devices | 1 | 📋 | No badge/key management documented |
| 80 | 3.10.6 | Alternate work site safeguards | 1 | 📋 | No remote work security policy documented |

**PE Sub-Total:** 6 controls · 0 Implemented · 2 Partial · 3 Planned · 1 N/A

---

## 3.11 Risk Assessment (RA) — 3 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 81 | 3.11.1 | Periodic risk assessment | 5 | 📋 | No formal risk assessment document; CI security checks provide continuous technical assessment |
| 82 | 3.11.2 | Vulnerability scanning | 5 | ✅ | `npm audit` in CI, Dependabot vulnerability alerts, CodeQL static analysis (`codeql_db/`), axe-core accessibility scanning |
| 83 | 3.11.3 | Remediate vulnerabilities per risk | 5 | 🔶 | Dependabot auto-PRs for dependencies; no formal remediation SLAs or tracking process |

**RA Sub-Total:** 3 controls · 1 Implemented · 1 Partial · 1 Planned · 0 N/A

---

## 3.12 Security Assessment (CA) — 4 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 84 | 3.12.1 | Periodic security control assessment | 3 | 🔶 | This self-assessment is the first formal assessment; no recurring schedule established |
| 85 | 3.12.2 | Plans of action (POA&M) | 3 | ✅ | POA&M template created (`docs/POAM-TEMPLATE.md`) with governance, lifecycle, CMMC rules |
| 86 | 3.12.3 | Continuous monitoring | 3 | ✅ | CI pipeline runs security checks every build; Dependabot monitors weekly; axe-core in CI |
| 87 | 3.12.4 | System security plan | 3 | 📋 | SSP template created (`docs/SSP-TEMPLATE.md`); needs organization-specific population |

**CA Sub-Total:** 4 controls · 2 Implemented · 1 Partial · 1 Planned · 0 N/A

---

## 3.13 System and Communications Protection (SC) — 16 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 88 | 3.13.1 | Boundary protection | 5 | ✅ | Helmet security headers, CORS origin restriction, rate limiting (100 req/15 min), request body size limits (1MB) |
| 89 | 3.13.2 | Security architecture principles | 3 | ✅ | Defense-in-depth (TLS + auth + RBAC + CSRF + validation), parameterized queries, Helmet, CI security checks |
| 90 | 3.13.3 | Separate user/management functionality | 3 | ✅ | Admin routes separated from user routes via `requireRole('admin')`; separate route files |
| 91 | 3.13.4 | Prevent unauthorized info transfer via shared resources | 3 | ✅ | Parameterized SQL queries prevent data leakage; per-user JWT scoping |
| 92 | 3.13.5 | DMZ for publicly accessible components | 5 | 🔶 | Render.com provides network isolation; no documented DMZ architecture |
| 93 | 3.13.6 | Deny-all, permit-by-exception | 5 | 🔶 | All API routes require authentication (deny-by-default); CORS restricts origins; no documented firewall rules |
| 94 | 3.13.7 | Prevent split tunneling | 3 | 📋 | No VPN/split-tunneling policy documented |
| 95 | 3.13.8 | Encrypt CUI in transit | 5 | ✅ | HSTS (1 year, preload), `upgradeInsecureRequests`, TLS via Render.com platform |
| 96 | 3.13.9 | Terminate inactive sessions | 3 | 🔶 | JWT has 7-day expiry; no idle session termination |
| 97 | 3.13.10 | Cryptographic key management | 3 | 🔶 | JWT_SECRET in env vars (not in code); production enforcement (`server/index.js`); no key rotation schedule |
| 98 | 3.13.11 | FIPS-validated cryptography | 5 | 🔶 | bcrypt and TLS use strong algorithm; **Gap:** No FIPS 140-2 validation documented, Node.js not in FIPS mode |
| 99 | 3.13.12 | Collaborative computing device control | 1 | ⬜ | N/A — web application, no collaborative computing devices |
| 100 | 3.13.13 | Mobile code control | 1 | ✅ | CSP restricts script sources (`defaultSrc: ['self']`, `frameSrc: ['none']`, `objectSrc: ['none']`) |
| 101 | 3.13.14 | VoIP control | 1 | ⬜ | N/A — no VoIP functionality in system |
| 102 | 3.13.15 | Session authenticity | 3 | ✅ | Signed JWT (HMAC-SHA256), CSRF double-submit cookies, TLS transport integrity, `sameSite: 'Strict'` cookies |
| 103 | 3.13.16 | CUI at rest encryption | 5 | 📋 | **Gap:** SQLite database stored unencrypted; backups are plain JSON; no encryption-at-rest |

**SC Sub-Total:** 16 controls · 6 Implemented · 5 Partial · 3 Planned · 2 N/A

---

## 3.14 System and Information Integrity (SI) — 7 Controls

| # | ID | Requirement | Pts | Status | Evidence |
|---|-----|------------|-----|--------|----------|
| 104 | 3.14.1 | Flaw remediation | 5 | ✅ | `npm audit` in CI, Dependabot auto-PRs, CodeQL SAST, 259 automated tests |
| 105 | 3.14.2 | Malicious code protection | 3 | 📋 | No documented endpoint anti-malware |
| 106 | 3.14.3 | Security alert monitoring | 3 | ✅ | Dependabot security advisories, GitHub security alerts, CI audit checks |
| 107 | 3.14.4 | Update malicious code protection | 1 | 📋 | No documented anti-malware update mechanism |
| 108 | 3.14.5 | System/file scanning | 3 | ✅ | CI scans all dependencies every build; CodeQL static analysis |
| 109 | 3.14.6 | Monitor communications for attacks | 5 | 🔶 | Access logging (IP, user-agent, requestId) for all requests; no IDS/IPS, no anomaly detection |
| 110 | 3.14.7 | Detect unauthorized use | 3 | 🔶 | Failed login logging (partial — not via `logActivity()`), audit trails; no automated anomaly detection |

**SI Sub-Total:** 7 controls · 3 Implemented · 2 Partial · 2 Planned · 0 N/A

---

## SPRS Score Calculation

### Scoring Rules (per DFARS 252.204-7019)

- Start at **110**
- For each control **NOT implemented** and **NOT on POA&M**: subtract the control's point value
- Controls on POA&M: do NOT subtract (but must close within 180 days)
- Controls marked N/A: do NOT subtract
- Minimum possible score: **-203**

### Current Score Breakdown

| Category | Count | Points |
|----------|-------|--------|
| ✅ Implemented (full credit) | 41 | — (no deduction) |
| 🔶 Partially Implemented (POA&M) | 30 | — (on POA&M, no deduction) |
| 📋 Planned (POA&M) | 31 | — (on POA&M, no deduction) |
| ⬜ Not Applicable | 8 | — (no deduction) |

### Points at Risk (if POA&M closes on time)

If all POA&M items are closed within 180 days, no points are deducted.

If POA&M items are NOT closed, the following deductions apply by family:

| Family | Partial + Planned Controls | Points at Risk |
|--------|--------------------------|----------------|
| AC | 3.1.3(5), 3.1.4(1), 3.1.5(5), 3.1.8(3), 3.1.10(3), 3.1.11(3), 3.1.15(3), 3.1.18(1), 3.1.19(1), 3.1.21(1) | 26 |
| AT | 3.2.1(1), 3.2.2(1), 3.2.3(1) | 3 |
| AU | 3.3.3(3), 3.3.4(3), 3.3.7(1), 3.3.8(3) | 10 |
| CM | 3.4.4(3), 3.4.7(1), 3.4.9(1) | 5 |
| IA | 3.5.3(5), 3.5.5(1), 3.5.6(1), 3.5.7(5), 3.5.8(1), 3.5.9(1) | 14 |
| IR | 3.6.1(5), 3.6.2(3), 3.6.3(3) | 11 |
| MA | 3.7.2(3), 3.7.3(1), 3.7.4(1), 3.7.5(3) | 8 |
| MP | 3.8.1(1), 3.8.3(3), 3.8.6(3), 3.8.8(1), 3.8.9(3) | 11 |
| PS | 3.9.1(1), 3.9.2(1) | 2 |
| PE | 3.10.1(5), 3.10.2(1), 3.10.4(1), 3.10.5(1), 3.10.6(1) | 9 |
| RA | 3.11.1(5), 3.11.3(5) | 10 |
| CA | 3.12.1(3), 3.12.4(3) | 6 |
| SC | 3.13.5(5), 3.13.6(5), 3.13.7(3), 3.13.9(3), 3.13.10(3), 3.13.11(5), 3.13.16(5) + 3.13.14 already N/A | 29 |
| SI | 3.14.2(3), 3.14.4(1), 3.14.6(5), 3.14.7(3) | 12 |
| **TOTAL AT RISK** | **61 controls** | **156 points** |

### Preliminary SPRS Score

| Scenario | Score | Notes |
|---------|-------|-------|
| **All POA&M items accepted** | **110** | All gaps are on the POA&M with remediation plans |
| **If all POA&M items fail** | **-46** | 110 - 156 = -46 (worst case) |
| **Realistic estimate** | **40–70** | Based on typical first-assessment scoring with policy gaps |

> **Note:** The SPRS score of 110 (with POA&M) requires all Partially Implemented and Planned items to have a credible remediation plan documented in the POA&M with milestones within the 180-day window. Critical controls like MFA (3.5.3), FIPS crypto (3.13.11), and CUI at-rest encryption (3.13.16) should be prioritized for remediation.

### Priority Remediation (Highest Point Controls)

| Priority | Control | Pts | Gap | Remediation |
|---------|---------|-----|-----|-------------|
| 1 | 3.5.3 MFA | 5 | MFA optional | Enforce MFA for all admin accounts |
| 2 | 3.5.7 Password complexity | 5 | Min 8 chars only | Add complexity rules (14+ chars, mixed case, numbers, special) |
| 3 | 3.13.11 FIPS crypto | 5 | Not validated | Configure Node.js with OpenSSL FIPS mode |
| 4 | 3.13.16 CUI at rest | 5 | No encryption | Implement SQLCipher or filesystem encryption |
| 5 | 3.6.1 Incident response | 5 | No IR plan | Create and publish Incident Response Plan |
| 6 | 3.11.1 Risk assessment | 5 | No formal assessment | Conduct risk assessment per NIST SP 800-30 |
| 7 | 3.10.1 Physical access | 5 | Cloud-deferred | Document cloud provider physical security controls |
| 8 | 3.13.5 DMZ | 5 | Not documented | Document network architecture and segmentation |
| 9 | 3.13.6 Deny-all | 5 | Not documented | Document firewall/security group rules |
| 10 | 3.1.3 CUI flow | 5 | Marking only | Implement data-layer CUI access enforcement |

---

## Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-02-15 | Automated Assessment | Initial self-assessment — code-level evidence analysis |
| | | | |

---

**END OF NIST SP 800-171 REV 2 SELF-ASSESSMENT**

*This document contains Controlled Unclassified Information (CUI) and must be handled in accordance with 32 CFR Part 2002 and organizational CUI handling procedures.*
