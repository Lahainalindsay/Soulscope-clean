import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { DEMO_RESULT_V1 } from "../lib/demo-result";
import { narrativeSentences, prohibitedResultLanguage, readReflectionNarrative } from "../lib/reflection-narrative";
import { storedReflection, constellationOutcome } from "../lib/result-presentation";
import { ReflectionOverview, ReflectionDetails } from "../components/reflection-narrative";
import { ResultsView } from "../components/results-view";
import type { ResultBundle, SemanticResultRecord } from "../lib/contracts";
import type { ReflectionNarrativeV1 } from "@soulscope/canonical-contracts/reflection-narrative";

const demo = DEMO_RESULT_V1;
const clone = () => structuredClone(demo.narrative);
const render = (narrative: ReflectionNarrativeV1 | null) =>
  renderToStaticMarkup(createElement(ReflectionOverview, { narrative })) +
  renderToStaticMarkup(createElement(ReflectionDetails, { narrative }));
function semantic(status = "resolved"): SemanticResultRecord {
  return {
    id: demo.source.resultId,
    scan_id: "saved-scan",
    status,
    semantic_schema_version: "0.2",
    evidence_ledger: demo.source.evidenceIds.map((evidence_id) => ({ evidence_id })),
    decision_ledger: demo.source.decisionIds.map((decisionId) => ({ decisionId })),
    states_or_blends: [{ constellationId: "COG", outcomeType: "UNRESOLVED" }],
    result_report: {
      schemaVersion: "test-only",
      status: "READY",
      reflectionNarrative: demo.narrative,
      selectedMeaningUnitIds: demo.source.selectedMeaningUnitIds,
    },
  };
}
function bundle(score: number, saved = semantic()): ResultBundle {
  return {
    scan: { id: "saved-scan", created_at: "2026-10-09T12:00:00Z", lifecycle_state: "finalized" },
    measurement: null,
    evidence: null,
    dimensions: { id: "d", status: "unresolved_abstained", dimensions: [{ posteriorMean: score, confidence: score }] },
    semantic: saved,
  };
}

test("demo is deeply frozen, synthetic, traced, and has three overview and daily-life sentences", () => {
  assert.equal(demo.kind, "ILLUSTRATIVE_DEMO");
  assert.ok(Object.isFrozen(demo) && Object.isFrozen(demo.narrative.overview[0]));
  assert.ok(readReflectionNarrative(demo.narrative, demo.source));
  assert.equal(demo.narrative.overview.length, 3);
  assert.equal(demo.narrative.dailyLife.length, 3);
  assert.ok(render(demo.narrative).includes("A QUESTION TO SIT WITH"));
});

test("rendered reflection and full dashboard do not change when scores change", () => {
  const low = bundle(0), high = bundle(100);
  assert.equal(render(storedReflection(low.semantic, low.scan.id)), render(storedReflection(high.semantic, high.scan.id)));
  assert.equal(renderToStaticMarkup(createElement(ResultsView, { bundle: low })),
    renderToStaticMarkup(createElement(ResultsView, { bundle: high })));
  assert.equal(constellationOutcome(high.semantic, "COG"), "UNRESOLVED");
});

test("scores without supplied narrative never create interpretation or leak the demo", () => {
  for (const score of [0, 50, 100, NaN]) {
    const saved = semantic("unresolved_abstained");
    const result = { ...saved, result_report: { schemaVersion: "0.1", status: "UNAVAILABLE", reason: "NO_PUBLISHABLE_SEMANTIC_FINDINGS" } };
    const html = renderToStaticMarkup(createElement(ResultsView, { bundle: bundle(score, result), demoResult: demo }));
    assert.ok(html.includes("A supported summary is not available"));
    assert.ok(!html.includes("HOW THIS MAY SHOW UP IN DAILY LIFE"));
    assert.ok(!html.includes("A QUESTION TO SIT WITH"));
    assert.ok(!html.includes(demo.narrative.overview[0]?.text ?? "unexpected-fixture"));
  }
});

test("backend abstention cannot be upgraded by a ready-looking narrative", () => {
  assert.equal(storedReflection(semantic("unresolved_abstained"), "saved-scan"), null);
  assert.equal(storedReflection(semantic("invalid"), "saved-scan"), null);
  assert.equal(storedReflection(semantic(), "another-scan"), null);
});

test("unresolved supplied narrative preserves its explanation and reasons without reflective padding", () => {
  const unresolved: ReflectionNarrativeV1 = {
    schemaVersion: "reflection-narrative.v1", languageVersion: "1.0.0", canonVersion: "2.0",
    sourceResultId: demo.source.resultId, status: "UNRESOLVED",
    strongestObservation: null, overview: [], dailyLife: [], questionToSitWith: null, alternatives: [],
    evidenceRefs: [], decisionRefs: demo.source.decisionIds, meaningUnitRefs: [],
    unresolved: {
      reasonCodes: ["NO_PUBLISHABLE_SEMANTIC_FINDINGS"],
      explanation: { text: "There was not enough supported meaning to offer a reflection.", evidenceRefs: [], decisionRefs: demo.source.decisionIds, meaningUnitRefs: [] },
    },
  };
  const validated = readReflectionNarrative(unresolved, { ...demo.source, publicationStatus: "UNRESOLVED" });
  assert.ok(validated);
  const html = render(validated);
  assert.ok(html.includes(unresolved.unresolved.explanation.text));
  assert.ok(html.includes("NO_PUBLISHABLE_SEMANTIC_FINDINGS"));
  assert.ok(!html.includes("HOW THIS MAY SHOW UP IN DAILY LIFE"));
});

test("invalid version, source IDs, citations, sentence counts, and multiple questions fail closed", () => {
  const edits = [
    (n: Record<string, unknown>) => { n.schemaVersion = "v99"; },
    (n: Record<string, unknown>) => { n.sourceResultId = "other-result"; },
    (n: Record<string, unknown>) => { n.overview = [demo.narrative.overview[0]]; },
    (n: Record<string, unknown>) => { n.dailyLife = Array(6).fill(demo.narrative.dailyLife[0]); },
    (n: Record<string, unknown>) => { n.evidenceRefs = ["unknown-evidence"]; },
    (n: Record<string, unknown>) => { n.questionToSitWith = { ...demo.narrative.questionToSitWith, text: "What feels useful? What will you do?" }; },
    (n: Record<string, unknown>) => { n.questionToSitWith = { ...demo.narrative.questionToSitWith, text: "Take a pause today." }; },
    (n: Record<string, unknown>) => { n.strongestObservation = { ...demo.narrative.strongestObservation, text: "Something shifted. This is another sentence." }; },
    (n: Record<string, unknown>) => { n.strongestObservation = { ...demo.narrative.strongestObservation, decisionRefs: ["invented-decision"] }; },
    (n: Record<string, unknown>) => { n.strongestObservation = { ...demo.narrative.strongestObservation, meaningUnitRefs: [] }; },
  ];
  for (const edit of edits) {
    const narrative = clone() as unknown as Record<string, unknown>;
    edit(narrative);
    assert.equal(readReflectionNarrative(narrative, demo.source), null);
  }
  assert.equal(readReflectionNarrative(demo.narrative, { ...demo.source, selectedMeaningUnitIds: [] }), null);
  assert.equal(storedReflection({ ...semantic(), evidence_ledger: null } as unknown as SemanticResultRecord, "saved-scan"), null);
});

test("validation and rendering never mutate the sealed input", () => {
  const original = JSON.stringify(demo);
  const validated = readReflectionNarrative(demo.narrative, demo.source);
  assert.ok(validated && Object.isFrozen(validated));
  render(validated);
  assert.equal(JSON.stringify(demo), original);
  assert.notEqual(validated, demo.narrative);
});

test("alternatives render as supplied and prose is escaped", () => {
  const narrative = clone();
  if (narrative.status !== "READY") throw new Error("Expected ready fixture");
  assert.ok(render(narrative).includes(narrative.alternatives[0].text));
  const injected = { ...narrative, strongestObservation: { ...narrative.strongestObservation, text: "<script>alert(1)</script> is fixture text." } };
  assert.ok(!render(injected).includes("<script>"));
});

const prohibited = [
  "You are a restrained person.",
  "This proves your feelings.",
  "The real reason is fear.",
  "Your voice suggests anxiety.",
  "You have ADHD.",
  "This scan reveals your personality.",
  "Your personality type is introverted.",
  "Your voice shows deception.",
  "You were lying.",
  "This reveals a hidden truth.",
  "Deep down you want control.",
];
for (const text of prohibited) {
  test(`prohibited result language is rejected: ${text}`, () => {
    assert.ok(prohibitedResultLanguage(text));
    const narrative = clone();
    if (narrative.status !== "READY") throw new Error("Expected ready fixture");
    assert.equal(readReflectionNarrative({ ...narrative, strongestObservation: { ...narrative.strongestObservation, text } }, demo.source), null);
  });
}

test("all supplied prose and static result UI remain free of prohibited claims", () => {
  for (const sentence of narrativeSentences(demo.narrative)) assert.ok(!prohibitedResultLanguage(sentence.text));
  const html = renderToStaticMarkup(createElement(ResultsView, { demoResult: demo }));
  assert.ok(!prohibitedResultLanguage(html.replace(/<[^>]*>/g, " ")));
});

test("language guards apply to overview, daily life, alternatives, and the question", () => {
  for (const field of ["overview", "dailyLife", "alternatives"] as const) {
    const narrative = clone();
    if (narrative.status !== "READY") throw new Error("Expected ready fixture");
    const sentences = [...narrative[field]];
    sentences[0] = { ...sentences[0], text: "This proves a hidden truth." };
    assert.equal(readReflectionNarrative({ ...narrative, [field]: sentences }, demo.source), null);
  }
  const narrative = clone();
  if (narrative.status !== "READY") throw new Error("Expected ready fixture");
  assert.equal(readReflectionNarrative({ ...narrative, questionToSitWith: { ...narrative.questionToSitWith, text: "Why do you think you are an introvert?" } }, demo.source), null);
});

test("reflection renderer and presentation adapter have no score or inference dependency", () => {
  const renderer = readFileSync(new URL("../components/reflection-narrative.tsx", import.meta.url), "utf8");
  const adapter = readFileSync(new URL("../lib/result-presentation.ts", import.meta.url), "utf8");
  assert.doesNotMatch(renderer, /\b(?:bundle|dimensions|posteriorMean|confidence)\b|selectState|scoreDimension|demo-result/);
  assert.doesNotMatch(adapter, /posteriorMean|selectState|scoreDimension|DEMO_RESULT|PREVIEW_REFLECTION/);
});
