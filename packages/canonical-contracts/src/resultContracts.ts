import type { DimensionId } from "./dimensionIds";
import type { EvidenceMarkerId } from "./evidenceMarkers";
import type { InteractionVerb } from "./interactionRegistry";
import type { PatternAbstentionReason, PatternId, PatternModifier, PatternOutcomeType, PatternPublicationStatus } from "./patternRegistry";
import type { PromptId } from "./promptProtocol";
import type { Provenance } from "./provenance";
import type { ResolutionReason, ResolutionStatus } from "./scientificStatus";
import type { StateOutcomeType } from "./stateRegistry";
import type { CanonicalVersionManifest } from "./versioning";

export type AcquisitionRecord = Readonly<{
  scanId: string;
  promptIds: readonly PromptId[];
  provenance: Provenance;
}>;

export type MeasurementRecord = Readonly<{
  timeResolvedMeasurements: readonly string[];
  promptSummaries: readonly string[];
  quality: Readonly<Record<string, string | number | boolean | null>>;
  promptContrasts: readonly string[];
  extractorProvenance: Provenance;
}>;

export type DimensionPosterior = Readonly<{
  dimensionId: DimensionId;
  posteriorMean?: number | null;
  posteriorLower?: number | null;
  posteriorUpper?: number | null;
  confidence?: number | null;
  evidenceCoverage?: number | null;
  baselineTrust?: number | null;
  contradiction?: number | null;
  coherence?: number | null;
  momentum?: number | null;
  resolutionStatus: ResolutionStatus;
  resolutionReason?: ResolutionReason;
  supportingEvidenceIds: readonly string[];
  contradictingEvidenceIds: readonly string[];
  provenance: Provenance;
}>;

export type EvidenceLedgerReference = Readonly<{
  evidenceId: string;
  markerId: EvidenceMarkerId;
  resolutionStatus: ResolutionStatus;
  provenance: Provenance;
}>;

export type DecisionRecord = Readonly<{
  decisionId: string;
  ruleId: string;
  resolutionStatus: ResolutionStatus;
  resolutionReason?: ResolutionReason;
  sourceIds: readonly string[];
  provenance: Provenance;
}>;

export type SemanticResult = Readonly<{
  evidenceLedger: readonly EvidenceLedgerReference[];
  dimensions: readonly DimensionPosterior[];
  constellationGeometry: readonly string[];
  statesOrBlends: readonly StateOutcomeType[];
  qualifiers: readonly string[];
  interactions: readonly InteractionVerb[];
  pattern: PatternResult;
  decisionLedger: readonly DecisionRecord[];
}>;

export type PatternDecisionRecord = Readonly<{
  patternDecisionId: string;
  scanId: string;
  patternRegistryVersion: "0.1";
  upstreamDimensionDecisionIds: readonly string[];
  upstreamStateDecisionIds: readonly string[];
  upstreamInteractionDecisionIds: readonly string[];
  eligiblePatterns: readonly PatternId[];
  rejectedPatterns: readonly Readonly<{
    patternId: PatternId;
    requirementsPassed: readonly string[];
    requirementsFailed: readonly string[];
    supportingStructures: readonly string[];
    contradictingStructures: readonly string[];
    missingRequiredStructures: readonly string[];
    hardExclusions: readonly string[];
    rejectionReason: PatternAbstentionReason;
  }>[];
  selectedPattern?: PatternId;
  selectedModifier?: PatternModifier;
  publicationStatus: PatternPublicationStatus;
  primaryReason: PatternAbstentionReason | "PATTERN_SELECTED" | "BOUNDARY_PATTERN_SELECTED";
  secondaryReasons: readonly string[];
  createdAt: string;
}>;

export type PatternResult = Readonly<{
  scanId: string;
  outcomeType: PatternOutcomeType;
  selectedPattern?: PatternId;
  selectedModifier?: PatternModifier;
  candidatePatterns: readonly PatternId[];
  patternFit?: number | null;
  patternConfidence?: number | null;
  supportingConstellations: readonly string[];
  supportingDimensions: readonly DimensionId[];
  supportingInteractions: readonly InteractionVerb[];
  contradictingStructures: readonly string[];
  coverage: string;
  independence: string;
  uncertainty: string;
  alternativePattern?: PatternId;
  temporalScope: "SINGLE_SCAN" | "COMPATIBLE_LONGITUDINAL";
  publicationStatus: PatternPublicationStatus;
  resolutionReason?: PatternAbstentionReason;
  patternDecisionRecord: PatternDecisionRecord;
  registryVersions: CanonicalVersionManifest;
}>;

export type ResonanceRenderingRecord = Readonly<{
  inputPath: "QUALIFIED_ACOUSTIC_MEASUREMENTS_T";
  semanticGeometryInputAllowed: false;
  provenance: Provenance;
}>;

export type ImmutableScanResult = Readonly<{
  acquisitionRecord: AcquisitionRecord;
  measurementRecord: MeasurementRecord;
  semanticResult: SemanticResult;
  resonanceRenderingRecord: ResonanceRenderingRecord;
  versionManifest: CanonicalVersionManifest;
}>;
