import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const NARRATIVE_CLAIM_LEVELS = Object.freeze(["N0_MEASUREMENT", "N1_EVIDENCE", "N2_FUNCTIONAL_DIMENSION", "N3_CONSTELLATION_INTERACTION", "N4_REFLECTIVE_HYPOTHESIS"] as const);

export type NarrativeClaimLevel = (typeof NARRATIVE_CLAIM_LEVELS)[number];

export const NARRATIVE_BOUNDARY_POLICY = Object.freeze({
  registryVersion: REGISTRY_VERSION,
  consumesOnlyCompletedSemanticResult: true,
  rawAudioInputAllowed: false,
  independentReasoningAllowed: false,
  unresolvedMaySoundResolved: false,
  prohibitedClaims: Object.freeze(["identity", "diagnosis", "deception", "causality", "emotion_truth", "personality_certainty"] as const),
  claimLevels: NARRATIVE_CLAIM_LEVELS,
  provenance: provenance(sourceReference("narrativeRegistry", "Narrative authority boundary", "CANON")),
});
