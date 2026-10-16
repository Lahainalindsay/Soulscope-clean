import { loadAuthorizedRecordingSources } from "@/lib/server-result-summary";
import { buildRecordingReflection } from "@/lib/server-recording-reflection";
import { readRecordingReflection } from "@/lib/recording-reflection";
import { ProcessingError } from "@/lib/server-processing";

export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publicKey) return Response.json({ error: "Account access is unavailable." }, { status: 503, headers });
  try {
    const sources = await loadAuthorizedRecordingSources(request, (await params).id, { supabaseUrl, publicKey });
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
