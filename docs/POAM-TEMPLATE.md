# Plan of Action & Milestones (POA&M)

**NIST SP 800-171 Rev 2 — Tracking Security Deficiencies and Remediation**

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Date** | *(YYYY-MM-DD)* |
| **Classification** | CUI // SP-SSP |
| **System Name** | Structured for Growth — Consulting & Compliance Platform |
| **System Abbreviation** | SFG |
| **Prepared By** | *(Name, Title)* |
| **Approved By** | *(ISSM / ISSO)* |
| **Review Cycle** | Quarterly (minimum) |
| **Associated SSP** | `docs/SSP-TEMPLATE.md` |

> **Regulatory Basis:** NIST SP 800-171 Rev 2, Control 3.12.2 — *Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems.*
>
> **CMMC Note:** Under CMMC 2.0 Level 2, POA&M items must be closed within **180 days** of assessment. Only a limited number of controls may be on the POA&M — certain controls cannot receive a POA&M (they must be fully implemented at assessment time).

---

## TABLE OF CONTENTS

- [1. Purpose](#1-purpose)
- [2. POA&M Governance](#2-poam-governance)
- [3. Risk Scoring Methodology](#3-risk-scoring-methodology)
- [4. POA&M Items](#4-poam-items)
  - [4.1 Access Control (AC)](#41-access-control-ac)
  - [4.2 Awareness and Training (AT)](#42-awareness-and-training-at)
  - [4.3 Audit and Accountability (AU)](#43-audit-and-accountability-au)
  - [4.4 Configuration Management (CM)](#44-configuration-management-cm)
  - [4.5 Identification and Authentication (IA)](#45-identification-and-authentication-ia)
  - [4.6 Incident Response (IR)](#46-incident-response-ir)
  - [4.7 Maintenance (MA)](#47-maintenance-ma)
  - [4.8 Media Protection (MP)](#48-media-protection-mp)
  - [4.9 Personnel Security (PS)](#49-personnel-security-ps)
  - [4.10 Physical Protection (PE)](#410-physical-protection-pe)
  - [4.11 Risk Assessment (RA)](#411-risk-assessment-ra)
  - [4.12 Security Assessment (CA)](#412-security-assessment-ca)
  - [4.13 System and Communications Protection (SC)](#413-system-and-communications-protection-sc)
  - [4.14 System and Information Integrity (SI)](#414-system-and-information-integrity-si)
- [5. Summary Dashboard](#5-summary-dashboard)
- [6. Revision History](#6-revision-history)

---

## 1. Purpose

This Plan of Action & Milestones (POA&M) documents known security deficiencies in the Structured for Growth platform, their associated risks, planned corrective actions, responsible parties, and target completion dates. It serves as the primary tracking mechanism for achieving full NIST SP 800-171 Rev 2 compliance and CMMC Level 2 readiness.

**Think of the POA&M as a "to-do list with deadlines" for security gaps.** Each item says: "Here's what's broken, how bad it is, who's fixing it, and when it'll be done."

### 1.1 How to Use This Document

1. **Initial Population:** After completing a self-assessment (see `docs/NIST-800-171-ASSESSMENT.md`), add an entry for every control that is _not fully implemented_.
2. **Ongoing Updates:** Review and update quarterly (at minimum). Add new items as gaps are discovered. Close items as remediation is completed and verified.
3. **Assessment Preparation:** Before a CMMC assessment, ensure all POA&M items are either closed or have a credible remediation plan within the 180-day window.
4. **Evidence:** When closing a POA&M item, record the evidence that demonstrates the gap has been remediated.

---

## 2. POA&M Governance

### 2.1 Roles

| Role | Responsibility |
|------|---------------|
| **ISSM** | Owns the POA&M. Reviews quarterly. Approves closures. Escalates overdue items. |
| **ISSO** | Validates remediation. Collects evidence. Updates item status. |
| **System Owner** | Provides resources (budget, personnel) for remediation. Accepts residual risk for open items. |
| **Responsible Party** | Executes the corrective action by the milestone date. Reports progress to ISSO. |

### 2.2 Item Lifecycle

```
┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────┐
│  OPEN    │────▶│ IN PROGRESS  │────▶│  PENDING  │────▶│  CLOSED  │
│          │     │              │     │ VALIDATION│     │          │
└──────────┘     └──────────────┘     └───────────┘     └──────────┘
                        │                                     ▲
                        │         ┌───────────┐              │
                        └────────▶│  DELAYED   │─────────────┘
                                  │ (Escalate) │
                                  └───────────┘
```

### 2.3 CMMC POA&M Rules

Under CMMC 2.0 Level 2, the following rules apply:

| Rule | Requirement |
|------|------------|
| **Maximum Open Items** | A limited number of controls may be on POA&M at time of assessment |
| **Closure Deadline** | All POA&M items must be closed within **180 days** of the assessment |
| **Non-POA&M-able Controls** | Certain controls CANNOT be placed on POA&M — they must be fully implemented at assessment. These include controls related to: FIPS-validated cryptography (3.13.11), MFA (3.5.3), and others designated by CMMC |
| **Conditional Certificate** | If POA&M items exist at assessment, a conditional CMMC certificate is issued; final certificate is granted upon POA&M closure |
| **Scoring Impact** | Each open POA&M item reduces the SPRS score by the control's point value (1, 3, or 5 points) |

---

## 3. Risk Scoring Methodology

Each POA&M item is scored using the following methodology to prioritize remediation efforts:

### 3.1 SPRS Point Values

NIST SP 800-171 control point values determine the SPRS score impact:

| Point Value | Description | Examples |
|------------|-------------|----------|
| **5 points** | Highest impact controls — critical security functions | MFA (3.5.3), FIPS crypto (3.13.11), audit logging (3.3.1), CUI encryption in transit (3.13.8) |
| **3 points** | Significant controls — important security posture | Least privilege (3.1.5), session lock (3.1.10), flaw remediation (3.14.1) |
| **1 point** | Supporting controls — defense in depth | VoIP (3.13.14), media marking (3.8.4), mobile code (3.13.13) |

### 3.2 Risk Rating

| Rating | Criteria | Response |
|--------|----------|----------|
| **Critical** | 5-point control, exploitable vulnerability, CUI at risk | Remediate within 30 days |
| **High** | 5-point control without active exploit, or 3-point control with exploit | Remediate within 60 days |
| **Medium** | 3-point control, or policy/procedural gap | Remediate within 120 days |
| **Low** | 1-point control, minor gap with compensating control | Remediate within 180 days |

---

## 4. POA&M Items

> **Instructions:** For each security gap identified during self-assessment, create an entry using the template below. Remove the example entries and replace with actual findings.

### POA&M Entry Template

```
#### POA&M-XXX: [Short Title]

| Field | Value |
|-------|-------|
| **POA&M ID** | POA&M-XXX |
| **Control ID** | 3.X.X |
| **Control Family** | [Family Name] |
| **Control Requirement** | [Full control text from NIST SP 800-171] |
| **Weakness/Gap** | [Describe what is missing or deficient] |
| **Risk Rating** | Critical / High / Medium / Low |
| **SPRS Points** | 1 / 3 / 5 |
| **Status** | Open / In Progress / Pending Validation / Delayed / Closed |
| **Responsible Party** | [Name, Title] |
| **Milestones** | |
| — Milestone 1 | [Action] — [Target Date] |
| — Milestone 2 | [Action] — [Target Date] |
| — Milestone 3 | [Action] — [Target Date] |
| **Scheduled Completion** | [Date] |
| **Actual Completion** | [Date or pending] |
| **Resources Required** | [Budget, tools, training, personnel] |
| **Compensating Controls** | [Any interim measures reducing risk until full remediation] |
| **Evidence of Closure** | [Artifacts demonstrating remediation — screenshots, configs, test results] |
| **Notes** | [Additional context] |
```

---

### 4.1 Access Control (AC)

*Controls 3.1.1 through 3.1.22 — Add POA&M entries for any AC controls not fully implemented.*

#### POA&M-001: Account Lockout After Failed Attempts *(Example)*

| Field | Value |
|-------|-------|
| **POA&M ID** | POA&M-001 |
| **Control ID** | 3.1.8 |
| **Control Family** | Access Control |
| **Control Requirement** | Limit unsuccessful logon attempts. |
| **Weakness/Gap** | The platform does not currently implement account lockout after a defined number of failed login attempts. Rate limiting exists but does not lock the account. |
| **Risk Rating** | High |
| **SPRS Points** | 3 |
| **Status** | Open |
| **Responsible Party** | *(Application Developer)* |
| **Milestones** | |
| — Milestone 1 | Implement account lockout logic (lock after 5 failed attempts for 30 minutes) — *(Date + 30 days)* |
| — Milestone 2 | Add automated tests for lockout behavior — *(Date + 35 days)* |
| — Milestone 3 | Deploy to production and verify — *(Date + 45 days)* |
| **Scheduled Completion** | *(Date + 45 days)* |
| **Actual Completion** | *(Pending)* |
| **Resources Required** | 8 hours developer time |
| **Compensating Controls** | Rate limiting on `/api/auth/login` endpoint provides partial mitigation. Audit logs capture all failed login attempts. |
| **Evidence of Closure** | Test results showing lockout behavior, updated `server/routes/auth.js`, audit log samples |
| **Notes** | Aligns with CMMC AC.L2-3.1.8 |

#### POA&M-002: Session Idle Timeout *(Example)*

| Field | Value |
|-------|-------|
| **POA&M ID** | POA&M-002 |
| **Control ID** | 3.1.10 |
| **Control Family** | Access Control |
| **Control Requirement** | Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity. |
| **Weakness/Gap** | JWT tokens have expiration but client-side idle detection with screen lock/pattern-hiding is not yet implemented. |
| **Risk Rating** | Medium |
| **SPRS Points** | 3 |
| **Status** | Open |
| **Responsible Party** | *(Application Developer)* |
| **Milestones** | |
| — Milestone 1 | Implement client-side idle detection (15-minute timeout) — *(Date + 30 days)* |
| — Milestone 2 | Add screen lock overlay with pattern-hiding — *(Date + 40 days)* |
| — Milestone 3 | Require re-authentication to resume session — *(Date + 45 days)* |
| **Scheduled Completion** | *(Date + 45 days)* |
| **Actual Completion** | *(Pending)* |
| **Resources Required** | 12 hours developer time |
| **Compensating Controls** | JWT token expiration limits session lifetime. Operating system screen lock policies are enforced via endpoint management. |
| **Evidence of Closure** | Test results, client code demonstrating idle detection and screen lock |
| **Notes** | — |

*(Add additional AC POA&M entries as needed)*

---

### 4.2 Awareness and Training (AT)

*Controls 3.2.1 through 3.2.3 — Add POA&M entries for any AT controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.3 Audit and Accountability (AU)

*Controls 3.3.1 through 3.3.9 — Add POA&M entries for any AU controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.4 Configuration Management (CM)

*Controls 3.4.1 through 3.4.9 — Add POA&M entries for any CM controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.5 Identification and Authentication (IA)

*Controls 3.5.1 through 3.5.11 — Add POA&M entries for any IA controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.6 Incident Response (IR)

*Controls 3.6.1 through 3.6.3 — Add POA&M entries for any IR controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.7 Maintenance (MA)

*Controls 3.7.1 through 3.7.6 — Add POA&M entries for any MA controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.8 Media Protection (MP)

*Controls 3.8.1 through 3.8.9 — Add POA&M entries for any MP controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.9 Personnel Security (PS)

*Controls 3.9.1 through 3.9.2 — Add POA&M entries for any PS controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.10 Physical Protection (PE)

*Controls 3.10.1 through 3.10.6 — Add POA&M entries for any PE controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.11 Risk Assessment (RA)

*Controls 3.11.1 through 3.11.3 — Add POA&M entries for any RA controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.12 Security Assessment (CA)

*Controls 3.12.1 through 3.12.4 — Add POA&M entries for any CA controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.13 System and Communications Protection (SC)

*Controls 3.13.1 through 3.13.16 — Add POA&M entries for any SC controls not fully implemented.*

*(Add entries using the template above)*

---

### 4.14 System and Information Integrity (SI)

*Controls 3.14.1 through 3.14.7 — Add POA&M entries for any SI controls not fully implemented.*

*(Add entries using the template above)*

---

## 5. Summary Dashboard

### 5.1 POA&M Status Summary

| Status | Count | Percentage |
|--------|-------|-----------|
| Open | *(N)* | *(%)* |
| In Progress | *(N)* | *(%)* |
| Pending Validation | *(N)* | *(%)* |
| Delayed | *(N)* | *(%)* |
| Closed | *(N)* | *(%)* |
| **Total** | *(N)* | 100% |

### 5.2 Risk Distribution

| Risk Rating | Count | SPRS Points at Risk |
|------------|-------|-------------------|
| Critical | *(N)* | *(Sum of points)* |
| High | *(N)* | *(Sum of points)* |
| Medium | *(N)* | *(Sum of points)* |
| Low | *(N)* | *(Sum of points)* |
| **Total** | *(N)* | *(Total points at risk)* |

### 5.3 SPRS Score Impact

| Metric | Value |
|--------|-------|
| Maximum possible score | 110 |
| Points implemented | *(Score)* |
| Points on POA&M (at risk) | *(Points)* |
| **Current SPRS Score** | *(110 minus unimplemented points)* |

> **SPRS Scoring Formula:** Start at 110. Subtract the point value of each control that is NOT implemented and NOT on the POA&M. Controls on the POA&M are NOT subtracted (but must be closed within 180 days of assessment).

### 5.4 Timeline Overview

| Quarter | Items Due | Items Closed | Items Overdue |
|---------|----------|-------------|---------------|
| *(Q1 YYYY)* | *(N)* | *(N)* | *(N)* |
| *(Q2 YYYY)* | *(N)* | *(N)* | *(N)* |
| *(Q3 YYYY)* | *(N)* | *(N)* | *(N)* |
| *(Q4 YYYY)* | *(N)* | *(N)* | *(N)* |

---

## 6. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | *(Date)* | *(Author)* | Initial POA&M creation with example entries |
| | | | |
| | | | |

---

**END OF PLAN OF ACTION & MILESTONES**

*This document contains Controlled Unclassified Information (CUI) and must be handled in accordance with 32 CFR Part 2002 and organizational CUI handling procedures.*
