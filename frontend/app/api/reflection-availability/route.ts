export const runtime = "nodejs";
export async function GET() {
  const base = process.env.SOULSCOPE_BACKEND_URL;
  const token = process.env.SOULSCOPE_WORKER_INTERNAL_TOKEN;
  if (!base || !token) return Response.json({ available: false }, { headers: { "Cache-Control": "no-store" } });
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/internal/reflection-availability`, {
      headers: { "x-worker-token": token }, cache: "no-store", signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error("not ready");
    const body = await res.json();
    return Response.json({ available: body.available === true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ available: false }, { headers: { "Cache-Control": "no-store" } });
  }
}
