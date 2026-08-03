# Constellation Bible Source Audit

This audit compares the correct Constellation Bible source, the Foundational Canon, the current pre-task Constellation Bible file, current architecture documents, and Phase E.5 audit documents.

## Authority Precedence

1. Canon for product truth, scientific boundaries, prohibited claims, visual laws, and governance.
2. Correct Constellation Bible for operational constellation specifications.
3. Current architecture documents for compatible implementation contracts.
4. Historical code only as evidence of previous behavior.

## Source Labels

- BIBLE — direct specification from the correct Bible.
- CANON — direct product or scientific boundary.
- DERIVED — compatible operational interpretation.
- PROVISIONAL — not finalized.
- CONFLICTING — conflicts with another source.
- INCOMPLETE — required detail is missing.
- HISTORICAL — old behavior, not automatically valid.
- REJECTED — incompatible with the current system.
- UNKNOWN — source cannot be established.

## Major Rule Audit

| Rule area | Primary source | Label | Relationship and notes |
| --- | --- | --- | --- |
| Product truth and claim boundary | `docs/SOULSCOPE_CANON.md` | CANON | Canon controls; Bible must remain subordinate for product/scientific claims. |
| Voice-first current product boundary | Canon and Bible scientific boundary | CANON | Future modalities remain research until separately validated. |
| Evidence hierarchy and scientific caution | Bible sections 1-2; Canon boundaries | BIBLE | Bible directly states acoustic cues are many-to-many and dimensions are evidence-supported tendencies. |
| Deception detection prohibition | Bible scientific boundary; Canon claim boundary | CANON | Bible specifically rejects LVA deception claims; Canon prohibits hidden-truth claims. |
| Canonical processing contract | Bible section 3; `architecture/CANONICAL_PIPELINE.md` | BIBLE | Bible supplies the processing sequence from Raw Acoustic Features through Resonance Signature. |
| Evidence Ledger minimum record | Bible section 3.1; `architecture/EVIDENCE_LEDGER.md` | BIBLE | Direct Bible detail governs; architecture contract is compatible. |
| Baseline hierarchy | Bible section 3.2; `architecture/BASELINE_AND_PROMPT_PROTOCOL.md` | BIBLE | Bible separates within-scan baseline, personal Reference Signature, and population priors. |
| Acoustic extraction recommendation | Bible section 4; `architecture/ACOUSTIC_MEASUREMENT_LAYER.md` | BIBLE | Bible recommends eGeMAPS concepts and Praat/Parselmouth; architecture constrains hosted/licensed implementation. |
| Browser approximations | Bible section 4; Acoustic Measurement Layer | BIBLE | Browser approximations must be lower reliability and cannot become canonical without validation. |
| Normalization formula | Bible section 5.1 | BIBLE | Direct formula retained in Bible transcription. Implementation requires review for units/version compatibility. |
| Evidence-family aggregation | Bible section 5.2 | BIBLE | At least two independent evidence families; correlated measurements count once. |
| Cognitive Form constellation | Bible section 6 | BIBLE | Names, point IDs, state IDs, and state descriptions are direct Bible specifications. |
| Regulatory Motion constellation | Bible section 7 | BIBLE | Names, point IDs, state IDs, and state descriptions are direct Bible specifications. |
| Available Capacity constellation | Bible section 8 | BIBLE | Bible directly prohibits metabolic reserve, organ health, burnout, and physical vitality claims. |
| Expressive Interface constellation | Bible section 9 | BIBLE | Bible directly prohibits honesty, hidden emotion, attachment style, social intent, and personality inference. |
| Geometry point scale | Bible section 10.1 | BIBLE | Posterior distribution, mean, interval, confidence, coverage, and baseline trust are direct Bible requirements. |
| Candidate-state selection | Bible section 10.3; Decision Ledger | BIBLE | Bible directly defines distance, eligibility, fit, blend, unresolved, alternatives, and lost-on reasons. |
| Boundary blends | Bible section 11; Phase E.6 calibration | BIBLE | Bible says registry growth should be evidence-driven; E.6 fixture calibration is historical support, not authority. |
| Cross-constellation interaction records | Bible section 12 | BIBLE | Direct source for typed relations; exact v0.1 high-value rule detail remains in source transcription. |
| Pattern engine | Bible section 13 | BIBLE | Pattern label describes reasoning and never creates it. |
| Narrative engine | Bible section 14; Canon claim boundary | BIBLE | Every sentence must internally cite state, interaction, or evidence-ledger ID; no new inference. |
| Resonance Signature contract | Bible section 15; Canon visual laws; `architecture/RESONANCE_SIGNATURE.md` | BIBLE | Written Reflection and Resonance Signature consume the same immutable result object. |
| Visual uncertainty | Bible section 15; Canon visual truth principle | CANON | Incomplete evidence must remain visible; complete-looking visual from incomplete evidence is prohibited. |
| Validation program | Bible section 16 | BIBLE | Bible defines phase gates, ground-truth strategy, participant splits, calibration reporting, and display-name validation. |
| Machine-readable registry blueprint | Bible section 17 | BIBLE | Direct source includes example thresholds and ranges; treat as source-provided blueprint, not invented code. |
| Registry governance | Bible section 18 | BIBLE | Direct transcription governs future Bible changes subject to owner approval. |
| Research synthesis and sources | Bible sections 19-20 | BIBLE | Source links preserved in transcription; no external validation performed in this task. |
| Previous template | Git history before `ec04bea` | REJECTED | Template is not authoritative now that the correct Bible exists. |
| Canon copied into `docs/CONSTELLATION_BIBLE.md` at `ec04bea` | Current pre-task tracked file | HISTORICAL | Correctly preserved Canon content but wrong document role; moved to `docs/SOULSCOPE_CANON.md`. |
| Interrupted Canon-derived draft | Aborted branch work | REJECTED | Not committed and not authoritative. |
| Old implementation thresholds | Historical frontend/backend code | HISTORICAL | May inform testing but does not override Bible or Canon. |
| Chakra/cymatics/organ-frequency systems | Old repo legacy systems | REJECTED | Conflict with Canon/Bible claim boundaries and clean rebuild rules. |

## Conflicts Found

No direct Canon/Bible conflict was found in this documentation pass. The Bible adds operational detail while generally preserving Canon boundaries. Implementation must still stop if source formulas or thresholds conflict with later validated architecture.

## Incomplete Areas

- Source docx extraction preserves text and basic structure, but tables/images may require human formatting review.
- Some sections are headings with compact text; implementation should consult the immutable `.docx` source before coding.
- Numeric thresholds and formulas in the Bible are source-provided, but not implemented or validated here.
- No application behavior was changed in this task.
