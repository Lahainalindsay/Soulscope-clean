import type { DimensionId, DimensionScientificClass } from "./dimensionIds";
import type { EvidenceFamily } from "./evidenceMarkers";
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
