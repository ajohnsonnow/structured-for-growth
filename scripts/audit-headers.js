/**
 * Security Headers Audit Script (P3.2.6)
 *
 * Verifies Helmet configuration and HTTP response headers against
 * OWASP Secure Headers recommendations and federal security standards.
 *
 * Usage:  node scripts/audit-headers.js [URL]
 * Default URL: http://localhost:10000
 */

const DEFAULT_URL = process.env.BASE_URL || 'http://localhost:10000';
const url = process.argv[2] || DEFAULT_URL;

// ── Expected Headers & Policies ──

const REQUIRED_HEADERS = [
  {
    name: 'strict-transport-security',
    check: (val) => {
      const maxAge = parseInt(val?.match(/max-age=(\d+)/)?.[1] || '0', 10);
      const hasSub = /includeSubDomains/i.test(val);
      const hasPreload = /preload/i.test(val);
      return maxAge >= 31536000 && hasSub && hasPreload;
    },
    expected: 'max-age≥31536000; includeSubDomains; preload',
    severity: 'HIGH',
    standard: 'NIST SC-8, HSTS RFC 6797',
  },
  {
    name: 'content-security-policy',
    check: (val) => {
      if (!val) {
        return false;
      }
      const hasDefault = /default-src\s+'self'/.test(val);
      const noUnsafeEval = !/unsafe-eval/.test(val);
      const hasFrame = /frame-src\s+'none'/.test(val);
      const hasObject = /object-src\s+'none'/.test(val);
      const hasBase = /base-uri\s+'self'/.test(val);
      return hasDefault && noUnsafeEval && hasFrame && hasObject && hasBase;
    },
    expected:
      "default-src 'self'; no unsafe-eval; frame-src 'none'; object-src 'none'; base-uri 'self'",
    severity: 'HIGH',
    standard: 'OWASP A05, NIST SC-18',
    warnings: [
      {
        check: (val) => /unsafe-inline/.test(val),
        message: "CSP uses 'unsafe-inline' — migrate to nonces or hashes for CMMC compliance",
        severity: 'MEDIUM',
      },
    ],
  },
  {
    name: 'x-content-type-options',
    check: (val) => val?.toLowerCase() === 'nosniff',
    expected: 'nosniff',
    severity: 'MEDIUM',
    standard: 'OWASP, Helmet default',
  },
  {
    name: 'x-frame-options',
    check: (val) => /^(DENY|SAMEORIGIN)$/i.test(val?.trim()),
    expected: 'DENY or SAMEORIGIN',
    severity: 'MEDIUM',
    standard: 'OWASP Clickjacking Defense',
  },
  {
    name: 'referrer-policy',
    check: (val) => {
      const safe = [
        'no-referrer',
        'strict-origin',
        'strict-origin-when-cross-origin',
        'same-origin',
      ];
      return safe.some((p) => val?.toLowerCase().includes(p));
    },
    expected: 'strict-origin-when-cross-origin (or stricter)',
    severity: 'LOW',
    standard: 'OWASP',
  },
  {
    name: 'x-dns-prefetch-control',
    check: (val) => val?.toLowerCase() === 'off',
    expected: 'off',
    severity: 'LOW',
    standard: 'Helmet default',
  },
  {
    name: 'x-download-options',
    check: (val) => val?.toLowerCase() === 'noopen',
    expected: 'noopen',
    severity: 'LOW',
    standard: 'IE-specific mitigation',
  },
  {
    name: 'x-permitted-cross-domain-policies',
    check: (val) => val?.toLowerCase() === 'none',
    expected: 'none',
    severity: 'LOW',
    standard: 'Helmet default',
  },
];

const FORBIDDEN_HEADERS = [
  { name: 'x-powered-by', severity: 'MEDIUM', reason: 'Reveals server technology' },
  { name: 'server', severity: 'LOW', reason: 'May reveal server software version' },
];

// ── Fetch and Audit ──

async function audit() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           Security Headers Audit                       ║');
  console.log(`║  Target: ${url.padEnd(46)} ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');

  let headers;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    headers = Object.fromEntries([...res.headers.entries()].map(([k, v]) => [k.toLowerCase(), v]));
    console.log(`║  Status: ${String(res.status).padEnd(46)} ║`);
  } catch (err) {
    console.log(`║  ❌ Connection failed: ${err.message.slice(0, 33).padEnd(33)} ║`);
    console.log('║  Start the server first: npm start                    ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    process.exit(1);
  }

  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  let pass = 0;
  let warn = 0;
  let fail = 0;
  const findings = [];

  // Check required headers
  console.log('Required Headers:');
  console.log('─────────────────────────────────────────────────────────');

  for (const h of REQUIRED_HEADERS) {
    const val = headers[h.name];
    const ok = h.check(val);

    if (ok) {
      console.log(`  ✅ ${h.name}`);
      pass++;

      // Check for warnings on passing headers
      if (h.warnings) {
        for (const w of h.warnings) {
          if (w.check(val)) {
            console.log(`     ⚠  ${w.message}`);
            warn++;
            findings.push({
              type: 'WARNING',
              header: h.name,
              message: w.message,
              severity: w.severity,
            });
          }
        }
      }
    } else if (val) {
      console.log(`  ⚠  ${h.name}: present but does not meet requirements`);
      console.log(`     Expected: ${h.expected}`);
      console.log(`     Actual:   ${val.slice(0, 80)}`);
      warn++;
      findings.push({
        type: 'WARNING',
        header: h.name,
        message: `Present but insufficient: ${val.slice(0, 60)}`,
        severity: h.severity,
      });
    } else {
      console.log(`  ❌ ${h.name}: MISSING`);
      console.log(`     Expected: ${h.expected}`);
      console.log(`     Standard: ${h.standard}`);
      fail++;
      findings.push({ type: 'FAIL', header: h.name, message: 'Missing', severity: h.severity });
    }
  }

  console.log('');
  console.log('Forbidden Headers (information disclosure):');
  console.log('─────────────────────────────────────────────────────────');

  for (const h of FORBIDDEN_HEADERS) {
    const val = headers[h.name];
    if (val) {
      console.log(`  ⚠  ${h.name}: "${val}" — ${h.reason}`);
      warn++;
      findings.push({
        type: 'WARNING',
        header: h.name,
        message: `${h.reason}: ${val}`,
        severity: h.severity,
      });
    } else {
      console.log(`  ✅ ${h.name}: not present (good)`);
      pass++;
    }
  }

  // Summary
  console.log('');
  console.log('Summary:');
  console.log('─────────────────────────────────────────────────────────');
  console.log(`  ✅ Pass:     ${pass}`);
  console.log(`  ⚠  Warning:  ${warn}`);
  console.log(`  ❌ Fail:     ${fail}`);
  console.log('');

  if (fail === 0 && warn === 0) {
    console.log('✅ All security headers pass audit.');
  } else if (fail === 0) {
    console.log('⚠  Headers present but some need improvement.');
  } else {
    console.log('❌ Missing required security headers. Remediate before deployment.');
  }
  console.log('');

  // JSON output
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ url, pass, warn, fail, findings }, null, 2));
  }

  process.exit(fail > 0 ? 1 : 0);
}

audit();
