import { test } from "node:test";
import assert from "node:assert/strict";
import { readReflectionV2 } from "../lib/reflection-v2";
import { GET } from "../app/api/results/[id]/reflection/route";

test("transcript reading cites exact codepoint spans and rejects forged citations", () => {
  const id = "11111111-1111-4111-8111-111111111111";
  const text = "I’m making plans with my sister.";
  const span = { captureId: id, start: 0, end: 16, quote: Array.from(text).slice(0, 16).join("") };
  const line = { text: "You are making plans with your sister.", sourceSpans: [span] };
  const sections = { overview: [line], cognition: [], relationships: [], expression: [], question: [] };
  const row = { id: "reading", semantic_result_id: "semantic", status: "READY",
    narrative: { schemaVersion: "reflection-narrative.v2", status: "READY", sections } };
  const transcripts = [{ capture_id: id, text }, { capture_id: "b", text: "Another." }, { capture_id: "c", text: "Third." }];
  assert.ok(readReflectionV2(row, transcripts, "semantic"));
  assert.equal(readReflectionV2(row, transcripts, "other"), null);
  assert.equal(readReflectionV2({ ...row, narrative: { ...row.narrative,
    sections: { ...sections, overview: [{ ...line, sourceSpans: [{ ...span, quote: "invented" }] }] } } }, transcripts, "semantic"), null);
});

test("owner route serves a saved v2 reading and never exposes another user's scan", async () => {
  const scanId = "11111111-1111-4111-8111-111111111111", captureId = "22222222-2222-4222-8222-222222222222";
  const phrase = "I want to plan with my sister.";
  const line = { text: "You want to make plans with your sister.", sourceSpans: [
    { captureId, start: 0, end: Array.from(phrase).length, quote: phrase }] };
  const oldFetch = globalThis.fetch, oldUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const oldKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://db.example";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public";
  const calls: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = String(input); calls.push(url);
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer owner");
    if (url.includes("/auth/v1/user")) return Response.json({ id: "user" });
    if (url.includes("scan_sessions?")) return Response.json([{ id: scanId, lifecycle_state: "finalized" }]);
    if (url.includes("semantic_result_records?")) return Response.json([
      { id: "semantic", scan_id: scanId, measurement_record_id: "m", evidence_ledger_id: "e" }]);
    if (url.includes("measurement_records?")) return Response.json([{ id: "m", scan_id: scanId }]);
    if (url.includes("evidence_ledgers?")) return Response.json([{ id: "e", scan_id: scanId }]);
    if (url.includes("reflection_results_v2?")) return Response.json([{ id: "reading", semantic_result_id: "semantic", status: "READY",
      narrative: { schemaVersion: "reflection-narrative.v2", status: "READY", sections: {
        overview: [line], cognition: [], relationships: [], expression: [], question: [] } } }]);
    if (url.includes("capture_transcripts?")) return Response.json([
      { capture_id: captureId, text: phrase }, { capture_id: "b", text: "Second." }, { capture_id: "c", text: "Third." }]);
    throw new Error("Unexpected request");
  };
  try {
    const denied = await GET(new Request("https://app.example"), { params: Promise.resolve({ id: scanId }) });
    assert.equal(denied.status, 401); assert.equal(calls.length, 0);
    const served = await GET(new Request("https://app.example", { headers: { Authorization: "Bearer owner" } }),
      { params: Promise.resolve({ id: scanId }) });
    assert.equal(served.status, 200);
    assert.equal(served.headers.get("Cache-Control"), "private, no-store");
    const body = await served.json();
    assert.equal(body.kind, "TRANSCRIPT_REFLECTION_V2");
    assert.equal(body.sections.overview[0].text, line.text);
    assert.equal(calls.length, 7);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = oldUrl;
    if (oldKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = oldKey;
  }
});
