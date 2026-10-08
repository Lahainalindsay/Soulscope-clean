import { test } from "node:test";
import assert from "node:assert/strict";
import { processUpload, ProcessingError } from "../lib/server-processing";
import { encodeWav } from "../lib/audio";
const scan = "11111111-1111-4111-8111-111111111111",
  user = "22222222-2222-4222-8222-222222222222";
const mids = [
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
  "55555555-5555-4555-8555-555555555555",
  "99999999-9999-4999-8999-999999999999",
];
const captures = [
  "66666666-6666-4666-8666-666666666666",
  "77777777-7777-4777-8777-777777777777",
  "88888888-8888-4888-8888-888888888888",
];
const keys = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];
const config = {
  supabaseUrl: "https://db.example",
  publicKey: "public-test-key",
  workerUrl: "https://worker.example",
  workerToken: "server-only-token",
};
function request({
  auth = true,
  mismatch = false,
  missing = false,
  badWav = false,
} = {}) {
  const form = new FormData();
  form.set("scan_id", scan);
  for (let i = 1; i <= 3; i++) {
    form.set(
      `p${i}_capture_id`,
      mismatch && i === 2 ? mids[0] : captures[i - 1],
    );
    if (!missing || i !== 3)
      form.set(
        `p${i}_audio`,
        new Blob(
          [
            badWav
              ? new ArrayBuffer(60)
              : encodeWav(new Float32Array(80000), 16000),
          ],
          { type: "audio/wav" },
        ),
        "prompt.wav",
      );
  }
  return new Request("https://site.example/api/process", {
    method: "POST",
    headers: auth ? { Authorization: "Bearer owner-token" } : {},
    body: form,
  });
}
function mock({ owner = true, auth = true, cached = 0, fail = false } = {}) {
  const calls: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push(url);
    const json = (body: unknown, status = 200) =>
      Response.json(body, { status });
    if (url.includes("/auth/"))
      return auth ? json({ id: user }) : json({}, 401);
    if (url.includes("scan_sessions?")) {
      assert.ok(url.includes(`user_id=eq.${user}`));
      return json(owner ? [{ id: scan, lifecycle_state: "queued" }] : []);
    }
    if (url.includes("scan_prompt_captures?"))
      return json(
        captures.map((id, i) => ({
          id,
          prompt_order: i + 1,
          capture_status: "uploaded",
          prompt_definitions: { canonical_key: keys[i] },
        })),
      );
    if (url.includes("/rest/")) {
      const n = url.includes("measurement_records?")
        ? 0
        : url.includes("evidence_ledgers?")
          ? 1
          : url.includes("dimension_results?") ? 2 : 3;
      return json(cached > n ? [{ id: mids[n], ...(n === 3 ? { status: "unresolved_abstained" } : {}) }] : []);
    }
    assert.equal(
      (init?.headers as Record<string, string>)["x-worker-token"],
      "server-only-token",
    );
    assert.ok(!(init?.headers as Record<string, string>)["Authorization"]);
    if (fail) return json({ detail: "secret database error" }, 500);
    if (url.endsWith("process-scan"))
      return json({ measurement_record_id: mids[0] });
    if (url.endsWith("process-evidence")) {
      assert.equal(
        (init?.body as FormData).get("measurement_record_id"),
        mids[0],
      );
      return json({ evidence_ledger_id: mids[1] });
    }
    if (url.endsWith("process-result")) {
      assert.equal((init?.body as FormData).get("dimension_result_id"), mids[2]);
      return json({ semantic_result_id: mids[3], status: "unresolved_abstained" });
    }
    assert.equal((init?.body as FormData).get("evidence_ledger_id"), mids[1]);
    return json({ dimension_result_id: mids[2] });
  };
  return { fetcher, calls };
}
test("unauthenticated and expired-session requests never call the worker", async () => {
  const m = mock();
  await assert.rejects(
    () => processUpload(request({ auth: false }), config, m.fetcher),
    (e: unknown) => e instanceof ProcessingError && e.status === 401,
  );
  assert.equal(m.calls.length, 0);
  const expired = mock({ auth: false });
  await assert.rejects(() => processUpload(request(), config, expired.fetcher));
  assert.equal(expired.calls.length, 1);
});
test("another account cannot trigger privileged processing", async () => {
  const m = mock({ owner: false });
  await assert.rejects(
    () => processUpload(request(), config, m.fetcher),
    (e: unknown) => e instanceof ProcessingError && e.status === 403,
  );
  assert.ok(!m.calls.some((s) => s.includes("worker.example")));
});
test("capture mismatch, missing recordings and malformed WAVs are rejected before worker access", async () => {
  for (const input of [
    { mismatch: true },
    { missing: true },
    { badWav: true },
  ]) {
    const m = mock();
    await assert.rejects(() =>
      processUpload(request(input), config, m.fetcher),
    );
    assert.ok(!m.calls.some((s) => s.includes("worker.example")));
  }
});
test("runs measurement, evidence, dimensions and finalization in order using server-returned IDs", async () => {
  const m = mock();
  const result = await processUpload(request(), config, m.fetcher);
  assert.equal(result.status, "unresolved_abstained");
  assert.equal(result.dimension_result_id, mids[2]);
  assert.equal(result.semantic_result_id, mids[3]);
  assert.deepEqual(
    m.calls
      .filter((s) => s.includes("worker.example"))
      .map((s) => s.split("/").at(-1)),
    ["process-scan", "process-evidence", "process-dimensions", "process-result"],
  );
});
test("retry resumes from saved measurement and evidence instead of reprocessing audio", async () => {
  const m = mock({ cached: 2 });
  await processUpload(request(), config, m.fetcher);
  assert.deepEqual(
    m.calls
      .filter((s) => s.includes("worker.example"))
      .map((s) => s.split("/").at(-1)),
    ["process-dimensions", "process-result"],
  );
});
test("fully saved stages are idempotent and worker failure details are not exposed", async () => {
  const m = mock({ cached: 4 });
  await processUpload(request(), config, m.fetcher);
  assert.ok(!m.calls.some((s) => s.includes("worker.example")));
  const failed = mock({ fail: true });
  await assert.rejects(
    () => processUpload(request(), config, failed.fetcher),
    (e: unknown) =>
      e instanceof ProcessingError &&
      e.status === 502 &&
      !e.message.includes("secret"),
  );
});

test("saved dimensions still complete the final semantic step", async () => {
  const m = mock({ cached: 3 });
  await processUpload(request(), config, m.fetcher);
  assert.deepEqual(m.calls.filter(s => s.includes("worker.example")).map(s => s.split("/").at(-1)), ["process-result"]);
});
