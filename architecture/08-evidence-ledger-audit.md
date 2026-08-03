# Phase E.5 Evidence Ledger And Dimension Audit

Audit date: 2026-08-02

## Active Ledgers

| Ledger | Source | Input | Output | Active role |
|---|---|---|---|---|
| Backend extraction ledger | `backend/corescope/engine/evidence.py` | backend acoustic measurements | `EvidenceLedger` with one record per measurement | Returned by API for audit/debug |
| V2 observation evidence | `frontend/lib/observationFramework/buildEvidenceSignals.ts` and `evidenceDefinitions.ts` | raw features from canonical/client bridge | 9 evidence signals | Feeds domains, Atlas, compatibility report |
| Canonical evidence ledger | `frontend/lib/canonicalResult.ts` | canonical acoustic measurements | `CanonicalEvidenceLedger` | Feeds Phase B dimensions and final decision ledger |
| Decision ledger | `frontend/lib/canonicalResult.ts` | dimensions, geometry, interactions, meaning | final decision record | Published inside canonical result and diagnostics |

## V2 Evidence Rules

| Rule | Source measurements | Required families | Normalization | Problem | Downstream effect | Recommendation | Safe now |
|---|---|---|---|---|---|---|---|
| vocal_activation | RMS, voiced duration, phonation ratio | energy/timing | hard-coded min/max | RMS is device dependent | activation can be mic-gain sensitive | require calibration or relative baseline | No |
| vocal_stability | pitch stability, jitter, shimmer, formant stability | prosody/perturbation/formant | hard-coded clamps | jitter/shimmer task incompatible for speech | false stability/instability if client fallback fills them | task-gate perturbation | Needs approval |
| harmonic_clarity | HNR, harmonic richness, flatness | harmonic/spectral | hard-coded dB/ratio | correlated features counted separately | overstated confidence | family de-correlation | Needs approval |
| processing_pauses | pause count/density/durations | timing | hard-coded thresholds | prompt length and language dependent | reflective speech can look strained | task-specific thresholds | Needs approval |
| expressive_variability | F0 range, formant dynamics, centroid | prosody/formant/spectral | hard-coded thresholds | formant/centroid device sensitive | expression score can drift by mic | feature-specific confidence | Needs approval |
| vocal_energy | RMS, spectral centroid, harmonic richness | energy/spectral | hard-coded thresholds | RMS gain sensitivity | capacity/activation coupling | baseline/gain normalization | Needs approval |
| response_consistency | pitch stability, formant stability, clarity, clipping, jitter, shimmer | prosody/formant/capture | hard-coded thresholds | mixed capture quality and voice quality | unrelated dimensions can be downgraded | split capture from feature quality | Needs approval |
| speech_dynamics | rate, active ratio, pitch range, formant dynamics, pause density | timing/prosody | hard-coded thresholds | client/server rate proxy not true speaking rate | over-interpretation risk | relabel proxy and task-gate | Yes for docs |
| spectral_organization | flatness, centroid, richness, HNR, formant stability | spectral/harmonic/formant | hard-coded thresholds | correlated spectral features | false independence | require independent families | Needs approval |

## Cross-Cutting Evidence Findings

- `frontend/lib/observationFramework/buildEvidenceSignals.ts` uses `new Map(featureId -> feature)`, so duplicate feature IDs across prompt captures collapse to one value. Input: three prompt analyses. Output: one feature per ID, normally the last encountered. Problem: prompt protocol evidence is not aggregated. Downstream effect: challenge/recovery/baseline distinctions are weakened in V2 evidence.
- Evidence confidence uses lowest raw feature quality, feature count, coverage, and strength. It does not expose signal, task compatibility, feature reliability, family independence, or baseline trust.
- Rules use magic normalization numbers. These are deterministic but not documented as calibrated.
- Missing baseline is usually treated as absent internally, but many outputs still compute a resolved value without baseline trust.

## Canonical Dimension Audit

Source: `frontend/lib/canonicalDimensionEngine.ts`

Feature families currently available to dimensions:

- temporal: `voice.syllable_nuclei_rate`, `voice.pause.duration_mean`, `voice.phonation_time_ratio`
- prosody: `voice.f0.range_semitones`, `voice.pitch_stability`, `voice.pitch_clarity`, `voice.f0.median`
- spectral: `voice.spectral_flatness`, `voice.harmonic_richness`

Problem: dimension `requiredFamilies` names include concepts such as `ordered_challenge_recovery`, `time_on_task`, `latency_or_contingency`, `prompt_modulation`, and `recovery_window`, but coverage is computed by counting generic families. The named requirements are not actually satisfied by task-specific evidence.

| Bible point | Active features | Weights | Missing scientific support | Flag | Recommendation |
|---|---|---|---|---|---|
| COG-P1 Organization | pitch stability, pitch clarity, spectral flatness | 0.34/0.26/0.22 | no direct ordered challenge/recovery or task accuracy | driven by prosody/spectral | require protocol evidence |
| COG-P2 Exploration | F0 range, speaking-rate proxy, harmonic richness | 0.32/0.22/0.18 | no novelty/exploration task | cannot fully support | keep unresolved when task evidence absent |
| COG-P3 Focus Continuity | pitch stability, pause mean, phonation ratio | 0.3/0.24/0.22 | no attention/task continuity measure | proxy only | lower confidence |
| COG-P4 Processing Demand | pause mean, rate proxy, spectral flatness | 0.28/0.24/0.2 | no cognitive load ground truth | proxy only | require caveats |
| REG-P1 Activation | phonation ratio, rate proxy, F0 median | 0.3/0.24/0.18 | no physiological activation | acoustic arousal proxy | relabel |
| REG-P2 Stability | pitch stability, pitch clarity, flatness | 0.34/0.22/0.18 | no recovery/stress baseline | proxy only | require feature-specific confidence |
| REG-P3 Flexibility | F0 range, rate proxy, harmonic richness | 0.3/0.22/0.18 | no flexible response task | weak | lower confidence |
| REG-P4 Recovery | pause mean, phonation ratio, pitch stability | 0.28/0.24/0.2 | no true pre/post recovery comparison enforced | cannot fully support | unresolved without ordered captures |
| CAP-P1 Mobilization | phonation ratio, rate proxy, F0 median | 0.3/0.2/0.18 | energy/mobilization not physiological | proxy | relabel |
| CAP-P2 Reserve | harmonic richness, flatness, phonation ratio | 0.28/0.22/0.2 | no reserve validation | proxy only | reduce certainty |
| CAP-P3 Effort Cost | pause mean, flatness, pitch clarity | 0.3/0.22/0.18 | effort inferred from pause/spectral cues | high overreach risk | require confounds |
| CAP-P4 Sustainability | phonation ratio, pitch stability, harmonic richness | 0.28/0.24/0.18 | no longitudinal endurance | cannot support strongly | unresolved or low confidence |
| EXP-P1 Range | F0 range, rate proxy, harmonic richness | 0.34/0.18/0.16 | expression not just acoustic range | proxy | keep cautious |
| EXP-P2 Openness | harmonic richness, phonation ratio, flatness | 0.26/0.24/0.18 | relational openness not directly measured | overreach risk | visible language must be gentle |
| EXP-P3 Restraint | pause mean, pitch stability, pitch clarity | 0.28/0.22/0.18 | restraint can be context/culture | proxy only | preserve alternatives |
| EXP-P4 Relational Availability | phonation ratio, harmonic richness, rate proxy | 0.24/0.22/0.18 | no listener/relationship data | cannot scientifically support directly | audit-only or low confidence |

## Constellation Geometry Audit

Source: `frontend/lib/canonicalConstellationEngine.ts`

Audited rules:

- Posterior/state compatibility is distance from fixed state targets.
- Confidence intervals come from dimension uncertainty.
- Candidate fit uses `(1 - distance)` with a penalty for missing requirements.
- Boundary blend threshold is `margin <= 0.08`.
- Unresolved threshold includes coverage `< 0.5` or confidence `< 0.2`.
- Temporal movement is present in type shape but currently `hasChange: false`.
- Compensation logic is represented by interaction records, not full temporal compensation.
- Adjacency is implicit by nearest candidates, not an explicit graph.

Fixture measurement status:

- Added `frontend/tests/phaseE5ScientificAudit.test.ts` to verify boundary-blend rate is measurable from canonical outputs.
- Existing fixture distribution tests cover canonical pattern collapse but not Phase B boundary frequency by capture protocol.

Likely causes of excessive blends:

- State regions are close around the center.
- Many dimensions default toward 0.5 under weak or missing evidence.
- Required family coverage is count-based rather than requirement-based.
- Confidence can be copied from features.
- Candidate eligibility is permissive when missing requirements are penalized but not always disqualifying.

Recommendation: measure boundary rates across generated acoustic fixtures and saved sample results before changing thresholds. Do not force winners.

