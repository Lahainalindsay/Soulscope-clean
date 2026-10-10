import { loadAuthorizedSummary } from "@/lib/server-result-summary";
import { ProcessingError } from "@/lib/server-processing";
export const runtime = "nodejs";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const headers = { "Cache-Control": "private, no-store", "Vary": "Authorization" };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !publicKey) return Response.json({ error: "Account access is unavailable." }, { status: 503, headers });
  try {
    return Response.json(await loadAuthorizedSummary(request, (await params).id, { supabaseUrl, publicKey }), { headers });
  } catch (error) {
    return Response.json({ error: error instanceof ProcessingError ? error.message : "Your summary could not be loaded. Please try again." }, { status: error instanceof ProcessingError ? error.status : 502, headers });
  }
}
