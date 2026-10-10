import type { ReflectionNarrativeV1, ReflectionSourceV1 } from "@soulscope/canonical-contracts/reflection-narrative";
import type { SemanticResultRecord } from "./contracts";
import { readReflectionNarrative } from "./reflection-narrative";

const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
function memberIds(value: unknown, key: string): string[] | null {
  if (!Array.isArray(value) || !value.every((entry) => record(entry) && typeof entry[key] === "string")) return null;
  return value.map((entry) => entry[key]);
}

/** Only server-published text may cross into the reflection renderer.
 * Existing unavailable reports need no migration and never become demo copy.
 */
export function storedReflection(semantic: SemanticResultRecord | null, scanId: string): ReflectionNarrativeV1 | null {
  if (!record(semantic) || semantic.scan_id !== scanId || typeof semantic.id !== "string") return null;
  const report = semantic.result_report;
  if (!record(report)) return null;
  const evidenceIds = memberIds(semantic.evidence_ledger, "evidence_id");
  const decisionIds = memberIds(semantic.decision_ledger, "decisionId");
  if (!evidenceIds || !decisionIds) return null;
  const selectedMeaningUnitIds = report.selectedMeaningUnitIds ?? [];
  if (!strings(selectedMeaningUnitIds)) return null;
  const source: ReflectionSourceV1 = {
    resultId: semantic.id,
    publicationStatus: semantic.status === "resolved" && report.status === "READY" ? "READY" : "UNRESOLVED",
    evidenceIds,
    decisionIds,
    selectedMeaningUnitIds,
  };
  return readReflectionNarrative(report.reflectionNarrative, source);
}

/** Display a persisted outcome verbatim; never infer it from Dimension values. */
export function constellationOutcome(semantic: SemanticResultRecord | null, constellationId: string): string {
  const states = semantic?.states_or_blends;
  if (!Array.isArray(states)) return "Not available";
  const state = states.find((item) => record(item) && item.constellationId === constellationId);
  return state && typeof state.outcomeType === "string"
    ? state.outcomeType.replaceAll("_", " ")
    : "Not available";
}
