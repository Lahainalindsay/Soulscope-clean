import { validateCanonicalWav } from "./audio";
export class ProcessingError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export type ServerConfig = {
  supabaseUrl: string;
  publicKey: string;
  workerUrl: string;
  workerToken: string;
};
export async function processUpload(
  request: Request,
  config: ServerConfig,
  fetcher: typeof fetch = fetch,
) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length < 12)
    throw new ProcessingError("Please sign in before sending a scan.", 401);
  const userHeaders = {
    apikey: config.publicKey,
    Authorization: authorization,
  };
  const read = async (path: string) => {
    const res = await fetcher(`${config.supabaseUrl}${path}`, {
      headers: userHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok)
      throw new ProcessingError(
        res.status === 401
          ? "Please sign in again."
          : "Your scan could not be verified.",
        res.status === 401 ? 401 : 403,
      );
    return res.json();
  };
  const user = await read("/auth/v1/user");
  if (!user.id) throw new ProcessingError("Please sign in again.", 401);
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 10_000_000)
    throw new ProcessingError("The recording upload is too large.", 413);
  if (!request.body) throw new ProcessingError("Recordings are required.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    total += part.value.byteLength;
    if (total > 10_000_000) {
      await reader.cancel();
      throw new ProcessingError("The recording upload is too large.", 413);
    }
    chunks.push(part.value);
  }
  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }
  const form = await new Request(request.url, {
    method: "POST",
    headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    body: buffer,
  }).formData();
  const id = form.get("scan_id");
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (typeof id !== "string" || !uuid.test(id))
    throw new ProcessingError("Invalid scan.");
  const scans = await read(
    `/rest/v1/scan_sessions?id=eq.${id}&user_id=eq.${user.id}&select=id,lifecycle_state`,
  );
  if (scans.length !== 1)
    throw new ProcessingError(
      "This scan is unavailable or does not belong to your account.",
      403,
    );
  if (!["queued", "extracting"].includes(scans[0].lifecycle_state))
    throw new ProcessingError("This scan is not ready for processing.", 409);
  const captures = await read(
    `/rest/v1/scan_prompt_captures?scan_id=eq.${id}&select=id,prompt_order,capture_status,prompt_definitions(canonical_key)&order=prompt_order.asc`,
  );
  const keys = [
    "P1_OPEN_REFERENCE",
    "P2_TROUBLING_CONTEXT",
    "P3_FUTURE_CONTEXT",
  ];
  if (
    captures.length !== 3 ||
    captures.some(
      (
        c: {
          id: string;
          prompt_order: number;
          capture_status: string;
          prompt_definitions: { canonical_key: string };
        },
        i: number,
      ) =>
        c.prompt_order !== i + 1 ||
        c.id !== form.get(`p${i + 1}_capture_id`) ||
        !["uploaded", "processed"].includes(c.capture_status) ||
        c.prompt_definitions?.canonical_key !== keys[i],
    )
  )
    throw new ProcessingError(
      "The three recordings do not match this scan.",
      403,
    );
  const workerForm = new FormData();
  workerForm.set("scan_id", id);
  for (let i = 1; i <= 3; i++) {
    const file = form.get(`p${i}_audio`);
    if (!(file instanceof Blob))
      throw new ProcessingError("All three recordings are required.");
    try {
      validateCanonicalWav(await file.arrayBuffer());
    } catch (error) {
      throw new ProcessingError(
        error instanceof Error ? error.message : "Invalid recording.",
        422,
      );
    }
    workerForm.set(`p${i}_capture_id`, String(form.get(`p${i}_capture_id`)));
    workerForm.set(`p${i}_audio`, file, `prompt-${i}.wav`);
  }
  const invoke = async (path: string, body: FormData) => {
    const res = await fetcher(`${config.workerUrl.replace(/\/$/, "")}${path}`, {
      method: "POST",
      headers: { "x-worker-token": config.workerToken },
      body,
      signal: AbortSignal.timeout(180000),
    });
    if (!res.ok)
      throw new ProcessingError(
        "Processing could not finish. Retry on this page to resume, or view any saved measurements in your history.",
        502,
      );
    return res.json();
  };
  const latest = async (table: string, column: string, value: string) => {
    const rows = await read(
      `/rest/v1/${table}?${column}=eq.${value}&select=id&order=created_at.desc&limit=1`,
    );
    return rows[0]?.id as string | undefined;
  };
  let measurementId = await latest("measurement_records", "scan_id", id);
  if (!measurementId) {
    const result = await invoke("/internal/process-scan", workerForm);
    measurementId = result.measurement_record_id;
  }
  if (!measurementId || !uuid.test(measurementId))
    throw new ProcessingError(
      "Measurements were not saved. Please retry.",
      502,
    );
  let evidenceId = await latest(
    "evidence_ledgers",
    "measurement_record_id",
    measurementId,
  );
  if (!evidenceId) {
    const f = new FormData();
    f.set("measurement_record_id", measurementId);
    evidenceId = (await invoke("/internal/process-evidence", f))
      .evidence_ledger_id;
  }
  if (!evidenceId || !uuid.test(evidenceId))
    throw new ProcessingError(
      "The evidence record was not saved. Please retry.",
      502,
    );
  let dimensionId = await latest(
    "dimension_results",
    "evidence_ledger_id",
    evidenceId,
  );
  if (!dimensionId) {
    const f = new FormData();
    f.set("evidence_ledger_id", evidenceId);
    dimensionId = (await invoke("/internal/process-dimensions", f))
      .dimension_result_id;
  }
  if (!dimensionId || !uuid.test(dimensionId))
    throw new ProcessingError(
      "The dimension record was not saved. Please retry.",
      502,
    );
  const completedRows = await read(
    `/rest/v1/semantic_result_records?dimension_result_id=eq.${dimensionId}&select=id,status&order=created_at.desc&limit=1`,
  );
  let semanticId = completedRows[0]?.id as string | undefined;
  let semanticStatus = completedRows[0]?.status as string | undefined;
  if (!semanticId) {
    const f = new FormData();
    f.set("dimension_result_id", dimensionId);
    const completed = await invoke("/internal/process-result", f);
    semanticId = completed.semantic_result_id;
    semanticStatus = completed.status;
  }
  if (!semanticId || !uuid.test(semanticId) || !["unresolved_abstained", "invalid"].includes(semanticStatus ?? ""))
    throw new ProcessingError("The completed result was not saved. Please retry.", 502);
  return {
    scan_id: id,
    semantic_result_id: semanticId,
    measurement_record_id: measurementId,
    evidence_ledger_id: evidenceId,
    dimension_result_id: dimensionId,
    status: semanticStatus,
  };
}
