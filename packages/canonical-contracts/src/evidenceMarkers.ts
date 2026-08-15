import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const EVIDENCE_FAMILIES = Object.freeze(["PRO", "ENG", "TIM", "PHO", "SPE", "DYN"] as const);

export type EvidenceFamily = (typeof EVIDENCE_FAMILIES)[number];

export const EVIDENCE_MARKER_IDS = Object.freeze([
  "PROSODIC_EXPANSION",
  "PROSODIC_COMPRESSION",
  "PAUSE_LOAD_INCREASE",
  "TEMPORAL_FRAGMENTATION",
  "OUTPUT_CONTINUITY",
  "PHONATORY_SHIFT",
  "PHONATORY_STABILITY",
  "MODULATION_BREADTH",
  "CONTEXT_RECONFIGURATION",
  "CONTEXT_CONSISTENCY",
  "WITHIN_PROMPT_DRIFT",
] as const);

export type EvidenceMarkerId = (typeof EVIDENCE_MARKER_IDS)[number];

export type EvidenceMarkerRegistryEntry = Readonly<{
  id: EvidenceMarkerId;
  family: EvidenceFamily;
  definition: string;
  prohibitedDirectTargets: readonly string[];
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const evidenceSource = sourceReference("evidenceMarkerRegistry", "Evidence Marker families and examples", "CANON");

export const EVIDENCE_MARKER_REGISTRY: readonly EvidenceMarkerRegistryEntry[] = Object.freeze([
  Object.freeze({ id: "PROSODIC_EXPANSION", family: "PRO", definition: "Broader qualified prosodic variation relative to an explicit reference.", prohibitedDirectTargets: Object.freeze(["emotion", "personality", "diagnosis", "deception"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "PROSODIC_COMPRESSION", family: "PRO", definition: "Narrower qualified prosodic variation relative to an explicit reference.", prohibitedDirectTargets: Object.freeze(["emotion", "personality", "diagnosis", "deception"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "PAUSE_LOAD_INCREASE", family: "TIM", definition: "Increased qualified pause load relative to an explicit reference.", prohibitedDirectTargets: Object.freeze(["stress", "anxiety", "diagnosis"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "TEMPORAL_FRAGMENTATION", family: "TIM", definition: "Reduced temporal continuity or increased segmentation in qualified speech timing.", prohibitedDirectTargets: Object.freeze(["emotion", "identity", "hidden_truth"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "OUTPUT_CONTINUITY", family: "DYN", definition: "Qualified continuity of output across a prompt or prompt contrast.", prohibitedDirectTargets: Object.freeze(["personality", "diagnosis"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "PHONATORY_SHIFT", family: "PHO", definition: "Qualified change in phonatory voice-quality measurements.", prohibitedDirectTargets: Object.freeze(["disease", "organ_state", "diagnosis"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "PHONATORY_STABILITY", family: "PHO", definition: "Qualified stability in phonatory voice-quality measurements.", prohibitedDirectTargets: Object.freeze(["health_status", "diagnosis"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "MODULATION_BREADTH", family: "ENG", definition: "Qualified breadth of energy or modulation behavior.", prohibitedDirectTargets: Object.freeze(["confidence", "emotion"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "CONTEXT_RECONFIGURATION", family: "DYN", definition: "Qualified acoustic reconfiguration across prompt contexts.", prohibitedDirectTargets: Object.freeze(["causality", "recovery", "improvement"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "CONTEXT_CONSISTENCY", family: "DYN", definition: "Qualified preservation of acoustic structure across prompt contexts.", prohibitedDirectTargets: Object.freeze(["trait", "identity"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
  Object.freeze({ id: "WITHIN_PROMPT_DRIFT", family: "DYN", definition: "Qualified temporal movement inside one prompt window.", prohibitedDirectTargets: Object.freeze(["hidden_motive", "deception"] as const), registryVersion: REGISTRY_VERSION, provenance: provenance(evidenceSource) }),
]);

export function isEvidenceFamily(value: string): value is EvidenceFamily {
  return (EVIDENCE_FAMILIES as readonly string[]).includes(value);
}
