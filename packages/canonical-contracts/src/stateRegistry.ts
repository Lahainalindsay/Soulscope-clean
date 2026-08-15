import type { ConstellationId } from "./constellationIds";
import type { DimensionId } from "./dimensionIds";
import { provenance, sourceReference } from "./provenance";
import type { ScientificStatus } from "./scientificStatus";
import { REGISTRY_VERSION } from "./versioning";

export const STATE_OUTCOME_TYPES = Object.freeze(["STATE", "BOUNDARY_BLEND", "UNRESOLVED"] as const);

export type StateOutcomeType = (typeof STATE_OUTCOME_TYPES)[number];

export const STATE_IDS = Object.freeze([
  "COG-S01",
  "COG-S02",
  "REG-S01",
  "REG-S02",
  "CAP-S01",
  "CAP-S02",
  "EXP-S01",
  "EXP-S02",
] as const);

export type StateId = (typeof STATE_IDS)[number];

export type StateRegistryEntry = Readonly<{
  id: StateId;
  constellationId: ConstellationId;
  canonicalInternalName: string;
  scientificStatus: ScientificStatus;
  requiredDimensions: readonly DimensionId[];
  geometryPrimary: true;
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const stateSource = sourceReference("stateRegistry", "Production active anchor States", "CANON");

export const STATE_REGISTRY: readonly StateRegistryEntry[] = Object.freeze([
  Object.freeze({ id: "COG-S01", constellationId: "COG", canonicalInternalName: "CONTINUOUS_ORGANIZATION", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["COG-P1", "COG-P3"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "COG-S02", constellationId: "COG", canonicalInternalName: "FRAGMENTED_ORGANIZATION", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["COG-P1", "COG-P3"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "REG-S01", constellationId: "REG", canonicalInternalName: "STABLE_PATTERN", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["REG-P2"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "REG-S02", constellationId: "REG", canonicalInternalName: "VARIABLE_PATTERN", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["REG-P2"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "CAP-S01", constellationId: "CAP", canonicalInternalName: "MAINTAINED_OUTPUT", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["CAP-P4"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "CAP-S02", constellationId: "CAP", canonicalInternalName: "REDUCED_MAINTENANCE", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["CAP-P4"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "EXP-S01", constellationId: "EXP", canonicalInternalName: "BROAD_MODULATION", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["EXP-P1"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
  Object.freeze({ id: "EXP-S02", constellationId: "EXP", canonicalInternalName: "NARROW_MODULATION", scientificStatus: "ENGINEERING_PRIOR", requiredDimensions: Object.freeze(["EXP-P1"] as const), geometryPrimary: true, registryVersion: REGISTRY_VERSION, provenance: provenance(stateSource) }),
]);
