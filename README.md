# SoulScope Clean

SoulScope Clean is the production rebuild of SoulScope.

The old `~/soulscope` repository is preserved as the research archive. This repository starts from the verified architecture only and will copy or rewrite implementation pieces one at a time after review.

## Current Status

Current implementation:

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

## Document Authority

- `docs/SOULSCOPE_CANON.md` is the faithful Markdown transcription of the Foundational Canon and governs product truth, scientific boundaries, prohibited claims, vocabulary, visual laws, and governance.
- `docs/CONSTELLATION_BIBLE.md` is the faithful Markdown transcription of the correct Constellation Bible and governs operational constellation specifications under Canon authority.
- `docs/SoulScope_Canon_Foundational_Edition_v1.0.pdf` is the immutable Canon source artifact and must not be modified.
- `docs/source/SoulScope_Constellation_Bible_v0.1.docx` is the immutable Constellation Bible source artifact and must not be modified after preservation.

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
