import { provenance, sourceReference } from "./provenance";
import { REGISTRY_VERSION } from "./versioning";

export const PROMPT_IDS = Object.freeze([
  "P1_OPEN_REFERENCE",
  "P2_TROUBLING_CONTEXT",
  "P3_FUTURE_CONTEXT",
] as const);

export type PromptId = (typeof PROMPT_IDS)[number];

export type PromptRegistryEntry = Readonly<{
  id: PromptId;
  order: 1 | 2 | 3;
  label: string;
  promptText: string;
  expectedDurationSeconds: 30;
  scientificRole: string;
  prohibitedAssumptions: readonly string[];
  registryVersion: typeof REGISTRY_VERSION;
  provenance: ReturnType<typeof provenance>;
}>;

const promptSource = sourceReference("canon", "Section V, The Production Scan", "CANON");

export const PROMPT_PROTOCOL_REGISTRY: readonly PromptRegistryEntry[] = Object.freeze([
  Object.freeze({
    id: "P1_OPEN_REFERENCE",
    order: 1,
    label: "Open Reference",
    promptText: "Speak about yourself, your day, or whatever comes to mind.",
    expectedDurationSeconds: 30,
    scientificRole: "open spontaneous within-session reference",
    prohibitedAssumptions: Object.freeze(["neutral_baseline", "trait_baseline"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(promptSource),
  }),
  Object.freeze({
    id: "P2_TROUBLING_CONTEXT",
    order: 2,
    label: "Troubling Context",
    promptText: "Speak about something troubling you.",
    expectedDurationSeconds: 30,
    scientificRole: "personally salient troubling-material context",
    prohibitedAssumptions: Object.freeze(["negative_emotion", "stress", "anxiety", "distress"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(promptSource),
  }),
  Object.freeze({
    id: "P3_FUTURE_CONTEXT",
    order: 3,
    label: "Future Context",
    promptText: "Speak about your hopes or goals for the future.",
    expectedDurationSeconds: 30,
    scientificRole: "personally salient future-oriented context",
    prohibitedAssumptions: Object.freeze(["positive_emotion", "optimism", "recovery"] as const),
    registryVersion: REGISTRY_VERSION,
    provenance: provenance(promptSource),
  }),
]);

export function isPromptId(value: string): value is PromptId {
  return (PROMPT_IDS as readonly string[]).includes(value);
}
