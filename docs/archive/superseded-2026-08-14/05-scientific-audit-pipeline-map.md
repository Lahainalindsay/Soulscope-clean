# Phase E.5 Scientific Audit Pipeline Map

Audit date: 2026-08-02

Repository state audited: current working tree on `feature/resonance-signature-visual-truth`, not a clean `main` checkout. The worktree already contains cleanup/archive changes and renderer changes. Findings below describe the active files in this working tree.

## Executive Map

```text
Browser MediaRecorder
  -> frontend/components/Recorder.tsx
  -> frontend/pages/scan/question/[step].tsx
  -> local guided scan answer storage
  -> frontend/pages/scan/analyzing.tsx
     -> frontend/lib/voiceAnalysisProvider.ts
        -> frontend/lib/serverAcousticAnalysis.ts
           -> Supabase Storage scan-audio upload
           -> backend/main.py /api/acoustic/analyze
              -> backend/corescope/audio/acoustic_extractor.py
              -> backend/corescope/engine/evidence.py
        -> frontend/lib/voiceSpectrum.ts
     -> frontend/lib/voiceSpectrum.ts mergeVoiceAnalyses
     -> frontend/lib/buildSoulScopeReport.ts
        -> frontend/lib/observationFramework/*
        -> frontend/lib/canonicalResult.ts
           -> frontend/lib/canonicalDimensionEngine.ts
           -> frontend/lib/canonicalConstellationEngine.ts
           -> frontend/lib/canonicalInteractionEngine.ts
           -> frontend/lib/canonicalMeaningEngine.ts
           -> frontend/lib/resonanceSignature/mapper.ts
        -> frontend/lib/todaysStoryEngine.ts
     -> frontend/lib/reportPersistence.ts
        -> frontend/lib/data/v2/persistSoulScopeV2Result.ts
  -> frontend/pages/results/[id].tsx
     -> frontend/lib/data/v2/getScanResultViewModel.ts
     -> frontend/components/ResonanceResultsDashboard.tsx
     -> frontend/components/HumanReflectionOverview.tsx
     -> frontend/components/resonanceSignature/ResonanceSignature.tsx
```

## Stage Inventory

| Stage | Source file | Function or rule | Input | Output | Active callers | Problem | Downstream effect | Recommended correction | Safe now |
|---|---|---|---|---|---|---|---|---|---|
| Raw audio capture | `frontend/components/Recorder.tsx` | recorder state machine | microphone stream | WebM/WAV blob per prompt | `frontend/pages/scan/question/[step].tsx` | Capture format is browser-dependent before canonical conversion | Server receives a normalized WAV but client analyzer may analyze original blob | Keep, but record original mime/codec in audit metadata | Yes |
| Prompt orchestration | `frontend/pages/scan/analyzing.tsx` | `runAnalysis` effect | three guided answers | prompt analyses, merged scan, persisted report | page mount | Sequential, two analysis paths per prompt | Server canonical and client compatibility can disagree | Make server canonical authoritative for decision features | Needs approval |
| Server upload | `frontend/lib/serverAcousticAnalysis.ts` | `analyzeAudioOnServer` | browser blob | Supabase storage path plus canonical response | `SoulScopeAcousticProvider.analyzeFile` | Original upload retained in Storage; backend also writes private canonical WAV | Duplicated audio retention surfaces | Define retention lifecycle per storage path | Needs approval |
| Backend route | `backend/main.py` | `/api/acoustic/analyze` | WAV upload plus scan ownership | `AcousticAnalysisResponse` | frontend server acoustic adapter | Allows only WAV after frontend conversion | Good boundary | Keep | Yes |
| Acoustic extraction | `backend/corescope/audio/acoustic_extractor.py` | `analyze_canonical_audio` | canonical mono 16 kHz WAV | measurements, VAD, quality, confidence | backend route | One global confidence and quality copied onto non-null measurements | Feature-specific reliability is obscured | Add feature-specific confidence breakdown | Needs implementation |
| Backend evidence audit | `backend/corescope/engine/evidence.py` | `build_evidence_ledger` | acoustic measurements | backend `EvidenceLedger` | backend route | Ledger is audit/debug only and not the frontend decision ledger | Two ledgers can be confused | Rename/document backend ledger as extraction audit ledger | Yes |
| Client spectrum compatibility | `frontend/lib/voiceSpectrum.ts` | `analyzeVoiceSpectrum` | original blob | `VoiceAnalysisResult` with note, spectrum, voice dynamics | `voiceAnalysisProvider.ts` | Computes jitter/shimmer proxy for connected speech | Task-incompatible perturbation can reenter compatibility report | Gate perturbation by task or mark developer-only | Needs approval |
| Prompt merge | `frontend/lib/voiceSpectrum.ts` | `mergeVoiceAnalyses` | prompt `VoiceAnalysisResult[]` | merged compatibility scan | `scan/analyzing.tsx` | Weighted merged dynamics include client jitter/shimmer | Compatibility data can influence old engines | Exclude perturbation outside sustained vowels | Needs approval |
| Raw feature bridge | `frontend/lib/observationFramework/buildRawFeatures.ts` | `buildRawFeatures` | canonical and client features | raw feature rows | `buildObservationPipeline` | Server null rows are excluded, but client fallback can fill same aliases when server has no approved alias | Compatibility fallback can defeat server task gating | Track alias provenance and task compatibility | Needs approval |
| Evidence signals | `frontend/lib/observationFramework/buildEvidenceSignals.ts` | `buildEvidenceSignals` | raw features | V2 evidence signals | observation pipeline | `Map(featureId)` collapses prompt-specific duplicate features to last value | Three-prompt protocol is not aggregated for V2 evidence | Aggregate by capture kind/prompt before evidence scoring | Needs approval |
| Evidence rules | `frontend/lib/observationFramework/evidenceDefinitions.ts` | `EVIDENCE_DEFINITIONS` | raw features | 9 evidence signals | observation pipeline | Correlated features are counted like independent evidence | Confidence can be overstated | Require independent family coverage per rule | Needs approval |
| Dimension engine | `frontend/lib/canonicalDimensionEngine.ts` | `buildCanonicalDimensions` | canonical evidence rows | 16 Bible point records | `canonicalResult.ts` | Required family names are not actually matched to feature families | Task/baseline requirements are not enforced | Replace count coverage with named requirement satisfaction | Needs approval |
| Constellation geometry | `frontend/lib/canonicalConstellationEngine.ts` | `buildConstellationGeometry` | 16 dimensions | state decisions, geometry, blend | `canonicalResult.ts` | Boundary margin threshold is fixed and no temporal movement is implemented | Common boundary blends can become generic | Calibrate with fixture distribution | Needs approval |
| Interactions | `frontend/lib/canonicalInteractionEngine.ts` | `buildCanonicalInteractions` | dimensions and geometry | interaction records | `canonicalResult.ts` | Threshold rules are deterministic but not calibrated against independent evidence | Interaction confidence inherits dimension weaknesses | Keep as audit until calibrated | No |
| Meaning | `frontend/lib/canonicalMeaningEngine.ts` | `buildCanonicalMeaning` | geometry/interactions/dimensions | primary meaning | `canonicalResult.ts` | Generic labels: Boundary transition, Cross-constellation pattern candidate | Pattern identity is not user-specific | Implement deterministic composite pattern model after audit | Needs approval |
| Today story | `frontend/lib/todaysStoryEngine.ts` | `buildTodaysStory` | canonical result and Phase C | visible human story | report/dashboard | Strong visible filtering, but may incorporate Phase C summary also shown elsewhere | Duplicate storyline surfaces | Single story source contract | Needs approval |
| Report assembly | `frontend/lib/buildSoulScopeReport.ts` | `buildSoulScopeReport` | merged scan | large compatibility plus canonical report | scan analyzing, hydration | Many legacy and canonical outputs coexist | Payload duplication and competing semantics | Preserve canonical report, lazy-load audit details | Needs approval |
| Persistence | `frontend/lib/data/v2/persistSoulScopeV2Result.ts` | `persistSoulScopeV2Result` | report and scan | many DB writes | `reportPersistence.ts` | Raw report, acoustic tables, ledgers, diagnostics, variants duplicate derived data | Payload and schema review burden | Keep canonical source, move audit copies behind debug flag | Needs migration |
| Results hydration | `frontend/lib/data/v2/getScanResultViewModel.ts` | view model hydration | V2 DB rows | report and scan | results page | Reconstructs canonical and compatibility fields | Hydration priority can preserve old fields | Document authoritative order | Yes |
| Results render | `frontend/components/ResonanceResultsDashboard.tsx` | dashboard render | report | visible UI | results page | Renders Today's Story plus details and story candidates | Users can see multiple narrative layers | Hide audit/variant details by default | Needs approval |
| Human reflection | `frontend/components/HumanReflectionOverview.tsx` | reflection overview | Today's Story plus Phase C | visible UI | dashboard | Uses `story.reflection` again and adds Phase C discoveries | Repetition risk | Make it a continuation, not a duplicate | Needs approval |
| Resonance Signature | `frontend/components/resonanceSignature/ResonanceSignature.tsx` | visual renderer | canonical result object | SVG/canvas visual | dashboard | Consumes canonical mapper; root-level renderer also exists as compatibility | Mostly aligned | Remove compatibility import paths only after audit | No |

## Authoritative Engines

Authoritative current production path:

- Acoustic source of truth: `backend/corescope/audio/acoustic_extractor.py`
- Canonical result object: `frontend/lib/canonicalResult.ts`
- Bible point engine: `frontend/lib/canonicalDimensionEngine.ts`
- Constellation geometry: `frontend/lib/canonicalConstellationEngine.ts`
- Resonance Signature app mapper: `frontend/lib/resonanceSignature/mapper.ts`
- Resonance Signature math/render package: `packages/resonance-renderer/`
- Visible story: `frontend/lib/todaysStoryEngine.ts`

Still active compatibility engines:

- `frontend/lib/voiceSpectrum.ts`
- `frontend/lib/resonancePatterns.ts`
- `frontend/lib/canonicalPattern.ts`
- `frontend/lib/patternAtlas.ts`
- `frontend/lib/patternPersonalization.ts`
- `frontend/lib/resonanceNarrativeEngineV3.ts`
- `frontend/lib/vocalStateProfile.ts`
- `frontend/lib/atlasRuntime.ts`

Audit/debug only outputs:

- `backend/corescope/engine/evidence.py` evidence ledger
- `frontend/components/DeveloperAnalysisDebug.tsx`
- Diagnostics rows in `scan_interpretation_diagnostics`
- `analysisDebug.promptAnalyses`
- Resonance renderer debug panels and fixture manifests

Legacy paths that can still affect published results:

- Client `voiceSpectrum.ts` dynamics still feed compatibility engines and can fill raw feature aliases.
- `resonancePatterns.ts`, `canonicalPattern.ts`, and narrative V3 still feed compatibility report fields, story candidates, diagnostics, and some presentation fields.
- `patternPersonalization.ts` still uses shimmer and HNR from compatibility dynamics.

Frontend canonical versus compatibility renderers:

- Canonical: `frontend/components/resonanceSignature/ResonanceSignature.tsx` using canonical result object and mapper.
- Compatibility/root: `frontend/components/ResonanceSignature.tsx` exists and should be audited for active imports before removal.
- Current results dashboard uses the canonical nested renderer.

## Persistence Writes Per Completed Scan

Active writes observed from `frontend/lib/data/v2/persistSoulScopeV2Result.ts` and `frontend/lib/reportPersistence.ts`:

1. `scan_sessions` processing update.
2. `sensor_captures`.
3. Canonical acoustics persistence.
4. `raw_feature_measurements`.
5. `evidence_signals`.
6. `observations`.
7. `domain_results`.
8. `pattern_matches`.
9. `reflection_variants`.
10. `scan_interpretation_diagnostics`.
11. `evidence_ledger` or diagnostic equivalent.
12. `dimension_ledger` or diagnostic equivalent.
13. Final `scan_sessions` result update.
14. Personal pattern baseline refresh.
15. Personal acoustic baseline refresh.

This count is approximate because fallback paths depend on schema availability.

