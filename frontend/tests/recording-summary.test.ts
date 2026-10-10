import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describeRecording, loadAuthorizedSummary } from "../lib/server-result-summary";
import { readRecordingSummary } from "../lib/recording-summary";
import { ResultsView } from "../components/results-view";
import { ResultDetails } from "../components/result-details";
import type { ResultBundle } from "../lib/contracts";
const scanId = "11111111-1111-4111-8111-111111111111";
const promptIds = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];
function sources(values = [0.2, 0.6, 0.3]) {
  const measurement = { id: "measurement", scan_id: scanId, measurement_status: "qualified", created_at: "2026-10-10T13:00:00Z",
    extractor_version: "soulscope-measurement-worker-0.2.0", protocol_version: "1.3",
    quality_summary: { status: "qualified", warnings: [] as string[], rejectionReasons: [] as string[] },
    prompt_measurements: promptIds.map((promptId, i) => ({ promptId, captureId: `capture-${i}`, durationMs: 30000,
      measurements: [{ feature_id: "SS_PAUSE_LOAD", value: values[i], unit: "ratio", quality: "descriptive", rejection_reason: null,
        method: "energy_vad_silence_ratio", implementation_status: "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER",
        source_capture_id: `capture-${i}`, capture_kind: promptId }] })) };
  const evidence = { id: "evidence", scan_id: scanId, measurement_record_id: measurement.id, status: "complete", status_counts: { supported: 3 }, entries: [] };
  const semantic = { id: "result", scan_id: scanId, status: "unresolved_abstained", measurement_record_id: measurement.id, evidence_ledger_id: evidence.id,
    semantic_schema_version: "0.2", decision_ledger: [], states_or_blends: [], result_report: { schemaVersion: "0.1", status: "UNAVAILABLE" },
    evidence_ledger: promptIds.map((prompt, i) => ({ evidence_id: `e-${i}`, marker_id: "EV_TIM_008", status: "RESOLVED", evidence_status: "supported",
      prompt_scope: [prompt], supporting_components: ["SS_PAUSE_LOAD", "Q_VOICED_RATIO"], source_measurement_ids: [`m-${i}`], confound_flags: [] as string[],
      provenance: { measurement_record_id: measurement.id, source_capture_id: `capture-${i}` } })) };
  return { semantic, measurement, evidence };
}
function summary(s = sources()) { return describeRecording(s.semantic, s.measurement, s.evidence); }
function validate(value: unknown, s = sources()) { return readRecordingSummary(value, s.semantic.id, scanId, s.semantic.evidence_ledger.map(e => e.evidence_id)); }
function bundle(): ResultBundle {
  const s = sources();
  return { scan: { id: scanId, created_at: s.measurement.created_at, lifecycle_state: "finalized" }, ...s,
    dimensions: { id: "dimension", status: "unresolved_abstained", dimensions: [{ posteriorMean: 0 }] }, recordingSummary: summary(s) };
}
test("supported immutable recording sources produce a bounded observation, never a psychological state", () => {
  const s = sources(), before = JSON.stringify(s), result = summary(s);
  assert.equal(result.status, "AVAILABLE"); assert.match(result.strongestObservation, /second response/);
  assert.equal(result.decision.psychologicalInference, false); assert.equal(result.energy.status, "UNAVAILABLE");
  assert.equal(result.overview.length, 3); assert.equal(result.evidenceRefs.length, 3);
  assert.ok(validate(result)); assert.ok(Object.isFrozen(validate(result)));
  assert.equal(JSON.stringify(s), before); assert.equal(s.semantic.status, "unresolved_abstained");
});
test("ties, equal readings, and zero are described without inventing high/low grades", () => {
  assert.match(summary(sources([0, 0, 0])).strongestObservation, /same proportion/);
  assert.match(summary(sources([0.5, 0.1, 0.5])).strongestObservation, /first and third/);
  assert.match(summary(sources([0.1, 0.2, 0.3])).strongestObservation, /third response/);
});
test("incomplete, rejected, confounded, unknown-version, and noncanonical sources fail closed", () => {
  const edits = [
    (s: ReturnType<typeof sources>) => { s.semantic.status = "invalid"; },
    (s: ReturnType<typeof sources>) => { s.semantic.status = "unexpected"; },
    (s: ReturnType<typeof sources>) => { s.measurement.measurement_status = "rejected"; },
    (s: ReturnType<typeof sources>) => { s.measurement.extractor_version = "future-worker"; },
    (s: ReturnType<typeof sources>) => { s.measurement.quality_summary.warnings.push("CLIPPING"); },
    (s: ReturnType<typeof sources>) => { s.measurement.prompt_measurements.pop(); },
    (s: ReturnType<typeof sources>) => { s.semantic.evidence_ledger[0].evidence_status = "insufficient"; },
    (s: ReturnType<typeof sources>) => { s.semantic.evidence_ledger[0].prompt_scope = ["P2_VS_P1"]; },
    (s: ReturnType<typeof sources>) => { s.semantic.evidence_ledger[0].confound_flags.push("MICROPHONE"); },
    (s: ReturnType<typeof sources>) => { s.semantic.evidence_ledger[0].provenance.source_capture_id = "other-capture"; },
    (s: ReturnType<typeof sources>) => { s.measurement.prompt_measurements[0].measurements[0].implementation_status = "PROVISIONAL_NON_CANONICAL"; },
    (s: ReturnType<typeof sources>) => { s.measurement.prompt_measurements[0].measurements[0].value = NaN; },
    (s: ReturnType<typeof sources>) => { s.measurement.prompt_measurements[0].measurements[0].value = 1.1; },
  ];
  for (const edit of edits) {
    const s = sources(); edit(s); const result = summary(s);
    assert.equal(result.status, "UNAVAILABLE"); assert.deepEqual(result.evidenceRefs, []); assert.equal(result.questionToSitWith, null);
    assert.ok(validate(result, s));
  }
  const mismatched = sources(); mismatched.evidence.measurement_record_id = "other";
  assert.throws(() => summary(mismatched), /sources do not match/);
});
test("summary consumer rejects wrong sources, duplicate evidence, multiple questions, and prohibited claims", () => {
  const result = summary();
  for (const change of [{ sourceResultId: "other" }, { scanId: "other" }, { evidenceRefs: ["unknown", "e-1", "e-2"] },
    { evidenceRefs: ["e-0", "e-0", "e-0"] }, { questionToSitWith: "What changed? Why?" }, { questionToSitWith: "Take a moment." },
    { overview: ["A single sentence."] }, { decision: { ...result.decision, psychologicalInference: true } }]) {
    assert.equal(validate({ ...result, ...change }), null);
  }
  for (const text of ["You are a calm person.", "This proves your feelings.", "The real reason is fear.", "You have ADHD.",
    "This reveals your personality.", "Your voice shows deception.", "This reveals a hidden truth."]) {
    for (const change of [{ strongestObservation: text }, { overview: [text, ...result.overview.slice(1)] },
      { alternatives: [text] }, { questionToSitWith: text }, { energy: { ...result.energy, explanation: text } }])
      assert.equal(validate({ ...result, ...change }), null);
  }
});
test("main result renders supplied copy identically across scores and leaves technical records to details", () => {
  const b = bundle();
  const render = (value: ResultBundle) => renderToStaticMarkup(createElement(ResultsView, { bundle: value }));
  const html = render(b);
  assert.match(html, /second response/); assert.match(html, /<time /); assert.match(html, /13:00|1:00/);
  assert.equal(html, render({ ...b, dimensions: { ...b.dimensions!, dimensions: [{ posteriorMean: 100, confidence: 1 }] },
    measurement: { ...b.measurement!, prompt_measurements: [] } }));
  for (const term of ["FIELD ID", "EVIDENCE COVERAGE", "SS_PAUSE_LOAD", "NO_PUBLISHABLE_SEMANTIC_FINDINGS", "RESPONSES MEASURED"])
    assert.ok(!html.includes(term));
  assert.ok(html.includes(`/results/${scanId}/details`));
  const details = renderToStaticMarkup(createElement(ResultDetails, { bundle: b }));
  assert.match(details, /SS_PAUSE_LOAD/); assert.match(details, /quiet-audio-description.v1/);
  const absent = render({ ...b, recordingSummary: null });
  assert.ok(!absent.includes("second response"));
});
test("browser presentation never imports the backend description rules", () => {
  for (const path of ["../components/results-view.tsx", "../lib/scans.ts", "../lib/recording-summary.ts"])
    assert.doesNotMatch(readFileSync(new URL(path, import.meta.url), "utf8"), /describeRecording|server-result-summary|Math\.max|posteriorMean|selectState/);
});
const config = { supabaseUrl: "https://db.example", publicKey: "public-test-key" };
function mock({ owner = true, authenticated = true, finalized = true } = {}) {
  const s = sources(), calls: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); calls.push(url);
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer owner-token");
    assert.equal(init?.cache, "no-store");
    if (url.includes("/auth/")) return Response.json({ id: "owner" }, { status: authenticated ? 200 : 401 });
    if (url.includes("scan_sessions?")) {
      assert.match(url, /user_id=eq.owner/);
      return Response.json(owner ? [{ id: scanId, lifecycle_state: finalized ? "finalized" : "queued" }] : []);
    }
    if (url.includes("semantic_result_records?")) return Response.json([s.semantic]);
    if (url.includes("measurement_records?")) return Response.json([s.measurement]);
    if (url.includes("evidence_ledgers?")) return Response.json([s.evidence]);
    throw new Error("Unexpected URL");
  };
  return { fetcher, calls };
}
const request = (authorized = true) => new Request("https://site.example", { headers: authorized ? { Authorization: "Bearer owner-token" } : {} });
test("summary endpoint authenticates the owner and uses only linked finalized records without writes", async () => {
  const m = mock(); const result = await loadAuthorizedSummary(request(), scanId, config, m.fetcher);
  assert.equal(result.status, "AVAILABLE"); assert.equal(m.calls.length, 5);
  assert.ok(m.calls.some(url => /measurement_records\?id=eq.measurement&scan_id=eq/.test(url)));
  assert.ok(m.calls.some(url => /evidence_ledgers\?id=eq.evidence&scan_id=eq/.test(url)));
});
test("unauthenticated, other-account, and unfinished requests never retrieve source records", async () => {
  const noAuth = mock(); await assert.rejects(loadAuthorizedSummary(request(false), scanId, config, noAuth.fetcher), /sign in/);
  assert.equal(noAuth.calls.length, 0);
  for (const options of [{ authenticated: false }, { owner: false }, { finalized: false }]) {
    const m = mock(options); await assert.rejects(loadAuthorizedSummary(request(), scanId, config, m.fetcher));
    assert.ok(!m.calls.some(url => url.includes("semantic_result_records")));
  }
  const invalid = mock(); await assert.rejects(loadAuthorizedSummary(request(), "bad-id", config, invalid.fetcher), /Invalid scan/);
  assert.equal(invalid.calls.length, 0);
});
