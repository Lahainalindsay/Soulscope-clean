export function workerHeaders(token: string) {
  const headers: Record<string, string> = { "x-worker-token": token };
  const bypass = process.env.SOULSCOPE_VERCEL_WORKER_BYPASS_SECRET;
  if (bypass) headers["x-vercel-protection-bypass"] = bypass;
  return headers;
}
