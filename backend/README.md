# SoulScope Backend

This directory contains the Python/FastAPI backend worker and calibration-gated canonical completion.

The worker uses the service-owned Supabase RPC boundary established by the foundation migrations:

- `register_uploaded_capture_artifact`
- `start_scan_processing_run`
- `create_measurement_record`
- `create_evidence_ledger`
- `create_dimension_result`
- `finalize_canonical_result` (historic `create_unresolved_semantic_result` remains for compatibility)

It implements:

- private canonical PCM WAV validation and storage
- local filesystem and Supabase private Storage backends behind one storage interface
- 24-hour private-audio cleanup helper
- deterministic raw acoustic measurement extraction from three prompt WAVs
- signal quality qualification
- immutable measurement-record payload creation
- deterministic Evidence Engine v2 over immutable MeasurementRecords with canonical `EV_*` marker IDs
- immutable Evidence Ledger persistence
- deterministic Dimension Engine v2 over immutable Evidence Ledgers with structural Dimension requirements
- immutable Dimension Result persistence
- Dimension Calibration Foundation with immutable `CALIBRATION_REQUIRED` specs
- immutable source-linked semantic completion and atomic audited finalization
- opt-in hosted Supabase tests for Storage, privileged RPCs, RLS, immutability, Evidence, Dimensions, and idempotency

It intentionally does not implement calibrated Dimension scoring, State selection, Constellation scoring, Pattern inference, Narrative generation, Resonance Signature rendering, frontend integration, or calibrated psychological/scientific interpretation.

## Local checks

Install `backend[dev]` to run the full suite, including API boundary tests:

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

## Evidence Engine v2

Evidence Engine v2 is a deterministic transformation:

```text
immutable MeasurementRecord
  -> Evidence Engine v1
  -> immutable Evidence Ledger
```

It consumes persisted `measurement_records.prompt_measurements` and related measurement metadata. It does not consume raw audio, private Storage objects, frontend data, or semantic-result payloads.

Evidence status semantics:

- `supported`: the required source components are present and usable as neutral measurement evidence
- `contradicted`: represented in the status model, but not produced by v1 because no calibrated contradiction rules are active
- `unavailable`: expected measurement input is absent or null without a rejection reason
- `rejected`: measurement input is explicitly rejected or unsupported
- `insufficient`: measurement input exists but quality is limited for evidence use

Every entry uses a canonical `EV_*` marker ID and includes source measurement IDs, prompt scope, measurement quality, accepted/missing/rejected/insufficient components, rule/version metadata, and provenance back to the MeasurementRecord. Missing and rejected values remain `null`; they are not coerced to `0`, average, normal, or contradiction.

Evidence persistence uses the service-only `create_evidence_ledger(...)` RPC. Ledgers are immutable, owner-readable through RLS, non-owner isolated, and idempotent by MeasurementRecord plus Evidence Engine/rule version.

## Dimension Engine v2

Dimension Engine v2 is a deterministic transformation:

```text
immutable Evidence Ledger
  -> Dimension Engine v1
  -> immutable Dimension Result
```

It consumes persisted `evidence_ledgers.entries`, status counts, and ledger provenance. It does not consume raw audio, Storage objects, MeasurementRecords directly, frontend data, or semantic-result payloads.

The engine enumerates the 16 canonical Dimensions from the Constellation Dimension Registry and records Canon-defined structural requirements: required Evidence families, candidate markers, required markers, prompt prerequisites, independent-family coverage, and D3 abstentions. Calibrated Dimension scoring, weights, normalization, posterior construction, and confidence formulas are not yet defined, so v2 abstains from scoring. Every Dimension Result entry has `posteriorMean`, posterior bounds, and `confidence` set to `null`, with `scoreProduced=false` and `confidenceProduced=false`.

Dimension status semantics:

- `UNRESOLVED`: Dimension output is intentionally unresolved because calibrated scoring is unavailable or the current protocol cannot observe the construct
- `NO_RECOVERY_COMPATIBLE_CONDITION`: hard abstention for `REG-P4` Recovery
- `NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL`: hard abstention for `CAP-P2` Reserve
- `NO_RELATIONAL_OBSERVATION`: hard abstention for `EXP-P4` Relational Availability
- `CONSTRUCT_MODEL_NOT_VALIDATED`: non-D3 v1 abstention because calibrated Dimension inference is deferred

Supported, contradicted, unavailable, rejected, and insufficient Evidence entries remain distinct in Dimension provenance. Missing/rejected/null Evidence is never coerced to `0`, normal, average, or negative evidence.

Dimension persistence uses the service-only `create_dimension_result(...)` RPC. Results are immutable, owner-readable through RLS, non-owner isolated, and idempotent by Evidence Ledger plus Dimension Engine/registry/scoring version.

## Dimension Calibration Foundation

The calibration foundation is a guardrail between Evidence Ledgers and future Dimension scoring:

```text
Evidence Ledger
  -> Calibration Contract
  -> Dimension Scoring Eligibility
```

It does not calculate scores. It records whether a Dimension has the required scientific prerequisites for scoring and returns explicit blockers when it does not.

Current calibration status:

- all 16 Dimensions have immutable `CALIBRATION_REQUIRED` specs
- Canon-defined structural Evidence-to-Dimension mappings are present where defined
- no calibrated Evidence-to-Dimension scoring mappings are defined
- no directionality, weights, thresholds, normalization, score ranges, confidence model, posterior model, reference dataset, or validation criteria are defined
- no calibration is activated as validated

Compatibility checks cover Evidence Engine version, Evidence rule version, Evidence registry version, Dimension Engine version, and Dimension registry version. Dimension Engine v1 includes the resulting calibration blockers in each unresolved Dimension output while keeping posterior and confidence fields `null`.

Calibration metadata persistence uses the service-only `create_dimension_calibration_spec(...)` RPC. Anon and normal authenticated users cannot create or mutate calibration specs. Existing calibration specs are immutable; future versions must coexist rather than overwrite historical records.

## Running the service

Local filesystem storage:

```bash
SOULSCOPE_STORAGE_BACKEND=local \
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
SOULSCOPE_WORKER_INTERNAL_TOKEN=... \
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8080
```

Supabase private Storage:

```bash
SOULSCOPE_STORAGE_BACKEND=supabase \
SOULSCOPE_SUPABASE_STORAGE_BUCKET=... \
SUPABASE_URL=... \
SUPABASE_SERVICE_ROLE_KEY=... \
SOULSCOPE_WORKER_INTERNAL_TOKEN=... \
uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8080
```

The `/health` endpoint returns a small deterministic JSON body and does not validate Supabase credentials. Processing endpoints validate required service settings when invoked.

## Canonical completion

`POST /internal/process-scan` now extracts measurements, persists evidence and
all sixteen dimensions, and atomically finalizes an immutable semantic result.
The measurement worker itself no longer creates a semantic placeholder before
Evidence and Dimensions exist.

For a saved scan, resume at either boundary (multipart form fields):

- `/internal/complete-measurement`: `measurement_record_id`; runs the remaining evidence, dimension and completion stages.
- `/internal/process-result`: `dimension_result_id`; finalizes from the persisted upstream chain.

All processing endpoints require `x-worker-token`. Missing
`SOULSCOPE_WORKER_INTERNAL_TOKEN` fails closed with 503; an invalid token returns
401. Audio reads are bounded by the configured per-file limit. Local and Supabase
captures are write-once: identical retries succeed, different bytes conflict.
Blocking extraction and downstream processing run outside the ASGI event loop.

Schema `0.2` rows in `semantic_result_records` link `evidence_ledger_id` and
`dimension_result_id`, copy their immutable contents, retain four unresolved
constellation/state outcomes and all seven rejected pattern candidates, and carry
a version manifest and decision ledger. `result_report` exposes the availability
of all five canonical narrative sections. There are no personal narrative
sentences without supported findings. Rendering is explicitly unavailable.

Finalization locks the scan, creates the result and audits the remaining
`extracting -> evidence_ready -> finalizing -> finalized` transitions in one
transaction. Repeated finalization returns the same result without extra audits.
Saved measurement/run retries also remain valid after downstream completion.
Historical schema `0.1` placeholders remain immutable and are not completed
results. Select completions by their non-null `dimension_result_id`.

## Current limits

No calibrated Dimension, State, Constellation, Interaction or Pattern scores are
published. No personal narrative, production Resonance renderer or longitudinal
semantic interpretation is implemented. The engineering completion pipeline
preserves those abstentions instead of providing invented defaults.

See [backend completion status](../architecture/BACKEND_COMPLETION_STATUS.md) for
remaining science, hosted validation and deployment steps. Backend authority
remains `docs/CANONICAL_AUTHORITY_LEDGER.md` and `packages/canonical-contracts`.
