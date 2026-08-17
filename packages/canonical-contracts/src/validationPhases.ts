import { provenance, sourceReference } from "./provenance";

export const VALIDATION_PHASE_IDS = Object.freeze([
  "phase_0_measurement",
  "phase_1_reliability",
  "phase_2_construct",
  "phase_3_generalization",
  "phase_4_longitudinal",
  "phase_5_outcome",
] as const);

export type ValidationPhaseId = (typeof VALIDATION_PHASE_IDS)[number];

export const VALIDATION_PHASES = Object.freeze([
  Object.freeze({ id: "phase_0_measurement", sourceLabel: "0 - Measurement", goal: "Verify feature correctness." }),
  Object.freeze({ id: "phase_1_reliability", sourceLabel: "1 - Reliability", goal: "Measure repeatability and baseline stability." }),
  Object.freeze({ id: "phase_2_construct", sourceLabel: "2 - Construct", goal: "Test dimensions against preregistered observations." }),
  Object.freeze({ id: "phase_3_generalization", sourceLabel: "3 - Generalization", goal: "Evaluate across people and environments." }),
  Object.freeze({ id: "phase_4_longitudinal", sourceLabel: "4 - Longitudinal", goal: "Test whether movement means what the UI says." }),
  Object.freeze({ id: "phase_5_outcome", sourceLabel: "5 - Outcome", goal: "Assess whether reflection helps without causing harm." }),
].map((entry) =>
  Object.freeze({
    ...entry,
    provenance: provenance(sourceReference("inferenceRuleRegistry", "Scientific status and validation status", "CANON")),
  }),
));
