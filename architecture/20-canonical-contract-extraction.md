# Canonical Contract Extraction

Status: LIMITED CONTRACT EXTRACTION COMPLETE
Package: `packages/canonical-contracts/`
Package version: `0.1.0`
Branch: `feat/canonical-contracts-v0`

## Approved Extraction Scope

The owner approved extraction of the following specifications into non-executable contracts:

- constellation IDs: `COG`, `REG`, `CAP`, `EXP`
- sixteen permanent dimension IDs and labels
- seed-state IDs and display names
- Evidence Ledger record fields
- baseline hierarchy enum
- canonical processing-stage names
- narrative section names
- internal narrative citation requirements
- validation phase-gate names
- source, provenance, and version fields

Permitted artifact types:

- TypeScript types
- JSON Schemas
- immutable JSON registries
- enum definitions
- identifier and required-field validation
- contract-level tests
- source traceability documentation

## Source Mapping

| Contract area | Source | Extraction status |
| --- | --- | --- |
| Product/scientific boundaries | `docs/SOULSCOPE_CANON.md` | Governing constraint only |
| Constellation IDs and labels | `docs/CONSTELLATION_BIBLE.md`, section 1 | Extracted |
| Dimension IDs and labels | `docs/CONSTELLATION_BIBLE.md`, sections 6-9 | Extracted |
| Seed-state IDs and display names | `docs/CONSTELLATION_BIBLE.md`, sections 6.2, 7.1, 8.1, 9.1 | Extracted without selection logic |
| Evidence Ledger fields | `docs/CONSTELLATION_BIBLE.md`, section 3.1 | Extracted as structural field contract |
| Baseline hierarchy enum | `docs/CONSTELLATION_BIBLE.md`, section 3.2 | Extracted without trust scoring |
| Processing-stage names | `docs/CONSTELLATION_BIBLE.md`, section 3 | Extracted as ordered identifiers |
| Narrative section names | `docs/CONSTELLATION_BIBLE.md`, section 14.1 | Extracted without sentence templates |
| Internal narrative citations | `docs/CONSTELLATION_BIBLE.md`, section 14.2 | Extracted as citation requirement only |
| Validation phase gates | `docs/CONSTELLATION_BIBLE.md`, section 16.1 | Extracted as phase identifiers only |
| Source/provenance/version fields | Bible governance sections, readiness review, owner approval | Extracted |

## Files Created

- `packages/canonical-contracts/README.md`
- `packages/canonical-contracts/package.json`
- `packages/canonical-contracts/tsconfig.json`
- `packages/canonical-contracts/src/*.ts`
- `packages/canonical-contracts/registries/*.json`
- `packages/canonical-contracts/schemas/*.schema.json`
- `packages/canonical-contracts/tests/*.mjs`

## Contracts Extracted

The package exposes:

- immutable constellation registry
- immutable dimension registry
- immutable seed-state registry
- baseline hierarchy constants
- processing-stage constants
- narrative section constants
- narrative internal citation contract
- validation phase-gate constants
- Evidence Ledger field contract and record type
- provenance and source-reference types
- version-reference constants
- JSON Schema draft `2020-12` schemas for evidence ledger records, provenance, version references, and canonical registry entries

## Contracts Intentionally Deferred

The package intentionally does not include:

- acoustic scoring formulas
- feature weights
- normalization formulas
- confidence formulas
- posterior interval construction
- dimension scoring
- state eligibility
- state selection
- publish thresholds
- blend margins
- contradiction penalties
- interaction inference
- pattern inference
- narrative generation
- Resonance Signature behavior
- database migrations
- frontend integration
- backend integration
- renderer integration
- production deployment

## Ambiguities Found

No blocking ambiguity was found for the approved contract fields.

The following remain unresolved outside this package:

- whether source-provided threshold examples are normative or research priors
- exact executable Evidence Ledger validation beyond required structural fields
- baseline trust scoring
- state-region eligibility and publishability
- interaction rule execution
- narrative clause library
- renderer parameter behavior
- historical-result compatibility

## Owner Decisions Applied

The owner decision for limited contract extraction was applied exactly as a non-executable scope gate.

The full Constellation Bible remains not implementation-ready. The readiness conclusion remains:

`READY_FOR_LIMITED_CONTRACT_EXTRACTION`

This permits contract extraction only. It does not authorize scoring, interpretation, rendering, persistence, or user-facing application behavior.

## Compatibility Guarantees

- Permanent IDs are represented as literal types and immutable registry entries.
- Registry entries include source references.
- Schemas require provenance and version references.
- Registries preserve source ordering.
- The package has no imports from frontend, backend, Supabase, renderer packages, narrative packages, or the archived repository.
- No application package dependency is introduced.

## Non-Goals

This package is not a scoring engine, feature extractor, narrative engine, renderer, persistence model, or production API.

## Next Implementation Gate

The next safe gate is owner review of the extracted contracts. After approval, implementation may proceed only to downstream contract consumers that still do not score, infer, publish, render, or persist production results unless separately authorized.
