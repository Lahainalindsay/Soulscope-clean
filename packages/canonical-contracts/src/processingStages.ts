import { provenance, sourceReference } from "./provenance";

export const PROCESSING_STAGE_IDS = Object.freeze([
  "raw_audio",
  "versioned_acoustic_extraction",
  "signal_quality_task_qualification",
  "immutable_acoustic_measurement_record",
  "evidence_engine",
  "evidence_ledger",
  "dimension_inference_engine",
  "dimension_posterior_objects",
  "continuous_constellation_geometry",
  "state_blend_unresolved_engine",
  "cross_constellation_interaction_engine",
  "pattern_engine",
  "decision_ledger",
  "immutable_semantic_result",
  "narrative_engine",
] as const);

export type ProcessingStageId = (typeof PROCESSING_STAGE_IDS)[number];

export const PROCESSING_STAGES = Object.freeze(
  PROCESSING_STAGE_IDS.map((id, index) =>
    Object.freeze({
      id,
      order: index + 1,
      provenance: provenance(sourceReference("authorityLedger", "Current Backend Architecture", "CANON")),
    }),
  ),
);
