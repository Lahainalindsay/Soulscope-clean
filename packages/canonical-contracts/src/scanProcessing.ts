import type { PromptId } from "./promptProtocol";
import { provenance, sourceReference } from "./provenance";
import type { ResolutionReason } from "./scientificStatus";

export const SCAN_PROCESSING_RUN_STATUSES = Object.freeze([
  "queued",
  "running",
  "measurement_recorded",
  "semantic_abstained",
  "failed",
] as const);

export type ScanProcessingRunStatus = (typeof SCAN_PROCESSING_RUN_STATUSES)[number];

export const MEASUREMENT_RECORD_STATUSES = Object.freeze(["qualified", "limited", "rejected"] as const);

export type MeasurementRecordStatus = (typeof MEASUREMENT_RECORD_STATUSES)[number];

export const SEMANTIC_RESULT_RECORD_STATUSES = Object.freeze(["unresolved_abstained", "invalid"] as const);

export type SemanticResultRecordStatus = (typeof SEMANTIC_RESULT_RECORD_STATUSES)[number];

export const REAL_SCAN_PROCESSING_FOUNDATION = Object.freeze({
  id: "REAL_SCAN_PROCESSING_FOUNDATION",
  version: "0.1",
  serviceOwnedFunctions: Object.freeze([
    "register_uploaded_capture_artifact",
    "start_scan_processing_run",
    "create_measurement_record",
    "create_unresolved_semantic_result",
  ] as const),
  promptArtifactRequirement: Object.freeze(["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"] as readonly PromptId[]),
  requiredPromptArtifactCount: 3,
  createsCalibratedAcousticFeatures: false,
  createsDimensionScores: false,
  createsNarrative: false,
  createsResonanceRendering: false,
  unresolvedSemanticResultAllowed: true,
  provenance: provenance(sourceReference("authorityLedger", "Current Backend Architecture", "DERIVED")),
});

export const MEASUREMENT_RECORD_CONTRACT = Object.freeze({
  id: "IMMUTABLE_ACOUSTIC_MEASUREMENT_RECORD",
  schemaVersion: "0.1",
  promptMeasurementsShape: "array",
  promptContrastsShape: "array",
  qualitySummaryShape: "object",
  extractorProvenanceRequired: true,
  semanticEligibilityExplicit: true,
  rendererEligibilityExplicit: true,
  semanticAndRendererEligibilityAreSeparate: true,
  rejectedStatusRequiresIneligibleOutputs: true,
  noMissingValueCoercion: true,
  provenance: provenance(sourceReference("acousticParameterRegistry", "MeasurementRecord", "CANON")),
});

export const UNRESOLVED_SEMANTIC_RESULT_POLICY = Object.freeze({
  id: "UNRESOLVED_SEMANTIC_RESULT_POLICY",
  status: "unresolved_abstained" as SemanticResultRecordStatus,
  defaultNonD3Reason: "MISSING_REQUIRED_EVIDENCE" as ResolutionReason,
  hardD3Reasons: Object.freeze({
    "REG-P4": "NO_RECOVERY_COMPATIBLE_CONDITION",
    "CAP-P2": "NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL",
    "EXP-P4": "NO_RELATIONAL_OBSERVATION",
  } as const),
  patternOutcome: "NO_PATTERN_PUBLISHED",
  patternPublicationStatus: "NO_PATTERN_PUBLISHED",
  patternReason: "PATTERN_MODEL_NOT_VALIDATED",
  modelRegistry: "CALIBRATION_REQUIRED",
  rendererRegistry: "CALIBRATION_REQUIRED",
  noNarrativeClaimsGenerated: true,
  noPatternForced: true,
  noD3Reconstruction: true,
  provenance: provenance(sourceReference("inferenceRuleRegistry", "Missingness and abstention", "CANON")),
});
