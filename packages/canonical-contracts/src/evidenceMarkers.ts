import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const EVIDENCE_FAMILIES = Object.freeze(["PRO", "ENG", "TIM", "PHO", "SPE", "DYN"] as const);

export type EvidenceFamily = (typeof EVIDENCE_FAMILIES)[number];

export const EVIDENCE_MARKER_IDS = Object.freeze([
  "EV_PRO_001", "EV_PRO_002", "EV_PRO_003", "EV_PRO_004",
  "EV_ENG_001", "EV_ENG_002", "EV_ENG_003",
  "EV_TIM_001", "EV_TIM_002", "EV_TIM_003", "EV_TIM_004", "EV_TIM_005", "EV_TIM_006", "EV_TIM_007", "EV_TIM_008", "EV_TIM_009",
  "EV_PHO_001", "EV_PHO_002", "EV_PHO_003", "EV_PHO_004",
  "EV_SPE_001", "EV_SPE_002", "EV_SPE_003",
  "EV_DYN_001", "EV_DYN_002", "EV_DYN_003", "EV_DYN_004", "EV_DYN_005", "EV_DYN_006", "EV_DYN_007", "EV_DYN_008", "EV_DYN_009",
] as const);

export type EvidenceMarkerId = (typeof EVIDENCE_MARKER_IDS)[number];

export type EvidenceMarkerRegistryEntry = Readonly<{
  id: EvidenceMarkerId;
  family: EvidenceFamily;
  definition: string;
  prohibitedDirectTargets: readonly string[];
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
  composite: boolean;
}>;

const evidenceSource = sourceReference("evidenceMarkerRegistry", "Evidence Marker families and examples", "CANON");

export const EVIDENCE_MARKER_REGISTRY: readonly EvidenceMarkerRegistryEntry[] = Object.freeze([
  ...EVIDENCE_MARKER_IDS.map((id) => Object.freeze({
    id,
    family: id.split("_")[1] as EvidenceFamily,
    definition: "Canonical Evidence Marker Registry v0.1 EV_* marker.",
    prohibitedDirectTargets: Object.freeze(["emotion", "personality", "diagnosis", "deception", "identity"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(evidenceSource),
    composite: ["EV_TIM_008", "EV_TIM_009", "EV_PHO_004", "EV_DYN_001", "EV_DYN_002", "EV_DYN_003", "EV_DYN_004", "EV_DYN_005", "EV_DYN_006", "EV_DYN_007", "EV_DYN_008", "EV_DYN_009"].includes(id),
  })),
]);

export function isEvidenceFamily(value: string): value is EvidenceFamily {
  return (EVIDENCE_FAMILIES as readonly string[]).includes(value);
}

export function isEvidenceMarkerId(value: string): value is EvidenceMarkerId {
  return (EVIDENCE_MARKER_IDS as readonly string[]).includes(value);
}
