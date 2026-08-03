# Canonical Pipeline

SoulScope Clean implements one production path:

```text
Raw Audio
  -> Canonical Audio Decode
  -> Versioned Acoustic Measurements
  -> Evidence Engine
  -> Immutable Evidence Ledger
  -> Canonical Dimension Engine
  -> Continuous Constellation Geometry
  -> State / Composite / Unresolved Decision
  -> Cross-Constellation Interactions
  -> Pattern / Meaning
  -> Decision Ledger
  -> One Immutable Canonical Result Object
  -> One Story Engine
  -> One User Report
  -> One Resonance Signature Renderer
```

## Invariants

1. Raw acoustic features are measurements, not emotions.
2. No dimension, state, story, or visual can bypass the Evidence Ledger.
3. Missing evidence remains missing.
4. Rejected evidence remains rejected.
5. Capture quality and feature availability are separate concepts.
6. Jitter and shimmer unavailability may not downgrade a good connected-speech capture.
7. Prompt-level evidence remains distinct until an explicit aggregation rule runs.
8. Relational Availability remains unresolved for monologue-only prompt protocols.
9. The renderer is downstream only and may not interpret audio, select patterns, or create meaning.
10. Every persisted result carries schema, engine, registry, extractor, and rule versions.

## Canonical Result Contract

```ts
export type CanonicalScanResult = {
  schemaVersion: string;
  engineVersion: string;
  registryVersion: string;
  ruleVersion: string;
  scan: ScanMetadata;
  captureQuality: CaptureQuality;
  promptCaptures: PromptCapture[];
  acousticMeasurements: AcousticMeasurement[];
  evidenceLedger: EvidenceLedger;
  dimensions: DimensionResult[];
  constellations: ConstellationResult[];
  interactions: InteractionResult[];
  compositePattern: CompositePatternResult | null;
  decisionLedger: DecisionLedger;
  story: TodayStory;
  resonanceSignature: ResonanceSignatureParameters;
};
```

Every result surface consumes this object. The clean repository must not introduce report V1, report V2, normalized report, compatibility report, separate narrative result, or separate visual interpretation result.
