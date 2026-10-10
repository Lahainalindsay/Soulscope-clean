/** Language System v1. Canon Set v2.0 controls new presentation contracts.
 * This contract carries completed meaning; it contains no inference behavior.
 */
export type ReflectionSentenceV1 = Readonly<{
  text: string;
  evidenceRefs: readonly string[];
  decisionRefs: readonly string[];
  meaningUnitRefs: readonly string[];
}>;

export type ThreeToFiveSentencesV1 =
  | readonly [ReflectionSentenceV1, ReflectionSentenceV1, ReflectionSentenceV1]
  | readonly [ReflectionSentenceV1, ReflectionSentenceV1, ReflectionSentenceV1, ReflectionSentenceV1]
  | readonly [ReflectionSentenceV1, ReflectionSentenceV1, ReflectionSentenceV1, ReflectionSentenceV1, ReflectionSentenceV1];

type ReflectionNarrativeBaseV1 = Readonly<{
  schemaVersion: "reflection-narrative.v1";
  languageVersion: "1.0.0";
  canonVersion: "2.0";
  sourceResultId: string;
  evidenceRefs: readonly string[];
  decisionRefs: readonly string[];
  meaningUnitRefs: readonly string[];
}>;

export type ReflectionNarrativeV1 = ReflectionNarrativeBaseV1 & (
  | Readonly<{
      status: "READY";
      strongestObservation: ReflectionSentenceV1;
      overview: ThreeToFiveSentencesV1;
      dailyLife: ThreeToFiveSentencesV1;
      questionToSitWith: ReflectionSentenceV1;
      alternatives: readonly ReflectionSentenceV1[];
      unresolved: null;
    }>
  | Readonly<{
      status: "UNRESOLVED";
      strongestObservation: null;
      overview: readonly [];
      dailyLife: readonly [];
      questionToSitWith: null;
      alternatives: readonly [];
      unresolved: Readonly<{
        reasonCodes: readonly string[];
        explanation: ReflectionSentenceV1;
      }>;
    }>
);

/** Authoritative membership and publication data supplied with the sealed result.
 * Numeric measurements and scores are deliberately absent from this boundary.
 */
export type ReflectionSourceV1 = Readonly<{
  resultId: string;
  publicationStatus: "READY" | "UNRESOLVED";
  evidenceIds: readonly string[];
  decisionIds: readonly string[];
  selectedMeaningUnitIds: readonly string[];
}>;
