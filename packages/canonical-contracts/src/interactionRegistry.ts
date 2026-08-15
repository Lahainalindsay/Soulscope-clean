import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const INTERACTION_VERBS = Object.freeze([
  "REINFORCES",
  "BUFFERS",
  "AMPLIFIES",
  "MASKS",
  "COMPENSATES",
  "CONSTRAINS",
  "PROTECTS",
  "REDIRECTS",
  "DESTABILIZES",
  "INTEGRATES",
  "REVEALS",
  "SHIFTS",
] as const);

export type InteractionVerb = (typeof INTERACTION_VERBS)[number];

export const INTERACTION_BOUNDARY_POLICY = Object.freeze({
  registryVersion: REGISTRY_VERSION,
  verbs: INTERACTION_VERBS,
  downstreamOnly: true,
  unresolvedParticipantBlocksPublication: true,
  staticCooccurrenceDoesNotCreateCausalDirection: true,
  masksBoundary: "MASKS does not mean concealment or deception.",
  integratesBoundary: "INTEGRATES does not mean psychologically integrated or healthy.",
  shiftsBoundary: "SHIFTS does not mean improved, worsened, or recovered.",
  provenance: provenance(sourceReference("interactionRegistry", "Interaction verbs and scientific boundaries", "CANON")),
});
