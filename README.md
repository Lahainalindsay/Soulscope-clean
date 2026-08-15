# SoulScope Clean

SoulScope Clean is the production rebuild of SoulScope.

The old `~/soulscope` repository is preserved as the research archive. This repository starts from the verified architecture only and will copy or rewrite implementation pieces one at a time after review.

## Current Status

Current implementation:

- current Canonical Authority Ledger
- current Canon v1.3 and seven uploaded scientific/backend companion registries preserved under `docs/canonical/`
- approved canonical contract package
- backend database foundation migrations authored and locally validated on PostgreSQL 15
- scan ownership and lifecycle schema
- versioned prompt-set storage
- prompt capture records
- account policy acceptance history
- audit-event infrastructure
- row-level security foundations
- local PostgreSQL backend foundation test harness

Not yet implemented:

- deployed backend service
- executed production database migration
- private audio storage and retention workflow
- audio processing jobs
- acoustic feature extraction
- executable Evidence Engine
- Dimension Engine
- constellation decisions
- canonical result generation
- narrative or story generation
- production Resonance Signature renderer
- Whole-Scan Pattern Registry source artifact in `docs/canonical/`

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
