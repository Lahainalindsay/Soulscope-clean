import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { buildRecordingReflection } from "../lib/server-recording-reflection";
import { readRecordingReflection } from "../lib/recording-reflection";
import { ResultsView } from "../components/results-view";
import { RecordingReflection } from "../components/recording-reflection";
import { DEMO_RESULT_V1 } from "../lib/demo-result";
import { GET as reflectionGET } from "../app/api/results/[id]/reflection/route";
import { DEMO_RECORDING_REFLECTION } from "../lib/server-recording-reflection-demo";
import type { ResultBundle } from "../lib/contracts";

const promptIds = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];
export function recordingSources(pauses = [1000, 6000, 3000]) {
  const extractor = "soulscope-measurement-worker-0.3.0";
  const measurement = { id: "measurement", scan_id: "scan", protocol_version: "1.3", extractor_version: extractor,
    measurement_status: "qualified", created_at: "2026-10-16T00:00:00Z",
    quality_summary: { warnings: [] as string[], rejectionReasons: [] as string[] },
    prompt_measurements: promptIds.map((promptId, i) => {
      const captureId = `capture-${i}`;
      const feature = (name: string, value: number, unit: string, method: string) => ({
        feature_id: `PROVISIONAL_FRAME_${name}`, value: value as number | null, unit, method, feature_version: "1.0.0",
        feature_registry_version: "PROVISIONAL_NON_CANONICAL", implementation_status: "PROVISIONAL_NON_CANONICAL",
        quality: "research_only", rejection_reason: null as string | null, source_capture_id: captureId,
        capture_kind: promptId, extractor_version: extractor, segment_start_ms: 0, segment_end_ms: 30000,
        parameters: { profileVersion: "acoustic-profile.v1", semanticUse: false,
          nativeMethods: { praat: "0.4.6" }, support: { frameCount: 3000, validFrameCount: 2000 } },
      });
      return { promptId, captureId, durationMs: 30000,
        measurements: [feature("SPEECH_DURATION", 25000 - pauses[i], "ms", "webrtcvad_2.0.14_mode2"),
          feature("F0_P20", 100, "Hz", "praat_autocorrelation"), feature("F0_P80", [120, 150, 130][i], "Hz", "praat_autocorrelation")],
        acousticProfile: { version: "acoustic-profile.v1", nativeMethods: { vad: "webrtcvad-2.0.14-mode2-no-energy-fallback" },
          segments: [
            { kind: "leading_silence", start_ms: 0, end_ms: 1000 },
            { kind: "speech", start_ms: 1000, end_ms: 8000 },
            ...(pauses[i] > 0 ? [{ kind: "internal_pause", start_ms: 8000, end_ms: 8000 + pauses[i] }] : []),
            { kind: "speech", start_ms: 8000 + pauses[i], end_ms: 26000 },
            { kind: "trailing_silence", start_ms: 26000, end_ms: 30000 },
          ] },
      };
    }) };
  const evidence = { id: "evidence", scan_id: "scan", measurement_record_id: "measurement", status: "complete", entries: [], status_counts: {} };
  const semantic = { id: "result", scan_id: "scan", measurement_record_id: "measurement", evidence_ledger_id: "evidence",
    status: "unresolved_abstained", semantic_schema_version: "0.2", evidence_ledger: [], decision_ledger: [], states_or_blends: [],
    result_report: { schemaVersion: "0.2", status: "UNAVAILABLE" } };
  return { semantic, measurement, evidence };
}
function build(s = recordingSources()) { return buildRecordingReflection(s.semantic, s.measurement, s.evidence); }
function read(v: unknown) { return readRecordingReflection(v, { resultId: "result", scanId: "scan", measurementId: "measurement", evidenceLedgerId: "evidence" }); }

test("current worker produces an individualized recording reflection with traceable comparisons and no meaning promotion", () => {
  const s = recordingSources(), before = JSON.stringify(s), r = build(s);
  assert.equal(r.status, "AVAILABLE"); assert.match(r.title, /second response/);
  assert.match(r.overview[0].text, /1.0, 6.0, and 3.0 seconds/);
  assert.match(r.overview[2].text, /second response had the widest detected pitch span/);
  assert.equal(r.invitations.length, 3); assert.equal(r.overview.length, 4);
  assert.equal(r.selection.psychologicalInference, false);
  assert.equal(r.observationLedger.length, 6); assert.ok(read(r)); assert.ok(Object.isFrozen(read(r)));
  assert.equal(JSON.stringify(s), before); assert.equal(s.semantic.status, "unresolved_abstained");
  for (const claim of [r.strongestObservation, ...r.overview, ...r.prompts.flatMap(p => p.observations)])
    assert.ok(claim.observationRefs.every(id => r.selection.selected.includes(id)));
});
test("a different recording changes the observation; ties and tiny differences do not become emotional stories", () => {
  assert.match(build(recordingSources([6000, 1000, 3000])).title, /first response/);
  assert.match(build(recordingSources([1000, 3000, 6000])).title, /third response/);
  assert.match(build(recordingSources([1000, 1000, 1000])).title, /spacing/);
  assert.match(build(recordingSources([1000, 1001, 1000])).title, /spacing/);
  assert.match(build(recordingSources([0, 0, 0])).strongestObservation.text, /No pauses/);
  for (const pauses of [[1000, 6000, 3000], [3000, 1000, 6000], [0, 0, 0]]) {
    const r = build(recordingSources(pauses));
    assert.doesNotMatch(JSON.stringify(r), /optimism|recovery|anxious|resilient|dysregulated|calm person|emotional state/i);
    assert.ok(read(r));
  }
});
test("missing native analysis cannot be replaced by zero or treated as a quiet response", () => {
  const s = recordingSources();
  for (const r of s.measurement.prompt_measurements) for (const f of r.measurements) {
    f.value = null; f.rejection_reason = "NATIVE_DEPENDENCY_UNAVAILABLE"; f.quality = "not_available";
  }
  const r = build(s);
  assert.equal(r.status, "LIMITED"); assert.deepEqual(r.observationLedger, []); assert.equal(r.questionToSitWith, null); assert.ok(read(r));
});
test("partial, broken or unqualified timing is withheld while independent pitch description remains available", () => {
  const edits = [
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].acousticProfile.segments[1].end_ms = 7500; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].acousticProfile.segments[0].kind = "internal_pause"; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].measurements[0].source_capture_id = "wrong"; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].measurements[0].value = NaN; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].measurements[0].value = 1; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].acousticProfile.nativeMethods.vad = "unknown"; },
  ];
  for (const edit of edits) {
    const s = recordingSources(); edit(s); const r = build(s);
    assert.equal(r.status, "AVAILABLE"); assert.doesNotMatch(r.title, /more space/i);
    assert.ok(r.observationLedger.every(o => !o.id.endsWith(":timing"))); assert.ok(read(r));
  }
});
test("warnings, rejected audio, unknown versions, missing prompts and mismatched source links fail closed", () => {
  for (const edit of [
    (s: ReturnType<typeof recordingSources>) => { s.measurement.quality_summary.warnings.push("CLIPPING"); },
    (s: ReturnType<typeof recordingSources>) => { s.semantic.status = "invalid"; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.extractor_version = "future"; },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements.pop(); },
    (s: ReturnType<typeof recordingSources>) => { s.measurement.prompt_measurements[0].durationMs = 15000; },
  ]) {
    const s = recordingSources(); edit(s); const r = build(s); assert.equal(r.status, "LIMITED"); assert.ok(read(r));
  }
  const s = recordingSources(); s.semantic.measurement_record_id = "other";
  assert.throws(() => build(s), /sources do not match/);
});
test("consumer rejects wrong source IDs, dangling citations, clinical claims and multiple questions", () => {
  const r = build();
  for (const changed of [
    { ...r, sourceResultId: "other" }, { ...r, sourceMeasurementId: "other" }, { ...r, sourceEvidenceLedgerId: "other" },
    { ...r, strongestObservation: { text: "An observation.", observationRefs: ["invented"] } },
    { ...r, questionToSitWith: "What changed? Why?" },
    { ...r, selection: { ...r.selection, psychologicalInference: true } },
    { ...r, title: "You are anxious." },
    { ...r, invitations: [{ title: "A thought", text: "This reveals your personality." }, ...r.invitations.slice(1)] },
  ]) assert.equal(read(changed), null);
});
test("saved main result shows the supplied recording reflection without importing server rules or demo claims", () => {
  const s = recordingSources();
  const bundle: ResultBundle = { scan: { id: "scan", created_at: s.measurement.created_at, lifecycle_state: "finalized" },
    ...s, dimensions: null, recordingReflection: build(s) };
  const render = (b: ResultBundle) => renderToStaticMarkup(createElement(ResultsView, { bundle: b }));
  const html = render(bundle);
  assert.match(html, /More space in your second response/); assert.match(html, /AN INVITATION FOR TODAY/);
  assert.match(html, /A QUESTION TO SIT WITH/); assert.doesNotMatch(html, /Your reflection is not available yet/);
  assert.equal(html, render({ ...bundle, dimensions: { id: "d", status: "resolved", dimensions: [{ value: 100 }] } }));
  assert.doesNotMatch(render({ ...bundle, recordingReflection: { ...build(s), sourceResultId: "other" } }), /More space in your second response/);
  for (const path of ["../components/recording-reflection.tsx", "../components/results-view.tsx", "../lib/recording-reflection.ts"])
    assert.doesNotMatch(readFileSync(new URL(path, import.meta.url), "utf8"), /buildRecordingReflection|server-recording-reflection|Math\.max|posteriorMean/);
});
test("reflection renders text safely and does not execute supplied markup", () => {
  const r = build();
  const html = renderToStaticMarkup(createElement(RecordingReflection, { reflection: { ...r, title: "<script>alert(1)</script>" } }));
  assert.doesNotMatch(html, /<script>/); assert.match(html, /&lt;script&gt;/);
});
test("public sample uses the real recording projection and never leaks into a saved result", () => {
  const sample = renderToStaticMarkup(createElement(ResultsView, { recordingDemo: DEMO_RECORDING_REFLECTION }));
  assert.match(sample, /design preview/); assert.match(sample, /More space in your second response/);
  const s = recordingSources();
  const bundle: ResultBundle = { scan: { id: "scan", created_at: s.measurement.created_at, lifecycle_state: "finalized" },
    ...s, dimensions: null };
  const html = renderToStaticMarkup(createElement(ResultsView, { bundle, recordingDemo: DEMO_RECORDING_REFLECTION }));
  assert.doesNotMatch(html, /More space in your second response|design preview/);
});

test("a publishable supplied meaning narrative retains precedence over a recording description", () => {
  const s = recordingSources(), demo = DEMO_RESULT_V1;
  const bundle: ResultBundle = { scan: { id: "scan", created_at: s.measurement.created_at, lifecycle_state: "finalized" },
    ...s, dimensions: null, recordingReflection: build(s), semantic: { ...s.semantic, status: "resolved",
      evidence_ledger: demo.source.evidenceIds.map(evidence_id => ({ evidence_id })),
      decision_ledger: demo.source.decisionIds.map(decisionId => ({ decisionId })),
      result_report: { schemaVersion: "test", status: "READY", selectedMeaningUnitIds: demo.source.selectedMeaningUnitIds,
        reflectionNarrative: { ...demo.narrative, sourceResultId: s.semantic.id } } } };
  const html = renderToStaticMarkup(createElement(ResultsView, { bundle }));
  assert.match(html, /HOW THIS MAY SHOW UP IN DAILY LIFE/);
  assert.doesNotMatch(html, /More space in your second response/);
});

test("reflection route requires owner authentication, uses read-only requests and returns private validated prose", async () => {
  const original = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, fetch: globalThis.fetch };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-test";
  const scanId = "11111111-1111-4111-8111-111111111111", params = Promise.resolve({ id: scanId });
  const s = recordingSources();
  s.semantic.scan_id = scanId; s.measurement.scan_id = scanId; s.evidence.scan_id = scanId;
  const calls: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input); calls.push(url);
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer owner-token");
    assert.equal(init?.cache, "no-store"); assert.ok(!init?.method || init.method === "GET");
    if (url.includes("/auth/")) return Response.json({ id: "owner" });
    if (url.includes("scan_sessions?")) return Response.json([{ id: scanId, lifecycle_state: "finalized" }]);
    if (url.includes("semantic_result_records?")) return Response.json([s.semantic]);
    if (url.includes("measurement_records?")) return Response.json([s.measurement]);
    if (url.includes("evidence_ledgers?")) return Response.json([s.evidence]);
    throw new Error("Unexpected network destination");
  };
  try {
    const denied = await reflectionGET(new Request("https://site.example"), { params });
    assert.equal(denied.status, 401); assert.equal(calls.length, 0);
    const response = await reflectionGET(new Request("https://site.example", { headers: { Authorization: "Bearer owner-token" } }), { params });
    assert.equal(response.status, 200); assert.equal(response.headers.get("Cache-Control"), "private, no-store");
    assert.equal(response.headers.get("Vary"), "Authorization");
    const body = await response.json(); assert.equal(body.status, "AVAILABLE");
    assert.match(body.title, /second response/); assert.equal(calls.length, 5);
    assert.ok(calls.every(url => url.startsWith("https://db.example/")));
  } finally {
    globalThis.fetch = original.fetch;
    if (original.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = original.url;
    if (original.key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = original.key;
  }
});
