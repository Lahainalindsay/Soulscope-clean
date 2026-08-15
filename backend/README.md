# SoulScope Backend

This directory contains the Python/FastAPI backend worker for Backend Milestones 1, 2, and 3.

The worker uses the service-owned Supabase RPC boundary established by the foundation migrations:

- `register_uploaded_capture_artifact`
- `start_scan_processing_run`
- `create_measurement_record`
- `create_evidence_ledger`
- `create_unresolved_semantic_result`

It implements:

- private canonical PCM WAV validation and storage
- local filesystem and Supabase private Storage backends behind one storage interface
- 24-hour private-audio cleanup helper
- deterministic raw acoustic measurement extraction from three prompt WAVs
- signal quality qualification
- immutable measurement-record payload creation
- deterministic Evidence Engine v1 over immutable MeasurementRecords
- immutable Evidence Ledger persistence
- unresolved semantic result creation
- opt-in hosted Supabase tests for Storage, privileged RPCs, RLS, immutability, Evidence, and idempotency

It intentionally does not implement Dimension scoring, State selection, Pattern inference, Narrative generation, Resonance Signature rendering, frontend integration, or calibrated psychological/scientific interpretation.

## Local checks

The test suite is stdlib-only so it can run before optional scientific/runtime dependencies are installed:

```bash
PYTHONPATH=backend python3 -m unittest discover -s backend/tests -t backend
```

Full backend checks require the dependencies declared in `pyproject.toml`:

```bash
python3 -m pip install -e "backend[dev]"
pytest backend/tests
ruff check backend/app backend/tests
mypy backend/app
```

Hosted tests are opt-in and skip unless explicitly enabled:

```bash
SOULSCOPE_RUN_HOSTED_TESTS=1 pytest backend/tests/hosted
```

## Runtime configuration

Required service variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional variables:

- `SOULSCOPE_PRIVATE_AUDIO_ROOT`, default `backend/.private_audio`
- `SOULSCOPE_WORKER_INTERNAL_TOKEN`, required for protected deployments that expose the internal HTTP route
- `SOULSCOPE_STORAGE_BACKEND`, `local` or `supabase`; default `local`
- `SOULSCOPE_SUPABASE_STORAGE_BUCKET`, private Supabase Storage bucket used when `SOULSCOPE_STORAGE_BACKEND=supabase`
- `SOULSCOPE_LOG_LEVEL`, default `INFO`

Hosted integration tests additionally require:

- `SOULSCOPE_RUN_HOSTED_TESTS=1`
- `SUPABASE_ANON_KEY`
- `SOULSCOPE_STAGING_USER_A_EMAIL`
- `SOULSCOPE_STAGING_USER_A_PASSWORD`
- `SOULSCOPE_STAGING_USER_B_EMAIL`
- `SOULSCOPE_STAGING_USER_B_PASSWORD`

The hosted staging project must already have all repository migrations applied, a private audio bucket, and an active three-prompt prompt set. Tests do not create public audio URLs and do not log service-role secrets.

## Evidence Engine v1

Evidence Engine v1 is a deterministic transformation:

```text
immutable MeasurementRecord
  -> Evidence Engine v1
  -> immutable Evidence Ledger
```

It consumes persisted `measurement_records.prompt_measurements` and related measurement metadata. It does not consume raw audio, private Storage objects, frontend data, or semantic-result payloads.

Evidence status semantics:

- `supported`: the source measurement is present and usable as neutral measurement evidence
- `contradicted`: represented in the status model, but not produced by v1 because no calibrated contradiction rules are active
- `unavailable`: expected measurement input is absent or null without a rejection reason
- `rejected`: measurement input is explicitly rejected or unsupported
- `insufficient`: measurement input exists but quality is limited for evidence use

Every entry includes source measurement IDs, feature ID/version, prompt scope, measurement quality, missing/rejected components, rule/version metadata, and provenance back to the MeasurementRecord. Missing and rejected values remain `null`; they are not coerced to `0`, average, normal, or contradiction.

Evidence persistence uses the service-only `create_evidence_ledger(...)` RPC. Ledgers are immutable, owner-readable through RLS, non-owner isolated, and idempotent by MeasurementRecord plus Evidence Engine/rule version.

## Running the service

Local filesystem storage:

```bash
SOULSCOPE_STORAGE_BACKEND=local \
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8080
```

Supabase private Storage:

```bash
SOULSCOPE_STORAGE_BACKEND=supabase \
SOULSCOPE_SUPABASE_STORAGE_BUCKET=... \
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8080
```

The `/health` endpoint returns a small deterministic JSON body and does not validate Supabase credentials. Processing endpoints validate required service settings when invoked.

## Current limits

The hosted measurement pipeline remains measurement-only:

- no Dimension Engine
- no State inference
- no Pattern inference
- no Narrative generation
- no frontend integration
- no calibrated acoustic/scientific scoring
- no production deployment in this repository

Backend scientific authority lives in `docs/CANONICAL_AUTHORITY_LEDGER.md` and `packages/canonical-contracts`. The current Supabase migrations provide the service-owned real-scan processing scaffold: uploaded capture artifact registration, processing-run metadata, immutable measurement records, and unresolved semantic result records.
