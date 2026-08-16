# Canon v1.3 Alignment Audit

Status: AUDIT COMPLETE
Date: 2026-08-16
Repository checkpoint inspected: `b6af3a6 feat: add dimension calibration foundation`
Scope: Canon v1.3 plus current canonical scientific/backend registries, executable contracts, backend Measurement/Evidence/Dimension/Calibration layers, and Supabase persistence.

This audit is intentionally read-only for runtime behavior. It does not add scoring, mappings, thresholds, State selection, Interaction inference, Pattern inference, Narrative generation, Resonance output, migrations, or frontend changes.

## Authority Hierarchy

Current authority order is defined by `docs/CANONICAL_AUTHORITY_LEDGER.md`:

1. Scientific safety, personal agency, privacy, and immutable Evidence to Decision to Result contracts.
2. SoulScope Canon v1.3.
3. Current canonical scientific/backend companion registries.
4. Current compatible implementation, validation, privacy, security, rendering, interface, and route-level specifications where they do not conflict with the Canon or companion registries.
5. Executable implementation.

Archived files under `docs/archive/` are historical provenance only and must not control runtime.

## Current Authority Matrix

| Artifact | Version | Repository Path | Authority Level | Status | Supersedes / Constrains | Downstream Executable Representation |
| --- | --- | --- | --- | --- | --- | --- |
| SoulScope Canon | v1.3 | `docs/canonical/The SoulScope Canon v1.3.pdf` | Governing Canon | authoritative | Earlier Canon versions where conflicting | `packages/canonical-contracts/src/authority.ts`, backend boundary tests |
| Acoustic Parameter Registry | v0.1 | `docs/canonical/SoulScope Acoustic Parameter Registry v0.1.pdf` | Companion registry | authoritative | Unregistered acoustic-feature assumptions | Partial backend extractor in `backend/app/acoustics/`; no complete machine-readable acoustic registry |
| Evidence Marker Registry | v0.1 | `docs/canonical/SoulScope Evidence Marker Registry.pdf` | Companion registry | authoritative | Direct feature-to-semantics and noncanonical Evidence labels | Partial executable registry in `packages/canonical-contracts/src/evidenceMarkers.ts`; partial backend mapping in `backend/app/evidence/markers.py` |
| Constellation Dimension Registry | v0.1 | `docs/canonical/SoulScope Constellation Dimension Registry v0.1.pdf` | Companion registry | authoritative | Old Constellation Bible dimension definitions where conflicting | `packages/canonical-contracts/src/dimensionIds.ts`, `backend/app/dimensions/registry.py` |
| Inference Rule Registry | v0.1 | `docs/canonical/SoulScope Inference Rule Registry v0.1.pdf` | Companion registry | authoritative | Single-feature semantic inference, midpoint defaults, old inference shortcuts | Partial contracts in `dimensionInference.ts`; Dimension v1 abstention in `backend/app/dimensions/engine.py` |
| Constellation State Registry | v0.1 | `docs/canonical/SoulScope Constellation State Registry v0.1.pdf` | Companion registry | authoritative | Exhaustive State combinations and forced winners | Partial contract in `stateRegistry.ts`; no runtime State engine |
| Cross-Constellation Interaction Registry | v0.1 | `docs/canonical/SoulScope Cross-Constellation Interaction Registry v0.1.pdf` | Companion registry | authoritative | Static co-occurrence as causality; old interaction meanings | Partial contract in `interactionRegistry.ts`; no runtime Interaction engine |
| Whole-Scan Pattern Registry | v0.1 | `docs/canonical/SoulScope Whole-Scan Pattern Registry v0.1.pdf` | Companion registry | authoritative, research candidates calibration pending | Forced Pattern winner, personality/archetype/type labels | Strong structural contract in `patternRegistry.ts`; no runtime Pattern engine |
| Narrative Registry | v0.1 | `docs/canonical/SoulScope Narrative Registry.pdf` | Companion registry | authoritative, copy validation pending | LLM interpretation, raw-audio narrative reasoning, unresolved-to-resolved copy | Partial contract in `narrativePolicy.ts`; no runtime Narrative engine |
| Backend Foundation Proposal | n/a | `architecture/22-backend-foundation.md` | Compatible spec | supporting | Must yield to Canon/registries | Measurement/Evidence/Dimension service scaffolding |
| Canonical Pipeline | n/a | `architecture/CANONICAL_PIPELINE.md` | Compatible spec | supporting | Must yield to Canon/registries | Backend pipeline boundaries |
| Evidence Ledger | n/a | `architecture/EVIDENCE_LEDGER.md` | Compatible spec | supporting | Must yield to Evidence Marker Registry v0.1 | `evidence_ledgers` table and service |
| Acoustic Measurement Layer | n/a | `architecture/ACOUSTIC_MEASUREMENT_LAYER.md` | Compatible spec | supporting | Must yield to Acoustic Parameter Registry v0.1 | Measurement worker/extractor |
| Resonance Signature | n/a | `architecture/RESONANCE_SIGNATURE.md` | Compatible only for acoustic/time renderer path | supporting | Superseded if it routes semantic geometry into visual output | No current backend Resonance output |

## Superseded / Archived Material

The archive index `docs/archive/superseded-2026-08-14/README.md` marks these as historical only: `SOULSCOPE_CANON_v1.0.md`, `SoulScope_Canon_Foundational_Edition_v1.0.pdf`, `CONSTELLATION_BIBLE_v0.1.md`, `source/SoulScope_Constellation_Bible_v0.1.docx`, legacy audit/spec documents, `RESONANCE_SIGNATURE_legacy.md`, `seedStateIds.legacy.ts`, and `seed-states.v0.1.json`.

Active search found no runtime imports from `docs/archive/`. References in `architecture/23-canonical-backend-migration-map.md` are archive/provenance references, not current authority.

## Canon Alignment Matrix

| Layer | Canonical Rule / Registry Entry | Authority Source | Version | Implementation Location | Current Status | Classification | Gap / Conflict | Recommended Action | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authority | Single current authority ledger controls current Canon and registries | `docs/CANONICAL_AUTHORITY_LEDGER.md` | 2026-08-14 | `docs/CANONICAL_AUTHORITY_LEDGER.md` | Current and clear | IMPLEMENTED_AND_ALIGNED | None | Keep as sole index | None |
| Authority | Archived Canon/Bibles do not control runtime | Archive README | 2026-08-14 | `docs/archive/superseded-2026-08-14/` | Clear archive status | IMPLEMENTED_AND_ALIGNED | None found in runtime imports | Keep archive isolated | None |
| Contracts | Source authority includes all current registries | Authority Ledger | v1.3/v0.1 set | `packages/canonical-contracts/README.md` | Pattern Registry listed only as known authority gap, not in numbered source list | PARTIALLY_DEFINED | Provenance doc understates Pattern Registry as current authority | Update README source list in a later docs cleanup | P2 |
| Prompt protocol | P1 open reference, P2 troubling context, P3 future context; no neutral/negative/positive ground truth | Canon v1.3; Acoustic Registry v0.1 | v1.3/v0.1 | `promptProtocol.ts`, backend tests | Encoded and tested | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Measurement | Raw audio -> versioned extraction -> quality -> immutable MeasurementRecord | Canon v1.3; Acoustic Registry v0.1 | v1.3/v0.1 | `backend/app/processing/worker.py`, `measurement_records` | Implemented | IMPLEMENTED_AND_ALIGNED | Scope is measurement-only | Preserve as frozen upstream | None |
| Measurement | Production acoustic parameters must be registered, versioned, quality-gated, with separate semantic and renderer eligibility | Acoustic Registry v0.1 | v0.1 | `backend/app/acoustics/extractor.py` | Provisional subset | IMPLEMENTED_IN_CONFLICT_WITH_CANON | Runtime emits local IDs such as `AC_DURATION_MS`, `AC_RMS_ENERGY`, `AC_PITCH_ZCR_HZ`, `AC_SPECTRAL_CENTROID_HZ`, and `AC_FORMANT_TRACKING` while provenance uses feature registry `0.1`; the PDF registry defines canonical `AC_LLD_*`, SoulScope-native, and quality-variable sets | Add canonical machine-readable acoustic registry and map/rename provisional extractor outputs or version them as explicitly noncanonical engineering outputs before production use | P0 |
| Measurement | Time-resolved descriptors are preserved as authoritative when available | Acoustic Registry v0.1 | v0.1 | MeasurementRecord prompt summaries | Partially implemented | PARTIALLY_DEFINED | Extractor currently produces prompt-level summaries and placeholder formant unavailability, not full time-resolved descriptor channels | Add time-resolved measurement support after canonical ID alignment | P1 |
| Measurement | Jitter/shimmer restricted by periodicity and validation gates | Acoustic Registry v0.1; Evidence Registry v0.1 | v0.1 | `formants.py`, extractor | Correctly not implemented | CORRECTLY_DEFERRED_BY_CANON | None; unsupported formant/perturbation is rejected/null | Keep rejected/null, do not coerce to zero | None |
| Measurement | Missing/rejected values are not zero | Canon v1.3; Acoustic Registry v0.1 | v1.3/v0.1 | Extractor, quality tests | Implemented | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Evidence | Evidence Marker Registry defines canonical EV_* marker IDs and families | Evidence Marker Registry v0.1 | v0.1 | `evidenceMarkers.ts`, `backend/app/evidence/markers.py` | Simplified alias IDs only | IMPLEMENTED_IN_CONFLICT_WITH_CANON | Runtime/contracts use names such as `PROSODIC_EXPANSION`, `OUTPUT_CONTINUITY`, `MODULATION_BREADTH`; PDF registry defines canonical IDs including `EV_PRO_001`, `EV_PRO_002`, `EV_TIM_008`, `EV_DYN_005`, etc. | Replace alias marker IDs with canonical EV_* IDs or add a one-way compatibility adapter that persists canonical IDs | P0 |
| Evidence | Evidence families are PRO, ENG, TIM, PHO, SPE, DYN | Evidence Marker Registry; Inference Rule Registry | v0.1 | `evidenceMarkers.ts`, `dimensionInference.ts`, backend markers | Implemented | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Evidence | Evidence Ledger must include support, contradiction, missingness, confounds, confidence, references, provenance | Evidence Marker Registry v0.1 | v0.1 | `backend/app/evidence/engine.py`, `evidence_ledgers` | Structural subset | PARTIALLY_DEFINED | Ledger records statuses/provenance, but not full canonical marker-specific support/contradiction/confound/confidence behavior | Add canonical EV_* marker rules before using Evidence for Dimension scoring | P1 |
| Evidence | Missing/unavailable/rejected/insufficient are distinct and exhaustive | Evidence Marker Registry; Inference Rule Registry | v0.1 | Evidence Engine v1 | Implemented | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Evidence | Direct raw feature -> emotion/diagnosis/deception/personality claims prohibited | Canon v1.3; Evidence Registry v0.1 | v1.3/v0.1 | Evidence Engine v1 tests and contracts | Implemented | IMPLEMENTED_AND_ALIGNED | None found | Preserve | None |
| Evidence | Composite markers require multiple eligible components where specified | Evidence Marker Registry v0.1 | v0.1 | Evidence Engine v1 | Missing | CANON_DEFINED_IMPLEMENTATION_MISSING | Current structural engine emits availability entries per expected feature; canonical composites such as `EV_TIM_008 OUTPUT_CONTINUITY`, `EV_DYN_003 CONTEXT_RECONFIGURATION`, and `EV_DYN_005 MODULATION_BREADTH` need multi-input rules | Implement canonical marker-evaluation layer after acoustic ID alignment | P1 |
| Dimension | Sixteen canonical Dimensions and D1/D2/D3 classes | Dimension Registry v0.1 | v0.1 | `dimensionIds.ts`, `backend/app/dimensions/registry.py` | Implemented | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Dimension | Dimension result is not a bare score; posterior/confidence/coverage/baseline/contradiction/coherence/momentum/resolution/provenance are distinct | Dimension Registry; Inference Registry | v0.1 | `backend/app/dimensions/engine.py`, `dimension_results` | Implemented with null score/confidence | IMPLEMENTED_AND_ALIGNED | No numeric values fabricated | Preserve | None |
| Dimension | D3 hard abstentions: Recovery, Reserve, Relational Availability | Dimension Registry; Inference Registry | v0.1 | `dimensionInference.ts`, `dimension_results`, tests | Implemented | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Dimension | Required families and primary/candidate Evidence are defined per Dimension | Dimension Registry v0.1 | v0.1 | Current runtime ignores Evidence IDs | Missing from executable scoring/qualification | CANON_DEFINED_IMPLEMENTATION_MISSING | Registry defines required families/candidate Evidence for D1/D2 dimensions, but backend calibration marks all Evidence-to-Dimension mapping as absent | Encode structural Dimension Evidence requirements separately from calibrated numeric scoring | P1 |
| Dimension | Numeric posterior mapping, coefficients, confidence formula, contradiction cutoff, publication confidence remain calibration-dependent | Inference Registry v0.1 | v0.1 | Dimension Engine v1 and calibration foundation | Correctly abstains | CORRECTLY_DEFERRED_BY_CANON | None | Preserve abstention until calibrated | None |
| Calibration | Versioned calibration registry blocks scoring when scientific prerequisites missing | Inference Registry; Dimension Registry | v0.1 | `backend/app/dimensions/calibration.py`, `dimension_calibration_specs` | Implemented | IMPLEMENTED_AND_ALIGNED | None for numeric scoring | Preserve | None |
| Calibration | Evidence-to-Dimension structural mapping status | Dimension Registry v0.1 | v0.1 | `DIMENSION_CALIBRATION_REQUIREMENTS.md`, calibration gap code | Too broad | PARTIALLY_DEFINED | Current blocker says mapping `NOT_DEFINED`; canonical Dimension Registry partially defines required families and marker candidates, though not calibrated directionality/weights | Refine future blocker wording to `CALIBRATED_MARKER_TO_DIMENSION_SCORING_NOT_DEFINED` while preserving no-score behavior | P1 |
| State | Continuous geometry primary; compact anchor States; no forced winner | State Registry v0.1 | v0.1 | `stateRegistry.ts` only | Partial contract; no runtime | CORRECTLY_DEFERRED_BY_CANON | Numeric state regions, fit thresholds, confidence thresholds, blend margins pending calibration | Do not implement State engine until Dimension scoring exists | P4 |
| State | Eight initial anchors and required Dimensions | State Registry v0.1 | v0.1 | `stateRegistry.ts` | Implemented contract-level | IMPLEMENTED_AND_ALIGNED | No runtime engine | Preserve contract; runtime deferred | None |
| Interaction | Twelve canonical verbs and scientific boundaries | Interaction Registry v0.1 | v0.1 | `interactionRegistry.ts` | Implemented contract-level | IMPLEMENTED_AND_ALIGNED | No runtime engine | Preserve | None |
| Interaction | Interaction inference requires resolved upstream Dimensions/States, temporal/coverage/confidence conditions, and no static co-occurrence causality | Interaction Registry v0.1 | v0.1 | Contract policy only | Partial | PARTIALLY_DEFINED | Detailed interaction candidate conditions and calibration are not executable | Defer runtime Interaction engine until State/Dimension prerequisites exist | P4 |
| Pattern | Pattern is optional, downstream of Interactions, describes scan not person, no forced winner | Pattern Registry v0.1 | v0.1 | `patternRegistry.ts` | Implemented contract-level | IMPLEMENTED_AND_ALIGNED | No runtime engine | Preserve | None |
| Pattern | Seven initial Pattern IDs are research-only | Pattern Registry v0.1 | v0.1 | `patternRegistry.ts` | Implemented contract-level | IMPLEMENTED_AND_ALIGNED | No runtime publication | Preserve | None |
| Pattern | Pattern/Resonance separation | Pattern Registry v0.1; Authority Ledger | v0.1 | `patternRegistry.ts`, no resonance runtime | Implemented contract-level | IMPLEMENTED_AND_ALIGNED | None found | Preserve | None |
| Narrative | Narrative translates only completed Semantic Result; no raw audio/LLM reasoning/scoring/selection | Narrative Registry v0.1 | v0.1 | `narrativePolicy.ts` | Implemented contract-level | IMPLEMENTED_AND_ALIGNED | No runtime engine | Preserve | None |
| Narrative | Narrative templates, guard object, validation records, sentence-level traceability | Narrative Registry v0.1 | v0.1 | Minimal policy only | Missing from executable contract | CANON_DEFINED_IMPLEMENTATION_MISSING | Current contract captures policy but not full template/guard/validator schema | Implement only when Narrative milestone begins | P4 |
| Persistence | Immutable MeasurementRecord -> EvidenceLedger -> DimensionResult chain | Canon v1.3; ledgers/registries | v1.3/v0.1 | Migrations `20260815115156`, `20260815211541`, `20260815233420` | Implemented | IMPLEMENTED_AND_ALIGNED | None | Preserve | None |
| Persistence | Service-owned writes with RLS owner reads | Canon safety; Supabase policy | n/a | Current migrations/tests | Implemented and tested | IMPLEMENTED_AND_ALIGNED | None found in latest path | Preserve | None |
| Persistence | One logical Evidence persistence model | Canon v1.3; Evidence Ledger architecture | v1.3/v0.1 | `evidence_ledgers` plus older `evidence_records`/`result_manifest_evidence` | Ambiguous active schema | PARTIALLY_DEFINED | New Evidence Engine writes `evidence_ledgers`; earlier result-history schema still has `evidence_records` and manifest links, creating a duplicate Evidence persistence concept | Consolidate result-history manifest to consume `evidence_ledgers` or clearly mark old table as legacy compatibility before semantic-result publication | P1 |
| Runtime boundary | Evidence does not read WAVs; Dimension does not bypass Evidence; no downstream State/Pattern/Narrative/Resonance generated | Canon v1.3; registries | v1.3/v0.1 | Backend services/tests | Implemented | IMPLEMENTED_AND_ALIGNED | None found | Preserve | None |
| Frontend | Frontend must not perform scientific inference | Authority Ledger | current | No frontend changes in this audit | Not modified | IMPLEMENTED_AND_ALIGNED | Not audited for every frontend file in depth beyond no-change/no backend import finding | Preserve frontend freeze | None |

## Dimension-by-Dimension Findings

| Dimension | Label | Class | Structural Inference in Canon | Numeric Scoring in Canon | Current Implementation | Classification | Gap / Recommended Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| COG-P1 | Organization | D1 | Defined: TIM and DYN required; primary `EV_TIM_007`, `EV_TIM_008`, `EV_TIM_009`, `EV_DYN_001`, `EV_DYN_007`, `EV_DYN_008` | Calibration-dependent; coefficients are engineering priors until validated | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Implement structural evidence requirements before any D1 provisional score |
| COG-P2 | Exploration | D2 | Defined: P1 plus P2/P3; PRO, TIM, DYN required; candidates include `EV_PRO_002`, `EV_PRO_003`, `EV_ENG_002`, `EV_SPE_002`, `EV_DYN_003`, `EV_DYN_005`, `EV_DYN_006` | Absent until construct calibration and external validation | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Keep D2 no-score; encode structural prerequisites |
| COG-P3 | Focus Continuity | D1 | Defined: TIM required, DYN preferred; primary pause/run/fragmentation/maintenance Evidence | Calibration-dependent | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Implement structural evidence requirements before any D1 provisional score |
| COG-P4 | Processing Demand | D2 | Defined: at least 3 families from TIM/PHO/PRO/SPE/DYN; candidate Evidence listed; no single CPP/pause shortcut | Absent; requires calibrated multivariate model | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Preserve no-score; implement prerequisites only |
| REG-P1 | Activation | D2 | Defined: at least 3 independent families from PRO/ENG/TIM/PHO/SPE/DYN; candidate Evidence listed | Absent; no permanent F0 direction without calibration | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Preserve no-score; implement prerequisites only |
| REG-P2 | Stability | D1 | Defined: at least two of PRO/TIM/PHO/DYN; primary Evidence listed; not inverse of Flexibility | Calibration-dependent | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Implement structural evidence requirements before any D1 provisional score |
| REG-P3 | Flexibility | D2 | Defined: P1+P2+P3; requires `EV_DYN_003`, `EV_DYN_007` plus at least one of PRO/ENG/TIM/PHO/SPE; more change not automatically flexibility | Absent; requires learned/validated construct | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Preserve no-score; encode prerequisites |
| REG-P4 | Recovery | D3 | Defined hard abstention; current protocol lacks challenge + recovery interval | Not applicable | `UNRESOLVED`, `NO_RECOVERY_COMPATIBLE_CONDITION` | IMPLEMENTED_AND_ALIGNED | Preserve hard gate |
| CAP-P1 | Mobilization | D1 | Defined: P2 vs P1 or P3 vs P1 comparison; candidate Evidence listed | Calibration-dependent | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Implement structural comparisons before any D1 provisional score |
| CAP-P2 | Reserve | D3 | Defined hard abstention; current protocol lacks load + additional demand | Not applicable | `UNRESOLVED`, `NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL` | IMPLEMENTED_AND_ALIGNED | Preserve hard gate |
| CAP-P3 | Effort Cost | D2 | Defined: at least three candidate families and candidate Evidence; no subjective effort/fatigue/burnout inference | Absent; calibrated model required | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Preserve no-score; encode prerequisites |
| CAP-P4 | Sustainability | D1 | Defined: `EV_DYN_001`, `EV_DYN_009` plus one or more of TIM/PHO/PRO/ENG; limited to observed interval | Calibration-dependent | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Implement structural evidence requirements before any D1 provisional score |
| EXP-P1 | Range | D1 | Defined: at least two of PRO/ENG/TIM/SPE/DYN; primary Evidence listed | Calibration-dependent | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Implement structural evidence requirements before any D1 provisional score |
| EXP-P2 | Openness | D2 | Defined: EXP-P1 prerequisite; primary deployment/reconfiguration Evidence plus compatible PRO/ENG/TIM; not emotional/personality openness | Absent; construct calibration required | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Preserve no-score; encode prerequisites |
| EXP-P3 | Restraint | D2 | Defined: available range + context-specific compression; must not infer from narrow range alone | Absent; calibrated deployment/compression model required | Enumerated, unresolved, score null | PARTIALLY_DEFINED | Preserve no-score; encode prerequisites |
| EXP-P4 | Relational Availability | D3 | Defined hard abstention; monologic protocol lacks interaction/stimulus responsiveness observation | Not applicable | `UNRESOLVED`, `NO_RELATIONAL_OBSERVATION` | IMPLEMENTED_AND_ALIGNED | Preserve hard gate |

## Calibration Gap Audit

| Category | Current Calibration Foundation Says | Canon / Registry Audit Finding | Correct Classification | Notes |
| --- | --- | --- | --- | --- |
| Evidence-to-Dimension mappings | NOT_DEFINED | Dimension Registry defines structural required families and primary/candidate Evidence markers for many Dimensions | PARTIALLY_DEFINED | Numeric scoring mapping is absent, but structural mapping is not absent |
| Marker directionality | NOT_DEFINED | Some high/low expression descriptions exist; no full calibrated per-marker direction model | PARTIALLY_DEFINED | Do not execute as numeric direction without calibration |
| Weights | NOT_DEFINED | Inference Registry states coefficients/weights are calibration-dependent | ABSENT | Correctly blocked |
| Thresholds | NOT_DEFINED | Inference/State/Pattern registries leave thresholds calibration-dependent | ABSENT | Correctly blocked |
| Normalization | NOT_DEFINED | Acoustic and Evidence registries require compatible normalization for several measures, but no complete scoring normalization model | PARTIALLY_DEFINED | Structural requirement exists; executable normalization absent |
| Score range | NOT_DEFINED | Dimension posterior fields are defined; numeric score range/calibration not frozen | ABSENT | Correctly blocked |
| Minimum Evidence | NOT_DEFINED | Required families/minimum independent-family coverage are defined for several Dimensions | PARTIALLY_DEFINED | Current blocker is too broad; needs structural encoding |
| Confidence | NOT_DEFINED | Confidence components and separation from posterior are defined; exact formula remains pending | PARTIALLY_DEFINED | Do not fabricate formula |
| Priors/posteriors | NOT_DEFINED | Posterior object fields defined; exact mapping and estimator pending | PARTIALLY_DEFINED | Current null posterior is safe |
| Reference dataset | NOT_DEFINED | Validation/cohort need is defined; no dataset exists | ABSENT | Correctly blocked |
| Validation criteria | NOT_DEFINED | General gate categories exist; exact acceptance criteria not frozen | PARTIALLY_DEFINED | Software tests are not scientific validation |

## Do Not Build Yet

| Capability | Authority Source | Reason |
| --- | --- | --- |
| Numeric Dimension scoring | Dimension Registry v0.1; Inference Rule Registry v0.1 | Coefficients, weights, posterior mapping, score range, and validation data are not calibrated |
| Dimension confidence values | Inference Rule Registry v0.1 | Confidence components are defined but formula/calibration are pending |
| State selection/publication | State Registry v0.1 | Requires resolved Dimensions, state-region calibration, fit/confidence thresholds, and no forced winner |
| Cross-Constellation Interaction inference/publication | Interaction Registry v0.1 | Requires completed upstream Constellations/States and calibrated interaction models |
| Pattern inference/publication | Pattern Registry v0.1 | Initial motifs are `RESEARCH_ONLY`; no validated fit/publication thresholds or models |
| Narrative generation/publication | Narrative Registry v0.1 | Requires completed authorized Semantic Result and deterministic guard/validation layer |
| Resonance backend output from semantic geometry | Authority Ledger; Pattern Registry v0.1; Resonance Signature spec | Visual path must remain acoustic/time-resolved and separate |

## Canon Already Defines This

- Current authority chain and archive boundary.
- Three-prompt protocol and prohibited prompt assumptions.
- Measurement -> Evidence -> Dimension -> State/Interaction/Pattern -> Narrative semantic order.
- Separate Qualified Acoustic Measurements(t) -> Resonance Signature visual path.
- Evidence families: `PRO`, `ENG`, `TIM`, `PHO`, `SPE`, `DYN`.
- Canonical EV_* Evidence marker IDs and many structural marker inputs/outputs.
- Sixteen canonical Dimension IDs, labels, Constellation grouping, and D1/D2/D3 classes.
- Required Evidence families and primary/candidate Evidence for many Dimensions.
- D3 hard abstentions for Recovery, Reserve, and Relational Availability.
- Unknown/missing/rejected/unavailable/insufficient must not become zero or negative evidence.
- Compact State anchor set, geometry-primary behavior, no forced State winner, boundary blend, unresolved.
- Interaction verb set and causal/semantic boundaries.
- Seven research-only Pattern IDs, no forced Pattern winner, boundary/nonadjacent/multiple-candidate behavior, Pattern/Resonance separation.
- Narrative authority boundary, prohibited claims, unresolved language, LLM restrictions, and traceability requirements.

## Prioritized Remediation List

| Priority | Finding | Recommended Action |
| --- | --- | --- |
| P0 | Backend MeasurementRecord currently claims registry `0.1` while emitting provisional non-registry feature IDs | Align extractor outputs to Acoustic Parameter Registry v0.1 IDs or explicitly version them as noncanonical engineering measurements before production use |
| P0 | Evidence contracts/runtime use simplified marker labels rather than authoritative EV_* Evidence Marker IDs | Replace persisted marker IDs with EV_* IDs and use aliases only as display/internal compatibility metadata if needed |
| P1 | Evidence Engine v1 is structural availability only and does not implement canonical marker-specific composite rules | Implement canonical EV_* marker evaluation after acoustic ID alignment |
| P1 | Dimension Engine/calibration treats Evidence-to-Dimension mapping as fully absent despite structural mappings in Dimension Registry | Encode structural Dimension requirements separately from calibrated scoring; keep numeric score blocked |
| P1 | Active schema contains both old `evidence_records` and new `evidence_ledgers` Evidence persistence concepts | Consolidate result-manifest/result-history path to canonical `evidence_ledgers` or explicitly isolate old table as legacy compatibility |
| P2 | `packages/canonical-contracts/README.md` omits Pattern Registry from numbered source authority list and calls it a known gap | Update contract package documentation/provenance |
| P3 | Narrative executable contract is much thinner than Narrative Registry | Expand only when Narrative milestone begins |
| P4 | State/Interaction/Pattern/Narrative runtime engines remain unimplemented | Correctly deferred until upstream scoring/calibration and publication gates exist |

## Recommended Next Milestone

Recommended next milestone: **Canonical ID and Structural Mapping Reconciliation**.

Scope should be limited to:

- machine-readable Acoustic Parameter Registry alignment;
- canonical EV_* Evidence Marker Registry alignment;
- structural Evidence-to-Dimension requirement encoding;
- persistence consolidation plan for `evidence_records` versus `evidence_ledgers`;
- no numeric Dimension scoring.

This milestone should occur before any further calibration/scoring or State/Interaction/Pattern work.
