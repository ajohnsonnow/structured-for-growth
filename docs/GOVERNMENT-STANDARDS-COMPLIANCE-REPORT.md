# Comprehensive Government & Military Documentation Standards Compliance Report

**Prepared:** February 14, 2026  
**Scope:** All federal, DoD, and USACE standards, regulations, and requirements applicable to a consulting platform serving government clients — with emphasis on US Army Corps of Engineers (USACE).  
**Application Context:** Web-based consulting/software platform (structured-for-growth)

---

## TABLE OF CONTENTS

- [SECTION 1: US Army Corps of Engineers (USACE) Standards](#section-1-us-army-corps-of-engineers-usace-standards)
  - [1.1 Engineering Regulations (ERs) and Engineering Pamphlets (EPs)](#11-engineering-regulations-ers-and-engineering-pamphlets-eps)
  - [1.2 USACE Documentation Format Requirements](#12-usace-documentation-format-requirements)
  - [1.3 Engineer Manual (EM) Series — IT and Documentation](#13-engineer-manual-em-series--it-and-documentation)
  - [1.4 USACE Cybersecurity Requirements](#14-usace-cybersecurity-requirements)
  - [1.5 Project Documentation Requirements](#15-project-documentation-requirements)
- [SECTION 2: Federal Government IT Standards](#section-2-federal-government-it-standards)
  - [2.1 FISMA](#21-fisma-federal-information-security-modernization-act)
  - [2.2 FedRAMP](#22-fedramp-federal-risk-and-authorization-management-program)
  - [2.3 NIST SP 800-53](#23-nist-sp-800-53-rev-5-security-and-privacy-controls)
  - [2.4 NIST SP 800-171](#24-nist-sp-800-171-rev-2--rev-3-protecting-cui)
  - [2.5 NIST Cybersecurity Framework 2.0](#25-nist-cybersecurity-framework-csf-20)
  - [2.6 FIPS 140-2/140-3](#26-fips-140-2--fips-140-3)
  - [2.7 Zero Trust Architecture (NIST SP 800-207)](#27-zero-trust-architecture-nist-sp-800-207)
- [SECTION 3: DoD-Specific Requirements](#section-3-dod-specific-requirements)
  - [3.1 CMMC 2.0](#31-cmmc-20-cybersecurity-maturity-model-certification)
  - [3.2 DFARS 252.204-7012](#32-dfars-2522047012)
  - [3.3 ITAR and EAR](#33-itar-and-ear-export-control)
  - [3.4 STIGs](#34-stigs-security-technical-implementation-guides)
  - [3.5 RMF for DoD](#35-rmf-risk-management-framework-for-dod)
- [SECTION 4: Federal Acquisition Regulations (FAR)](#section-4-federal-acquisition-regulations-far)
  - [4.1 FAR Part 39](#41-far-part-39--acquisition-of-information-technology)
  - [4.2 DFARS Supplements](#42-dfars-supplements)
  - [4.3 Section 889](#43-section-889--supply-chain-security)
- [SECTION 5: Records Management](#section-5-records-management)
  - [5.1 NARA Requirements](#51-nara-national-archives-and-records-administration)
  - [5.2 Federal Records Act](#52-federal-records-act)
  - [5.3 Document Retention Schedules](#53-document-retention-schedules)
  - [5.4 Electronic Records Management](#54-electronic-records-management)
- [SECTION 6: Federal Plain Language Requirements](#section-6-federal-plain-language-requirements)
  - [6.1 Plain Writing Act of 2010](#61-plain-writing-act-of-2010)
  - [6.2 Federal Plain Language Guidelines](#62-federal-plain-language-guidelines)
  - [6.3 21st Century IDEA Act](#63-21st-century-idea-act)
- [SECTION 7: Government Accessibility (Beyond Section 508)](#section-7-government-accessibility-beyond-section-508)
  - [7.1 ADA Title II for Digital Services](#71-ada-title-ii-for-digital-services)
  - [7.2 Revised Section 508 (2018 Refresh)](#72-revised-section-508-2018-refresh)
- [SECTION 8: Platform Impact Matrix](#section-8-platform-impact-matrix)

---

# SECTION 1: US Army Corps of Engineers (USACE) Standards

## 1.1 Engineering Regulations (ERs) and Engineering Pamphlets (EPs)

### 1.1.1 Engineering Regulations (ERs) — Overview

**Official Name:** USACE Engineering Regulations (ER Series)  
**Citation:** Published under 33 CFR and internal USACE policy; cataloged through the USACE Publications System (UPS) at https://publications.usace.army.mil  
**Governing Authority:** Headquarters, US Army Corps of Engineers (HQUSACE)

**What They Require (Plain English):**  
Engineering Regulations are mandatory policy documents that prescribe how USACE and its contractors must plan, design, construct, operate, and maintain civil works and military construction projects. They cover everything from environmental compliance to information management. Contractors interacting with USACE must align deliverables — especially documentation, reports, and digital submissions — to the formats, workflows, and standards specified in applicable ERs.

**Key ERs Relevant to a Consulting/Software Platform:**

| ER Number | Title | Relevance |
|-----------|-------|-----------|
| **ER 25-1-1** | Army Corps of Engineers Information Management | Governs IT systems, cybersecurity, information assurance, records management, and web content management within USACE. Requires compliance with DoD and Army information management policies. |
| **ER 25-1-2** | Information Assurance and Cybersecurity | Maps USACE-specific cybersecurity requirements; mandates RMF implementation for all information systems. |
| **ER 25-1-3** | USACE Records Management Program | Establishes records management policies; aligns with NARA and DoD 5015.02 requirements. |
| **ER 1110-1-12** | Quality Management | Requires quality management plans and documentation for engineering products. Directly impacts documentation deliverables. |
| **ER 1110-1-8159** | DrChecks — Design Review and Checking System | Mandates use of DrChecks for design review comment tracking. Consulting platforms must integrate or export to DrChecks-compatible formats. |
| **ER 5-1-11** | USACE Business Process | Defines business process documentation requirements. |
| **ER 1110-345-700** | Design Analysis — Military Construction | Documentation standards for MILCON design analysis packages. |
| **ER 415-1-11** | Biddability, Constructability, Operability, and Environmental Sustainability (BCOES) Reviews | Requires structured review documentation for construction projects. |

**Who It Applies To:**  
- All USACE commands, districts, divisions, laboratories, and centers  
- All contractors, consultants, and vendors performing work for USACE (via contract flow-down clauses)  
- Subcontractors at any tier if specified in the prime contract

**Key Compliance Checkpoints:**
1. All documentation deliverables must conform to the ER-specified format and numbering system
2. Electronic submissions must follow USACE IT security and file format policies
3. Records must be managed according to ER 25-1-3 retention schedules
4. Quality management documentation must align with ER 1110-1-12
5. Web-based platforms must conform to ER 25-1-1 for information management

**Platform Impact:**
- Templates used within the platform must align with ER-specified formats
- Document numbering and classification schemes must mirror USACE conventions
- Any integration with USACE systems (DrChecks, ProjNet, RMS) must comply with applicable ERs
- The platform must be capable of generating deliverables in USACE-accepted formats (PDF/A, MS Office with specified templates)

---

### 1.1.2 Engineering Pamphlets (EPs) — Overview

**Official Name:** USACE Engineering Pamphlets (EP Series)  
**Citation:** USACE Publications System (UPS)

**What They Require:**  
EPs provide guidance (as opposed to mandatory regulation) on implementing USACE policies. While not strictly mandatory in the same way ERs are, they represent the accepted methodology and are frequently incorporated into contracts by reference.

**Key EPs:**

| EP Number | Title | Relevance |
|-----------|-------|-----------|
| **EP 25-1-1** | Information Management Guidance | Supplements ER 25-1-1 with implementation guidance for IT governance and information systems. |
| **EP 715-1-7** | Contractor Submittal Procedures | Defines electronic and hard-copy submittal requirements for contractor deliverables. |
| **EP 1110-1-8 (Vol 1-10)** | Value Engineering | Documentation standards for VE studies commonly produced by consultants. |
| **EP 1105-2-58** | Continuing Authorities Program | Documentation standards for project justification reports. |

**Platform Impact:**
- Platform document templates should be pre-configured to conform to EP guidance
- Submittal tracking and workflow features should align with EP 715-1-7

---

## 1.2 USACE Documentation Format Requirements

### 1.2.1 Standard Document Formats

**Official Policy:** ER 25-1-1 and associated Army policy (AR 25-30)  
**Citation:** AR 25-30 (The Army Publishing Program); ER 25-1-1 (USACE Information Management)

**What It Requires:**
USACE mandates specific formats for various document types:

| Document Type | Required Format | Standard |
|---------------|----------------|----------|
| Final reports and deliverables | PDF/A (archival) | ISO 19005-1:2005 (PDF/A-1), ISO 19005-2:2011 (PDF/A-2) |
| Working documents | MS Word (.docx) | OOXML (ISO/IEC 29500) |
| Spreadsheets | MS Excel (.xlsx) | OOXML |
| Engineering drawings | AutoCAD (.dwg) / PDF | USACE A/E/C CAD Standard |
| Geospatial data | Esri geodatabase, Shapefile | SDSFIE (Spatial Data Standards for Facilities, Infrastructure, and Environment) |
| Web content | HTML5, WCAG 2.0 AA conformant | Section 508 / WCAG 2.0 Level AA minimum |
| Photographs | JPEG, TIFF | Minimum 300 dpi for archival |

### 1.2.2 USACE A/E/C CAD Standard

**Official Name:** USACE A/E/C CAD Standard  
**Citation:** Latest release at https://cadbim.usace.army.mil  
**Current Version:** Release 2024.1

**What It Requires:**
- Standard layer naming conventions
- File naming conventions for drawings
- Model and sheet organization
- Plotting and output standards
- BIM (Building Information Modeling) requirements per the National BIM Standard-United States (NBIMS-US)

### 1.2.3 Document Identification and Numbering

USACE uses a structured numbering system for all publications:
- **Format:** `[Document Type] [Proponent Number]-[Series]-[Sequence]`
- **Example:** ER 1110-2-1156 (Engineering Regulation, Engineering and Construction proponent 1110, Water Resources series 2, sequence 1156)
- Contractor deliverables typically follow project-specific numbering schemas defined in the contract, but must align with the USACE Engineering Documentation System

**Platform Impact:**
- The platform must support generation and export of documents in all required formats
- Document metadata must include USACE-standard identification fields
- Naming conventions should be configurable to match USACE district-specific requirements
- CAD/BIM integration or references should align with USACE A/E/C standards

---

## 1.3 Engineer Manual (EM) Series — IT and Documentation

**Official Name:** USACE Engineer Manuals (EM Series)  
**Citation:** USACE Publications System

**What They Are:**  
Engineer Manuals provide detailed technical guidance on engineering methods, procedures, and criteria. Several are directly relevant to IT systems and documentation management.

**Key EMs Relevant to IT/Documentation Platforms:**

| EM Number | Title | Relevance |
|-----------|-------|-----------|
| **EM 25-1-1** | Information Technology (IT) Portfolio Management | Governs how USACE manages IT investments. Platforms serving USACE must fit within the IT portfolio governance structure. |
| **EM 385-1-1** | Safety and Health Requirements Manual | While primarily construction safety, it mandates documentation standards for safety plans, accident reports, and activity hazard analyses — all of which may be managed in a consulting platform. |
| **EM 1110-1-1003** | NAVSTAR Global Positioning System Surveying | Example of domain-specific documentation standards that may be enforced for deliverables. |
| **EM 200-1-12** | Principles of Environmental Cleanup (HTRW) | Documentation requirements for environmental remediation projects, a major USACE consulting domain. |

**Key Compliance Checkpoints:**
1. IT systems supporting USACE operations must be registered in the Army Portfolio Management Solution (APMS)
2. All IT platforms must undergo ATO (Authority to Operate) evaluation per RMF
3. Documentation for safety-related projects must meet EM 385-1-1 appendix requirements
4. Environmental project documentation must align with EM 200-1-12 reporting templates

**Platform Impact:**
- The platform must be capable of managing safety documentation per EM 385-1-1
- Environmental report templates should conform to EM 200-1-x series formats
- If the platform is used on USACE projects, it may need to be registered and authorized within the Army's IT governance framework

---

## 1.4 USACE Cybersecurity Requirements

### 1.4.1 USACE Cybersecurity Governance

**Official Policy:** ER 25-1-2, supplemented by Army Regulation AR 25-2 (Army Cybersecurity) and DoD Instruction 8500.01 (Cybersecurity)  
**Citation:** ER 25-1-2; AR 25-2; DoDI 8500.01

**What It Requires (Plain English):**  
Any information system that processes, stores, or transmits USACE data must comply with the DoD Risk Management Framework (RMF), obtain an Authority to Operate (ATO), and maintain continuous monitoring. This applies to contractor-operated systems if they handle government data — including CUI (Controlled Unclassified Information).

**Key Requirements:**

1. **Risk Management Framework (RMF) Compliance**
   - All systems must be categorized per CNSSI 1253 / FIPS 199
   - Security controls selected from NIST SP 800-53 Rev. 5
   - Assessed by an independent assessor (SCA — Security Control Assessor)
   - ATO issued by the Authorizing Official (AO)
   - Continuous monitoring per NIST SP 800-137

2. **Controlled Unclassified Information (CUI) Protection**
   - CUI markings per 32 CFR Part 2002 and DoD CUI Registry
   - NIST SP 800-171 controls for non-federal systems processing CUI
   - CUI banner markings on documents, emails, and digital media
   - Encryption in transit (TLS 1.2+ / FIPS 140-2 validated) and at rest (AES-256)

3. **Identity and Access Management**
   - CAC (Common Access Card) or PIV authentication for privileged access
   - Multi-factor authentication (MFA) mandatory
   - Alignment with ICAM (Identity, Credential, and Access Management) strategy
   - HSPD-12 compliance for personnel identity verification

4. **Network and Endpoint Security**
   - STIG compliance for all operating systems, applications, and network devices
   - Host-based Security System (HBSS) or successor (Tychon/Tanium) deployment
   - Assured Compliance Assessment Solution (ACAS) vulnerability scanning
   - Endpoint Detection and Response (EDR) capability

5. **Cybersecurity Incident Reporting**
   - Report within 72 hours of discovery per DFARS 252.204-7012
   - Report to USCYBERCOM / DC3 for DoD-related incidents
   - Preserve forensic evidence for 90 days minimum

**Who It Applies To:**
- All USACE-operated information systems
- Contractor systems that process, store, or transmit USACE/DoD data
- Cloud service providers hosting USACE workloads (must have FedRAMP authorization at appropriate impact level)

**Key Compliance Checkpoints:**
1. Complete RMF package (Security Plan, SAR, POA&M) prior to operation
2. Annual security assessment and continuous monitoring
3. Quarterly vulnerability scanning and remediation
4. Incident response plan tested annually
5. Personnel security clearances and cybersecurity awareness training (DoD Cyber Awareness Challenge, annual)

**Platform Impact:**
- The platform must implement NIST SP 800-53 controls appropriate to its categorization
- Must use FIPS 140-2/140-3 validated cryptographic modules
- Must support CAC/PIV authentication or integrate with DoD identity providers
- Must undergo penetration testing and vulnerability assessment
- Must maintain a System Security Plan (SSP) and Plan of Action & Milestones (POA&M)
- Must implement audit logging with 1-year retention minimum
- Must deploy in a FedRAMP-authorized cloud environment if cloud-hosted

---

## 1.5 Project Documentation Requirements

### 1.5.1 Project Management Plans (PMPs)

**Official Standard:** ER 5-1-11 (USACE Business Process); Supplemented by ER 1110-2-1150 (Engineering and Design for Civil Works Projects)  
**Citation:** ER 5-1-11; ER 1110-2-1150

**What It Requires:**
Every USACE project requires a Project Management Plan (PMP) that serves as the single, authoritative planning document. The PMP includes:

| PMP Component | Description |
|---------------|-------------|
| **Scope Statement** | Clear definition of project objectives, deliverables, and exclusions |
| **Work Breakdown Structure (WBS)** | Hierarchical decomposition of project work aligned with USACE standard WBS elements (CWBS for Civil Works) |
| **Schedule** | Network-logic schedule (CPM) with milestones aligned to USACE decision points |
| **Budget/Cost Estimate** | MCACES (Micro-Computer Aided Cost Estimating System) or PACES-formatted cost estimates |
| **Quality Management Plan** | Per ER 1110-1-12, defining QA/QC procedures for project deliverables |
| **Risk Register** | Formal risk identification, assessment, and response plans |
| **Communication Plan** | Stakeholder analysis and communication protocols |
| **Environmental Compliance** | NEPA documentation requirements (EA, EIS, FONSI, or CatEx) |

### 1.5.2 Decision Documents and Reports

USACE project lifecycle requires specific decision documents at defined milestones:

| Document | Milestone | Purpose |
|----------|-----------|---------|
| **Feasibility Report** | TSP (Tentatively Selected Plan) Milestone | Justifies federal interest in a project |
| **Chief's Report** | Chief of Engineers review | Recommendation to Congress for authorization |
| **Design Documentation Report (DDR)** | Design milestones | Technical design rationale and criteria |
| **Plans and Specifications** | Construction contract award | Construction execution documents |
| **O&M Manual** | Project completion | Operations and maintenance procedures |
| **After Action Report (AAR)** | Project close-out | Lessons learned documentation |

### 1.5.3 ProjNet and RMS Integration

**What They Are:**
- **ProjNet** (formerly Dr. Checks): Web-based review/comment management system used by USACE for design and document reviews
- **RMS (Resident Management System):** USACE's construction management system for daily reports, QA/QC, correspondence tracking, and contract administration

**Platform Impact:**
- The consulting platform should be capable of exporting/importing data in formats compatible with ProjNet and RMS
- Document templates for DDRs, AARs, PMPs, and Feasibility Reports should be built into the platform
- Cost estimate exports should align with MCACES/PACES formatting requirements
- WBS structures should support USACE Civil Works Breakdown Structure (CWBS) coding

---

# SECTION 2: Federal Government IT Standards

## 2.1 FISMA (Federal Information Security Modernization Act)

**Official Name:** Federal Information Security Modernization Act of 2014  
**Citation:** 44 U.S.C. § 3551–3558 (Public Law 113-283, amending the original FISMA 2002)  
**Governing Authority:** Office of Management and Budget (OMB), Cybersecurity and Infrastructure Security Agency (CISA), NIST

**What It Requires (Plain English):**  
FISMA requires every federal agency to develop, document, and implement an information security program to protect government information and information systems — including those operated by contractors on behalf of the government. The law mandates risk-based security controls, continuous monitoring, and annual reporting to Congress.

**Key Requirements:**

1. **System Categorization:** Every federal information system must be categorized as Low, Moderate, or High impact per FIPS 199 (Standards for Security Categorization of Federal Information and Information Systems)
2. **Security Control Selection:** Controls selected from NIST SP 800-53 based on the impact level
3. **Security Assessment:** Independent assessment of control effectiveness
4. **Authorization to Operate (ATO):** Formal acceptance of residual risk by an Authorizing Official
5. **Continuous Monitoring:** Ongoing assessment per NIST SP 800-137 (Information Security Continuous Monitoring)
6. **Incident Response:** Detection, reporting, and response per NIST SP 800-61 Rev. 2
7. **Annual Reporting:** Agencies must report security posture to OMB via CyberScope

**Who It Applies To:**
- All federal agencies (executive branch)
- All information systems operated by or on behalf of a federal agency
- Contractors operating federal information systems or processing federal data
- State agencies administering federal programs (in some cases)

**Key Compliance Checkpoints:**
1. FIPS 199 categorization complete
2. System Security Plan (SSP) developed per NIST SP 800-18
3. Security controls implemented and assessed
4. POA&M (Plan of Action & Milestones) maintained for deficiencies
5. ATO granted or renewed (typically every 3 years, or continuous under ongoing authorization)
6. Annual FISMA metrics reported

**Platform Impact:**
- If the platform processes federal data or operates on behalf of a federal agency, it falls under FISMA
- Must maintain a complete System Security Plan
- Must undergo independent security assessment
- Must implement continuous monitoring (vulnerability scanning, log analysis, configuration management)
- Must support federal agency FISMA reporting requirements
- Must implement security controls commensurate with the system's FIPS 199 categorization

---

## 2.2 FedRAMP (Federal Risk and Authorization Management Program)

**Official Name:** Federal Risk and Authorization Management Program  
**Citation:** OMB Memorandum M-23-16; FedRAMP Authorization Act (part of the FY2023 NDAA, Public Law 117-263, Title XXXV); codified at 44 U.S.C. § 3607-3616  
**Governing Authority:** FedRAMP Program Management Office (PMO) within GSA; FedRAMP Board

**What It Requires (Plain English):**  
FedRAMP provides a standardized approach for security authorization of cloud products and services used by federal agencies. Any cloud service offering (CSO) used by a federal agency must achieve FedRAMP authorization. This means the CSP (Cloud Service Provider) must implement NIST SP 800-53 controls, undergo assessment by a Third-Party Assessment Organization (3PAO), and receive authorization from either the Joint Authorization Board (JAB) — now replaced by the FedRAMP Board under the FedRAMP Authorization Act — or an individual agency.

**Authorization Levels:**

| Impact Level | Description | Control Count (approximate) | Use Case |
|-------------|-------------|---------------------------|----------|
| **FedRAMP Low** | Low-impact data (publicly available) | ~156 controls | Public websites, low-sensitivity apps |
| **FedRAMP Moderate** | Moderate-impact data (most government data) | ~325 controls | CUI, PII, PHI, financial data |
| **FedRAMP High** | High-impact data (law enforcement, emergency services, financial, health) | ~421 controls | Critical infrastructure, classified-adjacent |
| **FedRAMP Li-SaaS** | Low-Impact SaaS (streamlined for low-risk SaaS) | ~156 controls (streamlined process) | Collaboration tools, project management SaaS |

**Key Requirements:**
1. **Boundary Definition:** Clear delineation of the cloud system authorization boundary
2. **Control Implementation:** All applicable NIST SP 800-53 Rev. 5 controls
3. **3PAO Assessment:** Independent assessment by FedRAMP-recognized 3PAO
4. **Continuous Monitoring (ConMon):** Monthly vulnerability scanning, annual penetration testing, annual assessment of 1/3 of controls, monthly POA&M updates, significant change notifications
5. **Supply Chain Risk Management:** Documentation of third-party dependencies and risks
6. **Incident Response:** 1-hour reporting for incidents to US-CERT; coordination with FedRAMP PMO

**FedRAMP Authorization Process (High-Level):**
1. **Preparation Phase:** Readiness Assessment (optional but recommended), document SSP, implement controls
2. **Authorization Phase:** 3PAO assessment, SAR (Security Assessment Report), POA&M
3. **Decision Phase:** FedRAMP Board or agency AO reviews and grants ATO
4. **Continuous Monitoring Phase:** Ongoing compliance, monthly/quarterly/annual deliverables

**Who It Applies To:**
- Any CSP (Cloud Service Provider) offering services to federal agencies
- Federal agencies consuming cloud services
- Contractors deploying solutions in cloud environments for government use

**Key Compliance Checkpoints:**
1. FedRAMP Readiness Assessment Report (RAR) submitted (for Board path)
2. SSP with all control implementation details
3. 3PAO SAR with all findings documented
4. POA&M with remediation timelines for all findings
5. ATO letter from authorizing entity
6. Monthly ConMon deliverables (scan results, POA&M updates, significant change requests)

**Platform Impact:**
- If the platform is cloud-hosted and serves federal agencies, FedRAMP authorization is likely required
- The platform infrastructure must reside in a FedRAMP-authorized environment (e.g., AWS GovCloud, Azure Government, Google Cloud for Government)
- Must implement 325+ security controls for Moderate impact (most typical)
- Must budget for 3PAO assessment (typically $250K–$750K initial, $150K+ annual)
- Development and operational processes must support continuous monitoring deliverables
- Must maintain a digital identity that supports federation with federal identity providers

---

## 2.3 NIST SP 800-53 Rev. 5 (Security and Privacy Controls)

**Official Name:** NIST Special Publication 800-53, Revision 5: Security and Privacy Controls for Information Systems and Organizations  
**Citation:** NIST SP 800-53 Rev. 5 (September 2020; updated December 2020)  
**Governing Authority:** National Institute of Standards and Technology (NIST)

**What It Requires (Plain English):**  
NIST SP 800-53 is the catalog of security and privacy controls that serves as the foundation for FISMA, FedRAMP, and DoD RMF compliance. It provides a comprehensive set of safeguards organized into 20 control families. Organizations select and implement controls based on their system's risk categorization.

**Control Families (All 20):**

| ID | Family | Relevant Controls (examples) |
|----|--------|------------------------------|
| **AC** | Access Control | AC-2 (Account Management), AC-3 (Access Enforcement), AC-17 (Remote Access) |
| **AT** | Awareness and Training | AT-2 (Literacy Training and Awareness), AT-3 (Role-Based Training) |
| **AU** | Audit and Accountability | AU-2 (Event Logging), AU-6 (Audit Record Review), AU-12 (Audit Record Generation) |
| **CA** | Assessment, Authorization, and Monitoring | CA-2 (Control Assessments), CA-6 (Authorization), CA-7 (Continuous Monitoring) |
| **CM** | Configuration Management | CM-2 (Baseline Configuration), CM-6 (Configuration Settings), CM-8 (System Component Inventory) |
| **CP** | Contingency Planning | CP-2 (Contingency Plan), CP-9 (System Backup), CP-10 (System Recovery) |
| **IA** | Identification and Authentication | IA-2 (Identification and Authentication), IA-5 (Authenticator Management), IA-8 (Identification — Non-Organizational Users) |
| **IR** | Incident Response | IR-2 (Incident Response Training), IR-4 (Incident Handling), IR-6 (Incident Reporting) |
| **MA** | Maintenance | MA-2 (Controlled Maintenance), MA-4 (Nonlocal Maintenance) |
| **MP** | Media Protection | MP-2 (Media Access), MP-6 (Media Sanitization) |
| **PE** | Physical and Environmental Protection | PE-2 (Physical Access Authorizations), PE-6 (Monitoring Physical Access) |
| **PL** | Planning | PL-2 (System Security and Privacy Plans), PL-4 (Rules of Behavior) |
| **PM** | Program Management | PM-1 (Information Security Program Plan), PM-9 (Risk Management Strategy) |
| **PS** | Personnel Security | PS-3 (Personnel Screening), PS-6 (Access Agreements) |
| **PT** | PII Processing and Transparency | PT-2 (Authority to Process PII), PT-3 (PII Processing Purposes) |
| **RA** | Risk Assessment | RA-3 (Risk Assessment), RA-5 (Vulnerability Monitoring and Scanning) |
| **SA** | System and Services Acquisition | SA-4 (Acquisition Process), SA-9 (External System Services), SA-11 (Developer Testing) |
| **SC** | System and Communications Protection | SC-7 (Boundary Protection), SC-8 (Transmission Confidentiality), SC-28 (Protection of Information at Rest) |
| **SI** | System and Information Integrity | SI-2 (Flaw Remediation), SI-3 (Malicious Code Protection), SI-4 (System Monitoring) |
| **SR** | Supply Chain Risk Management | SR-2 (Supply Chain Risk Management Plan), SR-3 (Supply Chain Controls) |

**Control Baselines (from SP 800-53B):**

| Baseline | Total Controls | Typical Application |
|----------|---------------|---------------------|
| Low | ~156 | Public-facing, no sensitive data |
| Moderate | ~325 | Most federal systems; CUI |
| High | ~421 | National security, critical infrastructure |

**Who It Applies To:**
- All federal information systems (mandatory per FISMA)
- Non-federal systems processing CUI (via NIST SP 800-171 mapping)
- Cloud systems serving government (via FedRAMP)
- DoD systems (via RMF and CNSSI 1253 overlay)

**Key Compliance Checkpoints:**
1. Categorize the system (FIPS 199)
2. Select applicable control baseline (Low/Moderate/High)
3. Apply overlays or tailoring as appropriate (e.g., DoD overlays, privacy overlays)
4. Implement all selected controls
5. Document implementation in the System Security Plan (SSP)
6. Assess control effectiveness
7. Authorize system operation
8. Monitor controls continuously

**Platform Impact:**
- This is the primary control catalog used for all federal security compliance
- Every security feature in the platform maps back to specific 800-53 controls
- The platform's SSP must document how each applicable control is implemented (inherited, system-specific, or hybrid)
- Development practices must address SA-family controls (secure development lifecycle, testing, code review)
- Audit logging must meet AU-family requirements (who, what, when, where, outcome)

---

## 2.4 NIST SP 800-171 Rev. 2 / Rev. 3 (Protecting CUI)

**Official Name:** NIST Special Publication 800-171: Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations  
**Citation:** NIST SP 800-171 Rev. 2 (February 2020); NIST SP 800-171 Rev. 3 (May 2024)  
**Governing Authority:** NIST; enforced by DoD, GSA, NASA, and other agencies via contract clauses

**What It Requires (Plain English):**  
NIST SP 800-171 defines the security requirements that non-federal organizations must implement when they process, store, or transmit Controlled Unclassified Information (CUI) on behalf of the government. It is derived from NIST SP 800-53 but tailored for non-federal environments. This is the standard that CMMC 2.0 assesses against.

**CUI Categories Commonly Encountered:**
- Controlled Technical Information (CTI)
- Export-controlled information
- Privacy data (PII)
- Procurement and acquisition data
- Critical infrastructure information
- Legal information (attorney-client, law enforcement sensitive)
- Financial information

**Security Requirement Families (Rev. 2 — 14 families, 110 requirements):**

| Family | # Requirements | Key Requirements |
|--------|---------------|-----------------|
| Access Control | 22 | Limit system access, control CUI flow, remote access management |
| Awareness and Training | 3 | Security awareness, role-based training |
| Audit and Accountability | 9 | Create audit records, review/analyze logs, protect audit information |
| Configuration Management | 9 | Establish baselines, control changes, restrict unnecessary functions |
| Identification and Authentication | 11 | Authenticate users/devices, MFA, password management |
| Incident Response | 3 | Establish IR capability, track/report incidents |
| Maintenance | 6 | Perform maintenance, control maintenance tools |
| Media Protection | 9 | Protect, sanitize, control transport of CUI media |
| Personnel Security | 2 | Screen personnel, protect CUI during termination/transfer |
| Physical Protection | 6 | Limit physical access, manage visitors, protect equipment |
| Risk Assessment | 3 | Assess risk, scan for vulnerabilities |
| Security Assessment | 4 | Assess controls, monitor continuously, manage POA&Ms |
| System and Communications Protection | 16 | Monitor communications at boundaries, implement crypto, deny by default |
| System and Information Integrity | 7 | Remediate flaws, protect against malicious code, monitor systems |

**Rev. 3 Changes (May 2024):**
- Aligned with NIST SP 800-53 Rev. 5
- Reorganized into "determination statements" for each requirement
- Added organization-defined parameters (ODPs) for flexibility
- New requirements for supply chain risk management
- Enhanced requirements for secure software development

**Who It Applies To:**
- Any non-federal organization (contractor, subcontractor, university, research institution) that processes, stores, or transmits CUI
- Applied through contract clauses (DFARS 252.204-7012 for DoD; FAR 52.204-21 for basic safeguarding)
- Flows down to all subcontractors handling CUI

**Key Compliance Checkpoints:**
1. Identify CUI boundary and data flows
2. Develop System Security Plan (SSP) documenting all 110 requirements (Rev. 2)
3. Conduct self-assessment per DoD Assessment Methodology (NIST SP 800-171 DoD Assessment)
4. Submit score to Supplier Performance Risk System (SPRS) — score range: -203 to 110
5. Develop and execute POA&M for any unmet requirements
6. Achieve CMMC certification if required by contract (see Section 3.1)

**SPRS Scoring:**
- Perfect score: 110 (all requirements met)
- Each unmet requirement deducts weighted points
- Score must be submitted to SPRS before contract award
- DoD can verify scores through audit or CMMC assessment

**Platform Impact:**
- If the platform handles CUI (very likely for USACE consulting), all 110 requirements of SP 800-171 Rev. 2 must be met
- Must maintain a current SSP and SPRS score
- Must implement MFA, encryption (FIPS-validated), audit logging, access controls
- Must support CUI marking and handling procedures within the application
- Must be prepared for CMMC assessment as a condition of contract award

---

## 2.5 NIST Cybersecurity Framework (CSF) 2.0

**Official Name:** NIST Cybersecurity Framework (CSF) Version 2.0  
**Citation:** NIST CSF 2.0 (February 26, 2024)  
**Governing Authority:** NIST

**What It Requires (Plain English):**  
The CSF is a voluntary framework (mandatory for federal agencies per EO 13800) that provides a common language for managing cybersecurity risk. Version 2.0 expanded the original 5 functions to 6 by adding "Govern" and broadened applicability beyond critical infrastructure to all organizations.

**Six Core Functions:**

| Function | ID | Purpose | Key Categories |
|----------|-----|---------|----------------|
| **Govern** | GV | Establish and communicate cybersecurity risk management strategy, policy, and oversight | Organizational Context (GV.OC), Risk Management Strategy (GV.RM), Roles & Responsibilities (GV.RR), Policy (GV.PO), Oversight (GV.OV), Cybersecurity Supply Chain Risk Management (GV.SC) |
| **Identify** | ID | Understand organizational cybersecurity risk | Asset Management (ID.AM), Risk Assessment (ID.RA), Improvement (ID.IM) |
| **Protect** | PR | Implement safeguards | Identity Management (PR.AA), Awareness & Training (PR.AT), Data Security (PR.DS), Platform Security (PR.PS), Technology Infrastructure Resilience (PR.IR) |
| **Detect** | DE | Discover cybersecurity events | Continuous Monitoring (DE.CM), Adverse Event Analysis (DE.AE) |
| **Respond** | RS | Take action on detected incidents | Incident Management (RS.MA), Incident Analysis (RS.AN), Incident Response Reporting (RS.CO), Incident Mitigation (RS.MI) |
| **Recover** | RC | Restore capabilities after incidents | Incident Recovery Plan Execution (RC.RP), Incident Recovery Communication (RC.CO) |

**CSF 2.0 Key Enhancements:**
- New "Govern" function emphasizes leadership accountability and risk governance
- Organizational Profiles replace the former "Framework Profile" concept
- Community Profiles for sector-specific guidance
- Improved supply chain risk management integration
- Clearer mapping to SP 800-53 and international standards (ISO 27001)

**Who It Applies To:**
- All federal agencies (mandatory per EO 13800, OMB guidance)
- Strongly recommended for all government contractors
- Applicable to all sectors (expanded scope in v2.0)
- Referenced as the organizing framework for DoD cybersecurity programs

**Platform Impact:**
- Use CSF 2.0 as the organizing framework for the platform's security program
- Map platform capabilities to CSF functions (the platform enables customers to "Govern," "Identify," "Protect," "Detect," "Respond," and "Recover")
- Demonstrate alignment in proposals and security documentation
- Use organizational profiles to communicate security posture to government clients

---

## 2.6 FIPS 140-2 / FIPS 140-3

**Official Name:** Federal Information Processing Standard Publication 140-2: Security Requirements for Cryptographic Modules / FIPS 140-3  
**Citation:** FIPS PUB 140-2 (May 25, 2001); FIPS PUB 140-3 (March 22, 2019; effective September 22, 2019)  
**Governing Authority:** NIST; validated through the Cryptographic Module Validation Program (CMVP), joint between NIST and the Canadian Centre for Cyber Security (CCCS)

**What It Requires (Plain English):**  
FIPS 140-2/3 specifies the security requirements for cryptographic modules (hardware, software, firmware) used by federal agencies and their contractors. Any encryption used in a system processing federal data must be performed by a FIPS 140-2/3 validated module.

**Security Levels:**

| Level | Description | Hardware Requirements | Use Case |
|-------|------------|----------------------|----------|
| Level 1 | Basic requirements; no physical security | None (software-only acceptable) | General-purpose computing |
| Level 2 | Tamper-evidence, role-based authentication | Tamper-evident coatings/seals | Most federal IT systems |
| Level 3 | Tamper-resistance, identity-based authentication | Physical mechanisms to detect/respond to tampering | High-value systems, HSMs |
| Level 4 | Complete tamper-response envelope | Active tamper-response mechanisms; environmental protections | Military, intelligence |

**FIPS 140-3 vs. 140-2:**
- FIPS 140-2 submissions ended in September 2021 (testing/validation of 140-2 modules by existing labs continues for modules already in process)
- FIPS 140-3 is now the current standard, aligned with ISO/IEC 19790:2012 and ISO/IEC 24759:2017
- Existing FIPS 140-2 validated modules remain acceptable until their validation certificates expire or are revoked

**Key Requirements:**
1. All cryptographic modules must appear on the CMVP Validated Modules List
2. Approved algorithms only (AES, SHA-2, SHA-3, RSA 2048+, ECDSA P-256+, etc.)
3. SHA-1 and 3DES are deprecated / disallowed for most uses
4. TLS 1.2 with approved cipher suites minimum; TLS 1.3 preferred
5. Key management per NIST SP 800-57

**Who It Applies To:**
- All federal agencies and their contractors
- Any system processing, storing, or transmitting federal data
- DoD systems (mandatory per DoDI 8500.01)
- FedRAMP-authorized systems

**Key Compliance Checkpoints:**
1. Identify all cryptographic operations in the system
2. Verify each operation uses a FIPS 140-2/3 validated module (check NIST CMVP list)
3. Ensure modules are operating in "FIPS mode" (not just installed)
4. Document all cryptographic module certificates in the SSP
5. Monitor for module certificate revocations or expirations

**Platform Impact:**
- **Critical:** All encryption used in the platform must use FIPS 140-2/3 validated modules
- TLS libraries must be FIPS-validated (e.g., OpenSSL FIPS Object Module, AWS-LC-FIPS, BoringCrypto in Go)
- Database encryption must use FIPS-validated modules
- Any hashing for integrity or authentication must use FIPS-approved algorithms
- Must operate cryptographic modules in FIPS mode (configuration setting, not just availability)
- Validation certificates must be documented in security authorization packages

---

## 2.7 Zero Trust Architecture (NIST SP 800-207)

**Official Name:** NIST Special Publication 800-207: Zero Trust Architecture  
**Citation:** NIST SP 800-207 (August 2020)  
**Governing Authority:** NIST; mandated by EO 14028 (May 2021) and OMB Memorandum M-22-09

**What It Requires (Plain English):**  
Zero Trust Architecture (ZTA) is a security model that eliminates implicit trust — no user, device, or network segment is trusted by default, even if they are inside the network perimeter. Every access request must be authenticated, authorized, and continuously validated. Federal agencies are required to move toward ZTA per OMB M-22-09 (deadline targets were FY2024, with ongoing maturation).

**Core ZTA Principles:**
1. All data sources and computing services are considered resources
2. All communication is secured regardless of network location
3. Access to individual resources is granted on a per-session basis
4. Access is determined by dynamic policy (user identity, device health, behavior, environmental context)
5. The enterprise monitors and measures the integrity and security posture of all owned and associated assets
6. All resource authentication and authorization are dynamic and strictly enforced
7. The enterprise collects information about the current state of assets, network infrastructure, and communications to improve its security posture

**OMB M-22-09 Pillars (Federal Zero Trust Strategy):**

| Pillar | Requirement | Target |
|--------|------------|--------|
| **Identity** | Agency-wide MFA, phishing-resistant authenticators | FIDO2/WebAuthn, PIV |
| **Devices** | Comprehensive device inventory, EDR on all devices | Real-time device compliance |
| **Networks** | Encrypt all DNS, HTTP, and email traffic; segment networks | TLS everywhere, microsegmentation |
| **Applications & Workloads** | Treat all applications as internet-connected, routine security testing | Continuous integration security testing |
| **Data** | Categorize data, deploy protections, automate access decisions | Data-centric security model |

**Who It Applies To:**
- All federal agencies (mandatory per EO 14028 and M-22-09)
- Contractors providing IT services to federal agencies (alignment expected)
- DoD Zero Trust Strategy (published November 2022) extends requirements to defense industrial base

**Platform Impact:**
- Implement identity-centric access controls (every API call, every page access verified)
- Support phishing-resistant MFA (FIDO2/WebAuthn) alongside CAC/PIV
- Implement microsegmentation within the application (role-based access to data, not network-level trust)
- Encrypt all communications, including internal service-to-service
- Implement device posture assessment capabilities
- Continuous session validation (not just authenticate-once-and-trust)
- Attribute-based access control (ABAC) or policy-based access control (PBAC) instead of simple RBAC

---

# SECTION 3: DoD-Specific Requirements

## 3.1 CMMC 2.0 (Cybersecurity Maturity Model Certification)

**Official Name:** Cybersecurity Maturity Model Certification (CMMC) 2.0  
**Citation:** 32 CFR Part 170 (final rule published October 15, 2024, effective December 16, 2024); 48 CFR DFARS Case 2019-D041  
**Governing Authority:** DoD Chief Information Officer (CIO); administered by the Cyber AB (formerly CMMC Accreditation Body)

**What It Requires (Plain English):**  
CMMC 2.0 requires defense contractors to demonstrate cybersecurity maturity through assessment and certification. It replaces the self-attestation model with a tiered certification framework. Contractors must achieve the CMMC level specified in their contract before award.

**CMMC 2.0 Levels:**

| Level | Name | Requirements | Assessment Type | Who Needs It |
|-------|------|-------------|-----------------|--------------|
| **Level 1** | Foundational | 15 basic safeguarding requirements (FAR 52.204-21) | Annual self-assessment | Contractors handling FCI (Federal Contract Information) |
| **Level 2** | Advanced | 110 requirements from NIST SP 800-171 Rev. 2 | Self-assessment OR third-party assessment (C3PAO) depending on criticality | Contractors handling CUI |
| **Level 3** | Expert | 110 SP 800-171 requirements + 24 additional requirements from SP 800-172 | Government-led assessment (DIBCAC) | Contractors handling CUI on highest-priority programs |

**Key Dates and Phased Implementation:**
- Phase 1 (December 2024): CMMC Level 1 self-assessments and CMMC Level 2 self-assessments may appear in contracts
- Phase 2 (2025): CMMC Level 2 C3PAO assessments may be required
- Phase 3 (2026): CMMC Level 3 assessments may be required
- Phase 4 (2028): Full implementation across all applicable contracts

**CMMC Assessment Process (Level 2 — C3PAO):**
1. Contractor conducts readiness assessment (gap analysis)
2. Contractor implements all 110 NIST SP 800-171 requirements
3. Contractor selects a C3PAO from the Cyber AB Marketplace
4. C3PAO conducts assessment (typically 1–2 weeks on-site/remote)
5. C3PAO submits assessment results to CMMC eMASS
6. DoD DCMA DIBCAC reviews and issues certification (valid for 3 years)

**POA&M Policy:**
- Limited POA&Ms allowed: up to 20% of scored objectives
- No POA&Ms for the most critical requirements (e.g., MFA, FIPS encryption, audit logging)
- Must achieve minimum score of 80% (≥88 out of 110 on SPRS scoring)
- POA&Ms must be closed within 180 days of certification

**Who It Applies To:**
- All contractors and subcontractors in the Defense Industrial Base (DIB)
- Any company bidding on DoD contracts that involve FCI or CUI
- Subcontractors at any tier if they process, store, or transmit FCI or CUI
- Foreign contractors supporting DoD (with limited exceptions)

**Key Compliance Checkpoints:**
1. Determine required CMMC level based on contract requirements
2. Define CUI boundary and data flow diagrams
3. Complete NIST SP 800-171 self-assessment; submit SPRS score
4. Implement all 110 controls (or document POA&Ms for up to 20%)
5. Engage C3PAO for Level 2 assessment (if required)
6. Maintain certification through annual affirmation and triennial reassessment

**Platform Impact:**
- **High priority for USACE consulting:** USACE projects frequently involve CUI, requiring Level 2 minimum
- The platform itself must reside within a CMMC-compliant boundary
- Must implement all 110 NIST SP 800-171 controls
- Assessment scope includes the platform infrastructure, application, personnel, and processes
- Must maintain evidence of compliance for each control (policies, procedures, screenshots, configurations)
- Must support CUI marking, handling, and access controls within the application

---

## 3.2 DFARS 252.204-7012

**Official Name:** Defense Federal Acquisition Regulation Supplement (DFARS) Clause 252.204-7012: Safeguarding Covered Defense Information and Cyber Incident Reporting  
**Citation:** 48 CFR 252.204-7012  
**Governing Authority:** Under Secretary of Defense for Acquisition and Sustainment (USD(A&S))

**What It Requires (Plain English):**  
This DFARS clause is the contractual mechanism that obligates defense contractors to protect Covered Defense Information (CDI) using NIST SP 800-171 security requirements and to report cyber incidents to DoD within 72 hours.

**Key Obligations:**

| Obligation | Requirement |
|-----------|------------|
| **Adequate Security** | Implement NIST SP 800-171 on all covered contractor information systems |
| **Cloud Computing** | If using cloud services, must be FedRAMP Moderate or equivalent; data must reside in the United States |
| **Cyber Incident Reporting** | Report within 72 hours of discovery to https://dibnet.dod.mil |
| **Media Preservation** | Preserve images of all known affected information systems and relevant monitoring data for 90 days |
| **Access to Equipment/Information** | Grant DoD access to contractor equipment and information for forensic analysis if requested |
| **Subcontractor Flow-Down** | Must flow this clause down to all subcontractors whose performance involves CDI or operationally critical support |

**Key Definitions:**
- **Covered Defense Information (CDI):** Unclassified controlled technical information or other information requiring safeguarding as identified in the CUI Registry, that is (1) marked or (2) collected or developed in performance of the contract
- **Covered Contractor Information System:** An unclassified information system owned or operated by or for a contractor that processes, stores, or transmits CDI

**Who It Applies To:**
- All DoD contractors and subcontractors with access to CDI
- Applies regardless of contract size (no small business exemption)
- Flows down to all tiers of subcontracting

**Key Compliance Checkpoints:**
1. Determine if contract involves CDI
2. Identify and scope all covered contractor information systems
3. Implement NIST SP 800-171 requirements
4. Submit SPRS score
5. Develop and test 72-hour incident reporting procedures
6. Establish 90-day media preservation capability
7. Include clause in all subcontracts involving CDI

**Platform Impact:**
- If the platform processes CDI for DoD/USACE contracts, full compliance with this clause is mandatory
- Must implement 72-hour incident reporting capability (technical and procedural)
- Must maintain forensic imaging and log preservation for 90 days minimum
- Must ensure cloud hosting is FedRAMP Moderate (or equivalent) and data resides in the US
- Must flow down requirements to any third-party services or subcontractors

---

## 3.3 ITAR and EAR (Export Control)

### 3.3.1 ITAR (International Traffic in Arms Regulations)

**Official Name:** International Traffic in Arms Regulations  
**Citation:** 22 CFR Parts 120–130  
**Governing Authority:** US Department of State, Directorate of Defense Trade Controls (DDTC)

**What It Requires (Plain English):**  
ITAR controls the export and import of defense articles and services listed on the United States Munitions List (USML). Any technical data related to defense articles is ITAR-controlled and may not be disclosed to foreign nationals (including employees) or exported without a license or exemption.

**Key Requirements:**
1. **Registration:** Any company manufacturing, exporting, or brokering defense articles must register with DDTC
2. **Technical Data Control:** ITAR-controlled technical data may not be:
   - Exported outside the United States
   - Disclosed to foreign nationals (even within the US — "deemed export")
   - Stored on servers outside the US
   - Stored on cloud infrastructure accessible by foreign nationals
3. **Access Control:** Only US Persons (citizens, permanent residents, protected individuals) may access ITAR data
4. **Licenses:** Exports require either an export license, a license exemption, or a Technical Assistance Agreement (TAA)

### 3.3.2 EAR (Export Administration Regulations)

**Official Name:** Export Administration Regulations  
**Citation:** 15 CFR Parts 730–774  
**Governing Authority:** US Department of Commerce, Bureau of Industry and Security (BIS)

**What It Requires (Plain English):**  
EAR controls the export of dual-use items (commercial items with potential military applications), software, and technology listed on the Commerce Control List (CCL). Controls are less restrictive than ITAR but still require screening, classification, and potential licensing.

**Key Requirements:**
1. **ECCN Classification:** Determine Export Control Classification Number for any technology
2. **Denied Parties Screening:** Screen all parties against BIS Denied Parties lists, Treasury SDN list, and other restricted parties lists
3. **License Determination:** Based on ECCN, destination country, end-use, and end-user
4. **Record Keeping:** 5-year retention for all export records

**Who It Applies To:**
- ITAR: Any company dealing with defense articles, services, or technical data on the USML
- EAR: Any company exporting items, software, or technology subject to the CCL
- USACE contractors: May encounter ITAR data on military construction or defense-related civil works projects

**Platform Impact:**
- If the platform stores or processes ITAR-controlled data:
  - Must restrict access to US Persons only (no foreign national employees, subcontractors, or cloud admins)
  - Must host in US-only data centers with US Person-only administrative access (AWS GovCloud, Azure Government are suitable)
  - Must implement access controls to enforce US Person verification
  - Must maintain ITAR registration with DDTC
- If the platform stores EAR-controlled data:
  - Must implement denied parties screening for all users
  - Must classify technology under appropriate ECCN
  - Must maintain export control records for 5 years
- Recommended: Implement export control markings within the document management system (e.g., "ITAR Controlled," "Distribution Statement" per DoD Directive 5230.24)

---

## 3.4 STIGs (Security Technical Implementation Guides)

**Official Name:** Security Technical Implementation Guides  
**Citation:** Published by DISA (Defense Information Systems Agency) at https://public.cyber.mil/stigs/  
**Governing Authority:** DISA Field Security Operations (FSO)

**What They Require (Plain English):**  
STIGs are configuration standards for IT products (operating systems, applications, databases, network devices, web servers, etc.) used in DoD environments. Each STIG contains hundreds of specific configuration requirements (called "checks" or "rules") with severity categories. All DoD and DoD-contractor systems must be STIG-compliant.

**STIG Severity Categories:**

| Category | Severity | Description |
|----------|----------|-------------|
| **CAT I** | High | Directly results in loss of confidentiality, integrity, or availability |
| **CAT II** | Medium | Has potential to result in loss of C/I/A |
| **CAT III** | Low | Degrades measures to protect against loss of C/I/A |

**STIGs Relevant to a Web Application Platform:**

| STIG | Relevance |
|------|-----------|
| **Application Security and Development STIG** | Covers secure development, input validation, session management, error handling, encryption |
| **Web Server STIG (Apache/IIS/Nginx)** | Configuration requirements for web server hardening |
| **Application Server STIG (Tomcat/JBoss/Node.js)** | Application server security configuration |
| **Database STIG (PostgreSQL/MySQL/SQL Server)** | Database hardening, access controls, encryption |
| **Operating System STIG (Windows Server/RHEL/Ubuntu)** | OS-level hardening |
| **Network STIG (Firewalls, Routers, Switches)** | Network device configuration |
| **Cloud STIG (AWS/Azure/GCP)** | Cloud platform-specific security configuration |
| **Browser STIG** | Client-side browser security settings |
| **Container Platform STIG (Docker/Kubernetes)** | Container orchestration security |

**Application Security and Development STIG — Key Requirements:**

| Check ID | Requirement Summary |
|----------|-------------------|
| V-222400 series | Input validation for all user-supplied data |
| V-222425 series | Session management (timeout, secure flags, regeneration) |
| V-222430 series | Authentication (MFA, lockout, credential storage) |
| V-222540 series | Error handling (no stack traces, generic messages) |
| V-222550 series | Audit logging (all access, modifications, authentication events) |
| V-222570 series | Encryption (FIPS-validated, TLS 1.2+, AES-256) |
| V-222600 series | Access control (RBAC/ABAC, least privilege) |
| V-222610 series | Code quality (no dead code, no test code in production) |

**Who It Applies To:**
- All DoD information systems
- Contractor-operated systems processing DoD data
- Cloud environments hosting DoD workloads
- Applications deployed to DoD networks (NIPRNet, SIPRNet)

**Key Compliance Checkpoints:**
1. Identify all applicable STIGs for every component in the system architecture
2. Run STIG Viewer or SCAP Compliance Checker (SCC) to assess compliance
3. Document findings in a POA&M for any non-compliant items
4. Justify any waivers through the STIG waiver process
5. Achieve 100% CAT I compliance (no open CAT I findings)
6. Maintain quarterly STIG scans and remediation

**Platform Impact:**
- Every technology component must be hardened per its applicable STIG
- The application itself must comply with the Application Security and Development STIG
- STIG compliance reports (XCCDF/CKL format) must be generated and maintained
- Consider STIG compliance in technology selection (choose products with available STIGs)
- CI/CD pipeline should include STIG compliance scanning (OpenSCAP, Nessus, Anchore)

---

## 3.5 RMF (Risk Management Framework) for DoD

**Official Name:** Risk Management Framework for DoD Information Technology  
**Citation:** DoDI 8510.01 (Risk Management Framework for DoD Systems), incorporating NIST SP 800-37 Rev. 2  
**Governing Authority:** DoD CIO; implemented by service-specific cybersecurity authorities (e.g., Army Cyber Command for Army systems)

**What It Requires (Plain English):**  
RMF is the DoD's implementation of the NIST Risk Management Framework, adapted with DoD-specific overlays, processes, and tools. Every DoD information system (and contractor systems processing DoD data) must go through the RMF process to receive an Authority to Operate (ATO).

**RMF Steps:**

| Step | Activity | Key Artifacts |
|------|----------|---------------|
| **Step 0** | Prepare | Organization-level and system-level preparation; mission/business focus |
| **Step 1** | Categorize | Categorize per CNSSI 1253 (DoD-specific implementation of FIPS 199); register in eMASS (Enterprise Mission Assurance Support Service) |
| **Step 2** | Select | Select security controls from NIST SP 800-53 + DoD overlays (via CNSSI 1253) |
| **Step 3** | Implement | Implement controls; document in eMASS |
| **Step 4** | Assess | Independent assessment by SCA (Security Control Assessor) |
| **Step 5** | Authorize | AO (Authorizing Official) reviews risk and issues ATO, IATT (Interim ATO), or DATO (Denial of ATO) |
| **Step 6** | Monitor | Continuous monitoring per NIST SP 800-137; Report via eMASS dashboards |

**DoD RMF Enhancements Beyond NIST:**
- **eMASS:** Enterprise Mission Assurance Support Service — mandatory tool for managing RMF packages
- **CNSSI 1253:** Committee on National Security Systems Instruction 1253 — provides security categorization and control selection specific to national security systems
- **DoD Overlays:** Additional control requirements beyond baseline SP 800-53 (e.g., classified information overlay, privacy overlay, intelligence overlay)
- **STIG Integration:** RMF requires STIG compliance as part of the "Implement" and "Assess" steps
- **Reciprocity:** DoD RMF ATOs are intended to be accepted across DoD components (reducing duplicative assessments)

**ATO Types:**

| Type | Duration | Conditions |
|------|----------|------------|
| **ATO** | 3 years (with continuous monitoring) | All CAT I findings resolved; acceptable risk |
| **Ongoing Authorization** | Continuous (no expiration) | Requires mature continuous monitoring program |
| **IATT** | 6 months (one-time extension possible) | Interim operation with known risks being mitigated |
| **DATO** | N/A — system cannot operate | Unacceptable risk; must remediate before requesting reassessment |

**Who It Applies To:**
- All DoD information systems (classified and unclassified)
- Contractor systems connecting to DoD networks
- Contractor systems processing DoD CUI/CDI
- Cloud systems hosting DoD workloads (in conjunction with FedRAMP/DoD CC SRG — Cloud Computing Security Requirements Guide)

**Key Compliance Checkpoints:**
1. System registered in eMASS (or sponsor agency's equivalent)
2. CNSSI 1253 categorization complete
3. Control selection finalized with applicable overlays
4. SSP (System Security Plan) documented in eMASS
5. STIG scans and vulnerability assessments complete
6. SCA assessment complete with SAR
7. POA&M with remediation timelines for all open findings
8. AO issues authorization decision
9. Continuous monitoring artifacts delivered on schedule

**Platform Impact:**
- If the platform operates as a DoD system or connects to DoD networks, full RMF is required
- Must register in eMASS and maintain all RMF artifacts
- Must implement DoD-specific overlays in addition to NIST SP 800-53 baselines
- Must support continuous monitoring deliverables (monthly STIG scans, quarterly vulnerability assessments, annual penetration tests)
- Must comply with DoD Cloud Computing SRG if cloud-hosted (Impact Level 2, 4, 5, or 6)
- Assessment by an SCA can take 6–18 months — plan accordingly

---

# SECTION 4: Federal Acquisition Regulations (FAR)

## 4.1 FAR Part 39 — Acquisition of Information Technology

**Official Name:** Federal Acquisition Regulation, Part 39: Acquisition of Information Technology  
**Citation:** 48 CFR Part 39  
**Governing Authority:** FAR Council (GSA, DoD, NASA)

**What It Requires (Plain English):**  
FAR Part 39 establishes policies and procedures for acquiring IT by federal agencies. It requires agencies to structure IT acquisitions to promote modular contracting, reduce risk, address information security, and ensure accessibility (Section 508 compliance).

**Key Provisions:**

| Section | Title | Requirement |
|---------|-------|------------|
| **39.101** | Policy | IT must be acquired using modular contracting to the maximum extent practicable |
| **39.103** | Modular Contracting | Break large IT acquisitions into smaller, manageable increments; each module must be useful independently |
| **39.105** | Privacy | IT acquisitions must address privacy requirements per the Privacy Act and OMB guidance |
| **39.203** | Applicability of Section 508 | All IT developed, procured, maintained, or used by federal agencies must conform to Section 508 accessibility standards unless an undue burden exception applies |
| **39.204** | Exceptions to Section 508 | Back-office systems used by individuals with disabilities must still be accessible; ICT used by the public always requires conformance |

**Related FAR Clauses:**

| Clause | Title | Purpose |
|--------|-------|---------|
| **52.204-21** | Basic Safeguarding of Covered Contractor Information Systems | 15 basic security requirements for FCI (basis for CMMC Level 1) |
| **52.204-23** | Prohibition on Contracting for Hardware/Software from Covered Sources (Section 889) | See Section 4.3 |
| **52.239-1** | Privacy or Security Safeguards | Cloud computing security requirements |
| **52.204-25** | Prohibition on Contracting for Certain Telecommunications Equipment (889(b)) | Extended supply chain prohibition |

**Who It Applies To:**
- All federal agencies acquiring IT
- All contractors/vendors selling IT products or services to the federal government
- Subcontractors providing IT components

**Platform Impact:**
- The platform must be designed following modular architecture principles (aligns with FAR 39.103 modular contracting)
- Must implement FAR 52.204-21 basic safeguarding (15 requirements) at minimum for any federal contract
- Must comply with Section 508 accessibility (see Section 7)
- Privacy requirements must be addressed in the platform's design and operation
- Proposals must address how the platform meets FAR Part 39 requirements

---

## 4.2 DFARS Supplements

**Official Name:** Defense Federal Acquisition Regulation Supplement  
**Citation:** 48 CFR Parts 201–253  
**Governing Authority:** Under Secretary of Defense for Acquisition and Sustainment

**What It Requires (Plain English):**  
DFARS supplements the FAR with DoD-specific acquisition policies. For IT and cybersecurity, DFARS adds significant requirements beyond the base FAR, including CUI protection, supply chain security, and cloud computing provisions.

**Key DFARS Clauses for IT/Consulting Platforms:**

| Clause | Title | Impact |
|--------|-------|--------|
| **252.204-7008** | Compliance with Safeguarding CDI Procedures | Pre-award notice; contractor represents compliance with NIST SP 800-171 |
| **252.204-7009** | Limitations on the Use or Disclosure of Third-Party Contractor Reported Cyber Incident Information | Restricts sharing of incident information |
| **252.204-7012** | Safeguarding CDI and Cyber Incident Reporting | Primary CUI/CDI protection clause (see Section 3.2) |
| **252.204-7019** | Notice of NIST SP 800-171 DoD Assessment Requirements | Requires SPRS score posting |
| **252.204-7020** | NIST SP 800-171 DoD Assessment Requirements | Governs Medium/High DIBCAC assessments |
| **252.204-7021** | Cybersecurity Maturity Model Certification Requirements | CMMC clause (see Section 3.1) |
| **252.239-7010** | Cloud Computing Services | DoD cloud requirements; FedRAMP+ equivalency |
| **252.204-7018** | Prohibition on the Acquisition of Covered Defense Telecommunications | Section 889 for DoD |
| **252.227-7013** | Rights in Technical Data — Noncommercial Items | Government data rights |
| **252.227-7014** | Rights in Noncommercial Computer Software and Documentation | Government rights in software |

**DFARS 252.239-7010 — Cloud Computing Services (Detail):**
- Cloud services must meet FedRAMP Moderate baseline (or equivalent per DoD CC SRG)
- Data must be within the United States or its outlying areas
- Contractor must support DoD incident response requirements
- Government must be able to access data and perform forensic analysis
- This clause works in conjunction with DFARS 252.204-7012

**Who It Applies To:**
- All DoD contractors and subcontractors
- Flows down to all subcontract tiers for applicable clauses

**Platform Impact:**
- Must comply with all applicable DFARS clauses included in the contract
- Data rights clauses (252.227-7013, 252.227-7014) determine who owns technical data and software developed under the contract
- Cloud hosting must align with DFARS 252.239-7010 (FedRAMP Moderate+ in US-based facilities)
- Must be able to demonstrate DFARS 252.204-7012 compliance (NIST SP 800-171 controls, incident reporting, media preservation)
- SPRS score must be posted before contract award (252.204-7019/7020)

---

## 4.3 Section 889 — Supply Chain Security

**Official Name:** John S. McCain National Defense Authorization Act for Fiscal Year 2019, Section 889  
**Citation:** Public Law 115-232, Section 889; implemented via FAR 52.204-24, 52.204-25, 52.204-26  
**Governing Authority:** FAR Council; Government-wide

**What It Requires (Plain English):**  
Section 889 prohibits federal agencies (and their contractors) from procuring or using telecommunications equipment and services from specific Chinese companies deemed security risks. There are two parts:

| Part | Effective Date | Prohibition |
|------|---------------|-------------|
| **Part A** (889(a)(1)(A)) | August 13, 2019 | Agencies may not procure covered equipment/services |
| **Part B** (889(a)(1)(B)) | August 13, 2020 | Agencies may not contract with entities that USE covered equipment/services (regardless of whether it's used on the government contract) |

**Covered Companies (and Subsidiaries/Affiliates):**
1. Huawei Technologies / HiSilicon
2. ZTE Corporation
3. Hytera Communications
4. Hangzhou Hikvision Digital Technology
5. Dahua Technology
6. Any entity owned/controlled by, or connected to, the People's Republic of China government (as determined by the Secretary of Defense or Director of National Intelligence)

**Key Requirements:**
- Contractors must represent (under FAR 52.204-24/26) that they do not use covered equipment or services in any system, including internal corporate systems
- Covers equipment and services, including:
  - Telecommunications equipment (routers, switches, phones)
  - Video surveillance equipment (cameras, DVRs)
  - Telecommunications services
  - Components or services from covered entities in OEM or white-label products

**Who It Applies To:**
- All federal contractors (Part A for government-provided systems; Part B for any contractor system)
- Subcontractors at all tiers
- No exceptions for COTS products

**Key Compliance Checkpoints:**
1. Conduct supply chain review of all telecommunications and video surveillance equipment
2. Review all hardware vendors and subcomponents for covered entity connections
3. Complete reasonable inquiry per FAR 52.204-26 representation
4. Remove or replace any covered equipment/services
5. Maintain documentation of supply chain due diligence

**Platform Impact:**
- **Enterprise-wide impact:** Must audit all hardware, network equipment, cameras, phones, and services for covered entity connections
- Cloud infrastructure providers must not use covered components in their data centers (verify with CSP)
- If using Video Surveillance (e.g., physical security for data centers), cameras must not be from Hikvision or Dahua
- Must make Section 889 representations in all government contract bids
- Must implement supply chain risk management processes to continuously monitor

---

# SECTION 5: Records Management

## 5.1 NARA (National Archives and Records Administration)

**Official Name:** National Archives and Records Administration  
**Citation:** 44 U.S.C. Chapters 21, 29, 31, 33; 36 CFR Chapter XII (Parts 1220–1239)  
**Governing Authority:** Archivist of the United States

**What It Requires (Plain English):**  
NARA establishes the standards for federal records management, including creation, maintenance, use, and disposition (retention or destruction). All federal agencies must manage records per NARA regulations, and contractors creating or managing federal records must comply as well.

**Key NARA Regulations:**

| Regulation | Title | Key Requirement |
|-----------|-------|----------------|
| **36 CFR 1220** | Federal Records — General | Defines federal records; establishes agency responsibilities |
| **36 CFR 1222** | Creation and Maintenance of Federal Records | Agencies must create records documenting policies, decisions, and activities |
| **36 CFR 1224** | Records Disposition Programs | Agencies must implement records disposition schedules |
| **36 CFR 1225** | Scheduling Records | Process for submitting schedules (SF-115) to NARA for approval |
| **36 CFR 1230** | Unlawful or Accidental Destruction | Reporting requirements for unauthorized records destruction |
| **36 CFR 1235** | Transfer of Records to NARA | Requirements for transferring permanent records |
| **36 CFR 1236** | Electronic Records Management | Standards for electronic records systems |
| **36 CFR 1238** | Microforms Records Management | Standards for microform/digitization |
| **36 CFR 1239** | Program Assistance and Inspections | NARA's inspection authority |

**NARA Bulletin 2024-02 (Electronic Records Management):**
- All federal records must be managed electronically by June 30, 2024 (OMB M-19-21/M-23-07)
- Agencies must have the capability to manage all permanent electronic records in electronic format
- Paper records must be digitized or managed through hybrid processes
- Applies to emails, instant messages, social media, and all digital communications

**Who It Applies To:**
- All executive branch agencies
- Contractors managing federal records on behalf of agencies (per the contract)
- Government-sponsored enterprises in some cases

**Key Compliance Checkpoints:**
1. Identify all records created, received, and maintained
2. Apply NARA-approved disposition schedules (General Records Schedules or agency-specific schedules)
3. Implement records management controls in all information systems
4. Ensure permanent records are transferred to NARA as scheduled
5. Report any unauthorized destruction
6. Complete annual Records Management Self-Assessment (RMSA)

**Platform Impact:**
- The platform must support records management capabilities:
  - Records declaration and classification
  - Retention schedule enforcement (auto-archival, destruction holds)
  - Legal holds for litigation or FOIA
  - Audit trails for all records actions (creation, access, modification, destruction)
  - Export in NARA-approved transfer formats
- Must not allow unauthorized deletion of federal records
- Must support records search and retrieval for FOIA, discovery, and congressional requests

---

## 5.2 Federal Records Act

**Official Name:** Federal Records Act of 1950 (as amended)  
**Citation:** 44 U.S.C. Chapters 21, 29, 31, 33  
**Governing Authority:** NARA; OMB

**What It Requires (Plain English):**  
The Federal Records Act is the foundational law requiring federal agencies to create, preserve, and manage records documenting their organization, functions, policies, decisions, procedures, and essential transactions. It prohibits unauthorized destruction of federal records and establishes NARA's oversight role.

**Key Provisions:**
1. **Records Creation:** Agencies must create and preserve records necessary to document agency activities
2. **Records Management Program:** Each agency must establish and maintain a records management program
3. **Disposal Authority:** Records may only be destroyed in accordance with NARA-approved disposition schedules
4. **Penalties:** Willful and unlawful destruction of federal records is a felony (18 U.S.C. § 2071)
5. **Contractor Records:** Records created by contractors in performance of a federal contract may be federal records (depends on contract language)

**Who It Applies To:**
- All federal agencies
- Contractors whose contracts specify that records created are federal records

**Platform Impact:**
- Contracts with USACE/DoD may designate deliverables and project records as federal records
- The platform must prevent unauthorized deletion of records designated as federal records
- Must implement disposition controls aligned with NARA schedules
- Must support litigation holds and preservation orders

---

## 5.3 Document Retention Schedules

**Official Framework:** NARA General Records Schedules (GRS); Agency-specific schedules  
**Citation:** GRS published at https://www.archives.gov/records-mgmt/grs; Agency schedules approved via SF-115

**Key General Records Schedules for IT/Consulting:**

| GRS | Title | Retention |
|-----|-------|-----------|
| **GRS 3.1** | General Technology Management Records | IT management emails: 3 years; IT governance: 5 years after superseded |
| **GRS 3.2** | Information Systems Security Records | System security plans: 1 year after system decommission; Risk assessments: 6 years; Incident records: 3 years after case closed |
| **GRS 4.2** | Information Access and Protection Records | FOIA files: 6 years after final action; Privacy Act files: review at 4 years |
| **GRS 5.1** | Common Office Records | Routine correspondence: 7 years; Policy files: 6 years after superseded |
| **GRS 5.2** | Transitory and Intermediary Records | Transitory messages: destroy when no longer needed |
| **GRS 5.5** | Mail/Shipping/Packaging Management | 3 years |
| **GRS 5.7** | Agency Continuity Records | COOP plans: 3 years after superseded |
| **GRS 5.8** | Records Management Records | Records schedules: permanent; Disposition authorizations: 6 years |

**USACE-Specific Retention Periods (Examples):**

| Record Type | Retention Period | Authority |
|-------------|-----------------|-----------|
| Project files (Civil Works) | Permanent (transfer to NARA) | USACE Records Schedule |
| Engineering reports | Permanent | USACE Records Schedule |
| Contract administration files | 6 years after final payment | GRS 1.1 / FAR 4.805 |
| Safety reports (EM 385-1-1) | 5 years | Army Records Schedule |
| Environmental records (HTRW) | Permanent | EPA/Army Requirements |
| Audit files | 6 years after resolution | GRS 1.1 |
| Cybersecurity logs | 1 year minimum (DoD requires longer) | GRS 3.2 / DoD policy |

**Who It Applies To:**
- All federal agencies and their records
- Contractors managing federal records

**Platform Impact:**
- The platform must implement configurable retention schedules per record type
- Must support automatic disposition actions (notification, transfer, destruction) per NARA schedules
- Must maintain disposition logs (what was destroyed, when, by whom, under what authority)
- Must support "freeze" or "hold" to prevent destruction when litigation or investigation is anticipated
- USACE permanent records must never be automatically destroyed — must be queued for NARA transfer

---

## 5.4 Electronic Records Management

**Official Standard:** 36 CFR 1236 (Electronic Records Management); DoD 5015.02-STD (now superseded by Universal Electronic Records Management (ERM) Requirements)  
**Citation:** 36 CFR 1236; NARA Bulletin 2024-02; OMB M-19-21 (Transition to Electronic Records); OMB M-23-07

**What It Requires (Plain English):**  
Federal agencies must manage all records electronically and ensure electronic records management systems meet NARA performance requirements. The government has transitioned to fully electronic records management — paper-based processes are being phased out.

**Key Requirements:**

1. **Electronic Recordkeeping System Requirements (36 CFR 1236.10–1236.28):**
   - Reliable capture and storage of electronic records
   - Maintain integrity of records throughout lifecycle
   - Protect records from unauthorized access, modification, or deletion
   - Ensure records remain usable and retrievable
   - Support disposition in accordance with approved schedules

2. **OMB M-19-21 / M-23-07 Requirements:**
   - All permanent records in electronic format by end of FY2024
   - All temporary records managed electronically by end of FY2024
   - Agencies must close agency-operated paper records storage facilities
   - All records transfers to NARA must be in electronic format

3. **DoD ERM Requirements (Successor to DoD 5015.02):**
   - Universal ERM capabilities for all DoD information systems
   - Records management functionality embedded in business systems (not standalone records management systems)
   - Auto-categorization and tagging capabilities
   - Integration with DoD ERM Reference Architecture

4. **NARA Transfer Standards:**
   - Permanent records transferred as:
     - Text: PDF/A-1, PDF/A-2, PDF/A-3, or plain text (UTF-8)
     - Email: EML or MBOX with attachments
     - Images: TIFF (uncompressed or lossless), JPEG 2000
     - Databases: CSV with data dictionary, or SIARD format
     - Geospatial: GeoTIFF, Shapefile, GeoJSON
     - Audio/Video: BWF (broadcast WAV), JPEG 2000 motion

**Who It Applies To:**
- All federal agencies
- All information systems that create, manage, or store federal records
- Contractors operating records management systems for agencies

**Platform Impact:**
- The platform must function as an electronic recordkeeping system per 36 CFR 1236
- Must capture records with required metadata (creator, date, subject, disposition authority)
- Must enforce integrity protections (checksums, write-protection for finalized records)
- Must support export in NARA-approved transfer formats
- Must integrate with or function as a records management system (or interface with agency records management solutions like NARA's ERA 2.0)
- Document generation must default to PDF/A for archival records
- Email correspondence managed within the platform must be retained per records schedules

---

# SECTION 6: Federal Plain Language Requirements

## 6.1 Plain Writing Act of 2010

**Official Name:** Plain Writing Act of 2010  
**Citation:** Public Law 111-274; 5 U.S.C. § 301 note  
**Governing Authority:** OMB; each agency designates a Plain Language coordinator

**What It Requires (Plain English):**  
The Plain Writing Act requires federal agencies to write all new or substantially revised documents in plain language. "Plain language" means writing that is clear, concise, well-organized, and follows other best practices appropriate to the subject or field and intended audience.

**Key Requirements:**
1. **Covered Documents:** All documents that:
   - Are necessary to obtain any federal government benefit or service
   - Provide information about any federal government benefit or service
   - Explain how to comply with a requirement the federal government administers or enforces
2. **Agency Obligations:**
   - Designate a senior official for plain writing compliance
   - Train employees in plain writing
   - Establish plain writing processes for creating and reviewing documents
   - Create a plain language page on the agency website
   - Report annually on plain writing compliance
3. **Writing Guidelines:**
   - Use active voice
   - Use short sentences (average 15–20 words)
   - Use common, everyday words
   - Use "you" to address the reader
   - Use headings, lists, and tables to organize information
   - Omit unnecessary words
   - Use the simplest tense possible (present tense preferred)

**What's NOT Covered:**
- Regulations (covered separately by EO 12866/EO 13563)
- Court filings and legal briefs
- Classified documents

**Who It Applies To:**
- All executive branch agencies
- Contractors producing public-facing documents on behalf of agencies should follow these standards (typically specified in contract)

**Key Compliance Checkpoints:**
1. All public-facing content written in plain language
2. Plain language review integrated into document review process
3. Agency plain language training completed
4. Readability scores tracked (Flesch-Kincaid Grade Level 6–8 for public documents)
5. Feedback mechanism for public to comment on document clarity

**Platform Impact:**
- All user-facing content in the platform should follow plain language principles
- Template content and generated documents should use plain language by default
- Compliance documentation provided to government clients should be plain-language formatted
- Consider integrating readability scoring into the platform's document editor (Flesch-Kincaid, Gunning Fog)

---

## 6.2 Federal Plain Language Guidelines

**Official Name:** Federal Plain Language Guidelines  
**Citation:** Published by the Plain Language Action and Information Network (PLAIN); latest revision March 2011  
**Governing Authority:** PLAIN (interagency working group); OMB

**What They Require:**  
These guidelines operationalize the Plain Writing Act with specific, actionable writing standards. Key areas:

**Audience:**
- Identify your audience before writing
- Write for the main audience; provide supplementary materials for secondary audiences
- Use reader-centered language ("You must submit your application" vs. "The applicant shall submit the application")

**Organization:**
- Put the most important information first (inverted pyramid)
- Use descriptive headings organized logically
- Limit each paragraph to one idea
- Use transition words to connect ideas

**Word Choice:**
- Use common words ("use" not "utilize," "buy" not "procure," "help" not "facilitate")
- Avoid jargon and acronyms (define all acronyms on first use)
- Minimize the use of "shall" (use "must" for obligations, "may" for permission)

**Sentence Structure:**
- Use short sentences (target 15–20 words average)
- Use active voice (95%+ of the time)
- Write in present tense where possible
- Avoid double negatives
- Avoid strings of prepositional phrases

**Formatting:**
- Use headers (H2, H3) to break up content
- Use bulleted or numbered lists for three or more items
- Use tables for complex data
- Use adequate white space
- Keep paragraphs short (150 words maximum)

**Platform Impact:**
- Build plain language checks into the platform's content creation workflow
- Provide plain language templates as defaults for government-facing documents
- Use these guidelines as the standard for all platform documentation (help docs, tooltips, error messages)
- Consider integrating automated readability tools (Hemingway, readable.com API, or custom Flesch-Kincaid calculators)

---

## 6.3 21st Century IDEA Act

**Official Name:** 21st Century Integrated Digital Experience Act  
**Citation:** Public Law 115-336 (December 20, 2018); codified at 44 U.S.C. § 3501 note  
**Governing Authority:** OMB; GSA (standards and guidance)

**What It Requires (Plain English):**  
The 21st Century IDEA Act requires federal agencies to modernize their websites and digital services. It mandates that all new and redesigned agency websites and digital services must be:

**Eight Requirements:**

| # | Requirement | What It Means |
|---|-----------|---------------|
| 1 | **Accessible** | Conformant with Section 508 / WCAG 2.0 Level AA (now WCAG 2.1 per OMB guidance) |
| 2 | **Consistent** | Consistent visual design aligned with the U.S. Web Design System (USWDS) |
| 3 | **Authoritative** | Clear identity of the information's source |
| 4 | **Searchable** | Indexed and discoverable by commonly used search engines |
| 5 | **Secure** | HTTPS, HSTS, and security best practices |
| 6 | **User-Centered** | Designed around user needs, tested with actual users |
| 7 | **Customizable** | Personalized to user needs where appropriate (not personalized tracking) |
| 8 | **Mobile-Friendly** | Responsive design; functional on mobile devices |

**Additional Requirements:**
- Digitize all paper-based forms and processes
- Accept electronic signatures (per ESIGN Act and GPEA)
- Provide digital alternatives to in-person government services
- Align with the US Web Design System (USWDS — https://designsystem.digital.gov/)

**US Web Design System (USWDS):**
- Open-source design system for the federal government
- Provides components, design tokens, utilities, and templates
- Based on user research with government audiences
- Includes accessibility-tested components
- Currently at USWDS 3.x

**Who It Applies To:**
- All executive branch agencies (for public-facing websites and services)
- Contractors developing websites or digital services for federal agencies
- Agencies must submit modernization plans to OMB

**Key Compliance Checkpoints:**
1. All new websites comply with eight requirements
2. Existing websites on modernization schedule
3. Paper-based forms identified for digitization
4. Website analytics implemented (Digital Analytics Program — DAP)
5. USWDS components used for consistency
6. User research conducted and documented
7. Mobile responsiveness tested

**Platform Impact:**
- If the platform has any government-facing interface, it must comply with all eight requirements
- Should adopt USWDS design system (or demonstrate equivalent compliance)
- Must implement HTTPS with HSTS
- Must be mobile-responsive and accessible (WCAG 2.1 AA)
- Must support electronic signatures for forms and approvals
- Search functionality must be robust and indexable
- Should implement the Digital Analytics Program (DAP) if serving agency websites

---

# SECTION 7: Government Accessibility (Beyond Section 508)

## 7.1 ADA Title II for Digital Services

**Official Name:** Americans with Disabilities Act, Title II — Nondiscrimination on the Basis of Disability in State and Local Government Services (and its application to federal programs)  
**Citation:** 42 U.S.C. § 12131–12165; 28 CFR Part 35; Final Rule on Web Content and Mobile App Accessibility (April 24, 2024)  
**Governing Authority:** Department of Justice (DOJ)

**What It Requires (Plain English):**  
Title II of the ADA prohibits disability discrimination in all services, programs, and activities of state and local governments. The April 2024 DOJ final rule formally established WCAG 2.1 Level AA as the technical standard for web content and mobile application accessibility. While Title II directly applies to state and local governments, its principles extend to federal programs through Section 504 of the Rehabilitation Act, and it establishes the legal baseline that courts and agencies reference for digital accessibility.

**April 2024 ADA Title II Digital Accessibility Rule:**

| Requirement | Detail |
|------------|--------|
| **Technical Standard** | WCAG 2.1 Level AA |
| **Scope** | All web content and mobile applications of state/local governments |
| **Compliance Deadline (Large Entities)** | April 24, 2026 (population ≥50,000 or governments with 50+ employees) |
| **Compliance Deadline (Small Entities)** | April 24, 2027 (population <50,000) |
| **Third-Party Content** | Third-party content used by the government must also comply |
| **Archived Content** | Limited exception for archived web content not updated after the compliance date |
| **Enforcement** | DOJ enforcement actions, private lawsuits, reasonable modifications |

**Relevance to Federal Contractors:**
- While Title II directly targets state/local governments, courts increasingly apply similar accessibility standards to federal contractors under Section 504 and Section 508
- Government clients will require the platform to meet WCAG 2.1 AA (and increasingly WCAG 2.2) as a contractual obligation
- The DOJ rule signals a clear government-wide trajectory toward mandating WCAG 2.1 AA

**Key WCAG 2.1 Level AA Requirements (Highlights):**

| Principle | Key Success Criteria |
|-----------|---------------------|
| **Perceivable** | Text alternatives for non-text content (1.1.1); Captions for audio (1.2.2); Audio descriptions (1.2.5); Adaptable content (1.3.x); Contrast ratios 4.5:1 text, 3:1 large text (1.4.3); Text resize to 200% (1.4.4); Reflow at 320px (1.4.10) |
| **Operable** | Keyboard accessible (2.1.1); No keyboard traps (2.1.2); Timing adjustable (2.2.1); Seizure prevention (2.3.1); Skip navigation (2.4.1); Page titled (2.4.2); Focus order (2.4.3); Focus visible (2.4.7); Pointer gestures (2.5.1); Motion actuation alternatives (2.5.4) |
| **Understandable** | Language of page (3.1.1); Language of parts (3.1.2); On focus behavior (3.2.1); Consistent navigation (3.2.3); Error identification (3.3.1); Labels/instructions (3.3.2); Error suggestion (3.3.3); Error prevention (3.3.4) |
| **Robust** | Parsing (4.1.1 — deprecated in WCAG 2.2); Name, role, value (4.1.2); Status messages (4.1.3) |

**Platform Impact:**
- Must achieve WCAG 2.1 Level AA conformance at minimum
- Should target WCAG 2.2 Level AA for future-proofing
- Must ensure all third-party components (UI libraries, widgets, embedded content) are accessible
- Must provide accessibility documentation (VPAT/ACR — see Section 7.2)
- Must include accessibility in the software development lifecycle (design, development, testing, deployment)

---

## 7.2 Revised Section 508 (2018 Refresh)

**Official Name:** Section 508 of the Rehabilitation Act of 1973 (as amended), 2017 ICT Standards and Guidelines (commonly called the "2018 Refresh" or "Revised 508")  
**Citation:** 29 U.S.C. § 794d; 36 CFR Part 1194; Published January 18, 2017; Effective January 18, 2018  
**Governing Authority:** US Access Board (standards); GSA (implementation and testing); OMB (reporting)

**What It Requires (Plain English):**  
Section 508 requires that all Information and Communications Technology (ICT) developed, procured, maintained, or used by federal agencies must be accessible to people with disabilities. The 2017 update (effective 2018) harmonized Section 508 with the international standards by incorporating WCAG 2.0 Level A and AA success criteria as the technical standard for web content and software, and EN 301 549 for hardware and telecommunications.

**Key Changes in the 2018 Refresh:**

| Aspect | Original 508 (2000) | Revised 508 (2018) |
|--------|---------------------|---------------------|
| Web standard | Section 508 specific criteria (§1194.22) | WCAG 2.0 Level A and AA (all success criteria) |
| Software standard | Section 508 specific criteria (§1194.21) | WCAG 2.0 Level A and AA + Section 502 (interoperability with AT) |
| Hardware | §1194.25, §1194.26 | EN 301 549 Chapter 8 (Hardware) |
| Documentation | §1194.41 | Chapter 6 (Support documentation and services) |
| Functional performance criteria | §1194.31 | Chapter 3 (Functional Performance Criteria — for novel ICT not covered by specific chapters) |
| Real-time communication | N/A | Chapter 4 (Requirements for ICT with two-way voice communication) |
| Authoring tools | N/A | Chapter 5 (ATAG 2.0 Part A and B) |

**WCAG 2.0 AA to Section 508 Mapping (Excerpt):**

- 38 WCAG 2.0 success criteria (Level A and AA) are directly incorporated as Section 508 requirements via E205.4
- The Access Board published a mapping table cross-referencing old 508 provisions to the new WCAG-based requirements

**Voluntary Product Accessibility Template (VPAT) / Accessibility Conformance Report (ACR):**

- Vendors must provide a VPAT/ACR documenting Section 508 conformance
- Format: VPAT 2.4 or later (current version: VPAT 2.5)
- Available editions:
  - **508 Edition** — US Section 508 only
  - **EU Edition** — EN 301 549
  - **INT Edition** — WCAG only (international)
  - **WCAG Edition** — WCAG 2.x all levels
- The VPAT/ACR must be updated with each major product release
- Most government procurement solicitations (RFPs/RFQs) require a VPAT/ACR as part of the bid

**ICT Testing Baseline:**
- GSA publishes the ICT Testing Baseline (latest: ICT Testing Baseline for Web, version 3.1)
- Provides standardized testing methodology for Section 508 conformance
- Harmonized with the Trusted Tester Process (see below)

**Trusted Tester Program:**
- DHS/GSA program that certifies accessibility testers
- Trusted Tester methodology is the standard for Section 508 conformance testing
- Currently Trusted Tester v5.1 (aligned with Revised 508 / WCAG 2.0 AA)
- Federal agencies increasingly require Trusted Tester certification for accessibility reviews

**GSA Section 508 Program — Annual Assessment:**
- OMB requires annual Section 508 program assessments from all agencies (per OMB memoranda)
- Agencies must report on:
  - Section 508 program maturity
  - Top-viewed ICT products and their Section 508 status
  - Testing methodology and coverage
  - Training and awareness programs
  - Complaint resolution procedures

**Who It Applies To:**
- All federal agencies (zero exceptions)
- All ICT developed, procured, maintained, or used by federal agencies
- Contractors and vendors selling ICT to the federal government
- Applies to internal-facing AND public-facing ICT
- Applies to electronic content (documents, videos, social media posts)

**Exceptions (Limited):**
1. **Undue Burden:** If compliance would impose an undue burden, the agency must provide alternative means of access (must be documented with senior official sign-off)
2. **Fundamental Alteration:** If compliance would fundamentally alter the nature of the product
3. **National Security Systems:** ICT operated for national security purposes (as defined in 44 U.S.C. § 3542)
4. **Acquired by Contractor:** ICT used by contractor employees not directly supporting government functions (narrow exception)
5. **Maintenance/Monitoring Spaces:** ICT in spaces accessed only for maintenance (limited)

**Key Compliance Checkpoints:**
1. Conduct accessibility assessment against WCAG 2.0 Level A and AA (38 success criteria)
2. Test with the ICT Testing Baseline / Trusted Tester Process
3. Create and publish VPAT/ACR (VPAT 2.5 format)
4. Remediate all Level A and AA failures
5. Test with assistive technologies (screen readers: JAWS, NVDA; screen magnifiers: ZoomText; voice input: Dragon)
6. Include accessibility requirements in procurement language
7. Maintain accessibility throughout product lifecycle (not just at launch)
8. Provide accessible documentation and support

**Platform Impact:**
- **CRITICAL:** Must achieve WCAG 2.0 Level AA conformance at minimum (strongly recommended: target WCAG 2.1 AA)
- Must produce a VPAT/ACR and keep it current
- Must implement automated accessibility testing in CI/CD (axe-core, pa11y, Lighthouse)
- Must conduct manual testing with screen readers (JAWS + NVDA minimum)
- Must ensure all documents generated by the platform are accessible (tagged PDFs, accessible Word docs)
- Must provide keyboard navigation for all functionality
- Must meet color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Must include alt text for all non-decorative images
- Must provide captions for any video/audio content
- Consider Trusted Tester certification for team members conducting testing
- Must be prepared to respond to agency Section 508 conformance inquiries during procurement

---

# SECTION 8: Platform Impact Matrix

## 8.1 Compliance Priority Matrix

The following matrix prioritizes all standards by impact severity and implementation timeline for a consulting platform serving USACE/DoD clients:

| Priority | Standard | Risk if Non-Compliant | Implementation Effort | Timeline |
|----------|----------|----------------------|----------------------|----------|
| **P0 — Blocker** | NIST SP 800-171 / CMMC 2.0 | Cannot bid on DoD contracts | Very High | 6–18 months |
| **P0 — Blocker** | DFARS 252.204-7012 | Contract non-compliance; potential FCA liability | Very High | Concurrent with SP 800-171 |
| **P0 — Blocker** | FedRAMP (if cloud) | Cannot deploy to federal agencies | Very High (cost: $500K–$2M+) | 12–24 months |
| **P0 — Blocker** | FIPS 140-2/3 | All encryption non-compliant | Moderate (library selection) | 1–3 months |
| **P1 — Critical** | Section 508 / WCAG | Cannot sell to federal agencies; legal liability | Moderate–High | 3–6 months |
| **P1 — Critical** | FISMA (if operating federal system) | No ATO = no operation | Very High | 6–18 months |
| **P1 — Critical** | STIGs | Cannot deploy to DoD networks | High | 3–6 months |
| **P1 — Critical** | FAR 52.204-21 (Basic Safeguarding) | Cannot bid on any federal contract | Low–Moderate | 1–2 months |
| **P1 — Critical** | Section 889 | Cannot represent compliance; contract prohibition | Moderate (audit effort) | 1–3 months |
| **P2 — High** | RMF / DoD ATO | Cannot operate on DoD networks | Very High | 12–24 months |
| **P2 — High** | USACE ERs/EPs | Deliverable non-compliance | Moderate | 2–4 months |
| **P2 — High** | NIST CSF 2.0 | Program maturity gap; competitive disadvantage | Moderate | 3–6 months |
| **P2 — High** | Zero Trust Architecture | Non-alignment with federal strategy | High | 6–12 months |
| **P3 — Medium** | ITAR/EAR | Criminal/civil penalties if export-controlled data mishandled | Moderate–High | 3–6 months |
| **P3 — Medium** | Plain Writing Act | Non-compliance; poor user experience | Low | 1–2 months |
| **P3 — Medium** | 21st Century IDEA Act | Non-conformant digital service | Moderate | 2–4 months |
| **P3 — Medium** | NARA / Records Management | Improper records handling; audit findings | Moderate | 3–6 months |
| **P4 — Standard** | ADA Title II (digital) | Accessibility liability | Low (addressed with 508 compliance) | Concurrent with 508 |
| **P4 — Standard** | DFARS Data Rights (7013/7014) | IP/data rights disputes | Low (contractual/legal) | Pre-contract |
| **P4 — Standard** | FAR Part 39 (general) | Procurement non-compliance | Low | Pre-contract |

## 8.2 Cross-Reference: Standard-to-Control Mapping

The following illustrates how a single platform control can satisfy multiple standards simultaneously:

| Platform Control | NIST 800-53 | 800-171 | CMMC | STIG | FedRAMP | Section 508 |
|-----------------|-------------|---------|------|------|---------|-------------|
| Multi-Factor Authentication | IA-2(1)(2) | 3.5.3 | L2: IA.L2-3.5.3 | V-222430 | IA-2(1)(2) | — |
| Audit Logging | AU-2, AU-3, AU-12 | 3.3.1, 3.3.2 | L2: AU.L2-3.3.1 | V-222550 | AU-2, AU-3) | — |
| FIPS Encryption (TLS) | SC-8, SC-13 | 3.13.8, 3.13.11 | L2: SC.L2-3.13.11 | V-222570 | SC-8, SC-13 | — |
| Role-Based Access Control | AC-3, AC-6 | 3.1.1, 3.1.5 | L2: AC.L2-3.1.1 | V-222600 | AC-3, AC-6 | — |
| Session Timeout | AC-11, AC-12 | 3.1.10, 3.1.11 | L2: AC.L2-3.1.10 | V-222425 | AC-11, AC-12 | — |
| Keyboard Navigation | — | — | — | — | — | 2.1.1, 2.1.2 |
| Color Contrast (4.5:1) | — | — | — | — | — | 1.4.3 |
| Alt Text for Images | — | — | — | — | — | 1.1.1 |
| Vulnerability Scanning | RA-5, SI-2 | 3.11.2, 3.14.1 | L2: RA.L2-3.11.2 | Multiple | RA-5, SI-2 | — |
| Incident Response Plan | IR-1, IR-4, IR-8 | 3.6.1, 3.6.2 | L2: IR.L2-3.6.1 | Multiple | IR-1, IR-4, IR-8 | — |
| Records Retention | AU-11, SI-12 | 3.3.1 | — | Multiple | AU-11 | — |
| Plain Language Content | — | — | — | — | — | 3.1.5 (reading level) |

## 8.3 Action Items for Platform Compliance

### Immediate (0–3 Months)

1. **Cryptographic Module Audit:** Verify all encryption uses FIPS 140-2/3 validated modules operating in FIPS mode
2. **FAR 52.204-21 Self-Assessment:** Confirm all 15 basic safeguarding requirements are met
3. **Section 889 Audit:** Comprehensive supply chain review for covered telecommunications/video equipment
4. **SPRS Score Submission:** Complete NIST SP 800-171 self-assessment and submit score to SPRS
5. **VPAT/ACR Creation:** Conduct Section 508 accessibility assessment; produce VPAT 2.5

### Short-Term (3–6 Months)

6. **NIST SP 800-171 Gap Remediation:** Address all POA&M items from self-assessment
7. **STIG Hardening:** Apply applicable STIGs to all system components
8. **Plain Language Review:** Audit all platform content against Federal Plain Language Guidelines
9. **Records Management Framework:** Implement retention schedules and disposition controls
10. **Incident Response:** Build and test 72-hour cyber incident reporting capability

### Medium-Term (6–18 Months)

11. **CMMC Level 2 Certification:** Engage C3PAO for formal assessment
12. **FedRAMP Authorization (if applicable):** Begin readiness assessment and 3PAO engagement
13. **RMF Package (if DoD system):** Initiate eMASS registration and SSP development
14. **Zero Trust Implementation:** Implement identity-centric, continuous-verification architecture
15. **USACE Template Library:** Build USACE-compliant document templates (PMP, DDR, Feasibility Report)

### Ongoing

16. **Continuous Monitoring:** Monthly vulnerability scans, quarterly STIG scans, annual penetration testing
17. **Annual CMMC Affirmation:** Confirm continued compliance
18. **Section 508 Testing:** Integrate automated + manual accessibility testing into CI/CD
19. **Records Disposition:** Execute scheduled disposition actions per NARA schedules
20. **Training:** Annual cybersecurity awareness (DoD Cyber Awareness Challenge), Section 508 awareness, CUI handling, records management

---

## 8.4 Key References and URLs

| Standard | Primary Reference |
|----------|-------------------|
| USACE Publications | https://publications.usace.army.mil |
| NIST SP 800-53 Rev. 5 | https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final |
| NIST SP 800-171 Rev. 2 | https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final |
| NIST SP 800-171 Rev. 3 | https://csrc.nist.gov/publications/detail/sp/800-171/rev-3/final |
| NIST CSF 2.0 | https://www.nist.gov/cyberframework |
| NIST SP 800-207 (ZTA) | https://csrc.nist.gov/publications/detail/sp/800-207/final |
| FIPS 140-3 | https://csrc.nist.gov/publications/detail/fips/140/3/final |
| CMVP Validated Modules | https://csrc.nist.gov/projects/cryptographic-module-validation-program |
| CMMC 2.0 | https://dodcio.defense.gov/CMMC/ |
| DFARS (full text) | https://www.acquisition.gov/dfars |
| FAR (full text) | https://www.acquisition.gov/far |
| DISA STIGs | https://public.cyber.mil/stigs/ |
| FedRAMP | https://www.fedramp.gov |
| NARA GRS | https://www.archives.gov/records-mgmt/grs |
| Plain Language | https://www.plainlanguage.gov |
| USWDS | https://designsystem.digital.gov |
| Section 508 | https://www.section508.gov |
| ICT Testing Baseline | https://ictbaseline.access-board.gov |
| VPAT Template | https://www.itic.org/policy/accessibility/vpat |
| US Access Board | https://www.access-board.gov |
| DoD CUI Registry | https://www.archives.gov/cui |
| SPRS | https://www.sprs.csd.disa.mil |
| eMASS | https://disa.mil/~/media/Files/DISA/Fact-Sheets/eMASS-Fact-Sheet.pdf |
| DoD Cloud Computing SRG | https://public.cyber.mil/dccs/ |
| ITAR/DDTC | https://www.pmddtc.state.gov |
| BIS/EAR | https://www.bis.doc.gov |
| Cyber AB (CMMC) | https://cyberab.org |

---

*End of Report. This document should be reviewed and updated quarterly as standards evolve. Last comprehensive review: February 14, 2026.*
