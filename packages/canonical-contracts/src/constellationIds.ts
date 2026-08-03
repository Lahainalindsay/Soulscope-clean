import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const CONSTELLATION_IDS = Object.freeze(["COG", "REG", "CAP", "EXP"] as const);

export type ConstellationId = (typeof CONSTELLATION_IDS)[number];

export type ConstellationRegistryEntry = Readonly<{
  id: ConstellationId;
  label: string;
  questionAnswered: string;
  fourPoints: readonly string[];
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const constellationSource = sourceReference(
  "constellationBible",
  "Section 1, The four proposed constellations",
  "BIBLE",
  "Table 4",
);

export const CONSTELLATION_REGISTRY: readonly ConstellationRegistryEntry[] = Object.freeze([
  Object.freeze({
    id: "COG",
    label: "Cognitive Form",
    questionAnswered: "How is mental work being organized and sustained?",
    fourPoints: Object.freeze(["Organization", "Exploration", "Focus Continuity", "Processing Demand"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(constellationSource),
  }),
  Object.freeze({
    id: "REG",
    label: "Regulatory Motion",
    questionAnswered: "How is the system responding, adapting, and returning?",
    fourPoints: Object.freeze(["Activation", "Stability", "Flexibility", "Recovery"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(constellationSource),
  }),
  Object.freeze({
    id: "CAP",
    label: "Available Capacity",
    questionAnswered: "What resources appear available, and what does current functioning seem to cost?",
    fourPoints: Object.freeze(["Mobilization", "Reserve", "Effort Cost", "Sustainability"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(constellationSource),
  }),
  Object.freeze({
    id: "EXP",
    label: "Expressive Interface",
    questionAnswered: "How is inner activity being carried into outward expression?",
    fourPoints: Object.freeze(["Range", "Openness", "Restraint", "Relational Availability"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(constellationSource),
  }),
]);

export function isConstellationId(value: string): value is ConstellationId {
  return (CONSTELLATION_IDS as readonly string[]).includes(value);
}
