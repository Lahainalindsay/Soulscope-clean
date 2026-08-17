# Dimension Calibration Specification

Status: CALIBRATION_REQUIRED
Scope: Scientific calibration specification gate only
Date: 2026-08-17

This document is the authoritative repository artifact for the scientific work
required before numeric Dimension scoring may be implemented. It does not
authorize numeric scores, confidence values, posterior intervals, State
selection, Interaction inference, Pattern inference, Narrative generation, or
Resonance output.

Numeric Dimension scoring is NOT ready for implementation.

## Authority Sources

- `docs/canonical/The SoulScope Canon v1.3.pdf`
- `docs/canonical/SoulScope Acoustic Parameter Registry v0.1.pdf`
- `docs/canonical/SoulScope Evidence Marker Registry.pdf`
- `docs/canonical/SoulScope Constellation Dimension Registry v0.1.pdf`
- `docs/canonical/SoulScope Inference Rule Registry v0.1.pdf`
- `architecture/CANON_V1_3_ALIGNMENT_AUDIT.md`
- `packages/canonical-contracts/src/acousticParameters.ts`
- `packages/canonical-contracts/src/evidenceMarkers.ts`
- `packages/canonical-contracts/src/dimensionInference.ts`
- `backend/app/dimensions/registry.py`

Archived Canon, legacy Bible documents, old Resonance documents, and
superseded state seeds are not authority for this specification.

## 1. Canon Already Defines

Canon v1.3 and the current registries define the scientific envelope and the
structural input contract:

- Semantic order: MeasurementRecord -> Evidence Ledger -> Dimension Result.
- Measurement is not meaning; no acoustic parameter may directly assert an
  emotion, diagnosis, personality trait, deception, identity, causal state, or
  hidden state.
- Raw measurement records, Evidence ledgers, and completed semantic results are
  immutable; corrections require new versions rather than silent rewrites.
- Evidence Marker IDs are canonical `EV_*` IDs grouped into six Evidence
  families: `PRO`, `ENG`, `TIM`, `PHO`, `SPE`, and `DYN`.
- Multiple markers from one Evidence family count as one independent Evidence
  family when a Dimension requires independent-family coverage.
- Missing, rejected, contradicted, insufficient, unavailable, and negative
  evidence are distinct states.
- Strong evidence from one family does not compensate for a missing family when
  that family is explicitly required.
- Dimension results are posterior objects in concept, with separate posterior,
  confidence, evidence coverage, baseline trust, contradiction, coherence,
  momentum, resolution, and provenance fields.
- Under the current production protocol, `REG-P4`, `CAP-P2`, and `EXP-P4` are
  D3 protocol-unobservable Dimensions and must abstain.
- The active implementation may encode structural eligibility, but all numeric
  scoring outputs remain `CALIBRATION_REQUIRED`.

The Canon and registries define structural mappings for all 16 Dimensions, but
they do not define a complete calibrated scoring model for any Dimension.

## 2. Scientific Decisions Still Required

These decisions are missing for every Dimension unless a future approved
calibration registry explicitly defines them:

| Requirement | Current status | Required decision |
| --- | --- | --- |
| Marker directionality | NOT_DEFINED | Versioned orientation for each accepted Evidence marker relative to each Dimension scale. |
| Minimum Evidence for scoring | PARTIALLY_DEFINED | Structural family requirements exist; calibrated minimum coverage/publication criteria do not. |
| Weights or model coefficients | NOT_DEFINED | Calibrated weights, coefficients, or an approved non-weighted estimator. |
| Normalization | NOT_DEFINED | Versioned reference, prompt-contrast, device, language, and baseline normalization procedure. |
| Thresholds | NOT_DEFINED | Versioned eligibility, publication, contradiction, confidence, and abstention thresholds. |
| Score range | NOT_DEFINED | Numeric scale, bounds, interpretation, and user-visible precision policy. |
| Confidence model | NOT_DEFINED | Formula or estimator preserving quality, coverage, agreement, baseline trust, drift, missingness, and contradiction as distinct components. |
| Posterior model | NOT_DEFINED | Estimator for posterior mean and interval, or approved replacement for posterior fields. |
| Reference dataset | NOT_DEFINED | Governed calibration and validation dataset identity, inclusion rules, provenance, and version. |
| Validation acceptance | NOT_DEFINED | Pre-registered metrics, numeric acceptance thresholds, failure handling, and promotion authority. |

No undocumented constant in runtime code may satisfy any item in this table.

## 3. Data Required For Calibration

A calibration dataset must be governed, versioned, consent-compatible, and
traceable enough to reconstruct every result from source measurement through
Evidence and Dimension decision records.

Required data for every included scan:

- Source audio or approved retained acoustic source representation.
- Capture metadata: participant pseudonymous ID, prompt ID, prompt text/version,
  capture timing, device/acquisition metadata, environment metadata, and consent
  or research-use authorization version.
- MeasurementRecord fields required by the Acoustic Parameter Registry:
  `feature_id`, `feature_registry_version`, `unit`, `extractor_id`,
  `extractor_version`, `extractor_configuration_hash`, prompt/window timing,
  quality status, validity status, reference compatibility, confounds, and
  provenance.
- Canonical acoustic parameters used by the active runtime:
  `SS_RESPONSE_ONSET_LATENCY`, `SS_PAUSE_LOAD`, `Q_CLIPPING_RATIO`,
  `Q_VOICED_RATIO`.
- Explicit provisional/non-canonical acoustic parameters if retained as model
  candidates; these must not masquerade as registry v0.1 canonical parameters.
- Complete canonical `EV_*` Evidence Ledger output with marker family, prompt
  scope, accepted/rejected/missing/insufficient inputs, contradiction status,
  confounds, rule version, and source measurement provenance.
- Dimension structural eligibility output for all 16 Dimensions, including
  required families, candidate markers, missing families, rejected inputs, D3
  abstentions, and `CALIBRATION_REQUIRED` status.
- Participant-level repeated scans sufficient to estimate reliability,
  within-session contrast behavior, personal-baseline behavior, missingness, and
  version compatibility.
- Independent train, tuning/calibration, and final evaluation splits separated
  at the participant level. Repeated scans from one participant must not cross
  from training into final evaluation.
- Coverage across relevant devices, recording environments, speech material,
  language or dialect contexts, accents, demographic subgroups, accessibility
  conditions, and quality/confound profiles.

Additional requirements by Dimension class:

- D1 descriptive-functional Dimensions require reliability and construct-behavior
  data for transparent engineering-rule candidates, including repeatability,
  sensitivity to prompt contrasts, and robustness under quality variation.
- D2 construct-calibrated Dimensions require independently justified external
  validation targets. Target labels may not be created merely by internal
  subjective annotation such as "this voice sounds activated."
- D3 protocol-unobservable Dimensions require new protocol data containing the
  observation the active three-prompt protocol lacks; the current dataset cannot
  calibrate them for publication.

## 4. Validation Required Before CALIBRATION_VALIDATED

A future calibration may be promoted only after validation is explicitly
pre-registered and passed on frozen participant-separated evaluation data.

Required validation domains:

- Measurement reliability and extractor/version reproducibility.
- Evidence Marker reproducibility, missingness behavior, rejection behavior,
  contradiction preservation, and composite-marker provenance.
- Structural eligibility correctness for required Evidence families and
  independent-family counting.
- Posterior calibration if posterior fields are retained.
- Interval coverage if lower/upper intervals are retained.
- Confidence calibration, separate from posterior tendency.
- Reliability across repeated scans and prompt contexts.
- Abstention accuracy, including all D3 hard abstentions and insufficient
  required-family cases.
- Contradiction handling: strong independent contradiction must reduce
  confidence and/or force unresolved status according to the active policy; it
  must not disappear through averaging.
- Out-of-distribution detection and reference-compatibility behavior.
- Generalization and fairness across relevant devices, environments, language or
  dialect contexts, accents, demographic subgroups, accessibility conditions,
  and quality/confound profiles.
- User-result publication gating: resolution status, confidence, coverage,
  contradiction, construct-validation status, active confounds, and reference
  compatibility must all be evaluated before a numeric result can be published.

Current Canon identifies these validation domains, but it does not define the
numeric acceptance thresholds. A future calibration registry must provide
threshold IDs, versions, target Dimensions, values, calibration dataset identity,
validation dataset identity, scientific status, activation date, and rollback or
hold policy.

## Per-Dimension Calibration Specification

Legend:

- Structural eligibility means the active Evidence Ledger contains the Canon
  required families, candidate markers, prompt prerequisites, required markers,
  and independent-family coverage for that Dimension.
- Numeric scoreable remains `false` for every Dimension in this specification.
- Directionality, weights, normalization, thresholds, score range, confidence
  model, and posterior model are `NOT_DEFINED` for every Dimension.

| Dimension | Class | Canon structural Evidence | Candidate EV markers | Structural prerequisites and minimum Evidence | Dataset requirement | Validation requirement | D3 rule |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `COG-P1` Organization | D1 | Required families: `TIM`, `DYN` | `EV_TIM_007`, `EV_TIM_008`, `EV_TIM_009`, `EV_DYN_001`, `EV_DYN_007`, `EV_DYN_008` | Both required families must qualify; same-family duplicates do not add independence. | Repeated three-prompt scans with timing/run-structure, continuity, fragmentation, drift, coherence, and discordance evidence. | Reliability, prompt/context sensitivity, missingness, contradiction, and reproducibility of descriptive organization behavior. | None |
| `COG-P2` Exploration | D2 | Required families: `PRO`, `TIM`, `DYN`; optional: `ENG`, `SPE` | `EV_PRO_002`, `EV_PRO_003`, `EV_ENG_002`, `EV_SPE_002`, `EV_DYN_003`, `EV_DYN_005`, `EV_DYN_006` | Requires `P1` plus `P2` or `P3`; required families must qualify. | D2 construct dataset with independently justified exploration/deployment targets, plus full three-prompt acoustic and Evidence provenance. | External construct validation, incremental value beyond `EXP-P1`, calibration, fairness/generalization, and publication-gate validation. | None |
| `COG-P3` Focus Continuity | D1 | Required family: `TIM`; optional: `DYN` | `EV_TIM_002`, `EV_TIM_003`, `EV_TIM_004`, `EV_TIM_007`, `EV_TIM_008`, `EV_TIM_009`, `EV_DYN_009` | Timing family must qualify; dynamic maintenance may support but cannot replace required timing. | Repeated scans with pause load, pause duration, pause density, run structure, continuity, fragmentation, and maintenance markers. | Reliability, sensitivity to continuity/fragmentation changes, missingness, and quality/confound robustness. | None |
| `COG-P4` Processing Demand | D2 | Minimum 3 independent families from `TIM`, `PHO`, `PRO`, `SPE`, `DYN` | `EV_TIM_002`, `EV_TIM_005`, `EV_TIM_006`, `EV_TIM_009`, `EV_PHO_001`, `EV_PHO_004`, `EV_SPE_001`, `EV_DYN_007`, `EV_DYN_008` | At least 3 independent eligible families; no single CPP, pause, or rate shortcut. | D2 dataset with independent processing-demand or task-load criteria, quality-controlled phonatory/timing/prosody/spectral/dynamic evidence. | External construct validation, contradiction handling, multi-family independence, OOD, and publication-gate validation. | None |
| `REG-P1` Activation | D2 | Minimum 3 independent families from `PRO`, `ENG`, `TIM`, `PHO`, `SPE`, `DYN` | `EV_PRO_001`, `EV_PRO_002`, `EV_ENG_001`, `EV_TIM_005`, `EV_PHO_001`, `EV_SPE_001`, `EV_DYN_007` | At least 3 independent eligible families; no permanent `F0 higher => Activation higher` rule without calibration. | D2 dataset with independently justified activation/mobilization targets and broad device/environment coverage. | External construct validation, calibrated directionality, multi-family agreement/contradiction, and publication-gate validation. | None |
| `REG-P2` Stability | D1 | Minimum 2 independent families from `PRO`, `TIM`, `PHO`, `DYN` | `EV_PRO_003`, `EV_TIM_007`, `EV_TIM_008`, `EV_PHO_004`, `EV_DYN_002`, `EV_DYN_008`, `EV_DYN_009` | At least 2 independent eligible families; same-family timing markers remain one family. | Repeated scans with within-prompt and cross-prompt stability/volatility evidence. | Reliability, within-person stability behavior, missingness, contradiction, and confound robustness. | None |
| `REG-P3` Flexibility | D2 | Required family: `DYN`; optional supporting families: `PRO`, `ENG`, `TIM`, `PHO`, `SPE` | Required: `EV_DYN_003`, `EV_DYN_007`; candidates: `EV_DYN_003`, `EV_DYN_007` | Requires prompts `P1`, `P2`, and `P3`; requires `EV_DYN_003` and `EV_DYN_007`; plus at least one of `PRO`, `ENG`, `TIM`, `PHO`, `SPE`. | D2 dataset with context-shift protocol fidelity and independently justified flexibility/reconfiguration targets. | External construct validation, context reconfiguration validity, multi-family coherence, and publication-gate validation. | None |
| `REG-P4` Recovery | D3 | Current protocol supplies no eligible structural Evidence | None under current protocol | No inference permitted under the active three-prompt protocol. | New challenge-and-recovery protocol with explicit loading/challenge condition and subsequent recovery observation. | Abstention accuracy under current protocol; future protocol validation for recovery trajectory, baseline/reference compatibility, and publication gates. | `NO_RECOVERY_COMPATIBLE_CONDITION` |
| `CAP-P1` Mobilization | D1 | Prompt comparison requirement; candidate families include `PRO`, `ENG`, `TIM`, `DYN` | `EV_PRO_002`, `EV_ENG_001`, `EV_ENG_002`, `EV_TIM_005`, `EV_TIM_006`, `EV_DYN_003`, `EV_DYN_007` | Requires `P2 vs P1` or `P3 vs P1` comparison. | Repeated three-prompt scans with contrast evidence for range, loudness, rate, reconfiguration, and coherence. | Reliability, contrast behavior, reference compatibility, and quality/confound robustness. | None |
| `CAP-P2` Reserve | D3 | Current protocol supplies no eligible structural Evidence | None under current protocol | No inference permitted under the active three-prompt protocol. | New load-and-reload/additional-demand protocol capable of observing post-demand remaining capacity. | Abstention accuracy under current protocol; future protocol validation for load response, reserve interpretation, and publication gates. | `NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL` |
| `CAP-P3` Effort Cost | D2 | Minimum 3 independent families from `TIM`, `PHO`, `PRO`, `ENG`, `SPE`, `DYN` | `EV_TIM_002`, `EV_TIM_007`, `EV_TIM_009`, `EV_PHO_001`, `EV_PHO_004`, `EV_DYN_001`, `EV_DYN_009` | At least 3 independent eligible families. | D2 dataset with independently justified effort-cost or task-cost criteria and high-quality timing/phonatory/dynamic evidence. | External construct validation, calibrated directionality, contradiction handling, OOD, and publication-gate validation. | None |
| `CAP-P4` Sustainability | D1 | Required family: `DYN`; optional supporting families: `TIM`, `PHO`, `PRO`, `ENG` | Required: `EV_DYN_001`, `EV_DYN_009`; candidates: `EV_DYN_001`, `EV_DYN_009` | Requires `EV_DYN_001` and `EV_DYN_009`; plus one or more of `TIM`, `PHO`, `PRO`, `ENG`. Scope is the observed short interval only. | Repeated scans with within-prompt drift and short-interval maintenance evidence plus supporting timing/phonatory/prosody/energy data. | Reliability of short-interval maintenance, drift interpretation, missingness, contradiction, and quality/confound robustness. | None |
| `EXP-P1` Range | D1 | Minimum 2 independent families from `PRO`, `ENG`, `TIM`, `SPE`, `DYN` | `EV_PRO_002`, `EV_ENG_002`, `EV_SPE_002`, `EV_DYN_005` | At least 2 independent eligible families. | Repeated scans with modulation breadth across prosody, energy, timing, spectral, and dynamic domains. | Reliability, range sensitivity, family independence, missingness, and confound robustness. | None |
| `EXP-P2` Openness | D2 | Required family: `DYN`; optional compatible families: `PRO`, `ENG`, `TIM` | `EV_DYN_003`, `EV_DYN_005`, `EV_DYN_006` | `EXP-P1` Range must have sufficient evidence; requires deployment/reconfiguration Evidence plus compatible `PRO`, `ENG`, or `TIM`. | D2 dataset with independently justified expressive deployment or openness targets; must separate from personality/emotional openness claims unless validated. | External construct validation, dependency on `EXP-P1`, calibrated deployment directionality, and publication-gate validation. | None |
| `EXP-P3` Restraint | D2 | Context-specific compression after available range is established | `EV_PRO_002`, `EV_ENG_002`, `EV_DYN_005`, `EV_DYN_006` | Requires available range and context-specific compression; compression is not a personality or inhibition conclusion without validation. | D2 dataset with independently justified context-specific restraint/compression targets and available-range evidence. | External construct validation, calibrated compression interpretation, contradiction handling, and publication-gate validation. | None |
| `EXP-P4` Relational Availability | D3 | Current monologic protocol supplies no eligible structural Evidence | None under current protocol | No inference permitted without actual interaction or approved interactive stimulus responsiveness observation. | New interactional protocol with observable relational responsiveness and source interaction provenance. | Abstention accuracy under current protocol; future protocol validation for interactional responsiveness and publication gates. | `NO_RELATIONAL_OBSERVATION` |

## Per-Dimension Missing Calibration Fields

For each of the 16 Dimensions above:

- Marker directionality: `NOT_DEFINED`
- Weights: `NOT_DEFINED`
- Normalization: `NOT_DEFINED`
- Thresholds: `NOT_DEFINED`
- Score range: `NOT_DEFINED`
- Confidence model: `NOT_DEFINED`
- Posterior model: `NOT_DEFINED`
- Numeric scoreable: `false`
- Required output status until a validated calibration is adopted:
  `CALIBRATION_REQUIRED`

Structural eligibility may become true for non-D3 Dimensions when Canon-defined
Evidence requirements are met. Structural eligibility is not numeric scoring
eligibility.

## Canonical Evidence Marker Registry For Calibration Inputs

The calibration dataset must preserve these canonical Evidence families and
marker IDs. Simplified aliases are not valid new canonical ledger output.

| Family | Canonical markers |
| --- | --- |
| `PRO` | `EV_PRO_001`, `EV_PRO_002`, `EV_PRO_003`, `EV_PRO_004` |
| `ENG` | `EV_ENG_001`, `EV_ENG_002`, `EV_ENG_003` |
| `TIM` | `EV_TIM_001`, `EV_TIM_002`, `EV_TIM_003`, `EV_TIM_004`, `EV_TIM_005`, `EV_TIM_006`, `EV_TIM_007`, `EV_TIM_008`, `EV_TIM_009` |
| `PHO` | `EV_PHO_001`, `EV_PHO_002`, `EV_PHO_003`, `EV_PHO_004` |
| `SPE` | `EV_SPE_001`, `EV_SPE_002`, `EV_SPE_003` |
| `DYN` | `EV_DYN_001`, `EV_DYN_002`, `EV_DYN_003`, `EV_DYN_004`, `EV_DYN_005`, `EV_DYN_006`, `EV_DYN_007`, `EV_DYN_008`, `EV_DYN_009` |

Composite marker rules must remain deterministic and provenance-complete. The
dataset must retain accepted inputs, rejected inputs, missing inputs,
insufficient inputs, source Evidence families, prompt scope, rule version, and
resulting Evidence status.

## Promotion Gate

Before any implementation may return numeric Dimension scores, a new approved
calibration version must define:

- compatible Measurement, Evidence, and Dimension engine versions;
- compatible acoustic registry and Evidence registry versions;
- allowed canonical and explicitly provisional input variables;
- per-Dimension marker directionality;
- per-Dimension minimum calibrated evidence and publication policy;
- per-Dimension estimator, model coefficients, or non-weighted alternative;
- normalization/reference procedure;
- score range and interpretation policy;
- posterior estimator and interval construction, or approved replacement;
- confidence estimator separate from posterior tendency;
- contradiction and missingness handling;
- threshold registry with threshold IDs and versions;
- calibration/reference dataset identity and governance;
- participant-level split policy;
- validation metrics and numeric acceptance criteria;
- subgroup/generalization/fairness acceptance policy;
- D3 protocol-change requirements and validation criteria;
- scientific approval and activation record.

Until that promotion gate is satisfied, the correct downstream status remains
`CALIBRATION_REQUIRED`.
