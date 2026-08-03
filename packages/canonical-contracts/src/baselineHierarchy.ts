import { provenance, sourceReference } from "./provenance";

export const BASELINE_REFERENCE_TYPES = Object.freeze([
  "personal_reference_signature",
  "within_session_reference",
  "matched_population_prior",
  "no_reference",
] as const);

export type BaselineReferenceType = (typeof BASELINE_REFERENCE_TYPES)[number];

export const BASELINE_HIERARCHY = Object.freeze([
  Object.freeze({
    priority: 1,
    id: "personal_reference_signature",
    label: "Personal Reference Signature",
    use: "Primary change-from-self interpretation.",
    guardrail: "Same user, feature version, unit, task family, and compatible capture conditions.",
    provenance: provenance(sourceReference("constellationBible", "Section 3.2 Baseline hierarchy", "BIBLE", "Table 10")),
  }),
  Object.freeze({
    priority: 2,
    id: "within_session_reference",
    label: "Within-session reference",
    use: "Prompt-to-prompt and early-to-late comparison.",
    guardrail: "Never call it trait or long-term change.",
    provenance: provenance(sourceReference("constellationBible", "Section 3.2 Baseline hierarchy", "BIBLE", "Table 10")),
  }),
  Object.freeze({
    priority: 3,
    id: "matched_population_prior",
    label: "Matched population prior",
    use: "Feature scaling and anomaly checks.",
    guardrail: "Not a substitute for a personal baseline; stratify and audit bias.",
    provenance: provenance(sourceReference("constellationBible", "Section 3.2 Baseline hierarchy", "BIBLE", "Table 10")),
  }),
  Object.freeze({
    priority: 4,
    id: "no_reference",
    label: "No reference",
    use: "Raw description only.",
    guardrail: "Suppress directional personal claims.",
    provenance: provenance(sourceReference("constellationBible", "Section 3.2 Baseline hierarchy", "BIBLE", "Table 10")),
  }),
]);
