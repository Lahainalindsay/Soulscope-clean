# SoulScope Canonical Contracts

This package defines identifiers, registries, schemas, provenance, and version contracts only. It does not implement acoustic interpretation, scoring, state selection, narrative generation, visualization, diagnosis, or production behavior.

Version: `0.1.0`

Source authority:

1. `../../docs/SOULSCOPE_CANON.md`
2. `../../docs/CONSTELLATION_BIBLE.md`
3. `../../architecture/17-constellation-bible-fidelity-audit.md`
4. `../../architecture/18-constellation-bible-implementation-readiness.md`
5. owner decision recorded in the task authorizing limited contract extraction

## Scope

Included:

- Constellation IDs and labels.
- Sixteen permanent dimension IDs and labels.
- Seed-state IDs, display names, ownership, limited source-defined descriptive metadata, lifecycle/status labels, and provenance references.
- Evidence Ledger record fields and JSON Schema required-field validation.
- Baseline hierarchy enum.
- Canonical processing-stage names.
- Narrative section names and internal citation requirements.
- Validation phase-gate names.
- Source, provenance, registry version, schema version, and package version contracts.

Deferred:

- Acoustic scoring formulas.
- Feature weights.
- Normalization formulas.
- Confidence formulas.
- Posterior interval construction.
- Dimension scoring.
- State eligibility, selection, publish thresholds, and blend margins.
- Interaction inference.
- Pattern inference.
- Narrative generation.
- Resonance Signature behavior.
- Database, frontend, backend, and renderer integration.

## JSON Schema Draft

Schemas use JSON Schema draft `2020-12`. The included tests perform contract-level validation of required fields, primitive shapes, enum membership, unknown permanent IDs, provenance presence, and version references without introducing scientific range checks.
