# System Security Plan (SSP)

**NIST SP 800-171 Rev 2 — Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations**

| Field | Value |
|-------|-------|
| **Document Version** | 1.0 |
| **Date** | *(YYYY-MM-DD)* |
| **Classification** | CUI // SP-SSP |
| **Prepared By** | *(Name, Title)* |
| **Approved By** | *(ISSM / ISSO / Authorizing Official)* |
| **Review Cycle** | Annual (or upon significant system change) |
| **CAGE Code** | *(Your commercial and government entity code)* |
| **DUNS / UEI** | *(Unique Entity Identifier)* |

> **Regulatory Basis:** NIST SP 800-171 Rev 2, Control 3.12.4 — *Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems.*
>
> **Contract Applicability:** DFARS 252.204-7012, DFARS 252.204-7019/7020/7021 (CMMC), FAR 52.204-21.

---

## TABLE OF CONTENTS

- [1. System Identification](#1-system-identification)
- [2. System Environment](#2-system-environment)
- [3. System Boundary](#3-system-boundary)
- [4. Data Flow and CUI Categorization](#4-data-flow-and-cui-categorization)
- [5. Interconnections](#5-interconnections)
- [6. Roles and Responsibilities](#6-roles-and-responsibilities)
- [7. Security Control Implementation](#7-security-control-implementation)
  - [7.1 Access Control (AC)](#71-access-control-ac)
  - [7.2 Awareness and Training (AT)](#72-awareness-and-training-at)
  - [7.3 Audit and Accountability (AU)](#73-audit-and-accountability-au)
  - [7.4 Configuration Management (CM)](#74-configuration-management-cm)
  - [7.5 Identification and Authentication (IA)](#75-identification-and-authentication-ia)
  - [7.6 Incident Response (IR)](#76-incident-response-ir)
  - [7.7 Maintenance (MA)](#77-maintenance-ma)
  - [7.8 Media Protection (MP)](#78-media-protection-mp)
  - [7.9 Personnel Security (PS)](#79-personnel-security-ps)
  - [7.10 Physical Protection (PE)](#710-physical-protection-pe)
  - [7.11 Risk Assessment (RA)](#711-risk-assessment-ra)
  - [7.12 Security Assessment (CA)](#712-security-assessment-ca)
  - [7.13 System and Communications Protection (SC)](#713-system-and-communications-protection-sc)
  - [7.14 System and Information Integrity (SI)](#714-system-and-information-integrity-si)
- [8. Continuous Monitoring Strategy](#8-continuous-monitoring-strategy)
- [9. Incident Response Summary](#9-incident-response-summary)
- [10. Attachments and Artifacts](#10-attachments-and-artifacts)
- [11. Revision History](#11-revision-history)

---

## 1. System Identification

| Field | Value |
|-------|-------|
| **System Name** | Structured for Growth — Consulting & Compliance Platform |
| **System Abbreviation** | SFG |
| **System Version** | *(Current release version)* |
| **System Type** | Web Application (SaaS) |
| **Operational Status** | ☐ Operational · ☐ Under Development · ☐ Major Modification |
| **Information Types** | CUI, FCI, project data, contact records, compliance artifacts |
| **FIPS 199 Impact Level** | Confidentiality: **Moderate** · Integrity: **Moderate** · Availability: **Low** |
| **CMMC Target Level** | Level 2 — Advanced (110 controls, C3PAO assessment) |
| **Authorization Date** | *(Date system was last authorized)* |
| **Authorization Termination** | *(3 years from authorization date)* |

### 1.1 System Purpose

Structured for Growth (SFG) is a web-based consulting and compliance platform designed to help organizations — including government contractors — manage projects, client relationships, compliance artifacts, templates, and communications. The platform processes, stores, and transmits Controlled Unclassified Information (CUI) and Federal Contract Information (FCI) as defined in 32 CFR Part 2002.

### 1.2 System Description

The platform consists of:

- **Frontend:** Static HTML/CSS/JavaScript client served via CDN/web server (7 pages: dashboard, portal, templates, compliance, docs, mbai, contact)
- **Backend:** Node.js/Express REST API with JWT authentication and role-based access control (RBAC)
- **Database:** SQLite (sql.js) for structured data storage
- **Logging:** Server-side audit logging with structured JSON log entries (`logs/audit-history.jsonl`)
- **CI/CD:** GitHub Actions pipeline with automated testing, SAST, SBOM generation, and license compliance
- **Documentation:** OpenAPI 3.0.3 specification served at `/api-docs`

### 1.3 Legal and Regulatory Basis

| Regulation | Applicability |
|-----------|---------------|
| NIST SP 800-171 Rev 2 | Primary — all 110 controls |
| DFARS 252.204-7012 | Safeguarding Covered Defense Information |
| DFARS 252.204-7019 | NIST SP 800-171 DoD Assessment |
| DFARS 252.204-7020 | NIST SP 800-171 Higher Assessment |
| DFARS 252.204-7021 | CMMC Requirements |
| FAR 52.204-21 | Basic Safeguarding of FCI |
| 32 CFR Part 2002 | CUI Program |
| NIST SP 800-53 Rev 5 | Supplementary reference controls |
| Section 508 / WCAG 2.1 AA | Accessibility |

---

## 2. System Environment

### 2.1 Hardware Inventory

| Component | Description | Location | CUI Processing |
|-----------|-------------|----------|----------------|
| *(Web Server)* | *(e.g., AWS EC2 t3.medium)* | *(Region/AZ)* | Yes / No |
| *(Database Server)* | *(e.g., embedded SQLite)* | *(Co-located)* | Yes / No |
| *(Build Server)* | *(e.g., GitHub Actions runners)* | *(GitHub-hosted)* | No |
| *(Developer Workstations)* | *(Count and description)* | *(Office / Remote)* | Yes / No |

### 2.2 Software Inventory

| Software | Version | Purpose | Vendor |
|----------|---------|---------|--------|
| Node.js | *(18.x / 20.x)* | Application runtime | OpenJS Foundation |
| Express | *(4.x)* | HTTP framework | OpenJS Foundation |
| sql.js | *(1.x)* | SQLite in-process database | sql.js contributors |
| jsonwebtoken | *(9.x)* | JWT authentication | Auth0 |
| bcryptjs | *(2.x)* | Password hashing | dcodeIO |
| helmet | *(8.x)* | HTTP security headers | helmetjs |
| Vite | *(6.x)* | Frontend build tooling | Evan You |
| Vitest | *(4.x)* | Test framework | Vitest contributors |
| axe-core | *(4.x)* | Accessibility testing | Deque |

### 2.3 Network Architecture

*(Insert network diagram showing: internet boundary, load balancer/reverse proxy, application tier, database tier, logging tier, CI/CD pipeline, and developer access paths. Mark the CUI boundary with a red dashed line.)*

```
┌─────────────────────────────────────────────────────────┐
│                    CUI BOUNDARY                         │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Reverse  │───▶│  Node.js /   │───▶│   SQLite     │  │
│  │ Proxy    │    │  Express API │    │   Database   │  │
│  │ (TLS)    │    │  (RBAC+JWT)  │    │  (Encrypted) │  │
│  └──────────┘    └──────────────┘    └──────────────┘  │
│       ▲               │                                 │
│       │               ▼                                 │
│  ┌──────────┐    ┌──────────────┐                      │
│  │ Static   │    │ Audit Logs   │                      │
│  │ Frontend │    │ (JSONL)      │                      │
│  └──────────┘    └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
         ▲
         │ TLS 1.2+
    ┌────┴────┐
    │ Internet│
    │ Users   │
    └─────────┘
```

---

## 3. System Boundary

### 3.1 Scope Definition

The system boundary (also called the "assessment scope" or "CUI enclave") includes all components that process, store, or transmit CUI. Components outside this boundary are documented in Section 5 (Interconnections).

**In-Scope Components:**

- All server-side code (`server/` directory)
- All client-side code (`client/` directory)
- Database files and backup mechanisms
- Audit log storage (`logs/`)
- Compliance data (`data/compliance/`)
- Template data (`data/mbai/`)
- CI/CD pipeline configuration (`.github/workflows/`)
- Developer workstations used for development and administration

**Out-of-Scope Components:**

- Third-party SaaS tools not processing CUI (e.g., general email not containing CUI)
- Public marketing website (if separate)
- *(List any other systems explicitly excluded)*

### 3.2 Authorization Boundary Diagram

*(Insert diagram clearly marking the authorization boundary. Every component inside the boundary is subject to NIST SP 800-171 controls.)*

---

## 4. Data Flow and CUI Categorization

### 4.1 CUI Categories

| CUI Category | Marking | Example Data | Handling |
|-------------|---------|-------------|----------|
| Controlled Technical Information (CTI) | CUI // SP-CTI | Engineering specs, technical drawings | NIST SP 800-171 |
| Proprietary Business Information (PROPIN) | CUI // SP-PROPIN | Pricing, proposals, contracts | NIST SP 800-171 |
| Export Controlled (EXPT) | CUI // SP-EXPT | ITAR/EAR-controlled data | NIST SP 800-171 + ITAR/EAR |
| Privacy Information (PRVCY) | CUI // SP-PRVCY | PII of personnel | NIST SP 800-171 |

### 4.2 Data Flow Diagram

*(Insert data flow diagram showing how CUI enters, moves through, and exits the system. Include: data ingestion points, processing steps, storage locations, transmission paths, and data egress points.)*

```
User Browser ──TLS──▶ Reverse Proxy ──▶ Express API ──▶ SQLite DB
                                             │
                                             ├──▶ Audit Log (JSONL)
                                             ├──▶ File Storage (templates, docs)
                                             └──▶ Response to Client
```

### 4.3 CUI Marking and Handling

The platform implements CUI marking through:

- **Banner Marking:** Client-side CUI banner module (`client/js/modules/cuiBanner.js`) displays appropriate CUI banners and portion markings on all pages
- **Configuration:** CUI configuration module (`client/js/modules/cuiConfig.js`) allows authorized users to set CUI categories
- **Server-Side:** CUI library (`server/lib/cui.js`) enforces server-side CUI handling rules
- **Portion Marking:** Individual data elements are portion-marked per 32 CFR 2002.20

---

## 5. Interconnections

| External System | Type | Data Exchanged | Direction | CUI? | Authorization |
|----------------|------|---------------|-----------|------|---------------|
| *(e.g., Email)* | SMTP/TLS | Notifications | Outbound | No | *(ISA/MOU ref)* |
| *(e.g., GitHub)* | HTTPS | Source code, CI/CD | Bidirectional | No | *(GitHub BAA)* |
| *(e.g., Client Portal)* | HTTPS/REST | Project data | Bidirectional | Yes | *(ISA ref)* |
| *(Add rows as needed)* | | | | | |

> **Note:** All interconnections carrying CUI must have an Interconnection Security Agreement (ISA) or Memorandum of Understanding (MOU) on file.

---

## 6. Roles and Responsibilities

| Role | Name | Responsibilities |
|------|------|------------------|
| **System Owner** | *(Name)* | Overall accountability for system security. Authorizes system operation. |
| **Information System Security Manager (ISSM)** | *(Name)* | Manages the security program. Reviews and approves SSP. Oversees POA&M. |
| **Information System Security Officer (ISSO)** | *(Name)* | Day-to-day security operations. Monitors compliance. Responds to incidents. |
| **System Administrator** | *(Name)* | Manages system configuration, patching, backups, and user accounts. |
| **Database Administrator** | *(Name)* | Manages database access, backups, and integrity. |
| **Application Developer** | *(Name)* | Develops and maintains application code. Follows secure coding standards. |
| **Authorizing Official (AO)** | *(Name)* | Accepts risk and authorizes system to operate. |
| **Users** | *(Various)* | Comply with acceptable use policy. Report security incidents. |
| **Incident Response Lead** | *(Name)* | Leads incident response activities. Reports incidents per DFARS 7012. |

---

## 7. Security Control Implementation

> **How to read this section:** Each control below maps to a NIST SP 800-171 Rev 2 requirement. For each control, document:
> - **Status:** Implemented ✅ · Partially Implemented 🔶 · Planned 📋 · Not Applicable ⬜
> - **Implementation:** Describe *how* your organization meets this requirement
> - **Evidence:** List artifacts that prove implementation
> - **Responsible Party:** Who owns this control
>
> Controls marked ⬜ (Not Applicable) must include a justification accepted by the assessor.

---

### 7.1 Access Control (AC)

**Family Overview:** Limit system access to authorized users, processes, and devices; limit access to the types of transactions and functions that authorized users are permitted to execute.

**NIST SP 800-53 Mapping:** AC-2 through AC-20

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 1 | 3.1.1 | Limit system access to authorized users, processes acting on behalf of authorized users, and devices (including other systems). | ☐ |
| 2 | 3.1.2 | Limit system access to the types of transactions and functions that authorized users are permitted to execute. | ☐ |
| 3 | 3.1.3 | Control the flow of CUI in accordance with approved authorizations. | ☐ |
| 4 | 3.1.4 | Separate the duties of individuals to reduce the risk of malevolent activity without collusion. | ☐ |
| 5 | 3.1.5 | Employ the principle of least privilege, including for specific security functions and privileged accounts. | ☐ |
| 6 | 3.1.6 | Use non-privileged accounts or roles when accessing nonsecurity functions. | ☐ |
| 7 | 3.1.7 | Prevent non-privileged users from executing privileged functions and capture the execution of such functions in audit logs. | ☐ |
| 8 | 3.1.8 | Limit unsuccessful logon attempts. | ☐ |
| 9 | 3.1.9 | Provide privacy and security notices consistent with applicable CUI rules. | ☐ |
| 10 | 3.1.10 | Use session lock with pattern-hiding displays to prevent access and viewing of data after a period of inactivity. | ☐ |
| 11 | 3.1.11 | Terminate (automatically) a user session after a defined condition. | ☐ |
| 12 | 3.1.12 | Monitor and control remote access sessions. | ☐ |
| 13 | 3.1.13 | Employ cryptographic mechanisms to protect the confidentiality of remote access sessions. | ☐ |
| 14 | 3.1.14 | Route remote access via managed access control points. | ☐ |
| 15 | 3.1.15 | Authorize remote execution of privileged commands and remote access to security-relevant information. | ☐ |
| 16 | 3.1.16 | Authorize wireless access prior to allowing such connections. | ☐ |
| 17 | 3.1.17 | Protect wireless access using authentication and encryption. | ☐ |
| 18 | 3.1.18 | Control connection of mobile devices. | ☐ |
| 19 | 3.1.19 | Encrypt CUI on mobile devices and mobile computing platforms. | ☐ |
| 20 | 3.1.20 | Verify and control/limit connections to and use of external systems. | ☐ |
| 21 | 3.1.21 | Limit use of portable storage devices on external systems. | ☐ |
| 22 | 3.1.22 | Control CUI posted or processed on publicly accessible systems. | ☐ |

#### AC Implementation Details

**3.1.1 — Authorized Access Control**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The platform enforces access control through JWT-based authentication (`server/middleware/auth.js`) with role-based authorization (`authenticateToken`, `requireRole`). All API endpoints require valid JWT tokens. User accounts are created by administrators via the `/api/auth/register` endpoint with role assignment. Database access is restricted to the application service account.
- **Evidence:** `server/middleware/auth.js`, `server/routes/auth.js`, `tests/middleware/auth.test.js`, access control policy document
- **Responsible Party:** System Administrator / ISSO

**3.1.2 — Transaction and Function Control**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** RBAC middleware (`requireRole`) restricts API endpoints to specific roles (admin, user). Each route file enforces role checks before processing requests. Function-level permissions prevent unauthorized transaction types.
- **Evidence:** Route files in `server/routes/`, RBAC matrix, `tests/routes/auth.test.js`
- **Responsible Party:** Application Developer / ISSO

**3.1.3 — CUI Flow Control**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** CUI data flows are controlled through the application's API layer. The CUI module (`server/lib/cui.js`) enforces marking and handling rules. Data exports are restricted to authorized roles. CUI banners indicate data sensitivity on all client pages.
- **Evidence:** `server/lib/cui.js`, `client/js/modules/cuiBanner.js`, data flow diagram (Section 4.2)
- **Responsible Party:** ISSO

**3.1.4 — Separation of Duties**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The platform separates administrative functions (user management, system configuration) from standard user functions. CI/CD pipeline requires separate approvals for production deployments. Database administration is restricted.
- **Evidence:** RBAC matrix, CI/CD workflow configuration, organizational chart
- **Responsible Party:** ISSM

**3.1.5 — Least Privilege**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Users are assigned the minimum role necessary. Admin accounts are separate from day-to-day accounts. API endpoints enforce role checks via `requireRole` middleware. Database queries use parameterized statements to prevent privilege escalation.
- **Evidence:** `server/middleware/auth.js`, user role inventory, privilege access review records
- **Responsible Party:** System Administrator

**3.1.6 — Non-Privileged Accounts for Nonsecurity Functions**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Administrators use standard (non-privileged) accounts for routine tasks. Admin role is only used when performing administrative functions.
- **Evidence:** Account inventory showing separate admin/user accounts, login records
- **Responsible Party:** System Administrator

**3.1.7 — Privileged Function Execution**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Only users with the `admin` role can execute privileged functions (user management, backup, system configuration). All privileged actions are logged in `logs/audit-history.jsonl` with user identity, timestamp, and action details.
- **Evidence:** `server/routes/auth.js`, `server/routes/backup.js`, audit log samples, `server/lib/logger.js`
- **Responsible Party:** ISSO

**3.1.8 — Unsuccessful Logon Attempts**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document account lockout policy — e.g., lock after N failed attempts for M minutes. Describe rate limiting on `/api/auth/login`.)*
- **Evidence:** Rate limiting configuration, login failure logs, lockout policy document
- **Responsible Party:** System Administrator

**3.1.9 — Privacy and Security Notices**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** CUI banners are displayed on all pages via `cuiBanner.js`. Login page displays a DoD-compliant consent banner. Privacy policy is linked from every page footer.
- **Evidence:** `client/js/modules/cuiBanner.js`, screenshot of login banner, privacy policy document
- **Responsible Party:** ISSO

**3.1.10 — Session Lock**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document session timeout/lock behavior — e.g., JWT expiration + client-side idle detection that requires re-authentication.)*
- **Evidence:** JWT expiration configuration, client-side session management code
- **Responsible Party:** Application Developer

**3.1.11 — Session Termination**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** JWT tokens have a defined expiration period. The client application automatically logs out users when the token expires. Server-side logout invalidates the session.
- **Evidence:** JWT configuration, client logout code, session management policy
- **Responsible Party:** Application Developer

**3.1.12 — Remote Access Monitoring**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** All access to the platform is via HTTPS (remote by nature for a web application). Each request is logged with IP address, user identity, timestamp, and request details via the `requestId` middleware and logger.
- **Evidence:** `server/middleware/requestId.js`, `server/lib/logger.js`, access log samples
- **Responsible Party:** System Administrator

**3.1.13 — Remote Access Encryption**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** All remote access uses TLS 1.2+ encryption. The application enforces HTTPS via Helmet security headers (`Strict-Transport-Security`). Deprecated protocols (SSLv3, TLS 1.0/1.1) are disabled at the server/load-balancer level.
- **Evidence:** TLS configuration, Helmet configuration in `server/index.js`, SSL Labs scan results
- **Responsible Party:** System Administrator

**3.1.14 — Managed Access Control Points**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** All traffic is routed through a reverse proxy/load balancer that serves as the managed access control point. Direct access to application servers is blocked by firewall rules.
- **Evidence:** Network architecture diagram, firewall rules, reverse proxy configuration
- **Responsible Party:** System Administrator

**3.1.15 — Remote Privileged Commands**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Remote execution of privileged commands (e.g., via SSH to servers) requires MFA and is restricted to authorized administrators. Administrative API endpoints require `admin` role.
- **Evidence:** SSH configuration, MFA enforcement, admin access logs
- **Responsible Party:** System Administrator

**3.1.16 — Wireless Access Authorization**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document wireless access policy — e.g., corporate WiFi uses WPA3-Enterprise, guest network is isolated from CUI systems.)*
- **Evidence:** Wireless access policy, network segmentation diagram
- **Responsible Party:** System Administrator

**3.1.17 — Wireless Access Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document wireless encryption — e.g., WPA3-Enterprise with 802.1X authentication using RADIUS.)*
- **Evidence:** Wireless configuration, authentication server configuration
- **Responsible Party:** System Administrator

**3.1.18 — Mobile Device Control**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document mobile device management policy — e.g., MDM solution, device enrollment, remote wipe capability.)*
- **Evidence:** MDM policy, enrolled device inventory, remote wipe capability evidence
- **Responsible Party:** System Administrator

**3.1.19 — Mobile Device Encryption**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document mobile encryption requirements — e.g., full-device encryption required, CUI apps containerized.)*
- **Evidence:** MDM encryption enforcement, device compliance reports
- **Responsible Party:** System Administrator

**3.1.20 — External System Connections**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Connections to external systems are documented in Section 5 (Interconnections). Each connection requires an ISA or MOU. External API integrations use API keys with least-privilege scopes.
- **Evidence:** ISA/MOU documents, external system inventory, API key scope documentation
- **Responsible Party:** ISSM

**3.1.21 — Portable Storage Devices**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document USB/portable storage policy — e.g., USB storage disabled on CUI systems via group policy, approved encrypted drives only.)*
- **Evidence:** Group policy configuration, approved device list, DLP logs
- **Responsible Party:** System Administrator

**3.1.22 — Publicly Accessible Systems**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** CUI is never posted on publicly accessible portions of the system. The platform requires authentication for all CUI-containing pages. Public-facing pages (login, contact form) contain no CUI. Content review procedures prevent accidental CUI disclosure.
- **Evidence:** Authentication enforcement on all CUI routes, content review procedure, `server/middleware/auth.js`
- **Responsible Party:** ISSO

---

### 7.2 Awareness and Training (AT)

**Family Overview:** Ensure that managers, systems administrators, and users of organizational systems are made aware of the security risks associated with their activities and of applicable policies, standards, and procedures; and ensure that personnel are trained to carry out their assigned security responsibilities.

**NIST SP 800-53 Mapping:** AT-2, AT-3

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 23 | 3.2.1 | Ensure that managers, systems administrators, and users of organizational systems are made aware of the security risks associated with their activities and of the applicable policies, standards, and procedures related to the security of those systems. | ☐ |
| 24 | 3.2.2 | Ensure that personnel are trained to carry out their assigned information security-related duties and responsibilities. | ☐ |
| 25 | 3.2.3 | Provide security awareness training on recognizing and reporting potential indicators of insider threat. | ☐ |

#### AT Implementation Details

**3.2.1 — Security Awareness**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document security awareness program — e.g., annual security awareness training covering CUI handling, phishing, social engineering, physical security. New employee onboarding includes security briefing.)*
- **Evidence:** Training materials, completion records, training policy
- **Responsible Party:** ISSM

**3.2.2 — Role-Based Training**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document role-specific training — e.g., developers receive secure coding training (OWASP Top 10), admins receive system hardening training, users receive CUI handling training.)*
- **Evidence:** Role-based training plan, completion records, course certificates
- **Responsible Party:** ISSM

**3.2.3 — Insider Threat Awareness**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document insider threat training — e.g., annual training on recognizing behavioral indicators, reporting procedures, consequences.)*
- **Evidence:** Insider threat training materials, completion records, reporting hotline/procedures
- **Responsible Party:** ISSM

---

### 7.3 Audit and Accountability (AU)

**Family Overview:** Create, protect, and retain system audit logs and records to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity; and ensure that the actions of individual users can be uniquely traced.

**NIST SP 800-53 Mapping:** AU-2 through AU-12

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 26 | 3.3.1 | Create and retain system audit logs and records to the extent needed to enable the monitoring, analysis, investigation, and reporting of unlawful or unauthorized system activity. | ☐ |
| 27 | 3.3.2 | Ensure that the actions of individual system users can be uniquely traced to those users so they can be held accountable for their actions. | ☐ |
| 28 | 3.3.3 | Review and update logged events. | ☐ |
| 29 | 3.3.4 | Alert in the event of an audit logging process failure. | ☐ |
| 30 | 3.3.5 | Correlate audit record review, analysis, and reporting processes to support organizational processes for investigation and response to indications of unlawful, unauthorized, suspicious, or unusual activity. | ☐ |
| 31 | 3.3.6 | Provide audit record reduction and report generation to support on-demand analysis and reporting. | ☐ |
| 32 | 3.3.7 | Provide a system capability that compares and synchronizes internal system clocks with an authoritative source to generate time stamps for audit records. | ☐ |
| 33 | 3.3.8 | Protect audit information and audit logging tools from unauthorized access, modification, and deletion. | ☐ |
| 34 | 3.3.9 | Limit management of audit logging functionality to a subset of privileged users. | ☐ |

#### AU Implementation Details

**3.3.1 — System Auditing**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The platform creates structured audit logs in `logs/audit-history.jsonl` via `server/lib/logger.js`. Logged events include: authentication (login/logout/failed), data access (CRUD operations on CUI), administrative actions (user create/delete/role change), and system events (startup, shutdown, errors). Each log entry includes timestamp, user ID, action, resource, source IP, and outcome.
- **Evidence:** `server/lib/logger.js`, `logs/audit-history.jsonl` samples, `scripts/audit.js`, audit log configuration
- **Responsible Party:** System Administrator

**3.3.2 — User Accountability**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** All audit records include the authenticated user's unique identifier (from JWT `sub` claim). Shared accounts are prohibited by policy. The `requestId` middleware (`server/middleware/requestId.js`) assigns a unique correlation ID to each request for traceability.
- **Evidence:** Audit log samples showing user attribution, `server/middleware/requestId.js`, no-shared-accounts policy
- **Responsible Party:** ISSO

**3.3.3 — Logged Event Review**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document the process for reviewing and updating which events are logged — e.g., quarterly review of audit events, addition of new events as system changes.)*
- **Evidence:** Audit event review records, change log for logger configuration
- **Responsible Party:** ISSO

**3.3.4 — Audit Failure Alerting**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document audit failure detection — e.g., monitoring for log write failures, disk space alerts, SIEM health monitoring.)*
- **Evidence:** Alert configuration, monitoring dashboard, incident records for audit failures
- **Responsible Party:** System Administrator

**3.3.5 — Audit Correlation**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The `requestId` middleware enables correlation of related log entries across a single transaction. The `scripts/audit.js` script provides audit record analysis and reporting capability. *(Document SIEM integration if applicable.)*
- **Evidence:** `scripts/audit.js`, `server/middleware/requestId.js`, correlation analysis samples
- **Responsible Party:** ISSO

**3.3.6 — Audit Reduction and Reporting**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The audit script (`scripts/audit.js`) provides on-demand filtering, analysis, and report generation from audit logs. *(Document any SIEM-based reporting.)*
- **Evidence:** `scripts/audit.js`, report samples
- **Responsible Party:** ISSO

**3.3.7 — Time Synchronization**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document NTP configuration — e.g., servers synchronized to NIST time servers via NTP, audit timestamps use UTC.)*
- **Evidence:** NTP configuration, time source documentation
- **Responsible Party:** System Administrator

**3.3.8 — Audit Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document audit log protection — e.g., log files have restrictive file permissions (600), forwarded to read-only SIEM, integrity checksums, tamper-evident storage.)*
- **Evidence:** File permission configurations, SIEM forwarding config, integrity check procedures
- **Responsible Party:** System Administrator

**3.3.9 — Audit Management**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Only administrators can modify audit logging configuration. The logger module (`server/lib/logger.js`) is only configurable by modifying server code, which requires repository write access controlled by RBAC in the version control system.
- **Evidence:** Repository access controls, code review requirements, admin role documentation
- **Responsible Party:** System Administrator

---

### 7.4 Configuration Management (CM)

**Family Overview:** Establish and maintain baseline configurations and inventories of organizational systems; and establish and enforce security configuration settings.

**NIST SP 800-53 Mapping:** CM-2 through CM-8

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 35 | 3.4.1 | Establish and maintain baseline configurations and inventories of organizational systems (including hardware, software, firmware, and documentation) throughout the respective system development life cycles. | ☐ |
| 36 | 3.4.2 | Establish and enforce security configuration settings for information technology products employed in organizational systems. | ☐ |
| 37 | 3.4.3 | Track, review, approve or disapprove, and log changes to organizational systems. | ☐ |
| 38 | 3.4.4 | Analyze the security impact of changes prior to implementation. | ☐ |
| 39 | 3.4.5 | Define, document, approve, and enforce physical and logical access restrictions associated with changes to organizational systems. | ☐ |
| 40 | 3.4.6 | Employ the principle of least functionality by configuring organizational systems to provide only essential capabilities. | ☐ |
| 41 | 3.4.7 | Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services. | ☐ |
| 42 | 3.4.8 | Apply deny-by-exception (blacklisting) policy to prevent the use of unauthorized software or deny-all, permit-by-exception (whitelisting) policy to allow the execution of authorized software. | ☐ |
| 43 | 3.4.9 | Control and monitor user-installed software. | ☐ |

#### CM Implementation Details

**3.4.1 — Baseline Configuration**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** System baseline is maintained through version control (Git). The `package.json` and `package-lock.json` define the exact software inventory. Server configuration is documented in `render.yaml` (infrastructure-as-code). SBOM is generated on every release (`.github/workflows/release.yml`). Hardware inventory is maintained in Section 2.1.
- **Evidence:** `package.json`, `package-lock.json`, `render.yaml`, SBOM artifacts, `CHANGELOG.md`
- **Responsible Party:** System Administrator

**3.4.2 — Security Configuration Settings**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Security headers are enforced via Helmet middleware (CSP, HSTS, X-Frame-Options, etc.). CSRF protection is implemented (`server/middleware/csrf.js`). Environment variables control sensitive configuration (JWT secrets, database paths). Configuration follows CIS benchmarks where applicable.
- **Evidence:** `server/index.js` (Helmet config), `server/middleware/csrf.js`, environment variable documentation
- **Responsible Party:** System Administrator

**3.4.3 — Change Control**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** All changes go through Git version control with pull request reviews. CI pipeline (`.github/workflows/ci.yml`) runs automated tests, linting, accessibility testing, and security checks before merge. Changes are logged in `CHANGELOG.md`.
- **Evidence:** Git history, PR review records, CI pipeline results, `CHANGELOG.md`
- **Responsible Party:** Application Developer / ISSM

**3.4.4 — Security Impact Analysis**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document security impact analysis process — e.g., PR template includes security impact assessment, dependency updates trigger vulnerability scans.)*
- **Evidence:** PR templates, security review records, dependency scan results
- **Responsible Party:** ISSO

**3.4.5 — Access Restrictions for Change**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Repository access is controlled via GitHub roles (read, write, admin). Production deployments require approval. Direct database modification requires admin credentials. Server access requires SSH with MFA.
- **Evidence:** GitHub team/role configuration, deployment approval records, SSH access logs
- **Responsible Party:** System Administrator

**3.4.6 — Least Functionality**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The application is configured with only essential services enabled. Unused Node.js modules are not installed (`package.json` contains only required dependencies). Server exposes only necessary API endpoints. Unused ports are not opened.
- **Evidence:** `package.json` (minimal dependencies), network port scan results, service inventory
- **Responsible Party:** System Administrator

**3.4.7 — Nonessential Functionality**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document disabled services/ports — e.g., only HTTPS (443) exposed, debug endpoints disabled in production, development tools excluded from production builds.)*
- **Evidence:** Firewall rules, production build configuration (`vite.config.js`), service inventory
- **Responsible Party:** System Administrator

**3.4.8 — Application Whitelisting / Blacklisting**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document software restriction policy — e.g., only approved npm packages allowed, license compliance check in CI prevents unauthorized licenses.)*
- **Evidence:** License compliance check results (`.github/workflows/ci.yml`), approved software list
- **Responsible Party:** System Administrator

**3.4.9 — User-Installed Software**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document policy on user-installed software — e.g., endpoint management prevents unauthorized software installation on workstations.)*
- **Evidence:** Endpoint management configuration, software inventory scans
- **Responsible Party:** System Administrator

---

### 7.5 Identification and Authentication (IA)

**Family Overview:** Identify system users, processes acting on behalf of users, and devices; and authenticate the identities of users, processes, and devices as a prerequisite to allowing access.

**NIST SP 800-53 Mapping:** IA-2 through IA-11

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 44 | 3.5.1 | Identify system users, processes acting on behalf of users, and devices. | ☐ |
| 45 | 3.5.2 | Authenticate (or verify) the identities of users, processes, or devices, as a prerequisite to allowing access to organizational systems. | ☐ |
| 46 | 3.5.3 | Use multifactor authentication for local and network access to privileged accounts and for network access to non-privileged accounts. | ☐ |
| 47 | 3.5.4 | Employ replay-resistant authentication mechanisms for network access to privileged and non-privileged accounts. | ☐ |
| 48 | 3.5.5 | Prevent reuse of identifiers for a defined period. | ☐ |
| 49 | 3.5.6 | Disable identifiers after a defined period of inactivity. | ☐ |
| 50 | 3.5.7 | Enforce a minimum password complexity and change of characters when new passwords are created. | ☐ |
| 51 | 3.5.8 | Prohibit password reuse for a specified number of generations. | ☐ |
| 52 | 3.5.9 | Allow temporary password use for system logons with an immediate change to a permanent password. | ☐ |
| 53 | 3.5.10 | Store and transmit only cryptographically-protected passwords. | ☐ |
| 54 | 3.5.11 | Obscure feedback of authentication information. | ☐ |

#### IA Implementation Details

**3.5.1 — Identification**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Users are identified by unique usernames and database IDs. JWT tokens contain the user's unique `sub` (subject) claim for process-level identification. No shared accounts are permitted.
- **Evidence:** User account schema, JWT payload structure, `server/routes/auth.js`
- **Responsible Party:** System Administrator

**3.5.2 — Authentication**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Users authenticate via username/password at `/api/auth/login`. Passwords are verified against bcrypt hashes stored in the database. Upon successful authentication, a signed JWT is issued with an expiration time.
- **Evidence:** `server/routes/auth.js`, `server/middleware/auth.js`, `tests/routes/auth.test.js`
- **Responsible Party:** Application Developer

**3.5.3 — Multifactor Authentication**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** MFA is implemented via the `/api/mfa` endpoint (`server/routes/mfa.js`). *(Document MFA method — e.g., TOTP via authenticator app, FIDO2.)*
- **Evidence:** `server/routes/mfa.js`, MFA enrollment records, MFA policy
- **Responsible Party:** System Administrator

**3.5.4 — Replay-Resistant Authentication**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** JWT tokens are time-limited (expiration claim) preventing replay after expiration. CSRF tokens (`server/middleware/csrf.js`) prevent cross-site replay attacks. All authentication occurs over TLS preventing man-in-the-middle replay.
- **Evidence:** JWT expiration configuration, `server/middleware/csrf.js`, TLS configuration
- **Responsible Party:** Application Developer

**3.5.5 — Identifier Reuse Prevention**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document identifier reuse prevention — e.g., deleted usernames cannot be reassigned for 180 days.)*
- **Evidence:** Account management procedures, database constraints
- **Responsible Party:** System Administrator

**3.5.6 — Inactive Identifier Disabling**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document inactive account policy — e.g., accounts inactive for 90 days are automatically disabled.)*
- **Evidence:** Inactive account report, automated disabling mechanism
- **Responsible Party:** System Administrator

**3.5.7 — Password Complexity**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document password requirements — e.g., minimum 14 characters, must include uppercase, lowercase, number, special character. Passwords screened against breach databases.)*
- **Evidence:** Password policy, enforcement configuration in `server/routes/auth.js`, test results
- **Responsible Party:** Application Developer

**3.5.8 — Password Reuse Prevention**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document password history — e.g., last 24 passwords cannot be reused.)*
- **Evidence:** Password history implementation, policy document
- **Responsible Party:** Application Developer

**3.5.9 — Temporary Passwords**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document temporary password process — e.g., admin-issued temporary passwords must be changed on first login.)*
- **Evidence:** First-login password change enforcement, administration procedures
- **Responsible Party:** System Administrator

**3.5.10 — Cryptographic Password Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Passwords are hashed using bcrypt (`bcryptjs` library) before storage — never stored in plaintext. Password transmission occurs only over TLS-encrypted connections. JWT tokens do not contain passwords.
- **Evidence:** `server/routes/auth.js` (bcrypt usage), TLS configuration, database schema
- **Responsible Party:** Application Developer

**3.5.11 — Authentication Feedback Obscuring**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Login forms use `type="password"` to mask input. Error messages do not distinguish between invalid username and invalid password ("Invalid credentials" for both). Failed MFA attempts return generic error messages.
- **Evidence:** Client login form, `server/routes/auth.js` error responses
- **Responsible Party:** Application Developer

---

### 7.6 Incident Response (IR)

**Family Overview:** Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities; and track, document, and report incidents.

**NIST SP 800-53 Mapping:** IR-2 through IR-6

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 55 | 3.6.1 | Establish an operational incident-handling capability for organizational systems that includes preparation, detection, analysis, containment, recovery, and user response activities. | ☐ |
| 56 | 3.6.2 | Track, document, and report incidents to designated officials and/or authorities both internal and external to the organization. | ☐ |
| 57 | 3.6.3 | Test the organizational incident response capability. | ☐ |

#### IR Implementation Details

**3.6.1 — Incident Handling**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document incident response plan covering: preparation, detection/analysis, containment, eradication, recovery, post-incident activity. Reference DFARS 252.204-7012 72-hour reporting requirement to DC3.)*
- **Evidence:** Incident Response Plan document, incident response team roster, communication procedures
- **Responsible Party:** Incident Response Lead / ISSM

**3.6.2 — Incident Tracking and Reporting**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document incident tracking — e.g., incidents tracked in ticketing system, reported to ISSM within 1 hour, reported to DC3 via DIBNet within 72 hours per DFARS 7012.)*
- **Evidence:** Incident tracking system, reporting templates, DC3/DIBNet reporting procedures
- **Responsible Party:** Incident Response Lead

**3.6.3 — Incident Response Testing**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document IR testing — e.g., annual tabletop exercises, simulated phishing campaigns, red team engagements.)*
- **Evidence:** Exercise reports, after-action reports, lessons-learned documentation
- **Responsible Party:** ISSM

---

### 7.7 Maintenance (MA)

**Family Overview:** Perform maintenance on organizational systems; and provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance.

**NIST SP 800-53 Mapping:** MA-2 through MA-6

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 58 | 3.7.1 | Perform maintenance on organizational systems. | ☐ |
| 59 | 3.7.2 | Provide controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance. | ☐ |
| 60 | 3.7.3 | Ensure equipment removed for off-site maintenance is sanitized of any CUI. | ☐ |
| 61 | 3.7.4 | Check media containing diagnostic and test programs for malicious code before the media are used in organizational systems. | ☐ |
| 62 | 3.7.5 | Require multifactor authentication to establish nonlocal maintenance sessions via external network connections and terminate such connections when nonlocal maintenance is complete. | ☐ |
| 63 | 3.7.6 | Supervise the maintenance activities of maintenance personnel without required access authorization. | ☐ |

#### MA Implementation Details

**3.7.1 — System Maintenance**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document maintenance procedures — e.g., scheduled maintenance windows, patching cadence, dependency updates via Dependabot.)*
- **Evidence:** Maintenance schedule, Dependabot configuration (`.github/dependabot.yml`), patch records
- **Responsible Party:** System Administrator

**3.7.2 — Maintenance Tools and Personnel**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document approved maintenance tools and personnel screening — e.g., only authorized tools, maintenance personnel have background checks.)*
- **Evidence:** Approved tool list, personnel screening records
- **Responsible Party:** System Administrator

**3.7.3 — Off-Site Maintenance Sanitization**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document sanitization procedures — e.g., media is wiped per NIST SP 800-88 before leaving the CUI boundary.)*
- **Evidence:** Sanitization records, NIST SP 800-88 procedures
- **Responsible Party:** System Administrator

**3.7.4 — Diagnostic Media Scanning**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document media scanning — e.g., all diagnostic media scanned with approved anti-malware before use.)*
- **Evidence:** Scanning procedures, scan logs
- **Responsible Party:** System Administrator

**3.7.5 — Nonlocal Maintenance MFA**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document remote maintenance MFA — e.g., SSH sessions require MFA via hardware key, sessions terminated when complete.)*
- **Evidence:** MFA configuration for maintenance access, session termination evidence
- **Responsible Party:** System Administrator

**3.7.6 — Maintenance Personnel Supervision**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document supervision procedures — e.g., unauthorized maintenance personnel are escorted and supervised, sessions are monitored and recorded.)*
- **Evidence:** Supervision logs, escorted access records
- **Responsible Party:** System Administrator

---

### 7.8 Media Protection (MP)

**Family Overview:** Protect system media containing CUI, both paper and digital; limit access to CUI on system media to authorized users; and sanitize or destroy system media before disposal or release.

**NIST SP 800-53 Mapping:** MP-2 through MP-7

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 64 | 3.8.1 | Protect (i.e., physically control and securely store) system media containing CUI, both paper and digital. | ☐ |
| 65 | 3.8.2 | Limit access to CUI on system media to authorized users. | ☐ |
| 66 | 3.8.3 | Sanitize or destroy system media containing CUI before disposal or release for reuse. | ☐ |
| 67 | 3.8.4 | Mark media with necessary CUI markings and distribution limitations. | ☐ |
| 68 | 3.8.5 | Control access to media containing CUI and maintain accountability for media during transport outside of controlled areas. | ☐ |
| 69 | 3.8.6 | Implement cryptographic mechanisms to protect the confidentiality of CUI stored on digital media during transport unless otherwise protected by alternative physical safeguards. | ☐ |
| 70 | 3.8.7 | Control the use of removable media on system components. | ☐ |
| 71 | 3.8.8 | Prohibit the use of portable storage devices when such devices have no identifiable owner. | ☐ |
| 72 | 3.8.9 | Protect the confidentiality of backup CUI at storage locations. | ☐ |

#### MP Implementation Details

**3.8.1 — Media Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document media protection — e.g., digital media stored in locked server rooms, paper CUI stored in GSA-approved containers, access restricted to authorized personnel.)*
- **Evidence:** Physical security controls, media storage locations, access logs
- **Responsible Party:** System Administrator

**3.8.2 — Media Access Limitation**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Database backups created via `/api/backup` are restricted to admin role. File system permissions restrict access to log files and database files. *(Document additional media access controls.)*
- **Evidence:** `server/routes/backup.js`, file system permissions, access control lists
- **Responsible Party:** System Administrator

**3.8.3 — Media Sanitization**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document sanitization procedures — e.g., digital media sanitized per NIST SP 800-88 Rev 1 (Clear, Purge, or Destroy based on media type and CUI category). Sanitization logged.)*
- **Evidence:** NIST SP 800-88 procedures, sanitization logs, destruction certificates
- **Responsible Party:** System Administrator

**3.8.4 — Media Marking**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document media marking — e.g., all CUI media marked with CUI banner, category, and distribution statement. Digital files include CUI markings in headers/footers.)*
- **Evidence:** Marking procedures, sample marked media, CUI marking standard
- **Responsible Party:** ISSO

**3.8.5 — Media Transport Accountability**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document transport controls — e.g., chain of custody logs for physical media, encrypted containers for digital media in transit.)*
- **Evidence:** Chain of custody forms, transport logs
- **Responsible Party:** System Administrator

**3.8.6 — Transport Encryption**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document transport encryption — e.g., CUI on portable media is encrypted with FIPS 140-2 validated encryption (AES-256). Encryption keys managed separately from media.)*
- **Evidence:** Encryption tool documentation, FIPS validation certificates, key management procedures
- **Responsible Party:** System Administrator

**3.8.7 — Removable Media Control**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document removable media policy — e.g., USB storage disabled via group policy on CUI workstations, approved encrypted drives require authorization.)*
- **Evidence:** Group policy configuration, approved device list, exception requests
- **Responsible Party:** System Administrator

**3.8.8 — Unidentified Portable Storage**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document policy — e.g., unidentified/unowned portable storage devices are prohibited and reported to security.)*
- **Evidence:** Acceptable use policy, awareness training materials
- **Responsible Party:** System Administrator

**3.8.9 — Backup CUI Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Database backups are created through the backup route (`server/routes/backup.js`) and restricted to admin access. *(Document backup encryption and storage location security.)*
- **Evidence:** `server/routes/backup.js`, backup encryption configuration, storage location security
- **Responsible Party:** System Administrator

---

### 7.9 Personnel Security (PS)

**Family Overview:** Screen individuals prior to authorizing access to organizational systems containing CUI; and ensure that systems and CUI are protected during and after personnel actions such as terminations and transfers.

**NIST SP 800-53 Mapping:** PS-3 through PS-8

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 73 | 3.9.1 | Screen individuals prior to authorizing access to organizational systems containing CUI. | ☐ |
| 74 | 3.9.2 | Ensure that organizational systems containing CUI are protected during and after personnel actions such as terminations and transfers. | ☐ |

#### PS Implementation Details

**3.9.1 — Personnel Screening**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document screening procedures — e.g., background checks (NACI minimum) completed before CUI access is granted. Re-investigation every 5 years.)*
- **Evidence:** Screening policy, background check records (redacted), access authorization forms
- **Responsible Party:** HR / ISSM

**3.9.2 — Personnel Transfer and Termination**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document offboarding — e.g., access revoked within 24 hours of termination, exit interview includes CUI non-disclosure reminder, credentials rotated if shared knowledge exists.)*
- **Evidence:** Offboarding checklist, access revocation records, credential rotation logs
- **Responsible Party:** HR / System Administrator

---

### 7.10 Physical Protection (PE)

**Family Overview:** Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals; and protect and monitor the physical facility and support infrastructure.

**NIST SP 800-53 Mapping:** PE-2 through PE-17

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 75 | 3.10.1 | Limit physical access to organizational systems, equipment, and the respective operating environments to authorized individuals. | ☐ |
| 76 | 3.10.2 | Protect and monitor the physical facility and support infrastructure for organizational systems. | ☐ |
| 77 | 3.10.3 | Escort visitors and monitor visitor activity. | ☐ |
| 78 | 3.10.4 | Maintain audit logs of physical access. | ☐ |
| 79 | 3.10.5 | Control and manage physical access devices. | ☐ |
| 80 | 3.10.6 | Enforce safeguarding measures for CUI at alternate work sites. | ☐ |

#### PE Implementation Details

**3.10.1 — Physical Access Limits**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document physical access controls — e.g., data center access requires badge + PIN, server rooms locked, access list maintained. For cloud hosting, reference CSP's physical security (e.g., SOC 2 Type II report).)*
- **Evidence:** Physical access policy, badge system configuration, CSP compliance reports
- **Responsible Party:** Facility Manager / System Administrator

**3.10.2 — Physical Facility Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document facility protection — e.g., 24/7 security monitoring, CCTV, environmental controls (fire suppression, HVAC), UPS.)*
- **Evidence:** Monitoring service agreement, CCTV configuration, environmental control documentation
- **Responsible Party:** Facility Manager

**3.10.3 — Visitor Escort**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document visitor policy — e.g., visitors registered at reception, escorted at all times in CUI areas, visitor badges clearly distinguishable.)*
- **Evidence:** Visitor policy, visitor logs, badge samples
- **Responsible Party:** Facility Manager

**3.10.4 — Physical Access Logs**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document physical access logging — e.g., badge reader logs maintained for 1 year, visitor sign-in logs maintained for 3 years.)*
- **Evidence:** Badge reader logs, visitor sign-in sheets, retention policy
- **Responsible Party:** Facility Manager

**3.10.5 — Physical Access Devices**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document access device management — e.g., badge inventory maintained, lost badges reported and deactivated within 4 hours, locks re-keyed when keys are lost.)*
- **Evidence:** Badge inventory, lost badge procedures, key management log
- **Responsible Party:** Facility Manager

**3.10.6 — Alternate Work Site Safeguards**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document remote work safeguards — e.g., VPN required, screen privacy filters, dedicated workspace, secure Wi-Fi, full-disk encryption on devices.)*
- **Evidence:** Remote work policy, VPN configuration, device encryption verification
- **Responsible Party:** ISSO

---

### 7.11 Risk Assessment (RA)

**Family Overview:** Periodically assess risk to organizational operations, organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI.

**NIST SP 800-53 Mapping:** RA-3, RA-5

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 81 | 3.11.1 | Periodically assess the risk to organizational operations (including mission, functions, image, or reputation), organizational assets, and individuals, resulting from the operation of organizational systems and the associated processing, storage, or transmission of CUI. | ☐ |
| 82 | 3.11.2 | Scan for vulnerabilities in organizational systems and applications periodically and when new vulnerabilities affecting those systems and applications are identified. | ☐ |
| 83 | 3.11.3 | Remediate vulnerabilities in accordance with risk assessments. | ☐ |

#### RA Implementation Details

**3.11.1 — Risk Assessment**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document risk assessment — e.g., annual risk assessment per NIST SP 800-30, threat modeling for new features, risk register maintained and reviewed quarterly.)*
- **Evidence:** Risk assessment report, risk register, threat model documentation
- **Responsible Party:** ISSM

**3.11.2 — Vulnerability Scanning**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Automated vulnerability scanning is performed through multiple mechanisms: `npm audit` runs in CI pipeline on every build (`.github/workflows/ci.yml`), Dependabot monitors for dependency vulnerabilities (`.github/dependabot.yml`), and CodeQL performs static analysis. *(Document any additional infrastructure scanning.)*
- **Evidence:** CI pipeline results, Dependabot alerts, CodeQL scan results, `codeql_db/` directory
- **Responsible Party:** Application Developer / System Administrator

**3.11.3 — Vulnerability Remediation**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document remediation process — e.g., critical vulnerabilities remediated within 48 hours, high within 7 days, medium within 30 days, low within 90 days. Tracked in POA&M.)*
- **Evidence:** Vulnerability tracking records, remediation timeline evidence, POA&M
- **Responsible Party:** System Administrator

---

### 7.12 Security Assessment (CA)

**Family Overview:** Periodically assess the security controls in organizational systems to determine if the controls are effective in their application; develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities; and monitor security controls on an ongoing basis.

**NIST SP 800-53 Mapping:** CA-2, CA-5, CA-7, CA-9

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 84 | 3.12.1 | Periodically assess the security controls in organizational systems to determine if the controls are effective in their application. | ☐ |
| 85 | 3.12.2 | Develop and implement plans of action designed to correct deficiencies and reduce or eliminate vulnerabilities in organizational systems. | ☐ |
| 86 | 3.12.3 | Monitor security controls on an ongoing basis to ensure the continued effectiveness of the controls. | ☐ |
| 87 | 3.12.4 | Develop, document, and periodically update system security plans that describe system boundaries, system environments of operation, how security requirements are implemented, and the relationships with or connections to other systems. | ☐ |

#### CA Implementation Details

**3.12.1 — Security Control Assessment**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document assessment process — e.g., annual self-assessment against all 110 controls, independent assessment every 3 years by C3PAO (for CMMC Level 2).)*
- **Evidence:** Assessment reports, assessor qualifications, findings documentation
- **Responsible Party:** ISSM

**3.12.2 — Plans of Action (POA&M)**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** A Plan of Action and Milestones (POA&M) document is maintained to track security deficiencies, planned corrective actions, responsible parties, and completion milestones. See `docs/POAM-TEMPLATE.md`.
- **Evidence:** POA&M document, quarterly review records, closure evidence
- **Responsible Party:** ISSM

**3.12.3 — Continuous Monitoring**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Continuous monitoring is achieved through: CI/CD pipeline automated security checks, Dependabot vulnerability alerts, audit log monitoring, and periodic control assessments. See Section 8 for the full continuous monitoring strategy.
- **Evidence:** CI/CD results, Dependabot history, monitoring dashboard, assessment schedule
- **Responsible Party:** ISSO

**3.12.4 — System Security Plan**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** This document (SSP) fulfills this requirement. It is reviewed and updated annually, or upon significant system changes. The SSP describes the system boundary, environment, security control implementations, and interconnections.
- **Evidence:** This document, revision history (Section 11)
- **Responsible Party:** ISSM

---

### 7.13 System and Communications Protection (SC)

**Family Overview:** Monitor, control, and protect communications (i.e., information transmitted or received by organizational systems) at the external boundaries and key internal boundaries of organizational systems; and employ architectural designs, software development techniques, and systems engineering principles that promote effective information security.

**NIST SP 800-53 Mapping:** SC-7 through SC-28

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 88 | 3.13.1 | Monitor, control, and protect communications (i.e., information transmitted or received by organizational systems) at the external boundaries and key internal boundaries of organizational systems. | ☐ |
| 89 | 3.13.2 | Employ architectural designs, software development techniques, and systems engineering principles that promote effective information security within organizational systems. | ☐ |
| 90 | 3.13.3 | Separate user functionality from system management functionality. | ☐ |
| 91 | 3.13.4 | Prevent unauthorized and unintended information transfer via shared system resources. | ☐ |
| 92 | 3.13.5 | Implement subnetworks for publicly accessible system components that are physically or logically separated from internal networks. | ☐ |
| 93 | 3.13.6 | Deny network communications traffic by default and allow network communications traffic by exception (i.e., deny all, permit by exception). | ☐ |
| 94 | 3.13.7 | Prevent remote devices from simultaneously establishing non-remote connections with organizational systems and communicating via some other connection to resources in external networks (i.e., split tunneling). | ☐ |
| 95 | 3.13.8 | Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI during transmission unless otherwise protected by alternative physical safeguards. | ☐ |
| 96 | 3.13.9 | Terminate network connections associated with communications sessions at the end of the sessions or after a defined period of inactivity. | ☐ |
| 97 | 3.13.10 | Establish and manage cryptographic keys for cryptography employed in organizational systems. | ☐ |
| 98 | 3.13.11 | Employ FIPS-validated cryptography when used to protect the confidentiality of CUI. | ☐ |
| 99 | 3.13.12 | Prohibit remote activation of collaborative computing devices and provide indication of devices in use to users present at the device. | ☐ |
| 100 | 3.13.13 | Control and monitor the use of mobile code. | ☐ |
| 101 | 3.13.14 | Control and monitor the use of Voice over Internet Protocol (VoIP) technologies. | ☐ |
| 102 | 3.13.15 | Protect the authenticity of communications sessions. | ☐ |
| 103 | 3.13.16 | Protect the confidentiality of CUI at rest. | ☐ |

#### SC Implementation Details

**3.13.1 — Boundary Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document boundary controls — e.g., reverse proxy/WAF at boundary, security headers enforced via Helmet, CORS policy restricts origins, rate limiting prevents abuse.)*
- **Evidence:** Reverse proxy/WAF configuration, Helmet config in `server/index.js`, CORS configuration
- **Responsible Party:** System Administrator

**3.13.2 — Security Architecture**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The platform is architected with security-in-depth principles: defense-in-depth (TLS + auth + RBAC + CSRF + input validation), secure defaults (Helmet security headers), fail-secure error handling, parameterized database queries (SQL injection prevention), and automated security testing in CI.
- **Evidence:** Architecture documentation, `server/index.js`, CI security checks, secure coding standards
- **Responsible Party:** Application Developer / ISSO

**3.13.3 — User/Management Separation**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Administrative functions (user management, backup, system configuration) are separated from standard user functionality through RBAC. Admin routes are distinct from user routes. *(Document infrastructure-level separation if applicable.)*
- **Evidence:** Route structure (`server/routes/`), RBAC matrix, admin panel separation
- **Responsible Party:** Application Developer

**3.13.4 — Shared Resource Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document shared resource protection — e.g., database queries are parameterized to prevent data leakage between tenants, session data is user-specific, no shared temp files.)*
- **Evidence:** Parameterized query evidence, session isolation, resource allocation controls
- **Responsible Party:** Application Developer

**3.13.5 — DMZ / Public Subnet**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document network segmentation — e.g., public-facing reverse proxy in DMZ, application servers in private subnet, database in isolated subnet with no direct internet access.)*
- **Evidence:** Network architecture diagram, subnet configuration, firewall rules
- **Responsible Party:** System Administrator

**3.13.6 — Deny-All, Permit-by-Exception**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document network default-deny — e.g., firewall configured to deny all inbound traffic except HTTPS (443), security groups restrict east-west traffic.)*
- **Evidence:** Firewall ruleset, security group configuration
- **Responsible Party:** System Administrator

**3.13.7 — Split Tunneling Prevention**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document split tunneling policy — e.g., VPN configuration forces all traffic through corporate VPN when connected to CUI systems.)*
- **Evidence:** VPN configuration, split tunneling policy
- **Responsible Party:** System Administrator

**3.13.8 — CUI Transmission Encryption**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** All data in transit is encrypted via TLS 1.2+. The application enforces HSTS via Helmet middleware. API responses containing CUI are only served over encrypted connections. *(Document VPN or other network-level encryption if applicable.)*
- **Evidence:** TLS configuration, Helmet HSTS config, SSL Labs scan, `server/index.js`
- **Responsible Party:** System Administrator

**3.13.9 — Session Termination**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Network connections are terminated based on JWT token expiration. HTTP keep-alive has a configurable timeout. *(Document load balancer/proxy connection timeout settings.)*
- **Evidence:** JWT expiration configuration, server timeout settings
- **Responsible Party:** System Administrator

**3.13.10 — Cryptographic Key Management**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document key management — e.g., JWT signing keys stored in environment variables (not in code), TLS certificates managed via automated certificate authority, key rotation schedule defined.)*
- **Evidence:** Key management procedures, rotation schedule, key storage documentation
- **Responsible Party:** System Administrator

**3.13.11 — FIPS-Validated Cryptography**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document FIPS compliance — e.g., Node.js configured with OpenSSL in FIPS mode, TLS cipher suites limited to FIPS-approved algorithms, bcrypt for password hashing uses approved primitives.)*
- **Evidence:** FIPS configuration, cipher suite configuration, FIPS validation certificates
- **Responsible Party:** System Administrator

**3.13.12 — Collaborative Computing Devices**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document collaborative device policy — e.g., webcams/microphones not remotely activatable, indicator lights required when in use. Mark N/A if not applicable to system.)*
- **Evidence:** Device policy, indicator light documentation (or N/A justification)
- **Responsible Party:** System Administrator

**3.13.13 — Mobile Code**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The platform serves JavaScript as mobile code to client browsers. Content Security Policy (CSP) headers via Helmet restrict script sources to trusted origins only (`script-src 'self'`). No eval or dynamic code execution is used.
- **Evidence:** CSP configuration in `server/index.js`, client-side JavaScript review
- **Responsible Party:** Application Developer

**3.13.14 — VoIP**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document VoIP controls or mark N/A — e.g., system does not include VoIP functionality.)*
- **Evidence:** *(N/A justification if applicable)*
- **Responsible Party:** System Administrator

**3.13.15 — Session Authenticity**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Session authenticity is protected through: signed JWT tokens (HMAC-SHA256), CSRF tokens on state-changing requests (`server/middleware/csrf.js`), TLS for transport integrity, and secure cookie flags.
- **Evidence:** JWT signing configuration, `server/middleware/csrf.js`, cookie configurations
- **Responsible Party:** Application Developer

**3.13.16 — CUI at Rest Encryption**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document at-rest encryption — e.g., database encrypted with AES-256, file storage encrypted, full-disk encryption on all servers, FIPS-validated encryption modules.)*
- **Evidence:** Encryption configuration, FIPS validation, key management procedures
- **Responsible Party:** System Administrator

---

### 7.14 System and Information Integrity (SI)

**Family Overview:** Identify, report, and correct system flaws in a timely manner; provide protection from malicious code; and monitor system security alerts and advisories and take action in response.

**NIST SP 800-53 Mapping:** SI-2 through SI-7

| # | Control ID | Requirement | Status |
|---|-----------|-------------|--------|
| 104 | 3.14.1 | Identify, report, and correct information and information system flaws in a timely manner. | ☐ |
| 105 | 3.14.2 | Provide protection from malicious code at appropriate locations within organizational information systems. | ☐ |
| 106 | 3.14.3 | Monitor system security alerts and advisories and take action in response. | ☐ |
| 107 | 3.14.4 | Update malicious code protection mechanisms when new releases are available. | ☐ |
| 108 | 3.14.5 | Perform periodic scans of the information system and real-time scans of files from external sources as files are downloaded, opened, or executed. | ☐ |
| 109 | 3.14.6 | Monitor organizational systems, including inbound and outbound communications traffic, to detect attacks and indicators of potential attacks. | ☐ |
| 110 | 3.14.7 | Identify unauthorized use of organizational systems. | ☐ |

#### SI Implementation Details

**3.14.1 — Flaw Remediation**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** The CI/CD pipeline includes automated flaw detection: `npm audit` checks for known vulnerabilities on every build, Dependabot automatically creates PRs for vulnerable dependencies, and CodeQL performs static code analysis. Flaws are tracked in the issue tracker and POA&M. *(Document remediation SLAs.)*
- **Evidence:** CI pipeline results, Dependabot PRs, CodeQL results, issue tracker, `codeql_db/`
- **Responsible Party:** Application Developer

**3.14.2 — Malicious Code Protection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document anti-malware — e.g., endpoint protection on all developer workstations and servers, real-time scanning enabled, definitions auto-updated.)*
- **Evidence:** Anti-malware deployment report, scan logs, definition update logs
- **Responsible Party:** System Administrator

**3.14.3 — Security Alert Monitoring**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** Dependabot monitors for security advisories affecting project dependencies and automatically creates alerts. GitHub security advisory notifications are enabled. *(Document subscription to additional threat intelligence feeds — e.g., US-CERT, CISA alerts.)*
- **Evidence:** Dependabot configuration, advisory notification settings, threat feed subscriptions
- **Responsible Party:** ISSO

**3.14.4 — Malicious Code Protection Updates**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document update mechanisms — e.g., anti-malware definitions auto-updated daily, engine updates applied within 48 hours of release.)*
- **Evidence:** Auto-update configuration, update logs
- **Responsible Party:** System Administrator

**3.14.5 — System and File Scanning**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document scanning — e.g., weekly full system scans, real-time scanning of uploads, CI pipeline scans all dependencies on every build.)*
- **Evidence:** Scan schedule, scan logs, CI pipeline configuration
- **Responsible Party:** System Administrator

**3.14.6 — Communications Monitoring**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document network monitoring — e.g., IDS/IPS at network boundary, application-level logging of all requests (requestId middleware + logger), anomaly detection for unusual patterns.)*
- **Evidence:** IDS/IPS configuration, `server/middleware/requestId.js`, `server/lib/logger.js`, alert configurations
- **Responsible Party:** System Administrator

**3.14.7 — Unauthorized Use Detection**

- **Status:** *(Implemented / Partially Implemented / Planned / N/A)*
- **Implementation:** *(Document unauthorized use detection — e.g., audit log analysis for anomalous patterns, failed login monitoring, after-hours access alerts, impossible travel detection.)*
- **Evidence:** Monitoring rules, alert configurations, incident records
- **Responsible Party:** ISSO

---

## 8. Continuous Monitoring Strategy

### 8.1 Monitoring Activities

| Activity | Frequency | Responsible | Tool/Method |
|---------|-----------|-------------|-------------|
| Automated vulnerability scanning (dependencies) | Every CI build | Developer | `npm audit`, Dependabot |
| Static code analysis | Every CI build | Developer | CodeQL, ESLint |
| Accessibility testing | Every CI build | Developer | axe-core |
| License compliance check | Every CI build | Developer | license-checker |
| SBOM generation | Every release | Developer | CycloneDX |
| Audit log review | Weekly | ISSO | `scripts/audit.js` |
| Access review (user accounts) | Quarterly | ISSM | Manual review |
| Full security control assessment | Annually | ISSM | Self-assessment |
| Penetration testing | Annually | ISSM | Third-party |
| C3PAO assessment (CMMC Level 2) | Triennially | AO | C3PAO |

### 8.2 Metrics and Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to patch critical vulnerabilities | ≤ 48 hours | Dependabot alert to fix merge |
| User access review completion | 100% quarterly | Account review records |
| Security awareness training completion | 100% annually | Training records |
| Audit log retention | ≥ 1 year | Log storage verification |
| Incident response time | ≤ 1 hour detection | Incident records |
| SPRS score | ≥ 110 | Self-assessment |

---

## 9. Incident Response Summary

### 9.1 Incident Categories

| Category | Description | Reporting Timeline |
|---------|-------------|-------------------|
| **Cat 1 — Root-level Compromise** | Unauthorized root/admin access | Immediate (within 1 hour) |
| **Cat 2 — User-level Compromise** | Unauthorized user-level access | Within 4 hours |
| **Cat 3 — Unsuccessful Activity** | Failed attempts, scans, probes | Within 24 hours |
| **Cat 4 — Denial of Service** | Service disruption attack | Within 4 hours |
| **Cat 5 — Policy Violation** | Non-compliance with security policy | Within 24 hours |
| **Cat 6 — Reconnaissance** | Information gathering attempts | Within 72 hours |

### 9.2 DFARS 252.204-7012 Reporting

Per DFARS 252.204-7012, cyber incidents affecting Covered Defense Information must be reported to the DoD Cyber Crime Center (DC3) via DIBNet within **72 hours** of discovery. The report must include:

1. Company name and point of contact
2. Type and scope of cyber incident
3. Compromised data description
4. Systems and networks affected
5. Incident timeline
6. Damage assessment
7. Preservation of forensic evidence (minimum 90 days)

### 9.3 Incident Response Contacts

| Role | Name | Phone | Email |
|------|------|-------|-------|
| IR Lead | *(Name)* | *(Number)* | *(Email)* |
| ISSM | *(Name)* | *(Number)* | *(Email)* |
| DC3 / DIBNet | — | 1-877-838-2174 | dc3.mil/dibnet |
| *(Additional contacts)* | | | |

---

## 10. Attachments and Artifacts

| # | Artifact | Description | Location |
|---|---------|-------------|----------|
| A | Network Architecture Diagram | System boundary and data flows | *(Link/path)* |
| B | Data Flow Diagram | CUI data flow through system | *(Link/path)* |
| C | Hardware/Software Inventory | Complete system inventory | Section 2 of this document |
| D | RBAC Matrix | Role-based access control matrix | *(Link/path)* |
| E | Incident Response Plan | Full IR plan | *(Link/path)* |
| F | POA&M | Plan of Action & Milestones | `docs/POAM-TEMPLATE.md` |
| G | SBOM | Software Bill of Materials | Generated per release |
| H | Risk Assessment Report | Annual risk assessment | *(Link/path)* |
| I | Training Records | Security awareness training | *(Link/path)* |
| J | Penetration Test Report | Most recent pen test results | *(Link/path)* |
| K | SPRS Score Documentation | Self-assessment scoring | *(Link/path)* |
| L | ATO / Authorization Letter | Authorization to Operate | *(Link/path)* |

---

## 11. Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | *(Date)* | *(Author)* | Initial SSP creation |
| | | | |
| | | | |

---

**END OF SYSTEM SECURITY PLAN**

*This document contains Controlled Unclassified Information (CUI) and must be handled in accordance with 32 CFR Part 2002 and organizational CUI handling procedures.*
