/**
 * NIST SP 800-53 Rev 5 — Complete Base Control Catalog Generator
 *
 * Generates the full catalog of ~320 base controls across all 20 families.
 * Run with: node scripts/generate-nist-800-53.js
 *
 * Reference: https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final
 * Standard: NIST SP 800-53 Revision 5 (September 2020, updated December 2024)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * All 20 NIST 800-53 Rev 5 Control Families with their base controls.
 * Each control has: id, name, description, baseline(s), category
 *
 * Baselines: L = Low, M = Moderate, H = High, — = not in any baseline
 */
const families = [
  {
    id: 'access-control',
    name: 'Access Control (AC)',
    description:
      'Policy and procedures for limiting system access to authorized users, processes, and devices.',
    controls: [
      { id: 'AC-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'AC-2', name: 'Account Management', baselines: 'LMH', cat: 'Account Management' },
      { id: 'AC-3', name: 'Access Enforcement', baselines: 'LMH', cat: 'Access Enforcement' },
      { id: 'AC-4', name: 'Information Flow Enforcement', baselines: 'MH', cat: 'Flow Control' },
      { id: 'AC-5', name: 'Separation of Duties', baselines: 'MH', cat: 'Separation of Duties' },
      { id: 'AC-6', name: 'Least Privilege', baselines: 'MH', cat: 'Least Privilege' },
      { id: 'AC-7', name: 'Unsuccessful Logon Attempts', baselines: 'LMH', cat: 'Authentication' },
      { id: 'AC-8', name: 'System Use Notification', baselines: 'LMH', cat: 'Notification' },
      { id: 'AC-9', name: 'Previous Logon Notification', baselines: '—', cat: 'Notification' },
      { id: 'AC-10', name: 'Concurrent Session Control', baselines: 'H', cat: 'Session' },
      { id: 'AC-11', name: 'Device Lock', baselines: 'MH', cat: 'Device Lock' },
      { id: 'AC-12', name: 'Session Termination', baselines: 'MH', cat: 'Session' },
      {
        id: 'AC-13',
        name: 'Supervision and Review — Access Control',
        baselines: '—',
        cat: 'Withdrawn',
      },
      {
        id: 'AC-14',
        name: 'Permitted Actions without Identification or Authentication',
        baselines: 'LMH',
        cat: 'Authentication',
      },
      { id: 'AC-15', name: 'Automated Marking', baselines: '—', cat: 'Withdrawn' },
      { id: 'AC-16', name: 'Security and Privacy Attributes', baselines: '—', cat: 'Attributes' },
      { id: 'AC-17', name: 'Remote Access', baselines: 'LMH', cat: 'Remote Access' },
      { id: 'AC-18', name: 'Wireless Access', baselines: 'LMH', cat: 'Wireless' },
      { id: 'AC-19', name: 'Access Control for Mobile Devices', baselines: 'LMH', cat: 'Mobile' },
      { id: 'AC-20', name: 'Use of External Systems', baselines: 'LMH', cat: 'External Systems' },
      { id: 'AC-21', name: 'Information Sharing', baselines: 'MH', cat: 'Information Sharing' },
      { id: 'AC-22', name: 'Publicly Accessible Content', baselines: 'LMH', cat: 'Public Content' },
      { id: 'AC-23', name: 'Data Mining Protection', baselines: '—', cat: 'Data Mining' },
      { id: 'AC-24', name: 'Access Control Decisions', baselines: '—', cat: 'Access Control' },
      { id: 'AC-25', name: 'Reference Monitor', baselines: '—', cat: 'Reference Monitor' },
    ],
  },
  {
    id: 'awareness-training',
    name: 'Awareness and Training (AT)',
    description: 'Ensure personnel are aware of security risks and adequately trained.',
    controls: [
      { id: 'AT-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'AT-2', name: 'Literacy Training and Awareness', baselines: 'LMH', cat: 'Awareness' },
      { id: 'AT-3', name: 'Role-Based Training', baselines: 'LMH', cat: 'Training' },
      { id: 'AT-4', name: 'Training Records', baselines: 'LMH', cat: 'Records' },
      {
        id: 'AT-5',
        name: 'Contacts with Security Groups and Associations',
        baselines: '—',
        cat: 'Withdrawn',
      },
      { id: 'AT-6', name: 'Training Feedback', baselines: '—', cat: 'Feedback' },
    ],
  },
  {
    id: 'audit-accountability',
    name: 'Audit and Accountability (AU)',
    description: 'Create, protect, and retain audit records for monitoring and investigation.',
    controls: [
      { id: 'AU-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'AU-2', name: 'Event Logging', baselines: 'LMH', cat: 'Logging' },
      { id: 'AU-3', name: 'Content of Audit Records', baselines: 'LMH', cat: 'Logging' },
      { id: 'AU-4', name: 'Audit Log Storage Capacity', baselines: 'LMH', cat: 'Storage' },
      {
        id: 'AU-5',
        name: 'Response to Audit Logging Process Failures',
        baselines: 'LMH',
        cat: 'Failure Response',
      },
      {
        id: 'AU-6',
        name: 'Audit Record Review, Analysis, and Reporting',
        baselines: 'LMH',
        cat: 'Review',
      },
      {
        id: 'AU-7',
        name: 'Audit Record Reduction and Report Generation',
        baselines: 'MH',
        cat: 'Analysis',
      },
      { id: 'AU-8', name: 'Time Stamps', baselines: 'LMH', cat: 'Timestamps' },
      { id: 'AU-9', name: 'Protection of Audit Information', baselines: 'LMH', cat: 'Protection' },
      { id: 'AU-10', name: 'Non-repudiation', baselines: 'H', cat: 'Non-repudiation' },
      { id: 'AU-11', name: 'Audit Record Retention', baselines: 'LMH', cat: 'Retention' },
      { id: 'AU-12', name: 'Audit Record Generation', baselines: 'LMH', cat: 'Generation' },
      {
        id: 'AU-13',
        name: 'Monitoring for Information Disclosure',
        baselines: '—',
        cat: 'Monitoring',
      },
      { id: 'AU-14', name: 'Session Audit', baselines: '—', cat: 'Session Audit' },
      { id: 'AU-15', name: 'Alternate Audit Logging Capability', baselines: '—', cat: 'Withdrawn' },
      { id: 'AU-16', name: 'Cross-Organizational Audit Logging', baselines: '—', cat: 'Cross-Org' },
    ],
  },
  {
    id: 'assessment-authorization-monitoring',
    name: 'Assessment, Authorization, and Monitoring (CA)',
    description:
      'Periodically assess controls, authorize systems, and monitor on an ongoing basis.',
    controls: [
      { id: 'CA-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'CA-2', name: 'Control Assessments', baselines: 'LMH', cat: 'Assessment' },
      { id: 'CA-3', name: 'Information Exchange', baselines: 'LMH', cat: 'Interconnection' },
      { id: 'CA-4', name: 'Security Certification', baselines: '—', cat: 'Withdrawn' },
      { id: 'CA-5', name: 'Plan of Action and Milestones', baselines: 'LMH', cat: 'POA&M' },
      { id: 'CA-6', name: 'Authorization', baselines: 'LMH', cat: 'Authorization' },
      { id: 'CA-7', name: 'Continuous Monitoring', baselines: 'LMH', cat: 'Monitoring' },
      { id: 'CA-8', name: 'Penetration Testing', baselines: 'H', cat: 'Testing' },
      { id: 'CA-9', name: 'Internal System Connections', baselines: 'LMH', cat: 'Connections' },
    ],
  },
  {
    id: 'configuration-management',
    name: 'Configuration Management (CM)',
    description: 'Establish and maintain baseline configurations and inventories.',
    controls: [
      { id: 'CM-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'CM-2', name: 'Baseline Configuration', baselines: 'LMH', cat: 'Baseline' },
      { id: 'CM-3', name: 'Configuration Change Control', baselines: 'MH', cat: 'Change Control' },
      { id: 'CM-4', name: 'Impact Analyses', baselines: 'LMH', cat: 'Impact Analysis' },
      {
        id: 'CM-5',
        name: 'Access Restrictions for Change',
        baselines: 'MH',
        cat: 'Access Control',
      },
      { id: 'CM-6', name: 'Configuration Settings', baselines: 'LMH', cat: 'Settings' },
      { id: 'CM-7', name: 'Least Functionality', baselines: 'LMH', cat: 'Functionality' },
      { id: 'CM-8', name: 'System Component Inventory', baselines: 'LMH', cat: 'Inventory' },
      { id: 'CM-9', name: 'Configuration Management Plan', baselines: 'MH', cat: 'Planning' },
      { id: 'CM-10', name: 'Software Usage Restrictions', baselines: 'LMH', cat: 'Software' },
      { id: 'CM-11', name: 'User-Installed Software', baselines: 'LMH', cat: 'Software' },
      { id: 'CM-12', name: 'Information Location', baselines: 'MH', cat: 'Data Location' },
      { id: 'CM-13', name: 'Data Action Mapping', baselines: '—', cat: 'Data Mapping' },
      { id: 'CM-14', name: 'Signed Components', baselines: '—', cat: 'Integrity' },
    ],
  },
  {
    id: 'contingency-planning',
    name: 'Contingency Planning (CP)',
    description:
      'Establish plans for emergency response, backup operations, and post-disaster recovery.',
    controls: [
      { id: 'CP-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'CP-2', name: 'Contingency Plan', baselines: 'LMH', cat: 'Planning' },
      { id: 'CP-3', name: 'Contingency Training', baselines: 'LMH', cat: 'Training' },
      { id: 'CP-4', name: 'Contingency Plan Testing', baselines: 'LMH', cat: 'Testing' },
      { id: 'CP-5', name: 'Contingency Plan Update', baselines: '—', cat: 'Withdrawn' },
      { id: 'CP-6', name: 'Alternate Storage Site', baselines: 'MH', cat: 'Storage' },
      { id: 'CP-7', name: 'Alternate Processing Site', baselines: 'MH', cat: 'Processing' },
      { id: 'CP-8', name: 'Telecommunications Services', baselines: 'MH', cat: 'Telecom' },
      { id: 'CP-9', name: 'System Backup', baselines: 'LMH', cat: 'Backup' },
      {
        id: 'CP-10',
        name: 'System Recovery and Reconstitution',
        baselines: 'LMH',
        cat: 'Recovery',
      },
      {
        id: 'CP-11',
        name: 'Alternate Communications Protocols',
        baselines: '—',
        cat: 'Communications',
      },
      { id: 'CP-12', name: 'Safe Mode', baselines: '—', cat: 'Safe Mode' },
      { id: 'CP-13', name: 'Alternative Security Mechanisms', baselines: '—', cat: 'Alternatives' },
    ],
  },
  {
    id: 'identification-authentication',
    name: 'Identification and Authentication (IA)',
    description: 'Identify and authenticate users, processes, and devices before granting access.',
    controls: [
      { id: 'IA-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      {
        id: 'IA-2',
        name: 'Identification and Authentication (Organizational Users)',
        baselines: 'LMH',
        cat: 'Authentication',
      },
      {
        id: 'IA-3',
        name: 'Device Identification and Authentication',
        baselines: 'MH',
        cat: 'Device Auth',
      },
      { id: 'IA-4', name: 'Identifier Management', baselines: 'LMH', cat: 'Identifiers' },
      { id: 'IA-5', name: 'Authenticator Management', baselines: 'LMH', cat: 'Authenticators' },
      { id: 'IA-6', name: 'Authentication Feedback', baselines: 'LMH', cat: 'Feedback' },
      {
        id: 'IA-7',
        name: 'Cryptographic Module Authentication',
        baselines: 'LMH',
        cat: 'Cryptography',
      },
      {
        id: 'IA-8',
        name: 'Identification and Authentication (Non-Organizational Users)',
        baselines: 'LMH',
        cat: 'External Auth',
      },
      {
        id: 'IA-9',
        name: 'Service Identification and Authentication',
        baselines: '—',
        cat: 'Service Auth',
      },
      { id: 'IA-10', name: 'Adaptive Authentication', baselines: '—', cat: 'Adaptive Auth' },
      { id: 'IA-11', name: 'Re-authentication', baselines: 'LMH', cat: 'Re-auth' },
      { id: 'IA-12', name: 'Identity Proofing', baselines: 'MH', cat: 'Identity Proofing' },
    ],
  },
  {
    id: 'incident-response',
    name: 'Incident Response (IR)',
    description:
      'Establish operational incident handling capability for detecting, analyzing, and responding to incidents.',
    controls: [
      { id: 'IR-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'IR-2', name: 'Incident Response Training', baselines: 'LMH', cat: 'Training' },
      { id: 'IR-3', name: 'Incident Response Testing', baselines: 'MH', cat: 'Testing' },
      { id: 'IR-4', name: 'Incident Handling', baselines: 'LMH', cat: 'Handling' },
      { id: 'IR-5', name: 'Incident Monitoring', baselines: 'LMH', cat: 'Monitoring' },
      { id: 'IR-6', name: 'Incident Reporting', baselines: 'LMH', cat: 'Reporting' },
      { id: 'IR-7', name: 'Incident Response Assistance', baselines: 'LMH', cat: 'Assistance' },
      { id: 'IR-8', name: 'Incident Response Plan', baselines: 'LMH', cat: 'Planning' },
      { id: 'IR-9', name: 'Information Spillage Response', baselines: '—', cat: 'Spillage' },
      {
        id: 'IR-10',
        name: 'Integrated Information Security Analysis Team',
        baselines: '—',
        cat: 'Withdrawn',
      },
    ],
  },
  {
    id: 'maintenance',
    name: 'Maintenance (MA)',
    description:
      'Perform timely maintenance on systems and provide controls for maintenance tools and personnel.',
    controls: [
      { id: 'MA-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'MA-2', name: 'Controlled Maintenance', baselines: 'LMH', cat: 'Maintenance' },
      { id: 'MA-3', name: 'Maintenance Tools', baselines: 'MH', cat: 'Tools' },
      { id: 'MA-4', name: 'Nonlocal Maintenance', baselines: 'LMH', cat: 'Remote Maintenance' },
      { id: 'MA-5', name: 'Maintenance Personnel', baselines: 'LMH', cat: 'Personnel' },
      { id: 'MA-6', name: 'Timely Maintenance', baselines: 'MH', cat: 'Timeliness' },
      { id: 'MA-7', name: 'Field Maintenance', baselines: '—', cat: 'Field Maintenance' },
    ],
  },
  {
    id: 'media-protection',
    name: 'Media Protection (MP)',
    description: 'Protect information system media, both paper and digital.',
    controls: [
      { id: 'MP-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'MP-2', name: 'Media Access', baselines: 'LMH', cat: 'Access' },
      { id: 'MP-3', name: 'Media Marking', baselines: 'MH', cat: 'Marking' },
      { id: 'MP-4', name: 'Media Storage', baselines: 'MH', cat: 'Storage' },
      { id: 'MP-5', name: 'Media Transport', baselines: 'MH', cat: 'Transport' },
      { id: 'MP-6', name: 'Media Sanitization', baselines: 'LMH', cat: 'Sanitization' },
      { id: 'MP-7', name: 'Media Use', baselines: 'LMH', cat: 'Use Restrictions' },
      { id: 'MP-8', name: 'Media Downgrading', baselines: '—', cat: 'Downgrading' },
    ],
  },
  {
    id: 'physical-environmental',
    name: 'Physical and Environmental Protection (PE)',
    description:
      'Limit physical access to systems and protect the physical plant and support infrastructure.',
    controls: [
      { id: 'PE-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      {
        id: 'PE-2',
        name: 'Physical Access Authorizations',
        baselines: 'LMH',
        cat: 'Authorization',
      },
      { id: 'PE-3', name: 'Physical Access Control', baselines: 'LMH', cat: 'Access Control' },
      { id: 'PE-4', name: 'Access Control for Transmission', baselines: 'MH', cat: 'Transmission' },
      {
        id: 'PE-5',
        name: 'Access Control for Output Devices',
        baselines: 'MH',
        cat: 'Output Devices',
      },
      { id: 'PE-6', name: 'Monitoring Physical Access', baselines: 'LMH', cat: 'Monitoring' },
      { id: 'PE-7', name: 'Visitor Control', baselines: '—', cat: 'Withdrawn' },
      { id: 'PE-8', name: 'Visitor Access Records', baselines: 'LMH', cat: 'Visitor Records' },
      { id: 'PE-9', name: 'Power Equipment and Cabling', baselines: 'MH', cat: 'Power' },
      { id: 'PE-10', name: 'Emergency Shutoff', baselines: 'MH', cat: 'Emergency' },
      { id: 'PE-11', name: 'Emergency Power', baselines: 'MH', cat: 'Emergency Power' },
      { id: 'PE-12', name: 'Emergency Lighting', baselines: 'LMH', cat: 'Lighting' },
      { id: 'PE-13', name: 'Fire Protection', baselines: 'LMH', cat: 'Fire' },
      { id: 'PE-14', name: 'Environmental Controls', baselines: 'LMH', cat: 'Environmental' },
      { id: 'PE-15', name: 'Water Damage Protection', baselines: 'LMH', cat: 'Water Protection' },
      { id: 'PE-16', name: 'Delivery and Removal', baselines: 'LMH', cat: 'Delivery' },
      { id: 'PE-17', name: 'Alternate Work Site', baselines: 'MH', cat: 'Alternate Site' },
      { id: 'PE-18', name: 'Location of System Components', baselines: '—', cat: 'Location' },
      { id: 'PE-19', name: 'Information Leakage', baselines: '—', cat: 'Leakage' },
      { id: 'PE-20', name: 'Asset Monitoring and Tracking', baselines: '—', cat: 'Monitoring' },
      { id: 'PE-21', name: 'Electromagnetic Pulse Protection', baselines: '—', cat: 'EMP' },
      { id: 'PE-22', name: 'Component Marking', baselines: '—', cat: 'Marking' },
      { id: 'PE-23', name: 'Facility Location', baselines: '—', cat: 'Location' },
    ],
  },
  {
    id: 'planning',
    name: 'Planning (PL)',
    description:
      'Develop, document, periodically update, and implement security and privacy plans.',
    controls: [
      { id: 'PL-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'PL-2', name: 'System Security and Privacy Plans', baselines: 'LMH', cat: 'Planning' },
      { id: 'PL-3', name: 'Rules of Behavior Update', baselines: '—', cat: 'Withdrawn' },
      { id: 'PL-4', name: 'Rules of Behavior', baselines: 'LMH', cat: 'Rules of Behavior' },
      { id: 'PL-5', name: 'Privacy Impact Assessment', baselines: '—', cat: 'Withdrawn' },
      { id: 'PL-6', name: 'Security-Related Activity Planning', baselines: '—', cat: 'Withdrawn' },
      { id: 'PL-7', name: 'Concept of Operations', baselines: '—', cat: 'CONOPS' },
      {
        id: 'PL-8',
        name: 'Security and Privacy Architectures',
        baselines: 'MH',
        cat: 'Architecture',
      },
      { id: 'PL-9', name: 'Central Management', baselines: '—', cat: 'Central Management' },
      { id: 'PL-10', name: 'Baseline Selection', baselines: 'LMH', cat: 'Baselines' },
      { id: 'PL-11', name: 'Baseline Tailoring', baselines: 'LMH', cat: 'Tailoring' },
    ],
  },
  {
    id: 'program-management',
    name: 'Program Management (PM)',
    description:
      'Organization-level controls for managing information security and privacy programs.',
    controls: [
      {
        id: 'PM-1',
        name: 'Information Security Program Plan',
        baselines: '—',
        cat: 'Program Plan',
      },
      {
        id: 'PM-2',
        name: 'Information Security Program Leadership Role',
        baselines: '—',
        cat: 'Leadership',
      },
      {
        id: 'PM-3',
        name: 'Information Security and Privacy Resources',
        baselines: '—',
        cat: 'Resources',
      },
      { id: 'PM-4', name: 'Plan of Action and Milestones Process', baselines: '—', cat: 'POA&M' },
      { id: 'PM-5', name: 'System Inventory', baselines: '—', cat: 'Inventory' },
      { id: 'PM-6', name: 'Measures of Performance', baselines: '—', cat: 'Metrics' },
      { id: 'PM-7', name: 'Enterprise Architecture', baselines: '—', cat: 'Architecture' },
      { id: 'PM-8', name: 'Critical Infrastructure Plan', baselines: '—', cat: 'Critical Infra' },
      { id: 'PM-9', name: 'Risk Management Strategy', baselines: '—', cat: 'Risk Management' },
      { id: 'PM-10', name: 'Authorization Process', baselines: '—', cat: 'Authorization' },
      {
        id: 'PM-11',
        name: 'Mission and Business Process Definition',
        baselines: '—',
        cat: 'Mission',
      },
      { id: 'PM-12', name: 'Insider Threat Program', baselines: '—', cat: 'Insider Threat' },
      { id: 'PM-13', name: 'Security and Privacy Workforce', baselines: '—', cat: 'Workforce' },
      { id: 'PM-14', name: 'Testing, Training, and Monitoring', baselines: '—', cat: 'TTM' },
      {
        id: 'PM-15',
        name: 'Security and Privacy Groups and Associations',
        baselines: '—',
        cat: 'Groups',
      },
      { id: 'PM-16', name: 'Threat Awareness Program', baselines: '—', cat: 'Threat Awareness' },
      {
        id: 'PM-17',
        name: 'Protecting Controlled Unclassified Information on External Systems',
        baselines: '—',
        cat: 'CUI',
      },
      { id: 'PM-18', name: 'Privacy Program Plan', baselines: '—', cat: 'Privacy' },
      { id: 'PM-19', name: 'Privacy Program Leadership Role', baselines: '—', cat: 'Privacy' },
      {
        id: 'PM-20',
        name: 'Dissemination of Privacy Program Information',
        baselines: '—',
        cat: 'Privacy',
      },
      { id: 'PM-21', name: 'Accounting of Disclosures', baselines: '—', cat: 'Privacy' },
      {
        id: 'PM-22',
        name: 'Personally Identifiable Information Quality Management',
        baselines: '—',
        cat: 'PII',
      },
      { id: 'PM-23', name: 'Data Governance Body', baselines: '—', cat: 'Governance' },
      { id: 'PM-24', name: 'Data Integrity Board', baselines: '—', cat: 'Data Integrity' },
      {
        id: 'PM-25',
        name: 'Minimization of Personally Identifiable Information Used in Testing, Training, and Research',
        baselines: '—',
        cat: 'PII Minimization',
      },
      { id: 'PM-26', name: 'Complaint Management', baselines: '—', cat: 'Complaints' },
      { id: 'PM-27', name: 'Privacy Reporting', baselines: '—', cat: 'Privacy Reporting' },
      { id: 'PM-28', name: 'Risk Framing', baselines: '—', cat: 'Risk Framing' },
      {
        id: 'PM-29',
        name: 'Risk Management Program Leadership Roles',
        baselines: '—',
        cat: 'Leadership',
      },
      {
        id: 'PM-30',
        name: 'Supply Chain Risk Management Strategy',
        baselines: '—',
        cat: 'Supply Chain',
      },
      { id: 'PM-31', name: 'Continuous Monitoring Strategy', baselines: '—', cat: 'ConMon' },
      { id: 'PM-32', name: 'Purposing', baselines: '—', cat: 'Purposing' },
    ],
  },
  {
    id: 'personnel-security',
    name: 'Personnel Security (PS)',
    description:
      'Ensure that individuals occupying positions of responsibility are trustworthy and meet security criteria.',
    controls: [
      { id: 'PS-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'PS-2', name: 'Position Risk Designation', baselines: 'LMH', cat: 'Risk Designation' },
      { id: 'PS-3', name: 'Personnel Screening', baselines: 'LMH', cat: 'Screening' },
      { id: 'PS-4', name: 'Personnel Termination', baselines: 'LMH', cat: 'Termination' },
      { id: 'PS-5', name: 'Personnel Transfer', baselines: 'LMH', cat: 'Transfer' },
      { id: 'PS-6', name: 'Access Agreements', baselines: 'LMH', cat: 'Agreements' },
      { id: 'PS-7', name: 'External Personnel Security', baselines: 'LMH', cat: 'External' },
      { id: 'PS-8', name: 'Personnel Sanctions', baselines: 'LMH', cat: 'Sanctions' },
      { id: 'PS-9', name: 'Position Descriptions', baselines: '—', cat: 'Positions' },
    ],
  },
  {
    id: 'personally-identifiable-information',
    name: 'Personally Identifiable Information Processing and Transparency (PT)',
    description: 'Apply privacy principles to PII processing and provide transparency.',
    controls: [
      { id: 'PT-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      {
        id: 'PT-2',
        name: 'Authority to Process Personally Identifiable Information',
        baselines: 'LMH',
        cat: 'Authority',
      },
      {
        id: 'PT-3',
        name: 'Personally Identifiable Information Processing Purposes',
        baselines: 'LMH',
        cat: 'Purpose',
      },
      { id: 'PT-4', name: 'Consent', baselines: 'LMH', cat: 'Consent' },
      { id: 'PT-5', name: 'Privacy Notice', baselines: 'LMH', cat: 'Notice' },
      { id: 'PT-6', name: 'System of Records Notice', baselines: 'LMH', cat: 'SORN' },
      {
        id: 'PT-7',
        name: 'Specific Categories of Personally Identifiable Information',
        baselines: 'LMH',
        cat: 'Categories',
      },
      { id: 'PT-8', name: 'Computer Matching Requirements', baselines: '—', cat: 'Matching' },
    ],
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment (RA)',
    description:
      'Assess risk to organizational operations, assets, individuals, and other organizations.',
    controls: [
      { id: 'RA-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'RA-2', name: 'Security Categorization', baselines: 'LMH', cat: 'Categorization' },
      { id: 'RA-3', name: 'Risk Assessment', baselines: 'LMH', cat: 'Assessment' },
      { id: 'RA-4', name: 'Risk Assessment Update', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'RA-5',
        name: 'Vulnerability Monitoring and Scanning',
        baselines: 'LMH',
        cat: 'Vulnerability Scanning',
      },
      {
        id: 'RA-6',
        name: 'Technical Surveillance Countermeasures Survey',
        baselines: '—',
        cat: 'TSCM',
      },
      { id: 'RA-7', name: 'Risk Response', baselines: 'LMH', cat: 'Response' },
      { id: 'RA-8', name: 'Privacy Impact Assessments', baselines: '—', cat: 'PIA' },
      { id: 'RA-9', name: 'Criticality Analysis', baselines: 'H', cat: 'Criticality' },
      { id: 'RA-10', name: 'Threat Hunting', baselines: '—', cat: 'Threat Hunting' },
    ],
  },
  {
    id: 'system-services-acquisition',
    name: 'System and Services Acquisition (SA)',
    description:
      'Allocate resources, employ development lifecycle, and manage supply chain for system security.',
    controls: [
      { id: 'SA-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'SA-2', name: 'Allocation of Resources', baselines: 'LMH', cat: 'Resources' },
      { id: 'SA-3', name: 'System Development Life Cycle', baselines: 'LMH', cat: 'SDLC' },
      { id: 'SA-4', name: 'Acquisition Process', baselines: 'LMH', cat: 'Acquisition' },
      { id: 'SA-5', name: 'System Documentation', baselines: 'LMH', cat: 'Documentation' },
      { id: 'SA-6', name: 'Software Usage Restrictions', baselines: '—', cat: 'Withdrawn' },
      { id: 'SA-7', name: 'User-Installed Software', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'SA-8',
        name: 'Security and Privacy Engineering Principles',
        baselines: 'LMH',
        cat: 'Engineering',
      },
      { id: 'SA-9', name: 'External System Services', baselines: 'LMH', cat: 'External Services' },
      { id: 'SA-10', name: 'Developer Configuration Management', baselines: 'MH', cat: 'Dev CM' },
      {
        id: 'SA-11',
        name: 'Developer Testing and Evaluation',
        baselines: 'MH',
        cat: 'Dev Testing',
      },
      { id: 'SA-12', name: 'Supply Chain Protection', baselines: '—', cat: 'Withdrawn' },
      { id: 'SA-13', name: 'Trustworthiness', baselines: '—', cat: 'Withdrawn' },
      { id: 'SA-14', name: 'Criticality Analysis', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'SA-15',
        name: 'Development Process, Standards, and Tools',
        baselines: 'H',
        cat: 'Dev Process',
      },
      { id: 'SA-16', name: 'Developer-Provided Training', baselines: '—', cat: 'Training' },
      {
        id: 'SA-17',
        name: 'Developer Security and Privacy Architecture and Design',
        baselines: 'H',
        cat: 'Architecture',
      },
      { id: 'SA-18', name: 'Tamper Resistance and Detection', baselines: '—', cat: 'Withdrawn' },
      { id: 'SA-19', name: 'Component Authenticity', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'SA-20',
        name: 'Customized Development of Critical Components',
        baselines: '—',
        cat: 'Custom Dev',
      },
      { id: 'SA-21', name: 'Developer Screening', baselines: 'H', cat: 'Screening' },
      { id: 'SA-22', name: 'Unsupported System Components', baselines: 'LMH', cat: 'Unsupported' },
      { id: 'SA-23', name: 'Specialization', baselines: '—', cat: 'Specialization' },
    ],
  },
  {
    id: 'system-communications-protection',
    name: 'System and Communications Protection (SC)',
    description: 'Monitor, control, and protect communications at system boundaries.',
    controls: [
      { id: 'SC-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      {
        id: 'SC-2',
        name: 'Separation of System and User Functionality',
        baselines: 'MH',
        cat: 'Separation',
      },
      { id: 'SC-3', name: 'Security Function Isolation', baselines: 'H', cat: 'Isolation' },
      {
        id: 'SC-4',
        name: 'Information in Shared System Resources',
        baselines: 'MH',
        cat: 'Shared Resources',
      },
      { id: 'SC-5', name: 'Denial-of-Service Protection', baselines: 'LMH', cat: 'DoS Protection' },
      { id: 'SC-6', name: 'Resource Availability', baselines: '—', cat: 'Availability' },
      { id: 'SC-7', name: 'Boundary Protection', baselines: 'LMH', cat: 'Boundary' },
      {
        id: 'SC-8',
        name: 'Transmission Confidentiality and Integrity',
        baselines: 'MH',
        cat: 'Transmission',
      },
      { id: 'SC-9', name: 'Transmission Confidentiality', baselines: '—', cat: 'Withdrawn' },
      { id: 'SC-10', name: 'Network Disconnect', baselines: 'MH', cat: 'Disconnect' },
      { id: 'SC-11', name: 'Trusted Path', baselines: '—', cat: 'Trusted Path' },
      {
        id: 'SC-12',
        name: 'Cryptographic Key Establishment and Management',
        baselines: 'LMH',
        cat: 'Key Management',
      },
      { id: 'SC-13', name: 'Cryptographic Protection', baselines: 'LMH', cat: 'Cryptography' },
      { id: 'SC-14', name: 'Public Access Protections', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'SC-15',
        name: 'Collaborative Computing Devices and Applications',
        baselines: 'LMH',
        cat: 'Collaboration',
      },
      {
        id: 'SC-16',
        name: 'Transmission of Security and Privacy Attributes',
        baselines: '—',
        cat: 'Attributes',
      },
      { id: 'SC-17', name: 'Public Key Infrastructure Certificates', baselines: 'MH', cat: 'PKI' },
      { id: 'SC-18', name: 'Mobile Code', baselines: 'MH', cat: 'Mobile Code' },
      { id: 'SC-19', name: 'Voice over Internet Protocol', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'SC-20',
        name: 'Secure Name/Address Resolution Service (Authoritative Source)',
        baselines: 'LMH',
        cat: 'DNS',
      },
      {
        id: 'SC-21',
        name: 'Secure Name/Address Resolution Service (Recursive or Caching Resolver)',
        baselines: 'LMH',
        cat: 'DNS',
      },
      {
        id: 'SC-22',
        name: 'Architecture and Provisioning for Name/Address Resolution Service',
        baselines: 'LMH',
        cat: 'DNS',
      },
      { id: 'SC-23', name: 'Session Authenticity', baselines: 'MH', cat: 'Session' },
      { id: 'SC-24', name: 'Fail in Known State', baselines: 'H', cat: 'Fail Safe' },
      { id: 'SC-25', name: 'Thin Nodes', baselines: '—', cat: 'Thin Nodes' },
      { id: 'SC-26', name: 'Honeypots', baselines: '—', cat: 'Honeypots' },
      {
        id: 'SC-27',
        name: 'Platform-Independent Applications',
        baselines: '—',
        cat: 'Platform Independence',
      },
      {
        id: 'SC-28',
        name: 'Protection of Information at Rest',
        baselines: 'MH',
        cat: 'Data at Rest',
      },
      { id: 'SC-29', name: 'Heterogeneity', baselines: '—', cat: 'Diversity' },
      { id: 'SC-30', name: 'Concealment and Misdirection', baselines: '—', cat: 'Concealment' },
      { id: 'SC-31', name: 'Covert Channel Analysis', baselines: '—', cat: 'Covert Channels' },
      { id: 'SC-32', name: 'System Partitioning', baselines: '—', cat: 'Partitioning' },
      { id: 'SC-33', name: 'Transmission Preparation Integrity', baselines: '—', cat: 'Withdrawn' },
      { id: 'SC-34', name: 'Non-Modifiable Executable Programs', baselines: '—', cat: 'Integrity' },
      {
        id: 'SC-35',
        name: 'External Malicious Code Identification',
        baselines: '—',
        cat: 'Honeyclients',
      },
      {
        id: 'SC-36',
        name: 'Distributed Processing and Storage',
        baselines: '—',
        cat: 'Distributed',
      },
      { id: 'SC-37', name: 'Out-of-Band Channels', baselines: '—', cat: 'OOB' },
      { id: 'SC-38', name: 'Operations Security', baselines: '—', cat: 'OPSEC' },
      { id: 'SC-39', name: 'Process Isolation', baselines: 'LMH', cat: 'Isolation' },
      { id: 'SC-40', name: 'Wireless Link Protection', baselines: '—', cat: 'Wireless' },
      { id: 'SC-41', name: 'Port and I/O Device Access', baselines: '—', cat: 'Port Access' },
      { id: 'SC-42', name: 'Sensor Capability and Data', baselines: '—', cat: 'Sensors' },
      { id: 'SC-43', name: 'Usage Restrictions', baselines: '—', cat: 'Usage' },
      { id: 'SC-44', name: 'Detonation Chambers', baselines: '—', cat: 'Sandboxing' },
      { id: 'SC-45', name: 'System Time Synchronization', baselines: '—', cat: 'Time Sync' },
      { id: 'SC-46', name: 'Cross Domain Policy Enforcement', baselines: '—', cat: 'Cross Domain' },
      {
        id: 'SC-47',
        name: 'Alternate Communications Paths',
        baselines: '—',
        cat: 'Alternate Paths',
      },
      { id: 'SC-48', name: 'Sensor Relocation', baselines: '—', cat: 'Sensor Relocation' },
      {
        id: 'SC-49',
        name: 'Hardware-Enforced Separation and Policy Enforcement',
        baselines: '—',
        cat: 'Hardware Security',
      },
      {
        id: 'SC-50',
        name: 'Software-Enforced Separation and Policy Enforcement',
        baselines: '—',
        cat: 'Software Security',
      },
      {
        id: 'SC-51',
        name: 'Hardware-Based Protection',
        baselines: '—',
        cat: 'Hardware Protection',
      },
    ],
  },
  {
    id: 'system-information-integrity',
    name: 'System and Information Integrity (SI)',
    description: 'Identify, report, and correct system flaws in a timely manner.',
    controls: [
      { id: 'SI-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'SI-2', name: 'Flaw Remediation', baselines: 'LMH', cat: 'Patching' },
      { id: 'SI-3', name: 'Malicious Code Protection', baselines: 'LMH', cat: 'Antimalware' },
      { id: 'SI-4', name: 'System Monitoring', baselines: 'LMH', cat: 'Monitoring' },
      {
        id: 'SI-5',
        name: 'Security Alerts, Advisories, and Directives',
        baselines: 'LMH',
        cat: 'Alerts',
      },
      {
        id: 'SI-6',
        name: 'Security and Privacy Function Verification',
        baselines: 'H',
        cat: 'Verification',
      },
      {
        id: 'SI-7',
        name: 'Software, Firmware, and Information Integrity',
        baselines: 'MH',
        cat: 'Integrity',
      },
      { id: 'SI-8', name: 'Spam Protection', baselines: 'MH', cat: 'Spam' },
      { id: 'SI-9', name: 'Information Input Restrictions', baselines: '—', cat: 'Withdrawn' },
      {
        id: 'SI-10',
        name: 'Information Input Validation',
        baselines: 'MH',
        cat: 'Input Validation',
      },
      { id: 'SI-11', name: 'Error Handling', baselines: 'MH', cat: 'Error Handling' },
      {
        id: 'SI-12',
        name: 'Information Management and Retention',
        baselines: 'LMH',
        cat: 'Retention',
      },
      {
        id: 'SI-13',
        name: 'Predictable Failure Prevention',
        baselines: '—',
        cat: 'Failure Prevention',
      },
      { id: 'SI-14', name: 'Non-Persistence', baselines: '—', cat: 'Non-Persistence' },
      {
        id: 'SI-15',
        name: 'Information Output Filtering',
        baselines: '—',
        cat: 'Output Filtering',
      },
      { id: 'SI-16', name: 'Memory Protection', baselines: 'MH', cat: 'Memory Protection' },
      { id: 'SI-17', name: 'Fail-Safe Procedures', baselines: '—', cat: 'Fail-Safe' },
      {
        id: 'SI-18',
        name: 'Personally Identifiable Information Quality Operations',
        baselines: '—',
        cat: 'PII Quality',
      },
      { id: 'SI-19', name: 'De-identification', baselines: '—', cat: 'De-identification' },
      { id: 'SI-20', name: 'Tainting', baselines: '—', cat: 'Tainting' },
      { id: 'SI-21', name: 'Information Refresh', baselines: '—', cat: 'Refresh' },
      { id: 'SI-22', name: 'Information Diversity', baselines: '—', cat: 'Diversity' },
      { id: 'SI-23', name: 'Information Fragmentation', baselines: '—', cat: 'Fragmentation' },
    ],
  },
  {
    id: 'supply-chain-risk-management',
    name: 'Supply Chain Risk Management (SR)',
    description: 'Manage supply chain risks to federal information systems and organizations.',
    controls: [
      { id: 'SR-1', name: 'Policy and Procedures', baselines: 'LMH', cat: 'Policy' },
      { id: 'SR-2', name: 'Supply Chain Risk Management Plan', baselines: 'LMH', cat: 'Planning' },
      {
        id: 'SR-3',
        name: 'Supply Chain Controls and Processes',
        baselines: 'LMH',
        cat: 'Controls',
      },
      { id: 'SR-4', name: 'Provenance', baselines: '—', cat: 'Provenance' },
      {
        id: 'SR-5',
        name: 'Acquisition Strategies, Tools, and Methods',
        baselines: 'LMH',
        cat: 'Acquisition',
      },
      { id: 'SR-6', name: 'Supplier Assessments and Reviews', baselines: 'MH', cat: 'Assessment' },
      { id: 'SR-7', name: 'Supply Chain Operations Security', baselines: '—', cat: 'OPSEC' },
      { id: 'SR-8', name: 'Notification Agreements', baselines: 'MH', cat: 'Notification' },
      { id: 'SR-9', name: 'Tamper Resistance and Detection', baselines: '—', cat: 'Tamper' },
      {
        id: 'SR-10',
        name: 'Inspection of Systems or Components',
        baselines: '—',
        cat: 'Inspection',
      },
      { id: 'SR-11', name: 'Component Authenticity', baselines: 'LMH', cat: 'Authenticity' },
      { id: 'SR-12', name: 'Component Disposal', baselines: 'LMH', cat: 'Disposal' },
    ],
  },
];

// Keep the existing framework metadata but replace domains with expanded ones
const existingPath = path.resolve(__dirname, '../data/compliance/frameworks/nist-800-53.json');
const existing = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));

// Build expanded domains
const expandedDomains = families.map((family) => {
  const controls = family.controls.map((ctrl) => ({
    id: ctrl.id,
    name: ctrl.name,
    description: `Implement ${ctrl.name.toLowerCase()} controls as required by NIST SP 800-53 Rev 5.`,
    implementationType: ctrl.baselines.includes('L')
      ? 'required'
      : ctrl.baselines.includes('M')
        ? 'recommended'
        : ctrl.baselines === '—'
          ? 'optional'
          : 'recommended',
    category: ctrl.cat,
    baselines: {
      low: ctrl.baselines.includes('L'),
      moderate: ctrl.baselines.includes('M'),
      high: ctrl.baselines.includes('H'),
    },
    automationCapability: ['Policy', 'Training', 'Planning', 'Assessment'].includes(ctrl.cat)
      ? 'manual'
      : 'partial',
  }));

  return {
    id: family.id,
    name: family.name,
    description: family.description,
    required: true,
    controlCount: controls.length,
    controls,
  };
});

// Update the framework
existing.domains = expandedDomains;

// Count total controls
const totalControls = expandedDomains.reduce((sum, d) => sum + d.controlCount, 0);
console.log(`Generated ${totalControls} controls across ${expandedDomains.length} families`);

// Write back
fs.writeFileSync(existingPath, JSON.stringify(existing, null, 2) + '\n');
console.log(`Updated: ${existingPath}`);
