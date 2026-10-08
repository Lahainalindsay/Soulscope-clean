import { processUpload, ProcessingError } from "@/lib/server-processing";
export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const workerUrl = process.env.SOULSCOPE_BACKEND_URL;
  const workerToken = process.env.SOULSCOPE_WORKER_INTERNAL_TOKEN;
  if (!supabaseUrl || !publicKey || !workerUrl || !workerToken)
    return Response.json(
      {
        error:
          "The scan backend is not connected yet. Explore the design preview in the meantime.",
      },
      { status: 503 },
    );
  try {
    return Response.json(
      await processUpload(request, {
        supabaseUrl,
        publicKey,
        workerUrl,
        workerToken,
      }),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof ProcessingError
            ? error.message
            : "Processing was interrupted. Retry to resume from the saved stage.",
      },
      {
        status: error instanceof ProcessingError ? error.status : 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
