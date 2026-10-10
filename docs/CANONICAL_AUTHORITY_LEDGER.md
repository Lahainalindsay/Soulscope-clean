# SoulScope Canonical Authority Ledger

Status: CURRENT AUTHORITY INDEX
Current decision authority confirmed for Language System v1: 2026-10-09

**SoulScope Canon Set v2.0 controls all new implementation decisions.** The
owner-provided `SoulScope_Canon_Set_v2.0_CURRENT_2026-08-13.pdf` was read in full.
The v1.3 Canon and companion documents below are retained implementation-source
provenance only; they do not override v2.0. Historical result manifests and source
references are not rewritten by this authority correction.

See `docs/LANGUAGE_SYSTEM_V1.md` for the new narrative contract and its limits.

This ledger records current owner authority and retained implementation provenance. Older source files may remain at their original paths for reproducibility; their location does not confer current authority.

## Authority Order

1. Scientific safety, personal agency, privacy, and immutable Evidence to Decision to Result contracts.
2. SoulScope Canon Set v2.0.
3. Versioned registries and compatible specifications only where consistent with Canon Set v2.0.
4. Current compatible implementation, validation, privacy, security, rendering, interface, and route-level specifications where they do not conflict with the Canon or companion registries.
5. Executable implementation.

No lower layer may override a higher layer. Archived files are not current authority.

## Current Governing Canon

| Authority | Version | Path | Status |
| --- | --- | --- | --- |
| SoulScope Canon Set | v2.0 | Owner-provided `SoulScope_Canon_Set_v2.0_CURRENT_2026-08-13.pdf` | CURRENT GOVERNING CANON |
| Earlier implementation Canon | v1.3 | `docs/canonical/The SoulScope Canon v1.3.pdf` | HISTORICAL IMPLEMENTATION PROVENANCE |

## Retained Scientific Backend Registry Sources

| Authority | Version | Path | Status |
| --- | --- | --- | --- |
| SoulScope Acoustic Parameter Registry | v0.1 | `docs/canonical/SoulScope Acoustic Parameter Registry v0.1.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |
| SoulScope Evidence Marker Registry | v0.1 | `docs/canonical/SoulScope Evidence Marker Registry.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |
| SoulScope Constellation Dimension Registry | v0.1 | `docs/canonical/SoulScope Constellation Dimension Registry v0.1.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |
| SoulScope Inference Rule Registry | v0.1 | `docs/canonical/SoulScope Inference Rule Registry v0.1.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |
| SoulScope Constellation State Registry | v0.1 | `docs/canonical/SoulScope Constellation State Registry v0.1.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |
| SoulScope Cross-Constellation Interaction Registry | v0.1 | `docs/canonical/SoulScope Cross-Constellation Interaction Registry v0.1.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |
| SoulScope Whole-Scan Pattern Registry | v0.1 | `docs/canonical/SoulScope Whole-Scan Pattern Registry v0.1.pdf` | IMPLEMENTATION SOURCE; CALIBRATION PENDING; SUBORDINATE TO v2.0 |
| SoulScope Narrative Registry | v0.1 | `docs/canonical/SoulScope Narrative Registry.pdf` | IMPLEMENTATION SOURCE; SUBORDINATE TO v2.0 |

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
