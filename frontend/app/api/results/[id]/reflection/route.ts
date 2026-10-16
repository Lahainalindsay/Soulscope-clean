import { loadAuthorizedRecordingSources } from "@/lib/server-result-summary";
import { buildRecordingReflection } from "@/lib/server-recording-reflection";
import { readRecordingReflection } from "@/lib/recording-reflection";
import { ProcessingError } from "@/lib/server-processing";
import { readReflectionV2 } from "@/lib/reflection-v2";

export const runtime = "nodejs";
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
    const rows = await privateRows(`reflection_results_v2?scan_id=eq.${encodeURIComponent(scanId)}&select=id,semantic_result_id,status,narrative&limit=1`);
    if (rows.length) {
      const transcriptRows = await privateRows(`capture_transcripts?scan_id=eq.${encodeURIComponent(scanId)}&select=capture_id,text`);
      const reading = readReflectionV2(rows[0], transcriptRows, String(sources.semantic.id));
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
