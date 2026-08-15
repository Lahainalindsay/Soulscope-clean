# Phase E.5 Final Scientific Audit

Audit date: 2026-08-02

## Executive Verdict

The current pipeline is engineering-coherent enough to produce deterministic reports, persist traceable rows, and render the current results UI. It is not yet scientifically coherent enough to claim fully calibrated Bible-point states or perturbation-based voice quality across connected speech.

Production-safety verdict: blocked for stronger accuracy claims and blocked for broad cleanup/removal. Usable only with cautious reflection language, debug traceability, and clear limits.

User-readiness verdict: partially user-ready for reflective, non-diagnostic storytelling; not ready for stronger measurement claims until quality semantics, evidence independence, and blend calibration are corrected.

## P0 Release Blockers

1. Task-incompatible jitter/shimmer are encoded as poor generic feature failures.
   - Source: `backend/corescope/audio/acoustic_extractor.py`, `_measurement` and `_pitch_and_praat_features`.
   - Input: guided/connected speech recording.
   - Output: null jitter/shimmer rows with `quality: "poor"`, `confidence: 0`, `rejection_reason: "insufficient_reliable_signal"`.
   - Downstream effect: canonical decision missingness/confounds can imply signal failure despite good capture quality.
   - Correction: implement `QualitySemantics` with `featureAvailability: "task_incompatible"` and `affectsGlobalCaptureQuality: false`.
   - Safe immediately: no, requires schema/consumer migration or compatibility adapter.

2. Client compatibility analyzer can reintroduce connected-speech jitter/shimmer.
   - Source: `frontend/lib/voiceSpectrum.ts`, `analyzeVoiceSpectrum`, `mergeVoiceAnalyses`; `frontend/lib/observationFramework/buildRawFeatures.ts`.
   - Input: original browser blob from guided speech.
   - Output: `jitterLocalPct` and `shimmerLocalPct` compatibility dynamics.
   - Downstream effect: V2 evidence and old personalization can use perturbation proxies even when server canonical path gated them.
   - Correction: task-gate client perturbation or mark developer-only outside sustained vowels.
   - Safe immediately: yes if guarded with regression tests, but should be approved because report scores may change.

3. Dimension requirements do not enforce named independent evidence families.
   - Source: `frontend/lib/canonicalDimensionEngine.ts`.
   - Input: canonical evidence records.
   - Output: 16 dimension scores with coverage from generic family count.
   - Problem: required family names like challenge/recovery, baseline, and time-on-task are not matched.
   - Downstream effect: dimensions can resolve without their stated scientific requirements.
   - Correction: replace coverage count with explicit requirement satisfaction.
   - Safe immediately: no, will change many results.

## P1 Accuracy Issues

- `frontend/lib/observationFramework/buildEvidenceSignals.ts` collapses duplicate feature IDs across prompts to the last feature via `Map`.
- Backend non-null measurements share one global confidence.
- Evidence rules use correlated features as if independent.
- Several rules infer human state directly from one acoustic family.
- Baseline trust is absent from canonical dimensions.
- Boundary-blend thresholds are uncalibrated against a fixture distribution.
- Meaning engine emits generic pattern identities for blends.

## P2 Quality Improvements

- Make Today's Story the only primary visible story.
- Remove repeated `story.reflection` between hero and overview.
- Hide story candidates, atlas details, and technical debug behind explicit debug/feedback affordances.
- Surface baseline comparisons only when meaningful and natural.
- Lazy-load `DeveloperAnalysisDebug`, feedback, and audit details.

## P3 Cleanup

- Mark unused acoustic variants developer-only before removal.
- Audit root `frontend/components/ResonanceSignature.tsx` imports before deleting.
- Keep archived migrations; do not remove applied migration history.
- Do not delete compatibility report fields until hydration and persistence migrations are complete.

## Proven Root Causes

| Root cause | Evidence |
|---|---|
| Feature availability and feature quality are conflated | `_measurement` turns null into poor/0/generic rejection |
| Capture quality and feature quality are conflated | backend copies scan confidence to non-null measurements |
| Server and client analyzers have different task semantics | server gates Praat jitter/shimmer; client computes proxies for all captures |
| Prompt protocol is not consistently represented | V2 evidence collapses duplicate feature IDs; canonical dimensions do not enforce ordered challenge/recovery requirements |
| Pattern synthesis is incomplete | meaning engine uses generic Boundary transition/Cross-constellation labels instead of deterministic composite pattern objects |
| Visible narrative has multiple surfaces | dashboard, overview, story candidates, Phase C insights can all publish story-like text |

## Proposed Fix Order

1. Add `QualitySemantics` and feature-specific confidence to backend response while preserving old fields.
2. Gate perturbation features by capture task in both server and client paths.
3. Filter task-incompatible unavailable features out of global confounds and retry language.
4. Aggregate prompt-specific raw features by capture kind before V2 evidence scoring.
5. Implement named independent evidence family requirements for the 16 dimensions.
6. Generate synthetic audio fixtures and measure boundary blend rates.
7. Implement deterministic composite pattern identity after state calibration.
8. Collapse visible narrative to one story source and lazy-load audit/debug detail.
9. Reduce duplicated persistence payload after hydration is proven stable.

## Files To Change

- `backend/corescope/audio/acoustic_contract.py`
- `backend/corescope/audio/acoustic_extractor.py`
- `frontend/lib/acousticContract.ts`
- `frontend/lib/voiceSpectrum.ts`
- `frontend/lib/voiceAnalysisProvider.ts`
- `frontend/lib/observationFramework/buildRawFeatures.ts`
- `frontend/lib/observationFramework/buildEvidenceSignals.ts`
- `frontend/lib/observationFramework/evidenceDefinitions.ts`
- `frontend/lib/canonicalResult.ts`
- `frontend/lib/canonicalDimensionEngine.ts`
- `frontend/lib/canonicalConstellationEngine.ts`
- `frontend/lib/canonicalMeaningEngine.ts`
- `frontend/lib/todaysStoryEngine.ts`
- `frontend/components/ResonanceResultsDashboard.tsx`
- `frontend/components/HumanReflectionOverview.tsx`
- `frontend/pages/results/[id].tsx`
- `frontend/lib/data/v2/persistSoulScopeV2Result.ts`
- `frontend/lib/data/v2/getScanResultViewModel.ts`

## Files To Remove

No additional files are proven safe to remove by this audit. Prior cleanup/archive changes exist in the working tree, but Phase E.5 did not validate those removals as production-final.

## Migration Requirements

- Add optional quality semantics fields to acoustic measurement persistence.
- Add feature confidence component columns or JSON breakdown.
- Add task compatibility and availability fields to raw feature/evidence rows.
- Add canonical report version marker for post-audit results.
- Add debug/audit payload storage strategy before removing derived copies.

## Test Gaps

Added:

- `frontend/tests/phaseE5ScientificAudit.test.ts`

Still missing:

- Real/synthetic clean sustained vowel audio.
- Clean connected speech audio.
- Quiet connected speech audio.
- Expressive speech audio.
- Low voiced duration audio.
- Clipped audio.
- Noisy audio.
- Pitch outside configured range.
- Backend unit tests for new quality semantics.
- Fixture-level boundary-blend distribution tests.
- Payload byte-size regression tests.

## Expected Impact

Estimated after the proposed fixes:

- Accuracy improvement: medium to high, primarily by preventing unsupported resolved dimensions.
- Quality-message correctness: high, especially for perturbation and retry language.
- Blend reduction: unknown until fixture distribution is measured; likely moderate if requirements and confidence are corrected.
- Narrative clarity: medium, by removing duplicate story surfaces.
- Processing time: low to moderate improvement if client compatibility analysis is reduced.
- Payload reduction: moderate to high after audit/debug lazy-loading and persistence deduplication.

## Validation Results

Validation on current working tree before docs/tests:

- `npm test`: passed, 214 passing.
- `npm run lint`: passed.
- `./node_modules/.bin/tsc --noEmit`: passed.
- `backend/.venv/bin/pytest`: passed, 34 passing.

Validation after Phase E.5 docs/tests:

- `npm test`: passed, 220 passing.
- `npm run lint`: passed.
- `./node_modules/.bin/tsc --noEmit`: passed.
- `npm run build`: failed without env at page-data collection because `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` were missing.
- `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=phase-e5-audit-placeholder npm run build`: passed.
- `backend/.venv/bin/pytest`: passed, 34 passing.
- `git diff --check`: passed.

## Implementation Gate

Stop after this audit. Do not implement the proposed engine changes, remove files, commit, push, merge, or deploy until the owner approves the fix sequence.
