# SoulScope Clean

SoulScope Clean is the production rebuild of SoulScope.

The old `~/soulscope` repository is preserved as the research archive. This repository starts from the verified architecture only and will copy or rewrite implementation pieces one at a time after review.

## Current Status

Current implementation:

- current Canonical Authority Ledger
- current Canon v1.3 and eight uploaded scientific/backend companion registries preserved under `docs/canonical/`
- approved canonical contract package
- backend database foundation migrations authored and locally validated on PostgreSQL 15
- local Python/FastAPI backend measurement worker scaffold
- private canonical WAV validation, storage pathing, Supabase Storage adapter, and cleanup helper
- deterministic raw acoustic measurement extraction for the three-prompt protocol
- unresolved semantic result creation through privileged RPCs
- executable Evidence Engine v1 over immutable MeasurementRecords
- immutable `evidence_ledgers` persistence through a service-only RPC
- executable Dimension Engine v1 over immutable Evidence Ledgers
- immutable `dimension_results` persistence through a service-only RPC
- Dimension Calibration Foundation with versioned `CALIBRATION_REQUIRED` specs and scoring-eligibility blockers
- opt-in hosted Supabase integration test harness for private Storage, RPC authorization, RLS, immutability, and idempotency
- scan ownership and lifecycle schema
- versioned prompt-set storage
- prompt capture records
- account policy acceptance history
- audit-event infrastructure
- row-level security foundations
- local PostgreSQL backend foundation test harness

Not yet implemented:

- deployed backend service or worker runtime
- executed production database migration
- calibrated audio processing jobs
- calibrated acoustic extraction with Parselmouth/SciPy/VAD production methods
- calibrated Dimension scoring
- constellation decisions
- canonical result generation
- narrative or story generation
- production Resonance Signature renderer
- staging Supabase deployment validation

## Document Authority

`docs/CANONICAL_AUTHORITY_LEDGER.md` is the single current authority index.

Current governing source artifacts live under `docs/canonical/`:

- SoulScope Canon v1.3
- SoulScope Acoustic Parameter Registry v0.1
- SoulScope Evidence Marker Registry v0.1
- SoulScope Constellation Dimension Registry v0.1
- SoulScope Inference Rule Registry v0.1
- SoulScope Constellation State Registry v0.1
- SoulScope Cross-Constellation Interaction Registry v0.1
- SoulScope Whole-Scan Pattern Registry v0.1
- SoulScope Narrative Registry v0.1

Superseded Canon/Bible materials live under `docs/archive/` and are historical provenance only.

## Core Rule

One canonical pipeline. One immutable result object. One report path. No legacy compatibility systems.

Nothing may bypass the Evidence Ledger. Nothing may publish independently from the canonical result.

## Backend Foundation Local Test Harness

Run the local PostgreSQL migration and invariant harness with:

```bash
./scripts/test-backend-foundation.sh
```

PostgreSQL and sudo access to the `postgres` system user are required. The script drops and recreates only the disposable test database named by `SOULSCOPE_TEST_DB`, defaulting to `soulscope_migration_test`; overrides must begin with `soulscope_`.

This validates PostgreSQL migration compatibility and backend invariants for the foundation migrations. It does not constitute hosted Supabase deployment validation.

## Backend Measurement Worker Local Tests

Run the local measurement-worker checks with:

```bash
PYTHONPATH=backend python3 -m unittest discover -s backend/tests -t backend
```

These tests use committed WAV fixtures and in-memory RPC fakes. They validate the service boundary and audio/measurement lifecycle without connecting the frontend or requiring hosted Supabase credentials.

## Hosted Measurement Pipeline Tests

Hosted Supabase tests are opt-in and are skipped by default. They require a staging project, repository migrations applied, a private Supabase Storage bucket, service-role and anon keys, and two staging-only test users.

Required environment:

```bash
SOULSCOPE_RUN_HOSTED_TESTS=1
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SOULSCOPE_SUPABASE_STORAGE_BUCKET=...
SOULSCOPE_STAGING_USER_A_EMAIL=...
SOULSCOPE_STAGING_USER_A_PASSWORD=...
SOULSCOPE_STAGING_USER_B_EMAIL=...
SOULSCOPE_STAGING_USER_B_PASSWORD=...
```

Run:

```bash
pytest backend/tests/hosted
```

These tests use real Supabase Auth, Storage, PostgREST/RPC, Postgres constraints, and RLS. They verify MeasurementRecord persistence, Evidence Ledger generation, and Dimension Result generation. They do not publish States, Patterns, Narrative, Resonance output, or frontend changes.

## Evidence Engine v1

Evidence Engine v1 consumes immutable `measurement_records` only. It never reads WAVs, reruns acoustic extraction, mutates measurements, or creates downstream semantic inference.

The v1 engine produces a structural Evidence Ledger:

- available measurements become neutral `supported` evidence facts, meaning the measurement exists and is usable, not that a psychological claim is supported
- missing inputs become `unavailable`
- rejected/null unsupported inputs become `rejected`
- limited-quality inputs become `insufficient`
- missing, rejected, and insufficient evidence are never converted to zero or contradiction
- every evidence entry records source measurement identity, feature/version, prompt scope, quality, provenance, and active evidence versions

Persistence is service-owned through `create_evidence_ledger(...)`. Browser, anon, and normal authenticated clients cannot create or mutate Evidence Ledgers. Repeated generation for the same MeasurementRecord, Evidence Engine version, and rule version is idempotent.

## Dimension Engine v1

Dimension Engine v1 consumes immutable `evidence_ledgers` only. It never reads WAVs, reruns acoustic extraction, reads MeasurementRecords directly, mutates upstream records, or creates downstream State, Constellation, Pattern, Narrative, or Resonance output.

The canonical Dimension registry contains exactly 16 Dimensions: `COG-P1`, `COG-P2`, `COG-P3`, `COG-P4`, `REG-P1`, `REG-P2`, `REG-P3`, `REG-P4`, `CAP-P1`, `CAP-P2`, `CAP-P3`, `CAP-P4`, `EXP-P1`, `EXP-P2`, `EXP-P3`, and `EXP-P4`.

Canonical calibrated Dimension scoring, weights, normalization, posterior construction, and confidence formulas remain deferred. Dimension Engine v1 therefore persists deterministic unresolved/abstained Dimension Results with posterior values and confidence set to `null`. Missing, rejected, unavailable, insufficient, supported, and contradicted Evidence entries remain distinct in qualification/provenance and are never converted to zero.

The current protocol hard-abstains `REG-P4` Recovery with `NO_RECOVERY_COMPATIBLE_CONDITION`, `CAP-P2` Reserve with `NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL`, and `EXP-P4` Relational Availability with `NO_RELATIONAL_OBSERVATION`. All other v1 Dimensions abstain with `CONSTRUCT_MODEL_NOT_VALIDATED`.

Persistence is service-owned through `create_dimension_result(...)`. Browser, anon, and normal authenticated clients cannot create or mutate Dimension Results. Repeated generation for the same Evidence Ledger, Dimension Engine version, registry version, and scoring version is database-idempotent.

## Dimension Calibration Foundation

The calibration foundation answers whether a Dimension may be scored with a scientifically defined calibration. The current answer for all 16 Dimensions is `NO`: `CALIBRATION_REQUIRED`.

Implemented:

- immutable versioned calibration metadata
- one calibration-required spec per canonical Dimension
- compatibility checks for Evidence/Dimension engine and registry versions
- deterministic scoring-eligibility blockers
- service-owned calibration metadata writes
- documentation of missing scientific prerequisites in `architecture/DIMENSION_CALIBRATION_REQUIREMENTS.md`

Not scientifically defined:

- Evidence-to-Dimension mappings
- directionality
- weights
- thresholds
- normalization
- score range
- minimum evidence rules
- confidence model
- priors/posteriors
- reference dataset
- validation criteria

Dimension Engine v1 reads this calibration state and continues to persist unresolved/abstained Dimension Results. No numeric Dimension scoring is enabled.
