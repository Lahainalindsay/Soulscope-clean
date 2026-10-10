import { freezeJson, prohibitedResultLanguage } from "./reflection-narrative";

/** A versioned raw/evidence-view projection, not a resolved psychological narrative. */
export type RecordingSummaryV1 = Readonly<{
  schemaVersion: "recording-summary.v1";
  ruleVersion: "quiet-audio-description.v1";
  sourceResultId: string;
  scanId: string;
  status: "AVAILABLE" | "UNAVAILABLE";
  strongestObservation: string;
  overview: readonly string[];
  questionToSitWith: string | null;
  alternatives: readonly string[];
  evidenceRefs: readonly string[];
  decision: Readonly<{ kind: "RAW_RECORDING_DESCRIPTION"; psychologicalInference: false; reason: string }>;
  energy: Readonly<{ status: "UNAVAILABLE"; explanation: string }>;
}>;

export function readRecordingSummary(value: unknown, resultId: string, scanId: string, evidenceIds: readonly string[]): RecordingSummaryV1 | null {
  if (!value || typeof value !== "object") return null;
  const v = value as RecordingSummaryV1;
  const strings = (items: unknown): items is string[] => Array.isArray(items) && items.length <= 5 && items.every(x => typeof x === "string" && x.trim().length > 0 && x.length <= 1500);
  if (v.schemaVersion !== "recording-summary.v1" || v.ruleVersion !== "quiet-audio-description.v1"
    || v.sourceResultId !== resultId || v.scanId !== scanId || !["AVAILABLE", "UNAVAILABLE"].includes(v.status)
    || typeof v.strongestObservation !== "string" || !strings(v.overview) || !strings(v.alternatives)
    || !strings(v.evidenceRefs) || !v.evidenceRefs.every(id => evidenceIds.includes(id))
    || v.decision?.kind !== "RAW_RECORDING_DESCRIPTION" || v.decision.psychologicalInference !== false
    || typeof v.decision.reason !== "string" || v.energy?.status !== "UNAVAILABLE" || typeof v.energy.explanation !== "string") return null;
  if (v.status === "AVAILABLE" && (v.evidenceRefs.length !== 3 || new Set(v.evidenceRefs).size !== 3 || v.overview.length !== 3 || typeof v.questionToSitWith !== "string")) return null;
  if (v.status === "UNAVAILABLE" && (v.evidenceRefs.length || v.questionToSitWith !== null)) return null;
  const prose = [v.strongestObservation, ...v.overview, ...v.alternatives, v.questionToSitWith ?? "", v.energy.explanation];
  if (prose.some(prohibitedResultLanguage)) return null;
  const sentence = new Intl.Segmenter("en", { granularity: "sentence" });
  const sentences = [v.strongestObservation, ...v.overview, ...v.alternatives, v.energy.explanation,
    ...(v.questionToSitWith ? [v.questionToSitWith] : [])];
  if (sentences.some(text => !text.trim() || !/[.!?]$/.test(text.trim()) || [...sentence.segment(text)].filter(p => p.segment.trim()).length !== 1)) return null;
  if (v.status === "AVAILABLE" && !/\?\s*$/.test(v.questionToSitWith!)) return null;
  return freezeJson(structuredClone(v));
}
