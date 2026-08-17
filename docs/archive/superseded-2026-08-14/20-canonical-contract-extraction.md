# Canonical Contract Extraction

Status: APPROVED FOR CONTRACT-LEVEL USE, with processing-stage correction
Package: `packages/canonical-contracts/`
Package version: `0.1.0`
Branch: `feat/canonical-contracts-v0`
Owner approval date: 2026-08-03
Approving role: Product Owner
Approved package: `@soulscope/canonical-contracts`
Approved version: `0.1.0`
Approved commit: `94120da59e02bbdbfcea0ebbd6c15163f82bfc0f`

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

The owner decision for limited contract extraction was applied exactly as a non-executable scope gate. On 2026-08-03, the Product Owner approved decisions 1-7 and 9-15 for contract-level use. Decision 8, Processing-Stage IDs and order, is approved with correction.

Approved decisions:

1. Constellation IDs: APPROVED FOR CONTRACT-LEVEL USE.
2. Dimension IDs and labels: APPROVED FOR CONTRACT-LEVEL USE.
3. Dimension ordering: APPROVED FOR CONTRACT-LEVEL USE.
4. Seed-state IDs: APPROVED FOR CONTRACT-LEVEL USE.
5. Seed-state display names: APPROVED FOR CONTRACT-LEVEL USE.
6. Evidence Ledger fields: APPROVED FOR CONTRACT-LEVEL USE.
7. Baseline hierarchy: APPROVED FOR CONTRACT-LEVEL USE.
8. Processing-stage IDs and order: APPROVED WITH CORRECTION.
9. Narrative-section IDs and labels: APPROVED FOR CONTRACT-LEVEL USE.
10. Internal narrative citation requirement: APPROVED FOR CONTRACT-LEVEL USE.
11. Validation phase-gate IDs and labels: APPROVED FOR CONTRACT-LEVEL USE.
12. Provenance fields: APPROVED FOR CONTRACT-LEVEL USE.
13. Version-reference fields: APPROVED FOR CONTRACT-LEVEL USE.
14. Non-executable package boundary: APPROVED FOR CONTRACT-LEVEL USE.
15. Package version `0.1.0`: APPROVED FOR CONTRACT-LEVEL USE.

Processing-stage correction:

- The extracted stage identifiers remain approved as source-faithful Bible stages.
- Future canonical implementation must separately preserve `Decision Ledger` and `Immutable Completed Result`.
- These must remain explicit canonical contracts between Pattern Engine and downstream Narrative Engine / Resonance Signature consumers.
- Their absence from the source-faithful stage registry must not be used to remove or bypass them.
- Current sources do not prove whether the Bible intentionally treats them as cross-cutting contracts rather than processing stages, or whether the stage registry is incomplete and requires a future Bible amendment. Treat this as an unresolved specification gap before implementation.

The full Constellation Bible remains not implementation-ready. The readiness conclusion remains:

`READY_FOR_LIMITED_CONTRACT_EXTRACTION`

This permits contract extraction only. It does not authorize scoring, interpretation, rendering, persistence, or user-facing application behavior.

## Owner Notes Recorded

- The sixteen seed-state IDs and display names are approved as canonical registry references only.
- The source-designated reserved/fixed states are `COG-017 — Deliberate Builder`, `REG-022 — Adaptive Recovery`, and `EXP-009 — Guarded Openness`.
- Remaining seed states retain provisional lifecycle status.
- Seed-state approval does not authorize candidate eligibility, state scoring, distance calculations, state selection, blending, confidence thresholds, publication rules, narrative templates, or visual profiles.
- The five narrative-section IDs are approved as Bible-derived internal contract sections: `what_feels_most_present`, `how_this_may_show_up_in_daily_life`, `what_may_be_happening_underneath`, `something_worth_noticing`, and `a_question_to_sit_with`.
- These identifiers are internal contract sections and are not required to appear verbatim as user-facing interface labels.
- A later presentation contract may organize supported reflection content into user-facing facets such as inner experience, interactions, holding back, daily functioning, and future access, while preserving evidence traceability and canonical reasoning.
- The Evidence Ledger schema is approved as a structural contract only. Schema validity does not imply scientific validity, calibrated confidence, causal support, eligibility for publication, diagnostic meaning, or production readiness.
- The approved baseline hierarchy preserves personal reference signature, within-session reference, matched population prior, and no reference.
- An opening prompt may serve as a within-session reference. It is not automatically a trusted longitudinal personal reference.
- No reference must not be interpreted as neutral, normal, balanced, average, or healthy.

## Compatibility Guarantees

- Permanent IDs are represented as literal types and immutable registry entries.
- Registry entries include source references.
- Schemas require provenance and version references.
- Registries preserve source ordering.
- The package has no imports from frontend, backend, Supabase, renderer packages, narrative packages, or the archived repository.
- No application package dependency is introduced.

## Non-Goals

This package is not a scoring engine, feature extractor, narrative engine, renderer, persistence model, or production API.

## Next Permitted Gate

FRONTEND VISUAL FOUNDATION AND NON-SCIENTIFIC APPLICATION SHELL

This next gate permits design tokens, typography, color system, spacing system, responsive application shell, navigation, accessible base components, scan-screen visual presentation, analyzing-screen presentation, results-page layout, history/profile/settings presentation, loading/empty/error/unresolved states, canonical labels imported from the contract package, clearly labeled mock-data adapters, and non-production visual placeholders.

This next gate does not permit scientific scoring, state inference, generated personal claims, production Resonance Signature mappings, production database integration, or migration of old scientific behavior.
