# Phase E.5 Performance And Payload Audit

Audit date: 2026-08-02

## Measured Validation Timings

Measurements are from the current local sandbox and should not be treated as production benchmarks.

| Command | Result | Approx duration |
|---|---|---:|
| `npm test` before Phase E.5 tests | passed | 207 s |
| `npm run lint` | passed | not timed |
| `./node_modules/.bin/tsc --noEmit` | passed | not timed |
| `backend/.venv/bin/pytest` | passed | 114 s |

Production build and final validation are recorded in `architecture/11-phase-e5-final-audit.md` after the audit files are created.

## Active Per-Scan Cost Centers

| Layer | Source | Cost | Problem | Recommendation |
|---|---|---|---|---|
| Client audio analysis | `frontend/lib/voiceSpectrum.ts` | Browser decode, Meyda frames, compatibility dynamics | Duplicates server extraction | Keep only for local preview/compatibility until migrated |
| Server audio analysis | `backend/corescope/audio/acoustic_extractor.py` | Decode, resample, VAD, Praat, spectral features | Correct authoritative cost | Keep |
| Prompt merge | `frontend/lib/voiceSpectrum.ts` | Weighted merge across prompts | Can mix task-incompatible compatibility metrics | Restrict merged compatibility metrics |
| Report generation | `frontend/lib/buildSoulScopeReport.ts` | Runs compatibility, observation, canonical, Phase C, story engines | Repeated overlapping semantics | Define single canonical report surface |
| Persistence | `frontend/lib/data/v2/persistSoulScopeV2Result.ts` | Many table writes per scan | Duplicated canonical/derived data | Persist canonical source plus audit rows only where needed |
| Hydration | `frontend/lib/data/v2/getScanResultViewModel.ts` | Rebuilds view model from rows | Multiple fallback paths | Document priority and remove old fallbacks after migration |
| Rendering | `frontend/components/ResonanceResultsDashboard.tsx` | Signature renderer, dashboard, debug, feedback, check-in | Debug and feedback render on every result page | Lazy-load debug and non-core panels |

## Extracted But Weakly Or Never Used

Likely debug/developer-only features:

- Jitter variants except local.
- Shimmer variants except local.
- Pitch floor/ceiling used.
- F0 p20/p80 in production scoring.
- Formant per-band medians/IQRs beyond derived stability/dynamics.
- Spectral slope.
- CPP proxy.
- Zero crossing rate except compatibility/debug.
- Musical note/cymatic compatibility fields still present in old report paths.

Do not delete these until migrations and consumers are checked. Mark them developer-only first.

## Duplicated Payload Fields

Observed duplicate or overlapping payload sections:

- `scan.canonicalAcoustic` and `analysisDebug.promptAnalyses[*].canonicalAcoustic`.
- Raw acoustic measurements persisted and embedded in report diagnostics.
- Canonical result evidence, dimension, decision, geometry, interactions, and meaning are embedded in `canonicalResult`.
- Derived diagnostics are also persisted in `scan_interpretation_diagnostics`.
- Reflection variants and Today's Story both hold user-facing narrative material.
- Local storage copy is written during scan analysis for recovery.

Sample payload:

- Existing `sample-canonical-result.json` in the working tree is approximately 134 KB.

Recommendation:

- Keep raw canonical measurements and canonical result as the source of truth.
- Move detailed ledgers, prompt analyses, and renderer debug manifests behind an audit/debug fetch.
- Avoid persisting repeated derived copies unless required for immutable report reproduction.

## Database Writes Per Scan

Approximate active write count from code inspection: 13 to 15 writes per completed scan, depending on diagnostic fallback and baseline refresh availability.

High-priority review:

- `scan_sessions.raw_result`
- `scan_interpretation_diagnostics`
- canonical acoustic tables
- `raw_feature_measurements`
- `evidence_signals`
- `dimension_ledger`
- `decision_ledger`
- `reflection_variants`

Traceability should be preserved, but redundant derived copies can be reduced after canonical hydration is stable.

