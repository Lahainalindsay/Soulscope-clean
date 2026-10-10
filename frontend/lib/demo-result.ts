import type {
  ReflectionNarrativeV1,
  ReflectionSourceV1,
  ReflectionSentenceV1,
} from "@soulscope/canonical-contracts/reflection-narrative";
import { freezeJson, readReflectionNarrative } from "./reflection-narrative";

type DemoResultV1 = Readonly<{
  kind: "ILLUSTRATIVE_DEMO";
  schemaVersion: "demo-result.v1";
  source: ReflectionSourceV1;
  evidenceLedger: readonly Readonly<{ id: string; description: string }>[];
  decisionLedger: readonly Readonly<{ id: string; meaningUnitIds: readonly string[] }>[];
  narrative: ReflectionNarrativeV1;
}>;

const source: ReflectionSourceV1 = {
  resultId: "demo-language-v1",
  publicationStatus: "READY",
  evidenceIds: ["demo:pause-spacing", "demo:context-transition"],
  decisionIds: ["demo:meaning-selection"],
  selectedMeaningUnitIds: ["demo:pause-reflection"],
};
const sentence = (text: string): ReflectionSentenceV1 => ({
  text,
  evidenceRefs: [...source.evidenceIds],
  decisionRefs: [...source.decisionIds],
  meaningUnitRefs: [...source.selectedMeaningUnitIds],
});
const narrative: ReflectionNarrativeV1 = {
  schemaVersion: "reflection-narrative.v1",
  languageVersion: "1.0.0",
  canonVersion: "2.0",
  sourceResultId: source.resultId,
  status: "READY",
  strongestObservation: sentence("There was more space between phrases as the responses moved toward the future."),
  overview: [
    sentence("There may be a pull between staying with what matters to you and making room for everything asking for your attention."),
    sentence("One possibility is that a little more space between demands could help you hear your own priorities."),
    sentence("If this fits, the invitation is to notice where a pause feels useful rather than deciding what the moment says about you."),
  ],
  dailyLife: [
    sentence("You might finish one task while already carrying the next one in your mind."),
    sentence("When a conversation matters, you may need a moment to find the words that feel right."),
    sentence("A quieter transition between commitments could give you room to choose your next step."),
  ],
  questionToSitWith: sentence("Where could a small pause give you more room to choose your next step today?"),
  alternatives: [
    sentence("The extra space could also reflect the wording of the prompt or simply taking time to speak."),
    sentence("A different speaking pace may fit the moment without carrying a deeper personal meaning."),
  ],
  evidenceRefs: [...source.evidenceIds],
  decisionRefs: [...source.decisionIds],
  meaningUnitRefs: [...source.selectedMeaningUnitIds],
  unresolved: null,
};
if (!readReflectionNarrative(narrative, source)) throw new Error("Invalid illustrative narrative fixture");

/** Entirely synthetic: no audio, real evidence, scoring, or production publication. */
export const DEMO_RESULT_V1: DemoResultV1 = freezeJson({
  kind: "ILLUSTRATIVE_DEMO",
  schemaVersion: "demo-result.v1",
  source,
  evidenceLedger: [
    { id: "demo:pause-spacing", description: "Synthetic fixture: more space between phrases in the final response." },
    { id: "demo:context-transition", description: "Synthetic fixture: prompt-level timing comparison." },
  ],
  decisionLedger: [{ id: "demo:meaning-selection", meaningUnitIds: ["demo:pause-reflection"] }],
  narrative,
});
export type { DemoResultV1 };
