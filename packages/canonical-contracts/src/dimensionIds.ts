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

export type DimensionScientificClass =
  | "D1_DESCRIPTIVE_FUNCTIONAL"
  | "D2_CONSTRUCT_CALIBRATION_REQUIRED"
  | "D3_CURRENT_PROTOCOL_UNOBSERVABLE";

export type DimensionRegistryEntry = Readonly<{
  id: DimensionId;
  label: string;
  constellationId: ConstellationId;
  order: number;
  scientificClass: DimensionScientificClass;
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const dimensionSource = sourceReference(
  "dimensionRegistry",
  "Sections 3-20, Dimension registry",
  "CANON",
);

export const DIMENSION_REGISTRY: readonly DimensionRegistryEntry[] = Object.freeze([
  Object.freeze({ id: "COG-P1", label: "Organization", constellationId: "COG", order: 1, scientificClass: "D1_DESCRIPTIVE_FUNCTIONAL", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "COG-P2", label: "Exploration", constellationId: "COG", order: 2, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "COG-P3", label: "Focus Continuity", constellationId: "COG", order: 3, scientificClass: "D1_DESCRIPTIVE_FUNCTIONAL", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "COG-P4", label: "Processing Demand", constellationId: "COG", order: 4, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P1", label: "Activation", constellationId: "REG", order: 5, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P2", label: "Stability", constellationId: "REG", order: 6, scientificClass: "D1_DESCRIPTIVE_FUNCTIONAL", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P3", label: "Flexibility", constellationId: "REG", order: 7, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "REG-P4", label: "Recovery", constellationId: "REG", order: 8, scientificClass: "D3_CURRENT_PROTOCOL_UNOBSERVABLE", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P1", label: "Mobilization", constellationId: "CAP", order: 9, scientificClass: "D1_DESCRIPTIVE_FUNCTIONAL", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P2", label: "Reserve", constellationId: "CAP", order: 10, scientificClass: "D3_CURRENT_PROTOCOL_UNOBSERVABLE", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P3", label: "Effort Cost", constellationId: "CAP", order: 11, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "CAP-P4", label: "Sustainability", constellationId: "CAP", order: 12, scientificClass: "D1_DESCRIPTIVE_FUNCTIONAL", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P1", label: "Range", constellationId: "EXP", order: 13, scientificClass: "D1_DESCRIPTIVE_FUNCTIONAL", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P2", label: "Openness", constellationId: "EXP", order: 14, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P3", label: "Restraint", constellationId: "EXP", order: 15, scientificClass: "D2_CONSTRUCT_CALIBRATION_REQUIRED", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
  Object.freeze({ id: "EXP-P4", label: "Relational Availability", constellationId: "EXP", order: 16, scientificClass: "D3_CURRENT_PROTOCOL_UNOBSERVABLE", registryVersion: REGISTRY_VERSION, provenance: provenance(dimensionSource) }),
]);

export function isDimensionId(value: string): value is DimensionId {
  return (DIMENSION_IDS as readonly string[]).includes(value);
}
