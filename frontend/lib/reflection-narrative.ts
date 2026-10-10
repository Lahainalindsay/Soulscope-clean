import Ajv2020 from "ajv/dist/2020";
import schema from "@soulscope/canonical-contracts/schemas/reflection-narrative-v1";
import type {
  ReflectionNarrativeV1,
  ReflectionSentenceV1,
  ReflectionSourceV1,
} from "@soulscope/canonical-contracts/reflection-narrative";

const validateShape = new Ajv2020({ allErrors: true, strictTypes: false })
  .compile<ReflectionNarrativeV1>(schema);
const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });

// Wording guardrails, not a classifier or a substitute for scientific review.
export const PROHIBITED_RESULT_LANGUAGE = [
  /\byou\s+are\b/i,
  /\bthis\s+proves\b/i,
  /\bthe\s+real\s+reason\b/i,
  /\b(?:diagnos(?:is|ed|tic)|mental illness|personality (?:type|trait|disorder)|true personality)\b/i,
  /\b(?:adhd|ptsd|bipolar|depression|anxiety disorder|autism|narcissis\w*)\b/i,
  /\b(?:you|your voice|this scan|these results?)\b[^.!?]*(?:\banxiety\b|\bemotionally unstable\b|\bintrovert\w*\b|\bextrovert\w*\b)/i,
  /\b(?:deception|deceptive|dishonest|lying|lie detector|hiding (?:something|the truth)|masking stress)\b/i,
  /\b(?:hidden truth|secret truth|true self|deep down|what you really (?:feel|want|think)|reveals? your (?:soul|personality|identity))\b/i,
] as const;

export function prohibitedResultLanguage(text: string): boolean {
  return PROHIBITED_RESULT_LANGUAGE.some((pattern) => pattern.test(text));
}

export function narrativeSentences(narrative: ReflectionNarrativeV1): readonly ReflectionSentenceV1[] {
  return narrative.status === "UNRESOLVED"
    ? [narrative.unresolved.explanation]
    : [narrative.strongestObservation, ...narrative.overview, ...narrative.dailyLife,
        narrative.questionToSitWith, ...narrative.alternatives];
}

export function freezeJson<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freezeJson);
    Object.freeze(value);
  }
  return value;
}

/** Validate a supplied projection against supplied sealed-result memberships.
 * No scores, acoustic values, thresholds, or state selection enter this function.
 */
export function readReflectionNarrative(
  value: unknown,
  source: ReflectionSourceV1,
): ReflectionNarrativeV1 | null {
  if (!validateShape(value)) return null;
  if (value.sourceResultId !== source.resultId) return null;
  if (value.status === "READY" && source.publicationStatus !== "READY") return null;
  const membership = (refs: readonly string[], allowed: readonly string[]) =>
    refs.every((ref) => allowed.includes(ref));
  if (!membership(value.evidenceRefs, source.evidenceIds)
    || !membership(value.decisionRefs, source.decisionIds)
    || !membership(value.meaningUnitRefs, source.selectedMeaningUnitIds)) return null;
  if (value.status === "READY" && !/\?\s*$/.test(value.questionToSitWith.text)) return null;
  for (const sentence of narrativeSentences(value)) {
    const text = sentence.text.trim();
    if (!text || !/[.!?]$/.test(text) || prohibitedResultLanguage(text)) return null;
    if ([...segmenter.segment(text)].filter((part) => part.segment.trim()).length !== 1) return null;
    if (!membership(sentence.evidenceRefs, value.evidenceRefs)
      || !membership(sentence.decisionRefs, value.decisionRefs)
      || !membership(sentence.meaningUnitRefs, value.meaningUnitRefs)) return null;
  }
  // Consumers receive a frozen copy. The caller's historical result is untouched.
  return freezeJson(structuredClone(value));
}
