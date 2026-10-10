# Result narrative reference review

Reviewed October 10, 2026. Controlling authority: SoulScope Canon Set v2.0.
Original repository was inspected through a separate reference checkout; no original source or remote ref was changed.

## Exact reference

Original: `Lahainalindsay/SoulScope`, main and SoulscopeV2 head `dee71405b419bea3bf4df53714e21a6eb10bb310` (July 31, 2026).
All original remote branch heads were inspected; none is newer than this head.
The result changes closest to the owner's requested experience are:

- `5231e13`: Today's Story engine (July 29 in Hawaiʻi).
- `cf6ba09`: render Today's Story in results hero (July 30 in Hawaiʻi).
- `15ff273`: translate canonical boundary narratives (July 29 in Hawaiʻi).

Relevant original files:

- `frontend/lib/todaysStoryEngine.ts`: theme/title, essence, reflection, daily-life examples, worth noticing, next step, trace.
- `frontend/components/HumanReflectionOverview.tsx`: the reflection and examples presentation.
- `frontend/components/ResonanceResultsDashboard.tsx`: theme and reflection in the hero.
- `frontend/lib/buildSoulScopeReport.ts`: multiple concurrent report engines.
- `frontend/lib/data/v2/getScanResultViewModel.ts`: browser rebuilds report from the stored raw result and overlays saved/history records.
- `frontend/lib/canonicalDimensionEngine.ts`: frontend weights, normalization, fabricated posterior interval and publication cutoffs.
- `frontend/lib/vocalStateProfile.ts`: independently computed emotion indicators; absent values default to 0.5; connected-speech jitter/shimmer feed instability.
- `backend/corescope/audio/acoustic_extractor.py`: Praat/Parselmouth, WebRTC VAD, spectral summaries. Useful reference for richer extraction, subject to new contracts and tests.
- `frontend/lib/voiceAnalysisProvider.ts`: performs server acoustic analysis and a separate browser spectrum analysis. Do not reproduce this double analysis path.

## What to retain

User experience: a current-moment theme, 3–5 sentences of reflection, three distinct daily-life examples, one open question, and optional alternatives. Technical traces belong on the details page. Tone and section structure are reference material; source text is not automatically eligible for every recorded person.

Clean already contains `ReflectionNarrativeV1` and a score-free renderer for that presentation. The missing component is a scientifically eligible producer, not another frontend narrative engine.

## Actual measurement gap

The latest saved Clean measurement record has 11 non-null feature types for each of three responses. Several are duplicates or quality measures: voiced/speech and quiet/silence ratios reuse the same energy detector. It does not contain the complete original feature set.

Clean's zero-crossing quantity is a provisional estimate, not a tracked F0 contour. The spectral centroid implementation samples the first 1024 samples and the first 64 frequency bins. With a 16 kHz capture, that is the opening 64 ms and frequencies through 1 kHz, not a full-response spectrum. Formants are unavailable. The optional Praat and WebRTC dependencies are declared but are not used by the active extractor.

The active Dimension engine stores every dimension unresolved, with no value/posterior/confidence and no validated calibration. Finalization stores an unavailable report. The last deployed quiet-audio summary is a separate bounded recording description; it is not the intended personal reflection and must not be expanded into psychological claims merely by replacing words.

## Scientific conflicts in the reference

Canon v2.0 §§04–07 requires one server-owned immutable source, qualified evidence, governed meaning selection and publication gates. Missing values cannot become neutral values. State names and emotional claims require calibrated eligibility; future-prompt wording cannot establish recovery. Connected-speech jitter/shimmer are excluded from production inference.

The original frontend's hard-coded weights and cutoffs have no validation record in the inspected runtime modules. Its `fallbackStory` supplies personal-sounding claims even without eligible dimensions. These rules and fallbacks cannot be ported as established scientific inference. The local file/branch named emotion-logic is a SoulScope heuristic, not proof that an external Emotion Logic provider is configured.

## Smallest honest integration sequence

1. Improve extraction in the existing Python worker, using a single governed profile with real frame support, F0 tracking, full-response spectral analysis, explicit nulls and units. Preserve raw audio hashes and old result versions. Do not alter capture or Signature.
2. Register and test the new feature version in backend and shared contracts; add Evidence support with correctly declared families, temporal scopes and correlated-feature handling. Keep diagnostic/experimental features excluded from psychological inference until eligible.
3. Define and evaluate the missing Dimension/meaning calibration against participant-separated reference data. No dataset, model-specific validation results or approved publish thresholds were found in Clean or the inspected original runtime path. This is an external scientific input, not an environment variable to flip.
4. Publish one backend-produced `ReflectionNarrativeV1` using approved selected/suppressed meaning units and immutable evidence/decision references. Reuse the original human section structure and compatible language, with prohibited-language validation. The frontend only renders it.
5. Remove the quiet-audio description from the primary reflection experience when that eligible producer is live; retain it in technical details if useful.

## Proposed implementation files

- `backend/app/acoustics/extractor.py`, a governed frame-analysis module, and `backend/app/acoustics/registry.py`.
- `backend/app/config.py` and backend dependency pins for a new extractor version.
- `packages/canonical-contracts/src/acousticParameters.ts` and feature contract tests.
- `backend/app/evidence/engine.py` and evidence tests for the new feature profile.
- A backend meaning registry/producer plus narrative tests; publication requires approved meaning predicates and calibration records.
- A versioned finalization migration for appending new results, only once the new producer is eligible.
- `frontend/components/results-view.tsx` to consume the narrative as its main reflection, keeping raw observations in `/details`.

Do not copy `buildSoulScopeReport`, `vocalStateProfile`, or frontend scoring into Clean. Do not add another competing inference path. Do not label heuristic cutoffs validated. No implementation or new production publication has been made by this review.
