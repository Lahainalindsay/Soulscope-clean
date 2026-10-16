import { freezeJson, prohibitedResultLanguage } from "./reflection-narrative";

/** Canon v2.0 §07: a raw bounded description, not a published Dimension or state.
 * A server consumer may regenerate this projection from immutable sources.
 * The client receives prose and source references, never a second scoring model.
 */
export type RecordingObservation = Readonly<{
  id: string; promptId: string; captureId: string; featureIds: readonly string[];
  description: string; method: string;
}>;
export type ObservationSentence = Readonly<{ text: string; observationRefs: readonly string[] }>;
export const FEELING_CHOICES = ["uneasy", "heavy", "hopeful", "tender", "frustrated", "steady", "mixed", "hard to name"] as const;
export type FeelingChoice = typeof FEELING_CHOICES[number];
export const isFeelingChoice = (value: unknown): value is FeelingChoice =>
  typeof value === "string" && (FEELING_CHOICES as readonly string[]).includes(value);
export type RecordingReflectionV1 = Readonly<{
  schemaVersion: "recording-reflection.v1";
  languageVersion: "recording-language.1.0.0" | "recording-language.1.0.1" | "recording-language.1.1.0";
  canonVersion: "2.0";
  sourceResultId: string; sourceMeasurementId: string; sourceEvidenceLedgerId: string; scanId: string;
  scope: "RECORDING_OBSERVATION"; status: "AVAILABLE" | "LIMITED";
  title: string; strongestObservation: ObservationSentence; overview: readonly ObservationSentence[];
  prompts: readonly Readonly<{ promptId: string; label: string; observations: readonly ObservationSentence[] }>[];
  invitations: readonly Readonly<{ title: string; text: string }>[];
  questionToSitWith: string | null;
  feltReading?: Readonly<{ reportedFeeling: FeelingChoice; title: string; opening: string;
    reflection: string; worthNoticing: string; question: string; observationRefs: readonly string[] }>;
  limits: readonly string[];
  observationLedger: readonly RecordingObservation[];
  selection: Readonly<{ selected: readonly string[]; withheld: readonly string[]; psychologicalInference: false }>;
}>;

const row = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 1000): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const strings = (v: unknown, max: number): v is string[] => Array.isArray(v) && v.length <= max && v.every(x => text(x));
const promptIds = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];

export function readRecordingReflection(value: unknown, source: {
  resultId: string; scanId: string; measurementId: string; evidenceLedgerId: string;
}): RecordingReflectionV1 | null {
  if (!row(value) || value.schemaVersion !== "recording-reflection.v1" || !["recording-language.1.0.0", "recording-language.1.0.1", "recording-language.1.1.0"].includes(String(value.languageVersion))
    || value.canonVersion !== "2.0" || value.scope !== "RECORDING_OBSERVATION"
    || value.sourceResultId !== source.resultId || value.scanId !== source.scanId
    || value.sourceMeasurementId !== source.measurementId || value.sourceEvidenceLedgerId !== source.evidenceLedgerId
    || !["AVAILABLE", "LIMITED"].includes(String(value.status)) || !text(value.title, 150)
    || !Array.isArray(value.observationLedger) || value.observationLedger.length > 12
    || !Array.isArray(value.prompts) || value.prompts.length > 3
    || !Array.isArray(value.overview) || value.overview.length < 1 || value.overview.length > 5
    || !Array.isArray(value.invitations) || value.invitations.length > 3
    || !strings(value.limits, 5) || !row(value.selection) || value.selection.psychologicalInference !== false
    || !strings(value.selection.selected, 12) || !strings(value.selection.withheld, 12)) return null;
  const ids: string[] = [];
  for (const entry of value.observationLedger) {
    if (!row(entry) || !text(entry.id) || !promptIds.includes(String(entry.promptId)) || !text(entry.captureId)
      || !strings(entry.featureIds, 4) || !entry.featureIds.length || !text(entry.description)
      || !text(entry.method)) return null;
    ids.push(entry.id);
  }
  if (new Set(ids).size !== ids.length || new Set(value.selection.selected).size !== value.selection.selected.length
    || !value.selection.selected.every(id => ids.includes(id))) return null;
  const prose: string[] = [value.title, ...value.limits];
  const validSentence = (v: unknown): boolean => {
    if (!row(v) || !text(v.text) || !strings(v.observationRefs, 12)
      || !v.observationRefs.every(id => ids.includes(id) && (value.selection as { selected: string[] }).selected.includes(id))) return false;
    if (value.status === "AVAILABLE" && !v.observationRefs.length) return false;
    prose.push(v.text);
    return true;
  };
  if (!validSentence(value.strongestObservation) || !value.overview.every(validSentence)) return null;
  for (const prompt of value.prompts) {
    if (!row(prompt) || !promptIds.includes(String(prompt.promptId)) || !text(prompt.label)
      || !Array.isArray(prompt.observations) || !prompt.observations.length || prompt.observations.length > 3
      || !prompt.observations.every(validSentence)) return null;
  }
  if (new Set(value.prompts.map(p => (p as { promptId: string }).promptId)).size !== value.prompts.length) return null;
  for (const invitation of value.invitations) {
    if (!row(invitation) || !text(invitation.title, 100) || !text(invitation.text)) return null;
    prose.push(invitation.title, invitation.text);
  }
  if (value.status === "AVAILABLE") {
    if (ids.length < 3 || !text(value.questionToSitWith) || !value.questionToSitWith.endsWith("?")
      || value.questionToSitWith.split("?").length !== 2 || value.invitations.length !== 3 || value.prompts.length !== 3) return null;
    prose.push(value.questionToSitWith);
  } else if (ids.length || value.selection.selected.length || value.questionToSitWith !== null
    || value.prompts.length || value.invitations.length) return null;
  if (value.feltReading !== undefined) {
    const reading = value.feltReading;
    if (value.languageVersion !== "recording-language.1.1.0" || value.status !== "AVAILABLE" || !row(reading)
      || !isFeelingChoice(reading.reportedFeeling) || !text(reading.title, 150)
      || !text(reading.opening) || !text(reading.reflection) || !text(reading.worthNoticing)
      || !text(reading.question) || !reading.question.endsWith("?") || reading.question.split("?").length !== 2
      || !strings(reading.observationRefs, 12) || !reading.observationRefs.length
      || !reading.observationRefs.every(id => (value.selection as { selected: string[] }).selected.includes(id))) return null;
    prose.push(reading.title, reading.opening, reading.reflection, reading.worthNoticing, reading.question);
  }
  if (prose.some(prohibitedResultLanguage)) return null;
  return freezeJson(structuredClone(value)) as RecordingReflectionV1;
}
