# Phase E.5 Quality And Confidence Audit

Audit date: 2026-08-02

## Current Concepts In Code

| Concept | Current source | Current behavior | Problem | Recommended correction | Safe now |
|---|---|---|---|---|---|
| Capture quality | `backend/corescope/audio/acoustic_extractor.py` `analyze_canonical_audio` | Derived from phonation ratio only: `phonation_time_ratio * 0.65 + 0.28` | Too narrow; no SNR, VAD reliability, clipping, codec, task fit | Add component breakdown | Needs implementation |
| Client capture quality | `frontend/lib/voiceSpectrum.ts` | Weighted active frames, analysis frames, pitch clarity, clipping | Different formula from backend | Two qualities can disagree | Server quality should be canonical |
| Feature quality | `backend/corescope/audio/acoustic_extractor.py` `_measurement` | Same label as capture quality for non-null values; poor for null | Feature reliability is not independent | Use feature-specific quality and availability | Needs implementation |
| Evidence quality | `frontend/lib/observationFramework/buildEvidenceSignals.ts` | Depends on available feature count, lowest raw feature quality, strength | Correlated features treated as independent; prompt duplicates collapsed | Use family coverage and prompt aggregation | Needs implementation |
| Dimension confidence | `frontend/lib/canonicalDimensionEngine.ts` | Mean feature confidence times evidence coverage | Required families not matched by name | Confidence can imply false requirement satisfaction | Needs implementation |
| Constellation confidence | `frontend/lib/canonicalConstellationEngine.ts` | Mean point confidence times coverage | Inherits dimension defects | Calibrate with fixture distribution | Needs implementation |
| Pattern confidence | `frontend/lib/canonicalMeaningEngine.ts` and compatibility pattern engines | Generic meaning confidence from geometry/interactions | Not a full composite pattern confidence | Define composite pattern confidence components | Needs implementation |
| Narrative specificity | `frontend/lib/todaysStoryEngine.ts` | Derived from strongest dimensions and Phase C synthesis | No explicit specificity score | Track specificity separately from confidence | Needs implementation |

## Proven Problems

1. One global backend confidence is copied onto every non-null measurement.
   - Source: `backend/corescope/audio/acoustic_extractor.py`, `analyze_canonical_audio`.
   - Input: any successful canonical audio analysis.
   - Output: all non-null `AcousticFeatureMeasurement.confidence` values equal the scan confidence.
   - Downstream effect: dimensions and evidence cannot distinguish reliable F0 from weaker formants or noisy spectral proxies.
   - Safe correction: add feature-specific confidence metadata while preserving old `confidence` until consumers migrate.

2. Unavailable features can look like poor signal features.
   - Source: `_measurement`.
   - Input: null jitter/shimmer for guided speech.
   - Output: `quality: "poor"`, `confidence: 0`, `rejection_reason: "insufficient_reliable_signal"`.
   - Downstream effect: decision confounds include generic signal failure even when capture quality is good.
   - Safe correction: add `featureAvailability: "task_incompatible"` and `affectsGlobalCaptureQuality: false`.

3. Missing evidence can be globalized.
   - Source: `frontend/lib/canonicalResult.ts`, `decisionRecord`.
   - Input: all missing evidence records and all rejection reasons.
   - Output: global `missingEvidence` and `confounds`.
   - Downstream effect: task-specific feature absence can appear as scan-level limitation.
   - Safe correction: filter task-incompatible unavailable rows out of global confounds.

4. Retry language is too broadly gated.
   - Source: `frontend/pages/results/[id].tsx`.
   - Input: `completeness.invalidRecordings > 0`.
   - Output: repeat/clearer scan messaging.
   - Downstream effect: failed feature calculations may contribute to retry framing if they affect completeness upstream.
   - Safe correction: gate retry copy on unusable capture quality, not feature availability.

## Canonical Confidence Model

Recommended type:

```ts
type ConfidenceBreakdown = {
  signalQuality: number
  taskCompatibility: number
  featureReliability: number
  evidenceCoverage: number
  evidenceAgreement: number
  baselineTrust: number
  temporalSupport: number
  boundaryDistance: number
}
```

Rules:

- Capture quality must not include task-specific feature availability.
- Feature quality must be feature-specific.
- Evidence quality must require independent families, not just feature count.
- Dimension confidence must expose requirement coverage, agreement, and missingness.
- Constellation confidence must include boundary distance.
- Pattern confidence must include state certainty, interaction support, and unresolved evidence.
- Narrative specificity must be separate and should fall when evidence is generic or unresolved.

## Immediate Safe Fixes

No production behavior changes were made in this phase. Characterization tests were added to freeze the current defects before remediation.

