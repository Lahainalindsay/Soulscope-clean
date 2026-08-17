# Dimension Calibration Requirements

Status: CALIBRATION_REQUIRED
Scope: Requirements artifact only

Dimension Engine v1 can enumerate canonical Dimensions and preserve Evidence
provenance, but it cannot responsibly produce numeric Dimension scores until a
versioned calibration specification is approved.

## Current Contract

Implemented infrastructure:

- immutable calibration metadata records
- one `CALIBRATION_REQUIRED` calibration spec per canonical Dimension
- upstream compatibility fields for Evidence and Dimension engine versions
- deterministic scoring-eligibility checks
- explicit blocker reasons
- provenance for why scoring is unavailable
- database immutability and service-owned calibration metadata writes
- Canon-defined structural Evidence-to-Dimension requirements separated from numeric scoring eligibility

Not implemented:

- numeric Dimension scoring
- confidence scoring
- posterior interval construction
- calibrated Evidence-to-Dimension semantic scoring inference
- State, Constellation, Pattern, Narrative, or Resonance output

## Global Missing Scientific Inputs

These are absent for every current Dimension:

| Requirement | Status | Needed Before Scoring |
| --- | --- | --- |
| Evidence-to-Dimension structural mapping | STRUCTURAL_MAPPING_DEFINED | Already encoded where Canon defines required families, candidate markers, required markers, and independent-family coverage |
| Calibrated scoring mapping | NOT_DEFINED | Approved marker directionality, coefficients/model, posterior construction, and calibrated scoring behavior per Dimension |
| Directionality | NOT_DEFINED | Approved direction for each Evidence marker relative to each Dimension |
| Weights | NOT_DEFINED | Calibrated, versioned weights or an approved non-weighted model |
| Thresholds | NOT_DEFINED | Calibrated decision thresholds or explicit no-threshold model |
| Normalization | NOT_DEFINED | Versioned normalization/reference procedure |
| Score range | NOT_DEFINED | Approved numeric range and interpretation constraints |
| Minimum evidence | PARTIALLY_DEFINED | Structural family coverage is encoded where Canon defines it; calibrated coverage thresholds remain absent |
| Confidence | NOT_DEFINED | Calibrated confidence model independent from score |
| Priors/posteriors | NOT_DEFINED | Prior and posterior construction method, if Bayesian/posterior output is retained |
| Reference dataset | NOT_DEFINED | Governed calibration cohort or approved reference dataset identity |
| Validation criteria | NOT_DEFINED | Acceptance metrics, holdout rules, and promotion criteria |

## Per-Dimension Status

All 16 Dimensions currently share the same calibration status:

```text
CALIBRATION_REQUIRED
```

Affected Dimension IDs:

- `COG-P1`
- `COG-P2`
- `COG-P3`
- `COG-P4`
- `REG-P1`
- `REG-P2`
- `REG-P3`
- `REG-P4`
- `CAP-P1`
- `CAP-P2`
- `CAP-P3`
- `CAP-P4`
- `EXP-P1`
- `EXP-P2`
- `EXP-P3`
- `EXP-P4`

The current three-prompt protocol also hard-abstains:

- `REG-P4` Recovery: `NO_RECOVERY_COMPATIBLE_CONDITION`
- `CAP-P2` Reserve: `NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL`
- `EXP-P4` Relational Availability: `NO_RELATIONAL_OBSERVATION`

## Versioned Calibration Gate

Before any future scoring engine may produce numbers, a new calibration version
must define, at minimum:

- compatible Measurement, Evidence, and Dimension engine versions
- eligible and required Evidence markers per Dimension
- directionality and missing/rejection behavior
- score model and score range
- confidence model
- posterior model, or an approved replacement for posterior fields
- reference dataset identity and governance
- train/validation/test partition policy
- validation metrics and acceptance criteria
- promotion process from draft to validated

Code passing tests or hosted deployment verification is not scientific
validation. A calibration may only become `CALIBRATION_VALIDATED` after the
versioned scientific prerequisites above are explicitly adopted.
