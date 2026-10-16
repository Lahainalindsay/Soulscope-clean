import { loadAuthorizedRecordingSources } from "@/lib/server-result-summary";
import { buildRecordingReflection } from "@/lib/server-recording-reflection";
import { readRecordingReflection } from "@/lib/recording-reflection";
import { ProcessingError } from "@/lib/server-processing";
import { readReflectionV2 } from "@/lib/reflection-v2";

export const runtime = "nodejs";
export const maxDuration = 300;
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publicKey) return Response.json({ error: "Account access is unavailable." }, { status: 503, headers });
  try {
    const sources = await loadAuthorizedRecordingSources(request, (await params).id, { supabaseUrl, publicKey });
    const token = request.headers.get("authorization");
    const privateRows = async (path: string): Promise<unknown[]> => {
      const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        headers: { apikey: publicKey, Authorization: token ?? "" }, cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new ProcessingError("Your reading could not be opened.", 502);
      return await response.json();
    };
    const scanId = String(sources.semantic.scan_id);
    const rows = await privateRows(`reflection_results_v2?scan_id=eq.${encodeURIComponent(scanId)}&select=id,scan_id,semantic_result_id,status,narrative&limit=1`);
    if (rows.length) {
      const transcriptRows = await privateRows(`capture_transcripts?scan_id=eq.${encodeURIComponent(scanId)}&select=capture_id,text`);
      const row = rows[0] as { narrative?: { mode?: string } };
      const voiceRows = row.narrative?.mode === "VOICE_AND_WORDS"
        ? await privateRows(`voice_observation_records?scan_id=eq.${encodeURIComponent(scanId)}&select=id,scan_id,observations,source_artifacts&limit=1`) : [];
      const reading = readReflectionV2(rows[0], transcriptRows, String(sources.semantic.id), voiceRows[0]);
      if (reading) return Response.json(reading, { headers });
    }
    const projection = buildRecordingReflection(sources.semantic, sources.measurement, sources.evidence);
    const validated = readRecordingReflection(projection, {
      resultId: String(sources.semantic.id), scanId: String(sources.semantic.scan_id),
      measurementId: String(sources.measurement.id), evidenceLedgerId: String(sources.evidence.id),
    });
    if (!validated) throw new ProcessingError("Your recording reflection could not be prepared.", 502);
    return Response.json(validated, { headers });
  } catch (error) {
    return Response.json({ error: error instanceof ProcessingError ? error.message : "Your recording reflection could not be opened. Please try again." },
      { status: error instanceof ProcessingError ? error.status : 502, headers });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const backend = process.env.SOULSCOPE_BACKEND_URL;
  const workerToken = process.env.SOULSCOPE_WORKER_INTERNAL_TOKEN;
  if (!supabaseUrl || !publicKey || !backend || !workerToken)
    return Response.json({ error: "The reading service is unavailable." }, { status: 503, headers });
  try {
    const { id } = await params;
    const sources = await loadAuthorizedRecordingSources(request, id, { supabaseUrl, publicKey });
    const authorization = request.headers.get("authorization") ?? "";
    const res = await fetch(`${supabaseUrl}/rest/v1/scan_sessions?id=eq.${encodeURIComponent(id)}&select=transcription_consent,transcription_consent_version`, {
      headers: { apikey: publicKey, Authorization: authorization }, cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new ProcessingError("Your consent could not be verified.", 502);
    const scans = await res.json();
    if (scans.length !== 1 || scans[0].transcription_consent !== true
      || scans[0].transcription_consent_version !== "transcript-reflection-v1")
      throw new ProcessingError("This scan did not opt in to a transcript reading.", 403);
    let body: { voiceConsent?: boolean } = {};
    try { body = await request.json(); } catch { /* A retry can use previously saved consent. */ }
    if (body?.voiceConsent === true) {
      const consent = await fetch(`${supabaseUrl}/rest/v1/voice_reflection_consents?on_conflict=scan_id`, {
        method: "POST", headers: { apikey: publicKey, Authorization: authorization,
          "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" },
        body: JSON.stringify({ scan_id: id, user_id: sources.userId, version: "voice-reflection-v1" }),
        signal: AbortSignal.timeout(15000),
      });
      if (!consent.ok) throw new ProcessingError("Your voice-analysis consent could not be saved.", 502);
    }
    const form = new FormData();
    form.set("scan_id", id);
    form.set("semantic_result_id", String(sources.semantic.id));
    const response = await fetch(`${backend.replace(/\/$/, "")}/internal/process-reflection`, {
      method: "POST", headers: { "x-worker-token": workerToken }, body: form,
      cache: "no-store", signal: AbortSignal.timeout(270000),
    });
    if (!response.ok) throw new ProcessingError("The reading could not be prepared. Please try again.", 502);
    const result = await response.json();
    if (result.status === "READY") return Response.json({ status: "READY" }, { headers });
    if (result.status === "UNRESOLVED")
      return Response.json({ error: "There was not enough reliable speech to prepare a reading." }, { status: 422, headers });
    if (result.status === "VOICE_CONSENT_REQUIRED")
      return Response.json({ error: "Please agree to direct voice analysis before generating this reading." }, { status: 403, headers });
    if (result.status === "PROVIDER_UNAVAILABLE" || result.status === "TRANSCRIPTION_UNAVAILABLE")
      return Response.json({ error: "The voice-analysis service is temporarily unavailable. Your recordings are saved; please retry." }, { status: 503, headers });
    return Response.json({ error: "The reading could not pass source validation. Please try again." }, { status: 422, headers });
  } catch (error) {
    return Response.json({ error: error instanceof ProcessingError ? error.message : "The reading could not be prepared. Please try again." },
      { status: error instanceof ProcessingError ? error.status : 502, headers });
  }
}
