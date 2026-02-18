# ADR-0005: Multi-Framework Compliance Engine with OSCAL Catalogs

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2025-04-01 |
| **Decision Makers** | Core team |
| **P-ID** | P3.4 |

## Context

SFG targets government and defense industrial base (DIB) customers who must comply with multiple overlapping frameworks: CMMC, NIST SP 800-53, NIST SP 800-171, FedRAMP, ISO 27001, SOC 2, and others. Each framework has hundreds of controls, and many map to the same underlying security requirements.

We need a system that:
1. Stores framework definitions with cross-framework mappings.
2. Tracks evidence artifacts linked to specific controls.
3. Computes compliance gap scores per framework and aggregate.
4. Exports POA&M documents in a standard format.
5. Aligns with NIST OSCAL (Open Security Controls Assessment Language) for interoperability.

## Decision

Build a **multi-framework compliance engine** with three layers:

1. **Static framework data** — JSON files in `data/compliance/frameworks/` and OSCAL catalogs in `data/compliance/oscal/`. Served read-only via `/api/compliance/frameworks` and `/api/compliance/oscal`.

2. **Dynamic assessment data** — SQLite tables for evidence tracking (`compliance_evidence`), control status (`compliance_control_status`), and assessment scheduling (`compliance_assessments`). Managed via `/api/compliance/evidence`, `/api/compliance/gap-score`, and `/api/compliance/assessments`.

3. **Cross-framework mappings** — a lookup table in `data/compliance/mappings/cross-framework-lookup.json` that maps controls across frameworks, enabling "assess once, comply many" workflows.

## Consequences

### Positive

- Single engine handles 12+ frameworks with consistent API.
- Evidence is linked to specific controls, enabling automated gap scoring.
- OSCAL alignment enables import/export with federal GRC tools (e.g., AWS GovCloud, eMASS).
- Cross-framework mappings reduce duplicate assessment effort.
- POA&M export matches NIST SP 800-171 Appendix E format.

### Negative

- Framework JSON files are large (100+ KB each) and must be maintained as standards evolve.
- Gap scoring is approximate (percentage-based) rather than weighted like SPRS.
- No real-time continuous monitoring yet (that's Phase 4).

### Risks

- Framework data could become stale if not updated when NIST/DoD releases revisions. Mitigated by version fields in each JSON file.
- Large framework files (800-53 has 1,000+ controls) could slow API responses. Mitigated by static file serving and client-side caching.

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| Third-party GRC platform (Drata, Vanta) | Full-featured, pre-built | Expensive ($15K+/yr), vendor lock-in, no CUI handling |
| Pure OSCAL-native engine | Maximum interoperability | Complex to implement, OSCAL learning curve |
| Spreadsheet-based tracking | Familiar to assessors | No automation, no API, error-prone |

## References

- [NIST OSCAL](https://pages.nist.gov/OSCAL/)
- [NIST SP 800-53 Rev 5](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final)
- [NIST SP 800-171 Rev 3](https://csrc.nist.gov/publications/detail/sp/800-171/rev-3/final)
- [CMMC 2.0 Final Rule](https://www.federalregister.gov/documents/2024/10/15/2024-22905/cybersecurity-maturity-model-certification-cmmc-program)
