# SoulScope Clean: current backend configuration

Snapshot: October 10, 2026, before the measurement upgrade authorized today.
Source: Clean main commit `60ccc2aba01fc759d45a2ce124f0aab53d1466d7`.
Controlling authority: SoulScope Canon Set v2.0. This report describes existing behavior, not proposed behavior.

## What is actually operating

SoulScope Clean has one Python/FastAPI worker and a Supabase-backed result pipeline. The frontend is a separate Next.js application. The Vercel project inventory confirms `soulscope-clean` and `soulscope-backend`; the worker project declares FastAPI. Repository deployment configuration sets the worker root to `backend`, entrypoint `app.main:app`, Python 3.12, and a 300-second function budget. The report does not expose credentials or claim to have re-verified every live environment value.

The browser records three 30-second mono PCM16 WAVs at 16 kHz:

1. `P1_OPEN_REFERENCE`
2. `P2_TROUBLING_CONTEXT`
3. `P3_FUTURE_CONTEXT`

The browser registers its scan and captures with Supabase. It posts recordings and capture IDs to the Next.js `/api/process` route. That route verifies the user through Supabase Auth, checks ownership and prompt order using the user's JWT/RLS, validates WAV format, and calls the worker using a server-only `x-worker-token`.

The worker stores private, write-once audio, registers its SHA-256 hash, extracts measurements, saves the MeasurementRecord, builds an Evidence Ledger, builds a Dimension Result, and calls the database finalizer. The finalizer validates the upstream record chain and versions, seals a Semantic Result, and completes the scan lifecycle atomically. Retry paths resume persisted stages rather than creating a second interpretation engine.

Main runtime files: `frontend/lib/server-processing.ts`, `backend/app/main.py`, `backend/app/processing/worker.py`, `backend/app/evidence/service.py`, `backend/app/dimensions/service.py`, `backend/app/results/service.py`, and `supabase/migrations/20261008011431_canonical_result_finalization.sql`.

## Measurements emitted per response today

There are 12 feature slots per response, normally 11 numeric values and one explicit unavailable formant slot. Three responses therefore produce 36 slots, normally 33 numeric values. This is not 33 independent indicators.

| Stored feature | What it computes | Current limitation |
|---|---|---|
| `SS_RESPONSE_ONSET_LATENCY` | Time to first 30 ms frame whose RMS reaches 0.01 | Energy activity, not a linguistic response-latency model |
| `SS_PAUSE_LOAD` | Fraction of 30 ms frames below the energy threshold | Quiet audio proxy; unvoiced consonants or quiet speech can be counted as silence |
| `Q_CLIPPING_RATIO` | Fraction of samples with absolute amplitude at least 0.98 | Signal clipping indicator |
| `Q_VOICED_RATIO` | Fraction of frames at or above the energy threshold | Energy activity, not true phonation/F0 voicing |
| `PROVISIONAL_DURATION_MS` | WAV frame count divided by sampling rate | Actual capture duration |
| `PROVISIONAL_RMS_ENERGY` | Root mean square sample amplitude across the recording | Relative digital amplitude; no microphone calibration or perceived-energy inference |
| `PROVISIONAL_PEAK_AMPLITUDE` | Largest absolute sample amplitude | Relative digital peak |
| `PROVISIONAL_ENERGY_SPEECH_RATIO` | Same energy-active frame fraction as `Q_VOICED_RATIO` | Duplicate of the same detector output |
| `PROVISIONAL_ENERGY_SILENCE_RATIO` | One minus the same energy-active fraction | Duplicate/complement of pause load |
| `PROVISIONAL_PITCH_ZCR_HZ` | Zero crossings divided by twice the recording duration | A provisional zero-crossing estimate, not a tracked fundamental frequency |
| `PROVISIONAL_SPECTRAL_CENTROID_HZ` | Magnitude-weighted centroid from the opening 1024 samples and first 64 DFT bins | At 16 kHz: opening 64 ms and frequencies only through 1 kHz; not the full response spectrum |
| `PROVISIONAL_FORMANT_TRACKING` | No active extraction | Null with `CALIBRATION_REQUIRED` |

A saved record inspected earlier today confirmed 11 non-null feature types across each of its three responses and a qualified recording status. No new personal audio was accessed for this written snapshot.

Each feature includes its ID/version, value/unit/method, capture/prompt reference, segment fields, quality, null confidence, rejection reason, extractor/version, and parameter/device metadata fields. Many current parameter/device fields are empty. Current feature version is `0.1`; worker version is `soulscope-measurement-worker-0.2.0`.

## Quality rules currently in code

These are recording acceptance rules, not psychological thresholds:

- Per-file worker upload limit: 25 MiB; maximum WAV duration: 90 seconds.
- Browser-to-Next upload limit: 10,000,000 bytes in code; hosting request limits can be smaller.
- Energy activity uses 30 ms frames and RMS threshold 0.01.
- A recording is rejected when duration is zero, duration exceeds 90 seconds, or energy-active ratio is below 0.05.
- Clipping ratio above 0.01 produces a warning; whole-recording RMS below 0.01 produces a warning.
- Rejections disable semantic and renderer eligibility. Warnings produce limited status, disable semantic eligibility, and preserve renderer eligibility. A qualified recording passes those signal checks; it does not establish a valid psychological result.

## Evidence and inference today

Evidence Engine `soulscope-evidence-engine-0.2.0` uses `evidence-canonical-structural-v2`, Evidence Registry `0.1`, and ledger schema `0.1`. It enumerates canonical markers in six families: prosody, energy, timing, phonation, spectral, and dynamics. Most required features are not supplied by today's extractor. Its supported status currently describes component presence/usability, not proof of a psychological construct. It does not calculate calibrated direction, magnitude, uncertainty, or contradictions.

Dimension Engine `soulscope-dimension-engine-0.2.0` enumerates 16 dimensions across cognition, regulation, capacity, and expression. All calibration specs are `CALIBRATION_REQUIRED`. Directionality, weights, normalization, thresholds, reference data, posterior models, confidence models, and validation criteria are not activated. Every dimension remains unresolved with null posterior/confidence and `scoreProduced=false`.

The semantic finalizer consequently retains unresolved constellation/state outcomes, publishes no interactions or whole-scan pattern, and stores an unavailable narrative report. Recovery, reserve, and relational availability also have protocol-specific abstentions. A future-context prompt is not evidence of recovery.

**There is no active validated emotion classifier, external Emotion Logic AI integration, or personal-reflection producer.** The current backend cannot turn a qualified recording into a calibrated emotional or psychological narrative merely by enabling a configuration flag.

## What the results page is using

The shared `ReflectionNarrativeV1` contract and frontend renderer exist. A supplied ready narrative needs a resolved semantic result, ready report, and valid evidence/decision/selected-meaning references. The current backend does not produce one.

The deployed Next.js summary endpoint is a separate bounded recording-description projection. It compares existing quiet-audio measurements, preserves unresolved scientific status, and does not infer emotional meaning. This is the source of the disappointing quiet-audio summary. It is not the requested original-style personal reflection. The demo narrative is synthetic and never substitutes for a saved result.

## Storage, security and retention

Supported storage backends: local private filesystem and a private Supabase bucket. Production setup is documented as `SOULSCOPE_STORAGE_BACKEND=supabase`, bucket `private-audio`, with local working files under `/tmp/soulscope-private-audio`. Audio uploads do not upsert; an identical retry succeeds and different bytes conflict. Database result records are immutable and owner-readable under RLS. Internal processing routes require the worker token; service credentials remain server-side.

A 24-hour local WAV cleanup helper exists. That does not establish automatic scheduled deletion of Supabase objects. The public privacy disclosure correctly does not promise automatic 24-hour raw-audio deletion. This upgrade does not alter capture consent or retention behavior.

## Dependencies and configuration

Required worker environment names: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SOULSCOPE_WORKER_INTERNAL_TOKEN`. Storage uses `SOULSCOPE_STORAGE_BACKEND`, `SOULSCOPE_SUPABASE_STORAGE_BUCKET`, and `SOULSCOPE_PRIVATE_AUDIO_ROOT`. Frontend server configuration additionally uses `SOULSCOPE_BACKEND_URL` and Supabase public URL/publishable key. Secrets are deliberately omitted.

Declared normal dependencies: FastAPI, Uvicorn, HTTPX, multipart support, SoundFile, SciPy, NumPy. Declared optional science dependencies: `praat-parselmouth==0.4.6` and `webrtcvad-wheels==2.0.14`. **The active extractor does not import those optional science libraries.** Declaring them is not the same as running pitch tracking, formant analysis, or WebRTC speech detection.

## Current gap and authorized next work

Capture, private storage, persistence and structural completion operate. Measurement extraction is incomplete relative to the original, and calibrated inference is not implemented. Richer acoustic measurements can be engineered and verified now. Psychological accuracy additionally requires reference data and approved calibrated meaning rules; borrowing the original frontend's heuristic conclusions does not provide that validation.

Next work: add a versioned full-recording measurement profile in the existing worker, explicit feature-specific support and missingness, tests against known signals, a governed backend narrative publication boundary, and a clear calibration specification. Do not alter Signature, capture, scientific thresholds or state selection. Historical sealed records stay unchanged.
