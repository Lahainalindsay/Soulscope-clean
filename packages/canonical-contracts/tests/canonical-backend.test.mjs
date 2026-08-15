import assert from "node:assert/strict";
import test from "node:test";
import { readText } from "./test-utils.mjs";

const sourceBundle = [
  "src/authority.ts",
  "src/promptProtocol.ts",
  "src/dimensionIds.ts",
  "src/dimensionInference.ts",
  "src/evidenceMarkers.ts",
  "src/stateRegistry.ts",
  "src/interactionRegistry.ts",
  "src/patternRegistry.ts",
  "src/narrativePolicy.ts",
  "src/processingStages.ts",
  "src/versioning.ts",
  "src/resultContracts.ts",
  "src/scanProcessing.ts",
].map((file) => readText(file)).join("\n");

test("authority chain points to Canon v1.3 and current registries", () => {
  assert.match(readText("src/provenance.ts"), /docs\/CANONICAL_AUTHORITY_LEDGER\.md/);
  assert.match(readText("src/provenance.ts"), /The SoulScope Canon v1\.3\.pdf/);
  assert.match(readText("src/provenance.ts"), /SoulScope Whole-Scan Pattern Registry v0\.1\.pdf/);
  assert.match(readText("src/provenance.ts"), /SoulScope Narrative Registry\.pdf/);
  assert.match(readText("src/authority.ts"), /CURRENT_AUTHORITY_CHAIN/);
});

test("prompt protocol preserves current three-prompt semantics", () => {
  assert.match(sourceBundle, /P1_OPEN_REFERENCE[\s\S]*open spontaneous within-session reference/);
  assert.match(sourceBundle, /P2_TROUBLING_CONTEXT[\s\S]*personally salient troubling-material context/);
  assert.match(sourceBundle, /P3_FUTURE_CONTEXT[\s\S]*personally salient future-oriented context/);
  assert.match(sourceBundle, /expectedDurationSeconds: 30/);
  assert.match(sourceBundle, /neutral_baseline/);
  assert.match(sourceBundle, /negative_emotion/);
  assert.match(sourceBundle, /positive_emotion/);
});

test("D3 dimensions are hard-abstained under the current protocol", () => {
  assert.match(sourceBundle, /REG-P4[\s\S]*UNRESOLVED[\s\S]*NO_RECOVERY_COMPATIBLE_CONDITION/);
  assert.match(sourceBundle, /CAP-P2[\s\S]*UNRESOLVED[\s\S]*NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL/);
  assert.match(sourceBundle, /EXP-P4[\s\S]*UNRESOLVED[\s\S]*NO_RELATIONAL_OBSERVATION/);
});

test("dimension classes match the current registry class counts", () => {
  assert.equal((sourceBundle.match(/D1_DESCRIPTIVE_FUNCTIONAL/g) ?? []).length >= 7, true);
  assert.equal((sourceBundle.match(/D2_CONSTRUCT_CALIBRATION_REQUIRED/g) ?? []).length >= 8, true);
  assert.equal((sourceBundle.match(/D3_CURRENT_PROTOCOL_UNOBSERVABLE/g) ?? []).length >= 4, true);
});

test("Evidence layer has independent families and no direct prohibited target", () => {
  assert.match(sourceBundle, /EVIDENCE_FAMILIES = Object\.freeze\(\["PRO", "ENG", "TIM", "PHO", "SPE", "DYN"\]/);
  assert.match(sourceBundle, /Multiple markers from one family count as one independent Evidence family/);
  assert.match(sourceBundle, /prohibitedDirectTargets/);
});

test("state architecture keeps geometry primary and does not force exhaustive outcomes", () => {
  assert.match(sourceBundle, /STATE_OUTCOME_TYPES = Object\.freeze\(\["STATE", "BOUNDARY_BLEND", "UNRESOLVED"\]/);
  assert.match(sourceBundle, /geometryPrimary: true/);
  assert.doesNotMatch(readText("src/stateRegistry.ts"), /minimumConfidence|narrativeTemplates|visualProfile/);
});

test("interactions, patterns, and narrative remain downstream bounded layers", () => {
  assert.match(sourceBundle, /unresolvedParticipantBlocksPublication: true/);
  assert.match(sourceBundle, /staticCooccurrenceDoesNotCreateCausalDirection: true/);
  assert.match(sourceBundle, /defaultPublicationStatus: "NO_PATTERN_PUBLISHED"/);
  assert.match(sourceBundle, /patternOccursAfterInteractions: true/);
  assert.match(sourceBundle, /llmCreatedPatternAllowed: false/);
  assert.match(sourceBundle, /consumesOnlyCompletedSemanticResult: true/);
  assert.match(sourceBundle, /rawAudioInputAllowed: false/);
  assert.match(sourceBundle, /independentReasoningAllowed: false/);
  assert.match(sourceBundle, /unresolvedMaySoundResolved: false/);
});

test("semantic and visual processing paths remain separated", () => {
  const processingStages = readText("src/processingStages.ts");
  assert.match(processingStages, /raw_audio/);
  assert.match(processingStages, /immutable_semantic_result/);
  assert.match(processingStages, /narrative_engine/);
  assert.doesNotMatch(processingStages, /resonance_signature/);
  assert.match(readText("src/resultContracts.ts"), /QUALIFIED_ACOUSTIC_MEASUREMENTS_T/);
  assert.match(readText("src/resultContracts.ts"), /semanticGeometryInputAllowed: false/);
});

test("real scan processing foundation is service-owned and calibration-bounded", () => {
  const scanProcessing = readText("src/scanProcessing.ts");
  assert.match(scanProcessing, /register_uploaded_capture_artifact/);
  assert.match(scanProcessing, /start_scan_processing_run/);
  assert.match(scanProcessing, /create_measurement_record/);
  assert.match(scanProcessing, /create_unresolved_semantic_result/);
  assert.match(scanProcessing, /requiredPromptArtifactCount: 3/);
  assert.match(scanProcessing, /createsCalibratedAcousticFeatures: false/);
  assert.match(scanProcessing, /createsDimensionScores: false/);
  assert.match(scanProcessing, /createsNarrative: false/);
  assert.match(scanProcessing, /createsResonanceRendering: false/);
});

test("unresolved semantic result policy preserves D3 abstentions and no Pattern", () => {
  const scanProcessing = readText("src/scanProcessing.ts");
  assert.match(scanProcessing, /NO_RECOVERY_COMPATIBLE_CONDITION/);
  assert.match(scanProcessing, /NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL/);
  assert.match(scanProcessing, /NO_RELATIONAL_OBSERVATION/);
  assert.match(scanProcessing, /patternOutcome: "NO_PATTERN_PUBLISHED"/);
  assert.match(scanProcessing, /noPatternForced: true/);
  assert.match(scanProcessing, /noD3Reconstruction: true/);
});

test("active version manifest preserves material version identities", () => {
  assert.match(sourceBundle, /protocol: "1\.3"/);
  assert.match(sourceBundle, /featureRegistry: "0\.1"/);
  assert.match(sourceBundle, /evidenceRegistry: "0\.1"/);
  assert.match(sourceBundle, /patternRegistry: "0\.1"/);
  assert.doesNotMatch(sourceBundle, new RegExp("MISSING_" + "SOURCE_ARTIFACT"));
});

test("Pattern registry defines the seven initial research candidates once", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  for (const patternId of ["PTN-S01", "PTN-S02", "PTN-S03", "PTN-S04", "PTN-S05", "PTN-S06", "PTN-S07"]) {
    assert.match(patternRegistry, new RegExp(`${patternId}[\\s\\S]*scientificStatus: "RESEARCH_ONLY"`));
  }
  assert.match(patternRegistry, /COHERENT_MAINTENANCE/);
  assert.match(patternRegistry, /MOBILIZED_MAINTENANCE/);
  assert.match(patternRegistry, /MAINTAINED_WITH_COST/);
  assert.match(patternRegistry, /CONTEXTUAL_RECONFIGURATION/);
  assert.match(patternRegistry, /VARIABLE_RECONFIGURATION/);
  assert.match(patternRegistry, /CROSS_DOMAIN_MISMATCH/);
  assert.match(patternRegistry, /TEMPORAL_RELATION_SHIFT/);
});

test("Pattern policy does not force publication or arbitrary blends", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  assert.match(patternRegistry, /forceWinner: false/);
  assert.match(patternRegistry, /normalizeCandidateScoresToForceWinner: false/);
  assert.match(patternRegistry, /nonadjacentCompetingPatternsOutcome: "NO_PATTERN_PUBLISHED"/);
  assert.match(patternRegistry, /nonadjacentCompetingPatternsReason: "NONADJACENT_COMPETING_PATTERNS"/);
  assert.match(patternRegistry, /threeOrMorePlausiblePatternsOutcome: "NO_PATTERN_PUBLISHED"/);
  assert.match(patternRegistry, /threeOrMorePlausiblePatternsReason: "MULTIPLE_PLAUSIBLE_MOTIFS"/);
  assert.match(patternRegistry, /boundaryPatternsRequireRegisteredAdjacency: true/);
});

test("Pattern policy blocks unresolved upstream constructs and D3 reconstruction", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  assert.match(patternRegistry, /unresolvedRequiredConstructMakesCandidateIneligible: true/);
  assert.match(patternRegistry, /protocolUnobservableDimensions: Object\.freeze\(\["REG-P4", "CAP-P2", "EXP-P4"\]/);
  assert.match(patternRegistry, /protocolUnobservablePatternInferenceAllowed: false/);
  assert.match(patternRegistry, /PTN-D3-001/);
});

test("Maintained With Cost remains a research candidate with independent cost semantics", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  assert.match(patternRegistry, /PTN-S03[\s\S]*MAINTAINED_WITH_COST[\s\S]*scientificStatus: "RESEARCH_ONLY"/);
  assert.match(patternRegistry, /INDEPENDENTLY_ELEVATED_EFFORT_COST/);
  assert.match(patternRegistry, /CAP-P3/);
  assert.doesNotMatch(patternRegistry, /PRODUCTION_ACTIVE[\s\S]*MAINTAINED_WITH_COST/);
});

test("Pattern modifiers are limited and missing evidence stays missing", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  assert.match(patternRegistry, /maxPatternLevelModifiers: 1/);
  assert.match(patternRegistry, /missingModifierEvidenceBehavior: "OMIT_MODIFIER_DO_NOT_INFER_OPPOSITE"/);
  assert.match(patternRegistry, /PatternModifier/);
});

test("Pattern result preserves rejected candidates, confidence boundaries, and status ceiling", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  const resultContracts = readText("src/resultContracts.ts");
  assert.match(patternRegistry, /statusCannotExceedWeakestRequiredUpstream: true/);
  assert.match(patternRegistry, /evidenceSourceOverlapPropagatesIntoPatternConfidence: true/);
  assert.match(patternRegistry, /rejectedCandidatesMustRetainReasons: true/);
  assert.match(resultContracts, /rejectedPatterns/);
  assert.match(resultContracts, /patternConfidence/);
});

test("Pattern cannot be selected by LLM or coupled into Resonance Signature", () => {
  const patternRegistry = readText("src/patternRegistry.ts");
  assert.match(patternRegistry, /llmCreatedPatternAllowed: false/);
  assert.match(patternRegistry, /narrativeMayTranslateCompletedPatternOnly: true/);
  assert.match(patternRegistry, /resonanceSignatureInputAllowed: false/);
  assert.match(patternRegistry, /PTN-LLM-001/);
  assert.match(patternRegistry, /PTN-RES-001/);
});
