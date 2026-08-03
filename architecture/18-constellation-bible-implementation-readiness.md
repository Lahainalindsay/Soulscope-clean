# Constellation Bible Implementation Readiness

Source: `docs/source/SoulScope_Constellation_Bible_v0.1.docx`
Markdown transcription: `docs/CONSTELLATION_BIBLE.md`
Governing Canon: `docs/SOULSCOPE_CANON.md`

## Status Vocabulary

- NORMATIVE_AND_IMPLEMENTABLE: source-defined and safe for contract extraction without guessing.
- NORMATIVE_BUT_UNCALIBRATED: source-defined, but scoring/threshold behavior requires calibration before implementation.
- ILLUSTRATIVE: useful example, not a production rule without approval.
- RESEARCH_PRIOR: research guidance before production rulemaking.
- PROVISIONAL: plausible but not final.
- DEFERRED: intentionally later.
- PROHIBITED: must not be implemented.
- AMBIGUOUS: source status unclear.
- MISSING: required detail absent.

## Readiness Matrix

| Specification | Classification | Source basis | What is missing | Resolving source | Approval/calibration need |
| --- | --- | --- | --- | --- | --- |
| Permanent constellation IDs | NORMATIVE_AND_IMPLEMENTABLE | COG, REG, CAP, EXP are directly specified. | None for contract extraction. | Constellation Bible | Owner approval sufficient for IDs; no calibration required. |
| Permanent dimension IDs | NORMATIVE_AND_IMPLEMENTABLE | COG-P1..EXP-P4 are directly specified. | None for contract extraction. | Constellation Bible | Owner approval sufficient for IDs; no calibration required. |
| Dimension definitions | NORMATIVE_BUT_UNCALIBRATED | Definitions and evidence tables are source-specified. | Executable feature mapping and calibration. | Constellation Bible plus scientific calibration | Owner approval can freeze text; calibration required before scoring. |
| Eligible evidence | NORMATIVE_BUT_UNCALIBRATED | Evidence families are listed for each point. | Exact low-level feature registry and commercial/license-safe extractor choices. | Bible plus Acoustic Measurement Layer | Scientific and licensing review required. |
| Evidence aggregation | NORMATIVE_BUT_UNCALIBRATED | Two independent evidence-family rule is explicit. | Weights and contradiction math. | Bible plus validation program | Calibration required. |
| Normalization | NORMATIVE_BUT_UNCALIBRATED | Formula is explicit in section 5.1. | Feature-specific epsilon, compatible reference rules, missingness implementation. | Bible plus empirical calibration | Scientific calibration required. |
| Baseline hierarchy | NORMATIVE_AND_IMPLEMENTABLE | Personal Reference Signature, within-session reference, population prior, no reference are explicit. | Trust computation details for scoring. | Bible and prompt protocol | Contract extraction ready; scoring not ready. |
| Prompt-transition logic | NORMATIVE_BUT_UNCALIBRATED | Ordered prompt requirements appear in dimensions/states. | Prompt labels to task metadata, transition formulas, low-confidence transition handling. | Bible plus validation data | Calibration required. |
| State registry | NORMATIVE_BUT_UNCALIBRATED | Seed state IDs and definitions are source-specified. | Whether all region intervals are final or examples. | Bible/owner approval | Owner approval plus calibration required. |
| State eligibility | NORMATIVE_BUT_UNCALIBRATED | Candidate-state sequence and hard requirements are explicit. | Publish thresholds and exact eligibility predicates. | Bible plus Decision Ledger architecture | Calibration required. |
| Geometry | NORMATIVE_BUT_UNCALIBRATED | Posterior point scale, descriptors, and candidate selection are specified. | Distance functions, intervals, boundary distance formulas. | Bible plus validation program | Calibration required. |
| Boundary blends | NORMATIVE_BUT_UNCALIBRATED | Blend behavior and registry growth policy are specified. | Blend margin and stable-use criteria. | Bible plus E.6 calibration data | Calibration required. |
| Confidence | NORMATIVE_BUT_UNCALIBRATED | Confidence components are specified. | Calibrated function and caps. | Bible plus validation program | Scientific calibration required. |
| Intervals | PROVISIONAL | Posterior distributions and intervals are required. | Interval construction method. | Bible plus scientific review | Scientific calibration required. |
| Missingness | NORMATIVE_AND_IMPLEMENTABLE | Missing baseline unknown-not-average and unresolved behavior are explicit. | Schema representation details. | Bible plus Evidence Ledger | Contract extraction ready. |
| Contradiction | NORMATIVE_BUT_UNCALIBRATED | Contradiction must remain visible and affect publishability. | Contradiction penalty formula. | Bible plus Decision Ledger | Calibration required. |
| Abstention | NORMATIVE_BUT_UNCALIBRATED | Unresolved behavior and pattern suppression are explicit. | Thresholds for abstention. | Bible plus owner/scientific review | Calibration required. |
| Interactions | NORMATIVE_BUT_UNCALIBRATED | Relation record and high-value rules are source-specified. | Executable thresholds and full evidence requirements. | Bible | Owner approval plus calibration required. |
| Pattern decisions | NORMATIVE_BUT_UNCALIBRATED | Pattern label selected after reasoning; suppression rule is explicit. | Top-two gap and essential interaction thresholds. | Bible plus Decision Ledger | Calibration required. |
| Personal reflection | NORMATIVE_AND_IMPLEMENTABLE | Narrative structure and internal citation contract are explicit. | Approved clause library. | Bible plus Canon | Contract extraction ready; generation not ready. |
| Resonance Signature mappings | NORMATIVE_BUT_UNCALIBRATED | Visual property/data source/meaning table is source-specified. | Renderer parameter contract and validation metrics. | Bible plus Canon visual laws | Contract extraction limited; renderer behavior not ready. |
| Validation requirements | NORMATIVE_AND_IMPLEMENTABLE | Phase gates and ground-truth strategy are specified. | Operational test plan details. | Bible | Can implement validation checklist/contracts. |
| Versioning | NORMATIVE_AND_IMPLEMENTABLE | Registry governance and version metadata are specified. | Release process mechanics. | Bible plus owner approval | Contract extraction ready. |
| Historical-result compatibility | DEFERRED | Old behavior is historical only. | Migration policy for old scans. | Owner decision | Owner approval required; no implementation now. |

## Items Not Implementation-Ready

The following are not ready for executable scoring or production behavior without guessing:

- Dimension scoring: requires feature registry, weighting, and calibration.
- Acoustic formulas: source provides normalization direction, but feature-specific epsilon, units, and compatible references must be established.
- Thresholds: source blueprint values and intervals need owner/scientific confirmation before production use.
- State selection: requires calibrated distance, fit, publish threshold, contradiction penalty, and blend margin.
- Narrative generation: source contract is ready, but approved clause templates and duplicate detection remain unresolved.
- Renderer behavior: source mapping is ready for parameter contract extraction, not full renderer implementation.
- Historical-result compatibility: deferred pending owner migration decision.

## Limited Contract Extraction Allowed

Without guessing, the following contracts may be extracted after owner approval:

- document/version metadata types
- constellation IDs: COG, REG, CAP, EXP
- dimension IDs and labels
- seed state IDs and display names
- evidence ledger record field names
- baseline hierarchy enum
- allowed processing-stage names
- narrative section names and internal citation requirement
- validation phase gate names
- source/provenance/version fields

## Implementation Gate Conclusion

READY_FOR_LIMITED_CONTRACT_EXTRACTION

This conclusion permits types, schemas, IDs, enum registries, and provenance contracts only. It does not authorize acoustic formulas, thresholds, dimension scoring, state selection, narrative generation, renderer behavior, database migration, frontend migration, or production deployment.
