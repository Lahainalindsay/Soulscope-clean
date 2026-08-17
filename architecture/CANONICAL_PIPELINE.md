# Canonical Pipeline

SoulScope Clean implements one semantic production path and one separate visual rendering path.

Semantic path:

```text
Raw Audio
  -> Versioned Acoustic Extraction
  -> Signal Quality / Task Qualification
  -> Immutable Acoustic Measurement Record
  -> Evidence Engine
  -> Immutable Evidence Ledger
  -> Dimension Inference Engine
  -> 16 Dimension Posterior Objects
  -> Continuous Constellation Geometry
  -> Canonical State / Boundary Blend / Unresolved
  -> Cross-Constellation Interactions
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

## Invariants

1. Raw acoustic features are measurements, not emotions.
2. No dimension, state, narrative, or semantic result can bypass the Evidence Ledger.
3. Missing evidence remains missing.
4. Rejected evidence remains rejected.
5. Capture quality and feature availability are separate concepts.
6. Jitter and shimmer unavailability may not downgrade a good connected-speech capture.
7. Prompt-level evidence remains distinct until an explicit aggregation rule runs.
8. Recovery, Reserve, and Relational Availability remain unresolved under the current three-prompt protocol.
9. The renderer receives qualified acoustic measurements over time and may not consume Constellation scores, State scores, Pattern scores, or semantic interpretations as geometry inputs.
10. Every persisted result carries schema, engine, registry, extractor, and rule versions.

## Canonical Result Contract

```ts
ImmutableScanResult
  acquisitionRecord
  measurementRecord
  semanticResult
    evidenceLedger
    dimensions
    constellationGeometry
    statesOrBlends
    qualifiers
    interactions
    pattern
    decisionLedger
  resonanceRenderingRecord
  versionManifest
```

Every semantic result surface consumes the immutable semantic result. The Resonance Signature consumes the separate acoustic/time-resolved rendering record. The clean repository must not introduce report V1, report V2, normalized report, compatibility report, separate narrative reasoning, or separate visual interpretation result.
