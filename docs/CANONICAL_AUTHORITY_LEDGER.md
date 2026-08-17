# SoulScope Canonical Authority Ledger

Status: CURRENT AUTHORITY INDEX
Adopted for repository integration: 2026-08-14

This ledger is the single current authority index for the SoulScope backend and scientific architecture in this repository. Historical Canon, Bible, and specification materials remain available only under `docs/archive/` for provenance.

## Authority Order

1. Scientific safety, personal agency, privacy, and immutable Evidence to Decision to Result contracts.
2. SoulScope Canon v1.3.
3. Current canonical scientific/backend companion registries listed below.
4. Current compatible implementation, validation, privacy, security, rendering, interface, and route-level specifications where they do not conflict with the Canon or companion registries.
5. Executable implementation.

No lower layer may override a higher layer. Archived files are not current authority.

## Current Governing Canon

| Authority | Version | Path | Status |
| --- | --- | --- | --- |
| SoulScope Canon | v1.3 | `docs/canonical/The SoulScope Canon v1.3.pdf` | CURRENT GOVERNING CANON |

## Current Scientific Backend Registries

| Authority | Version | Path | Status |
| --- | --- | --- | --- |
| SoulScope Acoustic Parameter Registry | v0.1 | `docs/canonical/SoulScope Acoustic Parameter Registry v0.1.pdf` | CURRENT |
| SoulScope Evidence Marker Registry | v0.1 | `docs/canonical/SoulScope Evidence Marker Registry.pdf` | CURRENT |
| SoulScope Constellation Dimension Registry | v0.1 | `docs/canonical/SoulScope Constellation Dimension Registry v0.1.pdf` | CURRENT |
| SoulScope Inference Rule Registry | v0.1 | `docs/canonical/SoulScope Inference Rule Registry v0.1.pdf` | CURRENT |
| SoulScope Constellation State Registry | v0.1 | `docs/canonical/SoulScope Constellation State Registry v0.1.pdf` | CURRENT |
| SoulScope Cross-Constellation Interaction Registry | v0.1 | `docs/canonical/SoulScope Cross-Constellation Interaction Registry v0.1.pdf` | CURRENT |
| SoulScope Whole-Scan Pattern Registry | v0.1 | `docs/canonical/SoulScope Whole-Scan Pattern Registry v0.1.pdf` | CURRENT, RESEARCH CANDIDATES CALIBRATION PENDING |
| SoulScope Narrative Registry | v0.1 | `docs/canonical/SoulScope Narrative Registry.pdf` | CURRENT |

## Current Compatible Specifications

These documents remain active only where compatible with the current Canon and registries:

| Specification | Path | Current status |
| --- | --- | --- |
| Backend Foundation Proposal | `architecture/22-backend-foundation.md` | Backend persistence/security scaffold only; not Canon. |
| Canonical Pipeline | `architecture/CANONICAL_PIPELINE.md` | Compatible pipeline summary where aligned with this ledger. |
| Evidence Ledger | `architecture/EVIDENCE_LEDGER.md` | Compatible ledger principle where aligned with Evidence Marker Registry v0.1. |
| Decision Ledger | `architecture/DECISION_LEDGER.md` | Compatible immutable decision principle. |
| Acoustic Measurement Layer | `architecture/ACOUSTIC_MEASUREMENT_LAYER.md` | Compatible measurement boundary where aligned with Acoustic Parameter Registry v0.1. |
| Resonance Signature | `architecture/RESONANCE_SIGNATURE.md` | Compatible only for the acoustic/time-resolved renderer path; superseded wherever it routes Constellation or semantic geometry into the Resonance Signature. |

## Current Backend Architecture

Semantic path:

```text
Raw Audio
  -> Versioned Acoustic Extraction
  -> Signal Quality / Task Qualification
  -> Immutable Acoustic Measurement Record
  -> Evidence Engine
  -> Evidence Ledger
  -> Dimension Inference Engine
  -> 16 Dimension Posterior Objects
  -> Continuous Constellation Geometry
  -> Canonical State / Boundary Blend / Unresolved
  -> Cross-Constellation Interaction Engine
  -> Whole-Scan Pattern Engine
  -> Decision Ledger
  -> Immutable Semantic Result
  -> Narrative Input
```

Visual path:

```text
Qualified Acoustic Measurements(t)
  -> Resonance Rendering Contract
  -> Deterministic Resonance Signature
```

These paths share measurement provenance but must not be collapsed.
