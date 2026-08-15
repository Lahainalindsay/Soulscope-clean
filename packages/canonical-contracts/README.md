# SoulScope Canonical Contracts

This package defines identifiers, registries, schemas, provenance, and version contracts only. It does not implement acoustic interpretation, scoring, state selection, narrative generation, visualization, diagnosis, or production behavior.

Version: `0.1.0`

Source authority:

1. `../../docs/CANONICAL_AUTHORITY_LEDGER.md`
2. `../../docs/canonical/The SoulScope Canon v1.3.pdf`
3. `../../docs/canonical/SoulScope Acoustic Parameter Registry v0.1.pdf`
4. `../../docs/canonical/SoulScope Evidence Marker Registry.pdf`
5. `../../docs/canonical/SoulScope Constellation Dimension Registry v0.1.pdf`
6. `../../docs/canonical/SoulScope Inference Rule Registry v0.1.pdf`
7. `../../docs/canonical/SoulScope Constellation State Registry v0.1.pdf`
8. `../../docs/canonical/SoulScope Cross-Constellation Interaction Registry v0.1.pdf`
9. `../../docs/canonical/SoulScope Narrative Registry.pdf`

## Scope

Included:

- Canon v1.3 prompt IDs, roles, durations, and prohibited prompt assumptions.
- Constellation IDs and labels.
- Sixteen permanent dimension IDs, labels, D1/D2/D3 classes, and D3 abstention contracts.
- Evidence family IDs and neutral Evidence Marker IDs.
- Compact state IDs and state-outcome categories without exhaustive classification.
- Interaction verbs and downstream-only boundaries.
- Optional Pattern publication policy.
- Evidence Ledger record fields and JSON Schema required-field validation.
- Baseline hierarchy enum.
- Canonical processing-stage names.
- Narrative section names, authority boundaries, and internal citation requirements.
- Validation phase-gate names.
- Source, provenance, registry version, schema version, and package version contracts.
- Immutable scan result envelope types.

Deferred:

- Acoustic scoring formulas.
- Feature weights.
- Normalization formulas.
- Confidence formulas.
- Posterior interval construction.
- Calibrated Dimension scoring.
- State eligibility numeric models, selection thresholds, and blend margins.
- Interaction inference models.
- Pattern inference models.
- Narrative generation.
- Resonance Signature behavior.
- Database, frontend, backend, and renderer integration.

Known authority gap:

- `SoulScope Whole-Scan Pattern Registry v0.1` is current authority at `docs/canonical/SoulScope Whole-Scan Pattern Registry v0.1.pdf`. Its initial seven Pattern motifs are `RESEARCH_ONLY` until calibrated and promoted by a later adopted authority.

## JSON Schema Draft

Schemas use JSON Schema draft `2020-12`. The included tests perform contract-level validation of required fields, primitive shapes, enum membership, unknown permanent IDs, provenance presence, and version references without introducing scientific range checks.
