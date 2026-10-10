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
/** Read-only persisted shape; consumer validation still checks untrusted JSON. */
export type SemanticResultRecord = Readonly<{
  id: string;
  scan_id: string;
  status: string;
  semantic_schema_version: string;
  evidence_ledger: readonly Readonly<{ evidence_id: string }>[];
  decision_ledger: readonly Readonly<{ decisionId: string }>[];
  states_or_blends: readonly Readonly<{ constellationId: string; outcomeType: string }>[];
  result_report: Readonly<{
    schemaVersion: string;
    status: string;
    reason?: string;
    reflectionNarrative?: unknown;
    selectedMeaningUnitIds?: readonly string[];
  }> | null;
}>;
export type ResultBundle = {
  recordingSummary?: unknown;
  scan: Scan;
  measurement: Measurement | null;
  evidence: Evidence | null;
  dimensions: Dimensions | null;
  semantic: SemanticResultRecord | null;
};
export function displayValue(value: number | null | undefined, unit: string) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Number(value.toFixed(3))} ${unit}`
    : "Not available";
}
