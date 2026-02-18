/**
 * SPRS Score Calculator (P2.4.4)
 *
 * Calculates the Supplier Performance Risk System (SPRS) score
 * based on NIST SP 800-171 Rev 2 self-assessment results.
 *
 * Scoring per DFARS 252.204-7019:
 *   - Start at 110
 *   - Subtract point value for each control NOT implemented and NOT on POA&M
 *   - Controls on POA&M with a credible plan: no deduction
 *   - N/A controls: no deduction
 *   - Minimum possible: -203
 *
 * Usage:  node scripts/sprs-score.js [--json] [--verbose]
 */

// ── NIST SP 800-171 Rev 2 — All 110 Controls with SPRS Point Values ──
// Point values sourced from DoD Assessment Methodology v1.2.1

const CONTROLS = [
  // 3.1 Access Control (AC) — 22 controls
  { id: '3.1.1', pts: 5, family: 'AC', title: 'Authorized access control' },
  { id: '3.1.2', pts: 5, family: 'AC', title: 'Transaction/function control' },
  { id: '3.1.3', pts: 5, family: 'AC', title: 'CUI flow control' },
  { id: '3.1.4', pts: 1, family: 'AC', title: 'Separation of duties' },
  { id: '3.1.5', pts: 5, family: 'AC', title: 'Least privilege' },
  { id: '3.1.6', pts: 1, family: 'AC', title: 'Non-privileged accounts for nonsecurity' },
  { id: '3.1.7', pts: 3, family: 'AC', title: 'Privileged function execution audit' },
  { id: '3.1.8', pts: 3, family: 'AC', title: 'Limit unsuccessful logon attempts' },
  { id: '3.1.9', pts: 1, family: 'AC', title: 'Privacy/security notices' },
  { id: '3.1.10', pts: 3, family: 'AC', title: 'Session lock with pattern-hiding' },
  { id: '3.1.11', pts: 3, family: 'AC', title: 'Session termination' },
  { id: '3.1.12', pts: 3, family: 'AC', title: 'Monitor/control remote access' },
  { id: '3.1.13', pts: 5, family: 'AC', title: 'Encrypt remote access' },
  { id: '3.1.14', pts: 3, family: 'AC', title: 'Route via managed access points' },
  { id: '3.1.15', pts: 3, family: 'AC', title: 'Remote privileged commands' },
  { id: '3.1.16', pts: 1, family: 'AC', title: 'Wireless access authorization' },
  { id: '3.1.17', pts: 1, family: 'AC', title: 'Wireless access protection' },
  { id: '3.1.18', pts: 1, family: 'AC', title: 'Mobile device control' },
  { id: '3.1.19', pts: 1, family: 'AC', title: 'Mobile device CUI encryption' },
  { id: '3.1.20', pts: 1, family: 'AC', title: 'External system connections' },
  { id: '3.1.21', pts: 1, family: 'AC', title: 'Portable storage limits' },
  { id: '3.1.22', pts: 5, family: 'AC', title: 'CUI on publicly accessible systems' },

  // 3.2 Awareness and Training (AT) — 3 controls
  { id: '3.2.1', pts: 1, family: 'AT', title: 'Security awareness' },
  { id: '3.2.2', pts: 1, family: 'AT', title: 'Role-based security training' },
  { id: '3.2.3', pts: 1, family: 'AT', title: 'Insider threat awareness' },

  // 3.3 Audit and Accountability (AU) — 9 controls
  { id: '3.3.1', pts: 5, family: 'AU', title: 'Create/retain audit logs' },
  { id: '3.3.2', pts: 3, family: 'AU', title: 'User traceability' },
  { id: '3.3.3', pts: 3, family: 'AU', title: 'Review/update logged events' },
  { id: '3.3.4', pts: 3, family: 'AU', title: 'Audit failure alerting' },
  { id: '3.3.5', pts: 3, family: 'AU', title: 'Audit correlation' },
  { id: '3.3.6', pts: 1, family: 'AU', title: 'Audit reduction and reporting' },
  { id: '3.3.7', pts: 1, family: 'AU', title: 'Time synchronization' },
  { id: '3.3.8', pts: 3, family: 'AU', title: 'Protect audit information' },
  { id: '3.3.9', pts: 1, family: 'AU', title: 'Limit audit management' },

  // 3.4 Configuration Management (CM) — 9 controls
  { id: '3.4.1', pts: 3, family: 'CM', title: 'Baseline configuration and inventory' },
  { id: '3.4.2', pts: 3, family: 'CM', title: 'Security configuration settings' },
  { id: '3.4.3', pts: 3, family: 'CM', title: 'Change control' },
  { id: '3.4.4', pts: 3, family: 'CM', title: 'Security impact analysis' },
  { id: '3.4.5', pts: 3, family: 'CM', title: 'Access restrictions for changes' },
  { id: '3.4.6', pts: 1, family: 'CM', title: 'Least functionality' },
  { id: '3.4.7', pts: 1, family: 'CM', title: 'Disable nonessential functions/ports' },
  { id: '3.4.8', pts: 1, family: 'CM', title: 'Software whitelisting/blacklisting' },
  { id: '3.4.9', pts: 1, family: 'CM', title: 'User-installed software control' },

  // 3.5 Identification and Authentication (IA) — 11 controls
  { id: '3.5.1', pts: 5, family: 'IA', title: 'Identify users/processes/devices' },
  { id: '3.5.2', pts: 5, family: 'IA', title: 'Authenticate identities' },
  { id: '3.5.3', pts: 5, family: 'IA', title: 'Multifactor authentication' },
  { id: '3.5.4', pts: 3, family: 'IA', title: 'Replay-resistant authentication' },
  { id: '3.5.5', pts: 1, family: 'IA', title: 'Prevent identifier reuse' },
  { id: '3.5.6', pts: 1, family: 'IA', title: 'Disable inactive identifiers' },
  { id: '3.5.7', pts: 5, family: 'IA', title: 'Password complexity' },
  { id: '3.5.8', pts: 1, family: 'IA', title: 'Password reuse prevention' },
  { id: '3.5.9', pts: 1, family: 'IA', title: 'Temporary password change' },
  { id: '3.5.10', pts: 5, family: 'IA', title: 'Cryptographic password protection' },
  { id: '3.5.11', pts: 1, family: 'IA', title: 'Obscure authentication feedback' },

  // 3.6 Incident Response (IR) — 3 controls
  { id: '3.6.1', pts: 5, family: 'IR', title: 'Incident handling capability' },
  { id: '3.6.2', pts: 3, family: 'IR', title: 'Incident tracking and reporting' },
  { id: '3.6.3', pts: 3, family: 'IR', title: 'Incident response testing' },

  // 3.7 Maintenance (MA) — 6 controls
  { id: '3.7.1', pts: 3, family: 'MA', title: 'System maintenance' },
  { id: '3.7.2', pts: 3, family: 'MA', title: 'Maintenance tools and personnel' },
  { id: '3.7.3', pts: 1, family: 'MA', title: 'Off-site maintenance sanitization' },
  { id: '3.7.4', pts: 1, family: 'MA', title: 'Diagnostic media scanning' },
  { id: '3.7.5', pts: 3, family: 'MA', title: 'Nonlocal maintenance MFA' },
  { id: '3.7.6', pts: 1, family: 'MA', title: 'Maintenance personnel supervision' },

  // 3.8 Media Protection (MP) — 9 controls
  { id: '3.8.1', pts: 1, family: 'MP', title: 'Protect system media' },
  { id: '3.8.2', pts: 1, family: 'MP', title: 'Limit media access' },
  { id: '3.8.3', pts: 3, family: 'MP', title: 'Media sanitization/destruction' },
  { id: '3.8.4', pts: 1, family: 'MP', title: 'CUI media marking' },
  { id: '3.8.5', pts: 1, family: 'MP', title: 'Media transport accountability' },
  { id: '3.8.6', pts: 3, family: 'MP', title: 'Transport encryption' },
  { id: '3.8.7', pts: 1, family: 'MP', title: 'Removable media control' },
  { id: '3.8.8', pts: 1, family: 'MP', title: 'Prohibit unidentified storage' },
  { id: '3.8.9', pts: 3, family: 'MP', title: 'Backup CUI confidentiality' },

  // 3.9 Personnel Security (PS) — 2 controls
  { id: '3.9.1', pts: 1, family: 'PS', title: 'Personnel screening' },
  { id: '3.9.2', pts: 1, family: 'PS', title: 'Personnel transfer/termination' },

  // 3.10 Physical Protection (PE) — 6 controls
  { id: '3.10.1', pts: 5, family: 'PE', title: 'Limit physical access' },
  { id: '3.10.2', pts: 1, family: 'PE', title: 'Protect/monitor facility' },
  { id: '3.10.3', pts: 1, family: 'PE', title: 'Escort visitors' },
  { id: '3.10.4', pts: 1, family: 'PE', title: 'Physical access logs' },
  { id: '3.10.5', pts: 1, family: 'PE', title: 'Physical access devices' },
  { id: '3.10.6', pts: 1, family: 'PE', title: 'Alternate work site safeguards' },

  // 3.11 Risk Assessment (RA) — 3 controls
  { id: '3.11.1', pts: 5, family: 'RA', title: 'Periodic risk assessment' },
  { id: '3.11.2', pts: 5, family: 'RA', title: 'Vulnerability scanning' },
  { id: '3.11.3', pts: 5, family: 'RA', title: 'Vulnerability remediation' },

  // 3.12 Security Assessment (CA) — 4 controls
  { id: '3.12.1', pts: 3, family: 'CA', title: 'Security control assessment' },
  { id: '3.12.2', pts: 3, family: 'CA', title: 'Plans of action (POA&M)' },
  { id: '3.12.3', pts: 3, family: 'CA', title: 'Continuous monitoring' },
  { id: '3.12.4', pts: 3, family: 'CA', title: 'System security plan' },

  // 3.13 System and Communications Protection (SC) — 16 controls
  { id: '3.13.1', pts: 5, family: 'SC', title: 'Boundary protection' },
  { id: '3.13.2', pts: 3, family: 'SC', title: 'Security architecture' },
  { id: '3.13.3', pts: 3, family: 'SC', title: 'User/management separation' },
  { id: '3.13.4', pts: 3, family: 'SC', title: 'Shared resource protection' },
  { id: '3.13.5', pts: 5, family: 'SC', title: 'DMZ / public subnet' },
  { id: '3.13.6', pts: 5, family: 'SC', title: 'Deny-all, permit-by-exception' },
  { id: '3.13.7', pts: 3, family: 'SC', title: 'Split tunneling prevention' },
  { id: '3.13.8', pts: 5, family: 'SC', title: 'CUI transmission encryption' },
  { id: '3.13.9', pts: 3, family: 'SC', title: 'Session termination' },
  { id: '3.13.10', pts: 3, family: 'SC', title: 'Cryptographic key management' },
  { id: '3.13.11', pts: 5, family: 'SC', title: 'FIPS-validated cryptography' },
  { id: '3.13.12', pts: 1, family: 'SC', title: 'Collaborative computing devices' },
  { id: '3.13.13', pts: 1, family: 'SC', title: 'Mobile code control (CSP)' },
  { id: '3.13.14', pts: 1, family: 'SC', title: 'VoIP control' },
  { id: '3.13.15', pts: 3, family: 'SC', title: 'Session authenticity' },
  { id: '3.13.16', pts: 5, family: 'SC', title: 'CUI at rest encryption' },

  // 3.14 System and Information Integrity (SI) — 7 controls
  { id: '3.14.1', pts: 5, family: 'SI', title: 'Flaw remediation' },
  { id: '3.14.2', pts: 3, family: 'SI', title: 'Malicious code protection' },
  { id: '3.14.3', pts: 3, family: 'SI', title: 'Security alert monitoring' },
  { id: '3.14.4', pts: 1, family: 'SI', title: 'Malicious code updates' },
  { id: '3.14.5', pts: 3, family: 'SI', title: 'System/file scanning' },
  { id: '3.14.6', pts: 5, family: 'SI', title: 'Communications monitoring' },
  { id: '3.14.7', pts: 3, family: 'SI', title: 'Unauthorized use detection' },
];

// ── Current Assessment Status ──
// Status: 'implemented' | 'partial' | 'planned' | 'na'
// 'partial' and 'planned' = on POA&M (no deduction if plan exists)
// 'na' = not applicable (no deduction)
// Only 'not-met' (no POA&M) causes a deduction — not used here since all gaps are on POA&M

const STATUS = {
  // AC
  '3.1.1': 'implemented',
  '3.1.2': 'implemented',
  '3.1.3': 'partial',
  '3.1.4': 'partial',
  '3.1.5': 'partial',
  '3.1.6': 'implemented',
  '3.1.7': 'implemented',
  '3.1.8': 'planned',
  '3.1.9': 'implemented',
  '3.1.10': 'planned',
  '3.1.11': 'partial',
  '3.1.12': 'implemented',
  '3.1.13': 'implemented',
  '3.1.14': 'implemented',
  '3.1.15': 'partial',
  '3.1.16': 'na',
  '3.1.17': 'na',
  '3.1.18': 'planned',
  '3.1.19': 'planned',
  '3.1.20': 'implemented',
  '3.1.21': 'partial',
  '3.1.22': 'implemented',

  // AT
  '3.2.1': 'planned',
  '3.2.2': 'planned',
  '3.2.3': 'planned',

  // AU
  '3.3.1': 'implemented',
  '3.3.2': 'implemented',
  '3.3.3': 'partial',
  '3.3.4': 'planned',
  '3.3.5': 'implemented',
  '3.3.6': 'implemented',
  '3.3.7': 'partial',
  '3.3.8': 'partial',
  '3.3.9': 'implemented',

  // CM
  '3.4.1': 'implemented',
  '3.4.2': 'implemented',
  '3.4.3': 'implemented',
  '3.4.4': 'partial',
  '3.4.5': 'implemented',
  '3.4.6': 'implemented',
  '3.4.7': 'partial',
  '3.4.8': 'implemented',
  '3.4.9': 'planned',

  // IA
  '3.5.1': 'implemented',
  '3.5.2': 'implemented',
  '3.5.3': 'partial',
  '3.5.4': 'implemented',
  '3.5.5': 'partial',
  '3.5.6': 'partial',
  '3.5.7': 'partial',
  '3.5.8': 'planned',
  '3.5.9': 'planned',
  '3.5.10': 'implemented',
  '3.5.11': 'implemented',

  // IR
  '3.6.1': 'planned',
  '3.6.2': 'partial',
  '3.6.3': 'planned',

  // MA
  '3.7.1': 'implemented',
  '3.7.2': 'partial',
  '3.7.3': 'planned',
  '3.7.4': 'planned',
  '3.7.5': 'planned',
  '3.7.6': 'na',

  // MP
  '3.8.1': 'partial',
  '3.8.2': 'implemented',
  '3.8.3': 'planned',
  '3.8.4': 'implemented',
  '3.8.5': 'na',
  '3.8.6': 'partial',
  '3.8.7': 'na',
  '3.8.8': 'planned',
  '3.8.9': 'planned',

  // PS
  '3.9.1': 'planned',
  '3.9.2': 'planned',

  // PE
  '3.10.1': 'partial',
  '3.10.2': 'partial',
  '3.10.3': 'na',
  '3.10.4': 'planned',
  '3.10.5': 'planned',
  '3.10.6': 'planned',

  // RA
  '3.11.1': 'planned',
  '3.11.2': 'implemented',
  '3.11.3': 'partial',

  // CA
  '3.12.1': 'partial',
  '3.12.2': 'implemented',
  '3.12.3': 'implemented',
  '3.12.4': 'planned',

  // SC
  '3.13.1': 'implemented',
  '3.13.2': 'implemented',
  '3.13.3': 'implemented',
  '3.13.4': 'implemented',
  '3.13.5': 'partial',
  '3.13.6': 'partial',
  '3.13.7': 'planned',
  '3.13.8': 'implemented',
  '3.13.9': 'partial',
  '3.13.10': 'partial',
  '3.13.11': 'partial',
  '3.13.12': 'na',
  '3.13.13': 'implemented',
  '3.13.14': 'na',
  '3.13.15': 'implemented',
  '3.13.16': 'planned',

  // SI
  '3.14.1': 'implemented',
  '3.14.2': 'planned',
  '3.14.3': 'implemented',
  '3.14.4': 'planned',
  '3.14.5': 'implemented',
  '3.14.6': 'partial',
  '3.14.7': 'partial',
};

// ── Compute Score ──

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const verbose = args.includes('--verbose');

const families = {};
let totalImplemented = 0;
let totalPartial = 0;
let totalPlanned = 0;
let totalNA = 0;
let totalNotMet = 0;
let deductions = 0;
const atRisk = [];

for (const ctrl of CONTROLS) {
  const status = STATUS[ctrl.id];
  if (!status) {
    console.error(`Missing status for ${ctrl.id}`);
    process.exit(1);
  }

  // Tally by family
  if (!families[ctrl.family]) {
    families[ctrl.family] = {
      implemented: 0,
      partial: 0,
      planned: 0,
      na: 0,
      notMet: 0,
      points: 0,
      atRisk: 0,
    };
  }

  switch (status) {
    case 'implemented':
      totalImplemented++;
      families[ctrl.family].implemented++;
      break;
    case 'partial':
      totalPartial++;
      families[ctrl.family].partial++;
      families[ctrl.family].atRisk += ctrl.pts;
      atRisk.push(ctrl);
      break;
    case 'planned':
      totalPlanned++;
      families[ctrl.family].planned++;
      families[ctrl.family].atRisk += ctrl.pts;
      atRisk.push(ctrl);
      break;
    case 'na':
      totalNA++;
      families[ctrl.family].na++;
      break;
    default:
      // 'not-met' — no POA&M, points deducted
      totalNotMet++;
      families[ctrl.family].notMet++;
      deductions += ctrl.pts;
      break;
  }

  families[ctrl.family].points += ctrl.pts;
}

const sprsScore = 110 - deductions;
const totalAtRiskPoints = atRisk.reduce((sum, c) => sum + c.pts, 0);
const worstCase = 110 - totalAtRiskPoints;

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        sprsScore,
        deductions,
        worstCaseIfPoamFails: worstCase,
        totalControls: CONTROLS.length,
        implemented: totalImplemented,
        partial: totalPartial,
        planned: totalPlanned,
        notApplicable: totalNA,
        notMet: totalNotMet,
        pointsAtRisk: totalAtRiskPoints,
        families: Object.fromEntries(
          Object.entries(families).map(([k, v]) => [
            k,
            {
              implemented: v.implemented,
              partial: v.partial,
              planned: v.planned,
              na: v.na,
              notMet: v.notMet,
              totalPoints: v.points,
              pointsAtRisk: v.atRisk,
            },
          ])
        ),
      },
      null,
      2
    )
  );
  process.exit(0);
}

// ── Console Output ──

console.log('');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║         SPRS Score Calculator — NIST SP 800-171        ║');
console.log('║         DFARS 252.204-7019 Self-Assessment             ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(
  `║  SPRS SCORE:  ${String(sprsScore).padStart(4)}                                     ║`
);
console.log(
  `║  Points deducted:  ${String(deductions).padStart(3)}                                ║`
);
console.log(
  `║  Points at risk (POA&M):  ${String(totalAtRiskPoints).padStart(3)}                       ║`
);
console.log(
  `║  Worst case (if POA&M fails):  ${String(worstCase).padStart(4)}                    ║`
);
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║  Controls: ${CONTROLS.length} total                                    ║`);
console.log(
  `║    ✅ Implemented:  ${String(totalImplemented).padStart(3)}                               ║`
);
console.log(
  `║    🔶 Partial:      ${String(totalPartial).padStart(3)}  (on POA&M)                      ║`
);
console.log(
  `║    📋 Planned:      ${String(totalPlanned).padStart(3)}  (on POA&M)                      ║`
);
console.log(
  `║    ⬜ N/A:          ${String(totalNA).padStart(3)}                                    ║`
);
console.log(
  `║    ❌ Not Met:      ${String(totalNotMet).padStart(3)}  (points deducted)                ║`
);
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('');

// Family breakdown
console.log('Family Breakdown:');
console.log('─────────────────────────────────────────────────────────');
console.log('Family │ Total │ Done │ Part │ Plan │ N/A │ Risk Pts');
console.log('───────┼───────┼──────┼──────┼──────┼─────┼─────────');

const familyOrder = [
  'AC',
  'AT',
  'AU',
  'CM',
  'IA',
  'IR',
  'MA',
  'MP',
  'PS',
  'PE',
  'RA',
  'CA',
  'SC',
  'SI',
];
for (const fam of familyOrder) {
  const f = families[fam];
  if (!f) {
    continue;
  }
  const total = f.implemented + f.partial + f.planned + f.na + f.notMet;
  console.log(
    `  ${fam.padEnd(4)} │ ${String(total).padStart(5)} │ ${String(f.implemented).padStart(4)} │ ${String(f.partial).padStart(4)} │ ${String(f.planned).padStart(4)} │ ${String(f.na).padStart(3)} │ ${String(f.atRisk).padStart(4)}`
  );
}
console.log('');

if (verbose && atRisk.length > 0) {
  console.log('Controls at Risk (on POA&M):');
  console.log('────────────────────────────────────────────────────');
  // Sort by point value descending
  const sorted = [...atRisk].sort((a, b) => b.pts - a.pts);
  for (const c of sorted) {
    const s = STATUS[c.id];
    const icon = s === 'partial' ? '🔶' : '📋';
    console.log(`  ${icon} ${c.id.padEnd(8)} (${c.pts} pts) ${c.title}`);
  }
  console.log('');
}

// Recommendation
if (sprsScore >= 110) {
  console.log('✅ All controls implemented or on POA&M. Ready for assessment.');
} else if (sprsScore >= 80) {
  console.log('⚠  Score is above 80 but gaps exist without POA&M coverage.');
} else {
  console.log('❌ Significant gaps exist. Address high-point controls first.');
}
console.log('');
