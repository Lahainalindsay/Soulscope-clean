import type { ConstellationId } from "./constellationIds";
import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const SEED_STATE_IDS = Object.freeze([
  "COG-017",
  "COG-014",
  "COG-011",
  "COG-020",
  "REG-022",
  "REG-019",
  "REG-024",
  "REG-026",
  "CAP-012",
  "CAP-016",
  "CAP-018",
  "CAP-021",
  "EXP-009",
  "EXP-006",
  "EXP-004",
  "EXP-012",
] as const);

export type SeedStateId = (typeof SEED_STATE_IDS)[number];
export type SeedStateLifecycle = "reserved_fixed_seed" | "provisional_seed";

export type SeedStateRegistryEntry = Readonly<{
  id: SeedStateId;
  constellationId: ConstellationId;
  displayName: string;
  lifecycle: SeedStateLifecycle;
  coreMeaning: string;
  strengths: readonly string[];
  potentialCosts: readonly string[];
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const sourceFor = (section: string, table: string) =>
  provenance(sourceReference("constellationBible", section, "BIBLE", table));

export const SEED_STATE_REGISTRY: readonly SeedStateRegistryEntry[] = Object.freeze([
  Object.freeze({ id: "COG-017", constellationId: "COG", displayName: "Deliberate Builder", lifecycle: "reserved_fixed_seed", coreMeaning: "A structured processing style is helping the person work through something that is not effortless.", strengths: Object.freeze(["Care", "persistence", "sequencing", "considered response"] as const), potentialCosts: Object.freeze(["Slowness", "over-management", "fatigue from holding the structure"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 6.2 Seed state registry", "Table 23") }),
  Object.freeze({ id: "COG-014", constellationId: "COG", displayName: "Structured Ease", lifecycle: "provisional_seed", coreMeaning: "Clear, efficient structure with available room.", strengths: Object.freeze(["Clarity", "reliability", "follow-through"] as const), potentialCosts: Object.freeze(["Routine rigidity", "under-exploration if repeated across contexts"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 6.2 Seed state registry", "Table 24") }),
  Object.freeze({ id: "COG-011", constellationId: "COG", displayName: "Open Architect", lifecycle: "provisional_seed", coreMeaning: "Flexible thought with enough structure to stay coherent.", strengths: Object.freeze(["Creativity", "reframing", "synthesis"] as const), potentialCosts: Object.freeze(["Over-expansion", "too many branches if focus drops"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 6.2 Seed state registry", "Table 25") }),
  Object.freeze({ id: "COG-020", constellationId: "COG", displayName: "Searching Load", lifecycle: "provisional_seed", coreMeaning: "Active search has not yet settled into a stable structure.", strengths: Object.freeze(["Possibility generation", "sensitivity to complexity"] as const), potentialCosts: Object.freeze(["Mental friction", "indecision", "fragmentation risk"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 6.2 Seed state registry", "Table 26") }),
  Object.freeze({ id: "REG-022", constellationId: "REG", displayName: "Adaptive Recovery", lifecycle: "reserved_fixed_seed", coreMeaning: "The system appears able to mobilize, adjust, and come back toward its reference.", strengths: Object.freeze(["Responsiveness", "resilience", "usable range"] as const), potentialCosts: Object.freeze(["Recovery may still carry a resource cost", "one successful return is not a trait"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 7.1 Seed state registry", "Table 36") }),
  Object.freeze({ id: "REG-019", constellationId: "REG", displayName: "Steady Mobilization", lifecycle: "provisional_seed", coreMeaning: "Energy appears contained and directed.", strengths: Object.freeze(["Readiness", "focus", "persistence"] as const), potentialCosts: Object.freeze(["Sustained tension if recovery remains absent"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 7.1 Seed state registry", "Table 37") }),
  Object.freeze({ id: "REG-024", constellationId: "REG", displayName: "Returning Capacity", lifecycle: "provisional_seed", coreMeaning: "Return is underway, even if the starting point was strained.", strengths: Object.freeze(["Recalibration", "responsiveness", "regained room"] as const), potentialCosts: Object.freeze(["Temporary fragility", "return may be incomplete"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 7.1 Seed state registry", "Table 38") }),
  Object.freeze({ id: "REG-026", constellationId: "REG", displayName: "Held Activation", lifecycle: "provisional_seed", coreMeaning: "Mobilization appears sustained and contained rather than resolved.", strengths: Object.freeze(["Endurance", "task commitment", "controlled intensity"] as const), potentialCosts: Object.freeze(["Carryover", "constraint", "delayed recovery"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 7.1 Seed state registry", "Table 39") }),
  Object.freeze({ id: "CAP-012", constellationId: "CAP", displayName: "Available Reserve", lifecycle: "provisional_seed", coreMeaning: "The person appears able to engage without using all available room.", strengths: Object.freeze(["Pacing", "adaptability", "capacity for added demand"] as const), potentialCosts: Object.freeze(["Reserve can be context-specific and temporary"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 8.1 Seed state registry", "Table 49") }),
  Object.freeze({ id: "CAP-016", constellationId: "CAP", displayName: "Efficient Engagement", lifecycle: "provisional_seed", coreMeaning: "Energy is reaching the task efficiently.", strengths: Object.freeze(["Presence", "momentum", "clear deployment"] as const), potentialCosts: Object.freeze(["May be short-lived if reserve is untested"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 8.1 Seed state registry", "Table 50") }),
  Object.freeze({ id: "CAP-018", constellationId: "CAP", displayName: "Costly Output", lifecycle: "provisional_seed", coreMeaning: "Performance may be held through extra effort.", strengths: Object.freeze(["Determination", "commitment", "capacity to compensate"] as const), potentialCosts: Object.freeze(["Fatigue", "reduced margin", "diminishing return"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 8.1 Seed state registry", "Table 51") }),
  Object.freeze({ id: "CAP-021", constellationId: "CAP", displayName: "Rebuilding Reserve", lifecycle: "provisional_seed", coreMeaning: "The scan suggests return of room rather than full availability.", strengths: Object.freeze(["Recalibration", "pacing", "responsiveness"] as const), potentialCosts: Object.freeze(["Still-limited margin", "improvement may be fragile"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 8.1 Seed state registry", "Table 52") }),
  Object.freeze({ id: "EXP-009", constellationId: "EXP", displayName: "Guarded Openness", lifecycle: "reserved_fixed_seed", coreMeaning: "The person appears able to engage while choosing what and how much to reveal.", strengths: Object.freeze(["Discernment", "boundaries", "deliberate communication"] as const), potentialCosts: Object.freeze(["Extra effort", "partial withholding from self-protection", "slower access"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 9.1 Seed state registry", "Table 62") }),
  Object.freeze({ id: "EXP-006", constellationId: "EXP", displayName: "Selective Clarity", lifecycle: "provisional_seed", coreMeaning: "Expression is economical and intentional.", strengths: Object.freeze(["Clarity", "boundaries", "efficient communication"] as const), potentialCosts: Object.freeze(["Nuance may remain private", "range may be under-used"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 9.1 Seed state registry", "Table 63") }),
  Object.freeze({ id: "EXP-004", constellationId: "EXP", displayName: "Open Range", lifecycle: "provisional_seed", coreMeaning: "Expression appears fluid, responsive, and varied.", strengths: Object.freeze(["Nuance", "communication", "spontaneous access"] as const), potentialCosts: Object.freeze(["Overextension", "reduced boundary if Regulation is strained"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 9.1 Seed state registry", "Table 64") }),
  Object.freeze({ id: "EXP-012", constellationId: "EXP", displayName: "Constrained Access", lifecycle: "provisional_seed", coreMeaning: "Access to outward expression may currently be restricted or expensive.", strengths: Object.freeze(["Protection", "composure", "preservation of privacy"] as const), potentialCosts: Object.freeze(["Isolation", "inhibited communication", "increased internal effort"] as const), registryVersion: REGISTRY_VERSION, provenance: sourceFor("Section 9.1 Seed state registry", "Table 65") }),
]);

export function isSeedStateId(value: string): value is SeedStateId {
  return (SEED_STATE_IDS as readonly string[]).includes(value);
}
