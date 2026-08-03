import { provenance, sourceReference } from "./provenance";

export const PROCESSING_STAGE_IDS = Object.freeze([
  "raw_acoustic_features",
  "evidence_engine",
  "evidence_ledger",
  "dimension_engine",
  "constellation_engine",
  "cross_constellation_interaction_engine",
  "pattern_engine",
  "narrative_engine",
  "resonance_signature",
] as const);

export type ProcessingStageId = (typeof PROCESSING_STAGE_IDS)[number];

export const PROCESSING_STAGES = Object.freeze(
  PROCESSING_STAGE_IDS.map((id, index) =>
    Object.freeze({
      id,
      order: index + 1,
      provenance: provenance(sourceReference("constellationBible", "Section 3 Canonical processing contract", "BIBLE")),
    }),
  ),
);
