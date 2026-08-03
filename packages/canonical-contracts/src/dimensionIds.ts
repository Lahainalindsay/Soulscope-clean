import type { ConstellationId } from "./constellationIds";
import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const DIMENSION_IDS = Object.freeze([
  "COG-P1",
  "COG-P2",
  "COG-P3",
  "COG-P4",
  "REG-P1",
  "REG-P2",
  "REG-P3",
  "REG-P4",
  "CAP-P1",
  "CAP-P2",
  "CAP-P3",
  "CAP-P4",
  "EXP-P1",
  "EXP-P2",
  "EXP-P3",
  "EXP-P4",
] as const);

export type DimensionId = (typeof DIMENSION_IDS)[number];

export type DimensionRegistryEntry = Readonly<{
  id: DimensionId;
  label: string;
  constellationId: ConstellationId;
  order: number;
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const dimensionSource = sourceReference(
  "constellationBible",
  "Sections 6-9 dimension headings",
  "BIBLE",
);

export const DIMENSION_REGISTRY: readonly DimensionRegistryEntry[] = Object.freeze([
  Object.freeze({ id: "COG-P1", label: "Organization", constellationId: "COG", order: 1, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "COG-P2", label: "Exploration", constellationId: "COG", order: 2, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "COG-P3", label: "Focus Continuity", constellationId: "COG", order: 3, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "COG-P4", label: "Processing Demand", constellationId: "COG", order: 4, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P1", label: "Activation", constellationId: "REG", order: 5, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P2", label: "Stability", constellationId: "REG", order: 6, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P3", label: "Flexibility", constellationId: "REG", order: 7, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P4", label: "Recovery", constellationId: "REG", order: 8, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P1", label: "Mobilization", constellationId: "CAP", order: 9, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P2", label: "Reserve", constellationId: "CAP", order: 10, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P3", label: "Effort Cost", constellationId: "CAP", order: 11, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P4", label: "Sustainability", constellationId: "CAP", order: 12, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P1", label: "Range", constellationId: "EXP", order: 13, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P2", label: "Openness", constellationId: "EXP", order: 14, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P3", label: "Restraint", constellationId: "EXP", order: 15, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P4", label: "Relational Availability", constellationId: "EXP", order: 16, registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
]);

export function isDimensionId(value: string): value is DimensionId {
  return (DIMENSION_IDS as readonly string[]).includes(value);
}
