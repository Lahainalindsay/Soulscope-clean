import { provenance, sourceReference } from "./provenance";

export const NARRATIVE_SECTION_IDS = Object.freeze([
  "what_feels_most_present",
  "how_this_may_show_up_in_daily_life",
  "what_may_be_happening_underneath",
  "something_worth_noticing",
  "a_question_to_sit_with",
] as const);

export type NarrativeSectionId = (typeof NARRATIVE_SECTION_IDS)[number];

export const NARRATIVE_SECTIONS = Object.freeze([
  Object.freeze({ id: "what_feels_most_present", label: "What feels most present", order: 1 }),
  Object.freeze({ id: "how_this_may_show_up_in_daily_life", label: "How this may show up in daily life", order: 2 }),
  Object.freeze({ id: "what_may_be_happening_underneath", label: "What may be happening underneath", order: 3 }),
  Object.freeze({ id: "something_worth_noticing", label: "Something worth noticing", order: 4 }),
  Object.freeze({ id: "a_question_to_sit_with", label: "A question to sit with", order: 5 }),
].map((entry) =>
  Object.freeze({
    ...entry,
    provenance: provenance(sourceReference("constellationBible", "Section 14.1 Approved structure", "BIBLE")),
  }),
));

export type NarrativeCitationRequirement = Readonly<{
  sentenceInternalCitationRequired: true;
  allowedCitationTargets: readonly ["state_id", "interaction_id", "evidence_ledger_id"];
  provenance: ReturnType<typeof provenance>;
}>;

export const NARRATIVE_CITATION_REQUIREMENT: NarrativeCitationRequirement = Object.freeze({
  sentenceInternalCitationRequired: true,
  allowedCitationTargets: Object.freeze(["state_id", "interaction_id", "evidence_ledger_id"] as const),
  provenance: provenance(sourceReference("constellationBible", "Section 14.2 Narrative generation contract", "BIBLE")),
});
