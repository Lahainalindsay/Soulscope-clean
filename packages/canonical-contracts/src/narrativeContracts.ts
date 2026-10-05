import type { NarrativeClaimLevel } from "./narrativePolicy";
import type { NarrativeSectionId } from "./narrativeSections";
import { provenance, sourceReference } from "./provenance";

export const NARRATIVE_PRESENTATION_VERSION = "0.1" as const;

export const NARRATIVE_SOURCE_TYPES = Object.freeze([
  "state_id",
  "interaction_id",
  "evidence_ledger_id",
] as const);
export type NarrativeSourceType = (typeof NARRATIVE_SOURCE_TYPES)[number];

export type NarrativeSourceCitation = Readonly<{
  sourceType: NarrativeSourceType;
  sourceId: string;
}>;

export type NarrativeSentence = Readonly<{
  sentenceId: string;
  sectionId: NarrativeSectionId;
  text: string;
  claimLevel: NarrativeClaimLevel;
  citations: readonly NarrativeSourceCitation[];
  reflective: boolean;
}>;

export type NarrativeSection = Readonly<{
  sectionId: NarrativeSectionId;
  sentences: readonly NarrativeSentence[];
}>;

export type NarrativeGuard = Readonly<{
  completedSemanticResultRequired: true;
  rawAudioAllowed: false;
  independentScientificInferenceAllowed: false;
  unresolvedMaySoundResolved: false;
  everySentenceRequiresInternalCitation: true;
  reflectiveHypothesisRequiresUncertaintyLanguage: true;
  identityClaimAllowed: false;
  diagnosisAllowed: false;
  deceptionClaimAllowed: false;
  causalClaimAllowed: false;
  emotionTruthClaimAllowed: false;
  personalityCertaintyAllowed: false;
}>;

export const NARRATIVE_GUARD: NarrativeGuard = Object.freeze({
  completedSemanticResultRequired: true,
  rawAudioAllowed: false,
  independentScientificInferenceAllowed: false,
  unresolvedMaySoundResolved: false,
  everySentenceRequiresInternalCitation: true,
  reflectiveHypothesisRequiresUncertaintyLanguage: true,
  identityClaimAllowed: false,
  diagnosisAllowed: false,
  deceptionClaimAllowed: false,
  causalClaimAllowed: false,
  emotionTruthClaimAllowed: false,
  personalityCertaintyAllowed: false,
});

export const NARRATIVE_PRESENTATION_POLICY = Object.freeze({
  version: NARRATIVE_PRESENTATION_VERSION,
  readerFirst: true,
  leadWithUserNotScan: true,
  requireTechnicalPreamble: false,
  technicalMeasurementLanguageDefaultVisible: false,
  sectionIdsRemainCanonicalWhenDisplayLabelsChange: true,
  dailyLifeSectionMayBeLongForm: true,
  dailyLifeSectionPurpose: "Translate supported completed-result structure into concrete, relatable everyday experience without adding inference.",
  tone: Object.freeze([
    "human",
    "direct",
    "relatable",
    "specific",
    "nonclinical",
    "nonjudgmental",
    "agency_preserving",
  ] as const),
  avoidDefaultOpeners: Object.freeze([
    "your scan suggests",
    "your scan indicates",
    "the scan shows",
    "our analysis shows",
  ] as const),
  provenance: provenance(sourceReference("narrativeRegistry", "Narrative output and authority boundary", "CANON")),
});

export type NarrativeValidationIssue = Readonly<{
  code:
    | "MISSING_INTERNAL_CITATION"
    | "UNSUPPORTED_SOURCE_TYPE"
    | "EMPTY_SOURCE_ID"
    | "REFLECTIVE_HYPOTHESIS_NOT_MARKED"
    | "UNRESOLVED_PRESENTED_AS_RESOLVED"
    | "PROHIBITED_CLAIM";
  sentenceId?: string;
  sectionId?: NarrativeSectionId;
  detail: string;
}>;

export type NarrativeValidationRecord = Readonly<{
  narrativeId: string;
  semanticResultId: string;
  presentationVersion: typeof NARRATIVE_PRESENTATION_VERSION;
  valid: boolean;
  issues: readonly NarrativeValidationIssue[];
  validatedSentenceIds: readonly string[];
  provenance: ReturnType<typeof provenance>;
}>;

export const NARRATIVE_VALIDATION_REQUIREMENTS = Object.freeze({
  validateBeforePublication: true,
  preserveMixedEvidence: true,
  preserveUnresolvedStatus: true,
  requireSentenceTraceability: true,
  rejectEmptyCitationSets: true,
  rejectUnsupportedCitationTargets: true,
  rejectNewScientificInference: true,
  rejectProhibitedClaims: true,
  provenance: provenance(sourceReference("narrativeRegistry", "Narrative validation and sentence-level traceability", "CANON")),
});
