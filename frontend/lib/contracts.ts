export const CONSTELLATIONS = [
  {
    id: "COG",
    name: "Cognitive form",
    label: "Mental architecture",
    description: "The organization and continuity of your spoken responses.",
    color: "cyan",
  },
  {
    id: "REG",
    name: "Regulatory motion",
    label: "Regulatory rhythm",
    description:
      "The movement and stability of your vocal response across contexts.",
    color: "violet",
  },
  {
    id: "CAP",
    name: "Available capacity",
    label: "Available capacity",
    description: "Observable vocal effort within these responses.",
    color: "cyan",
  },
  {
    id: "EXP",
    name: "Expressive interface",
    label: "Expressive flow",
    description: "The shape and variation of expression in your voice.",
    color: "violet",
  },
] as const;
export type Measurement = {
  id: string;
  measurement_status: string;
  created_at: string;
  quality_summary: {
    status?: string;
    warnings?: string[];
    rejectionReasons?: string[];
  };
  prompt_measurements: {
    promptId: string;
    durationMs: number;
    measurements: {
      feature_id: string;
      value: number | null;
      unit: string;
      quality: string;
      implementation_status?: string;
    }[];
  }[];
};
export type Scan = { id: string; created_at: string; lifecycle_state: string };
export type Evidence = {
  id: string;
  status: string;
  status_counts: Record<string, number>;
  entries: unknown[];
};
export type Dimensions = { id: string; status: string; dimensions: unknown[] };
export type ResultBundle = {
  scan: Scan;
  measurement: Measurement | null;
  evidence: Evidence | null;
  dimensions: Dimensions | null;
  semantic: Record<string, unknown> | null;
};
export function displayValue(value: number | null | undefined, unit: string) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Number(value.toFixed(3))} ${unit}`
    : "Not available";
}
export const PREVIEW_REFLECTION = {
  summary:
    "There may be a pull between staying with what matters to you and making room for everything asking for your attention. One possibility is that a little more space between demands could help you hear your own priorities.",
  daily: [
    "You might finish one task while already carrying the next one in your mind.",
    "When a conversation matters, you may need a moment to find the words that feel right.",
    "A quieter transition between commitments could give you room to choose your next step.",
  ],
  underneath:
    "One possibility is that competing demands leave less room to pause. If that does not fit your experience, you can set it aside.",
  noticing:
    "Notice whether giving yourself a moment before responding changes how much effort the next conversation takes.",
  question:
    "Where could you create a small pause today so your next choice comes from what you need, rather than what feels most urgent?",
};
