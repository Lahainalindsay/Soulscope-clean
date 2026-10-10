# SoulScope Language System v1

Controlling authority: **SoulScope Canon Set v2.0**, adopted August 13, 2026,
`SoulScope_Canon_Set_v2.0_CURRENT_2026-08-13.pdf`. Sections 02.1, 04.1, 07–07.2,
10.1 and 13.1 govern the boundary. The complete owner-provided edition was read
before implementing this contract. Earlier documents do not override it.

## Boundary

Trusted completed reasoning selects evidence, decisions and meaning units.
The immutable result supplies a versioned narrative projection. The frontend
validates and renders that projection; it does not select psychological meaning
from scores, measurements, prompt categories, or record presence.

The shared `ReflectionNarrativeV1` type and draft-2020-12 schema live in
`packages/canonical-contracts`. Ready narratives contain one strongest observation,
3–5 overview sentences, 3–5 daily-life sentences, one question, alternatives and
source references. Every substantive sentence carries evidence, decision and
selected meaning-unit IDs. Unknown versions, dangling references, malformed prose,
prohibited language and unsupported publication fail closed.

An unresolved narrative has an explanation and reason codes, with no strongest
observation, daily-life interpretation or question invented to fill the layout.
Unsupported meaning is never converted into balanced, low or healthy output.

## Current integration

`ResultsView` remains the existing dashboard; there was no `ScanResultDashboard`
in the inspected main branch. `ReflectionOverview` and `ReflectionDetails` receive
only validated narrative. They retain the existing CSS, typography and panel grid.

Saved-result reads can consume `result_report.reflectionNarrative` with
`result_report.selectedMeaningUnitIds` from a server-published immutable result.
Evidence and decision membership come from the result's ledgers. A ready narrative
also requires a resolved semantic result and a ready report. Frontend validation
does not establish scientific validity; the trusted producer owns that gate.

The existing backend currently emits only `unresolved_abstained`/`invalid` semantic
results and unavailable reports. Those records continue to render honestly without
requiring a database migration or changing historical JSON. No new production
Meaning Engine or calibrated interpretation is claimed by this patch.

`/results` and `/results/demo` render the same deeply frozen `DEMO_RESULT_V1`.
All evidence, decisions and meaning IDs in it are synthetic and explicitly labeled
as illustrative. A saved bundle always takes precedence over a demo prop; the live
result loader has no dependency on the demo fixture.

## Scope and verification

Scientific thresholds, Dimension processing, state selection, migrations, capture,
and Signature-related files are unchanged. The Signature is still unfinished;
decorative art remains labeled as decorative.

Tests cover runtime schema validation, sentence cardinality, a single question,
reference integrity, unresolved behavior, mutation protection, safe text rendering,
prohibited language, unchanged reflection across changed scores, and no preview
leakage into saved results. Phrase guards are regression checks, not a semantic
safety proof or replacement for governed producer review.

Run `npm ci --prefix frontend` and `npm ci --prefix packages/canonical-contracts`,
then `npm run test:frontend`, `npm run test:contracts`, `npm run typecheck`, and
`npm run build`. The contract tests use Ajv rather than the older limited schema
test helper.

## Measurement upgrade and sealed abstention

New result inserts now seal an explicit unresolved `ReflectionNarrativeV1` with
the immutable narrative decision reference. Existing result JSON stays unchanged.
The frontend gives this supplied projection precedence over a recording summary.
The fuller research acoustic profile does not activate psychological publication.
See `docs/MEASUREMENT_AND_MEANING_V1.md` for the scientific calibration gaps.
