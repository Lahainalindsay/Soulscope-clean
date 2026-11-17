import { workerHeaders } from "../../../lib/worker-headers";
export const runtime = "nodejs";
export async function GET() {
  const base = process.env.SOULSCOPE_BACKEND_URL;
  const token = process.env.SOULSCOPE_WORKER_INTERNAL_TOKEN;
  if (!base || !token) return Response.json({ available: false }, { headers: { "Cache-Control": "no-store" } });
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/internal/reflection-availability`, {
      headers: workerHeaders(token), cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.warn("Reflection worker availability check failed", { status: res.status });
      return Response.json({ available: false }, { headers: { "Cache-Control": "no-store" } });
    }
    const body = await res.json();
    return Response.json({ available: body.available === true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.warn("Reflection worker availability check failed", {
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return Response.json({ available: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
