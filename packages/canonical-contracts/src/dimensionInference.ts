import type { DimensionId, DimensionScientificClass } from "./dimensionIds";
import type { EvidenceFamily, EvidenceMarkerId } from "./evidenceMarkers";
import { provenance, sourceReference } from "./provenance";
import type { ResolutionReason, ResolutionStatus, ScientificStatus } from "./scientificStatus";
import { REGISTRY_VERSION } from "./versioning";

export type DimensionResolutionContract = Readonly<{
  dimensionId: DimensionId;
  scientificClass: DimensionScientificClass;
  requiredEvidenceFamilies: readonly EvidenceFamily[];
  optionalEvidenceFamilies: readonly EvidenceFamily[];
  defaultResolutionStatus: ResolutionStatus;
  defaultResolutionReason?: ResolutionReason;
  publicationStatus: ScientificStatus;
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const inferenceSource = sourceReference("inferenceRuleRegistry", "Hard gates, missingness, and D1/D2/D3 inference rules", "CANON");

export const D3_ABSTENTION_CONTRACTS: readonly DimensionResolutionContract[] = Object.freeze([
  Object.freeze({
    dimensionId: "REG-P4",
    scientificClass: "D3_CURRENT_PROTOCOL_UNOBSERVABLE",
    requiredEvidenceFamilies: Object.freeze([] as const),
    optionalEvidenceFamilies: Object.freeze([] as const),
    defaultResolutionStatus: "UNRESOLVED",
    defaultResolutionReason: "NO_RECOVERY_COMPATIBLE_CONDITION",
    publicationStatus: "PRODUCTION_ACTIVE",
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(inferenceSource),
  }),
  Object.freeze({
    dimensionId: "CAP-P2",
    scientificClass: "D3_CURRENT_PROTOCOL_UNOBSERVABLE",
    requiredEvidenceFamilies: Object.freeze([] as const),
    optionalEvidenceFamilies: Object.freeze([] as const),
    defaultResolutionStatus: "UNRESOLVED",
    defaultResolutionReason: "NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL",
    publicationStatus: "PRODUCTION_ACTIVE",
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(inferenceSource),
  }),
  Object.freeze({
    dimensionId: "EXP-P4",
    scientificClass: "D3_CURRENT_PROTOCOL_UNOBSERVABLE",
    requiredEvidenceFamilies: Object.freeze([] as const),
    optionalEvidenceFamilies: Object.freeze([] as const),
    defaultResolutionStatus: "UNRESOLVED",
    defaultResolutionReason: "NO_RELATIONAL_OBSERVATION",
    publicationStatus: "PRODUCTION_ACTIVE",
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(inferenceSource),
  }),
]);

export const EVIDENCE_FAMILY_INDEPENDENCE_POLICY = Object.freeze({
  id: "EVIDENCE_FAMILY_INDEPENDENCE",
  families: Object.freeze(["PRO", "ENG", "TIM", "PHO", "SPE", "DYN"] as const),
  rule: "Multiple markers from one family count as one independent Evidence family.",
  provenance: provenance(sourceReference("inferenceRuleRegistry", "Evidence-family independence", "CANON")),
});

export type DimensionStructuralRequirement = Readonly<{
  dimensionId: DimensionId;
  requiredEvidenceFamilies: readonly EvidenceFamily[];
  optionalEvidenceFamilies: readonly EvidenceFamily[];
  candidateEvidenceMarkerIds: readonly EvidenceMarkerId[];
  requiredEvidenceMarkerIds: readonly EvidenceMarkerId[];
  minimumIndependentFamilies?: number;
  d3AbstentionReason?: ResolutionReason;
  calibrationOutcome: "CALIBRATION_REQUIRED";
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const dimensionSource = sourceReference("dimensionRegistry", "Structural Evidence-to-Dimension requirements", "CANON");

export const DIMENSION_STRUCTURAL_REQUIREMENTS: readonly DimensionStructuralRequirement[] = Object.freeze([
  Object.freeze({ dimensionId: "COG-P1", requiredEvidenceFamilies: Object.freeze(["TIM", "DYN"] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_TIM_007", "EV_TIM_008", "EV_TIM_009", "EV_DYN_001", "EV_DYN_007", "EV_DYN_008"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "COG-P2", requiredEvidenceFamilies: Object.freeze(["PRO", "TIM", "DYN"] as const), optionalEvidenceFamilies: Object.freeze(["ENG", "SPE"] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_PRO_002", "EV_PRO_003", "EV_ENG_002", "EV_SPE_002", "EV_DYN_003", "EV_DYN_005", "EV_DYN_006"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "COG-P3", requiredEvidenceFamilies: Object.freeze(["TIM"] as const), optionalEvidenceFamilies: Object.freeze(["DYN"] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_TIM_002", "EV_TIM_003", "EV_TIM_004", "EV_TIM_007", "EV_TIM_008", "EV_TIM_009", "EV_DYN_009"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "COG-P4", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_TIM_002", "EV_TIM_005", "EV_TIM_006", "EV_TIM_009", "EV_PHO_001", "EV_PHO_004", "EV_SPE_001", "EV_DYN_007", "EV_DYN_008"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), minimumIndependentFamilies: 3, calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "REG-P1", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_PRO_001", "EV_PRO_002", "EV_ENG_001", "EV_TIM_005", "EV_PHO_001", "EV_SPE_001", "EV_DYN_007"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), minimumIndependentFamilies: 3, calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "REG-P2", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_PRO_003", "EV_TIM_007", "EV_TIM_008", "EV_PHO_004", "EV_DYN_002", "EV_DYN_008", "EV_DYN_009"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), minimumIndependentFamilies: 2, calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "REG-P3", requiredEvidenceFamilies: Object.freeze(["DYN"] as const), optionalEvidenceFamilies: Object.freeze(["PRO", "ENG", "TIM", "PHO", "SPE"] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_DYN_003", "EV_DYN_007"] as const), requiredEvidenceMarkerIds: Object.freeze(["EV_DYN_003", "EV_DYN_007"] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "REG-P4", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze([] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), d3AbstentionReason: "NO_RECOVERY_COMPATIBLE_CONDITION", calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "CAP-P1", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_PRO_002", "EV_ENG_001", "EV_ENG_002", "EV_TIM_005", "EV_TIM_006", "EV_DYN_003", "EV_DYN_007"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "CAP-P2", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze([] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), d3AbstentionReason: "NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL", calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "CAP-P3", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_TIM_002", "EV_TIM_007", "EV_TIM_009", "EV_PHO_001", "EV_PHO_004", "EV_DYN_001", "EV_DYN_009"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), minimumIndependentFamilies: 3, calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "CAP-P4", requiredEvidenceFamilies: Object.freeze(["DYN"] as const), optionalEvidenceFamilies: Object.freeze(["TIM", "PHO", "PRO", "ENG"] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_DYN_001", "EV_DYN_009"] as const), requiredEvidenceMarkerIds: Object.freeze(["EV_DYN_001", "EV_DYN_009"] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "EXP-P1", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_PRO_002", "EV_ENG_002", "EV_SPE_002", "EV_DYN_005"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), minimumIndependentFamilies: 2, calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "EXP-P2", requiredEvidenceFamilies: Object.freeze(["DYN"] as const), optionalEvidenceFamilies: Object.freeze(["PRO", "ENG", "TIM"] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_DYN_003", "EV_DYN_005", "EV_DYN_006"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "EXP-P3", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze(["EV_PRO_002", "EV_ENG_002", "EV_DYN_005", "EV_DYN_006"] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ dimensionId: "EXP-P4", requiredEvidenceFamilies: Object.freeze([] as const), optionalEvidenceFamilies: Object.freeze([] as const), candidateEvidenceMarkerIds: Object.freeze([] as const), requiredEvidenceMarkerIds: Object.freeze([] as const), d3AbstentionReason: "NO_RELATIONAL_OBSERVATION", calibrationOutcome: "CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
]);
