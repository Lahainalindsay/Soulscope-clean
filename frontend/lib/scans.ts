import { getSupabase, accessToken } from "./supabase";
import { PROMPTS } from "./prompts";
import type {
  ResultBundle,
  Scan,
  Measurement,
  Evidence,
  Dimensions,
  SemanticResultRecord,
} from "./contracts";
export async function loadHistory(): Promise<Scan[]> {
  await accessToken();
  const db = getSupabase()!;
  const { data, error } = await db
    .from("scan_sessions")
    .select("id,created_at,lifecycle_state")
    .neq("lifecycle_state", "deleted")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error)
    throw new Error(
      "Your history could not be loaded. Check the account connection and try again.",
    );
  return data ?? [];
}
export async function loadResult(id: string): Promise<ResultBundle> {
  const token = await accessToken();
  const db = getSupabase()!;
  const { data: scan, error } = await db
    .from("scan_sessions")
    .select("id,created_at,lifecycle_state")
    .eq("id", id)
    .neq("lifecycle_state", "deleted")
    .maybeSingle();
  if (error || !scan)
    throw new Error(
      "This scan is unavailable or does not belong to your account.",
    );
  const latest = async (table: string, column: string, value: string) => {
    const { data, error } = await db
      .from(table)
      .select("*")
      .eq(column, value)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error)
      throw new Error("A saved result could not be loaded. Please try again.");
    return data?.[0] ?? null;
  };
  const measurement = (await latest(
    "measurement_records",
    "scan_id",
    id,
  )) as Measurement | null;
  const evidence = measurement
    ? ((await latest(
        "evidence_ledgers",
        "measurement_record_id",
        measurement.id,
      )) as Evidence | null)
    : null;
  const dimensions = evidence
    ? ((await latest(
        "dimension_results",
        "evidence_ledger_id",
        evidence.id,
      )) as Dimensions | null)
    : null;
  const semantic = (measurement
    ? await latest(
        "semantic_result_records",
        "measurement_record_id",
        measurement.id,
      )
    : null) as SemanticResultRecord | null;
  let recordingSummary: unknown = null;
  if (semantic && scan.lifecycle_state === "finalized") {
    const response = await fetch(`/api/results/${encodeURIComponent(id)}/summary`, {
      headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(30000),
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "Your summary could not be loaded. Please try again.");
    recordingSummary = body;
  }
  return { scan, measurement, evidence, dimensions, semantic, recordingSummary };
}
export async function sendScan(
  audio: Blob[],
  existingId: string | null,
  onId: (id: string) => void,
) {
  const token = await accessToken();
  const db = getSupabase()!;
  let id = existingId;
  if (!id) {
    const { data: sets, error } = await db
      .from("prompt_sets")
      .select("id,version,prompt_definitions(*)")
      .eq("status", "active")
      .order("activated_at", { ascending: false });
    if (error) throw new Error("The recording protocol could not be loaded.");
    const set = sets?.find(
      (s) =>
        PROMPTS.every((p) =>
          s.prompt_definitions.some(
            (d: {
              canonical_key: string;
              prompt_order: number;
              prompt_text: string;
              expected_duration_seconds: number;
            }) =>
              d.canonical_key === p.id &&
              d.prompt_order === p.order &&
              d.prompt_text === p.promptText &&
              d.expected_duration_seconds === 30,
          ),
        ) && s.prompt_definitions.length === 3,
    );
    if (!set)
      throw new Error(
        "No compatible recording protocol is active yet. The staging backend needs its canonical three-prompt set activated.",
      );
    const { data: user, error: userError } = await db.auth.getUser();
    if (userError || !user.user) throw new Error("Please sign in again.");
    const { data: scan, error: scanError } = await db
      .from("scan_sessions")
      .insert({ user_id: user.user.id, prompt_set_id: set.id })
      .select("id")
      .single();
    if (scanError) throw new Error("The scan could not be created.");
    id = scan.id;
    onId(id!);
  }
  const { data: scan, error: stateError } = await db
    .from("scan_sessions")
    .select("lifecycle_state,prompt_set_id")
    .eq("id", id)
    .single();
  if (stateError) throw new Error("The scan could not be opened.");
  const transition = async (state: string) => {
    const { error } = await db.rpc("transition_scan_lifecycle", {
      requested_scan_id: id,
      requested_next_state: state,
      transition_details: {
        source: "frontend-v1",
        ...(state === "capturing"
          ? {
              voice_consent: true,
              disclosure_version: "staging-voice-v1",
              raw_audio_deletion_automatic: false,
              derived_records_persist: true,
            }
          : {}),
      },
    });
    if (error) throw new Error("The scan could not advance. Please retry.");
  };
  if (scan.lifecycle_state === "created") await transition("capturing");
  if (["created", "capturing"].includes(scan.lifecycle_state)) {
    const { data: defs, error } = await db
      .from("prompt_definitions")
      .select("id,prompt_order,canonical_key")
      .eq("prompt_set_id", scan.prompt_set_id)
      .order("prompt_order");
    if (error || defs?.length !== 3)
      throw new Error("The prompt set is incomplete.");
    const rows = await Promise.all(
      defs.map(async (d, i) => ({
        scan_id: id,
        prompt_definition_id: d.id,
        prompt_order: d.prompt_order,
        capture_status: "uploaded",
        duration_ms: Math.round(
          ((await audio[i].arrayBuffer()).byteLength - 44) / 32,
        ),
        upload_status: "uploaded",
        completed_at: new Date().toISOString(),
      })),
    );
    const { data: existing, error: existingError } = await db
      .from("scan_prompt_captures")
      .select("id,prompt_order")
      .eq("scan_id", id);
    if (existingError)
      throw new Error("The prompt recordings could not be opened.");
    for (const row of rows) {
      const previous = existing?.find(
        (c) => c.prompt_order === row.prompt_order,
      );
      const { error: writeError } = previous
        ? await db
            .from("scan_prompt_captures")
            .update({
              capture_status: row.capture_status,
              duration_ms: row.duration_ms,
              upload_status: row.upload_status,
              completed_at: row.completed_at,
            })
            .eq("id", previous.id)
        : await db.from("scan_prompt_captures").insert(row);
      if (writeError)
        throw new Error("The prompt recordings could not be registered.");
    }
    await transition("capture_complete");
    await transition("queued");
  } else if (scan.lifecycle_state === "capture_complete")
    await transition("queued");
  const { data: captures, error } = await db
    .from("scan_prompt_captures")
    .select("id,prompt_order")
    .eq("scan_id", id)
    .order("prompt_order");
  if (error || captures?.length !== 3)
    throw new Error("The prompt recordings could not be opened.");
  const form = new FormData();
  form.set("scan_id", id!);
  captures.forEach((c, i) => {
    form.set(`p${i + 1}_capture_id`, c.id);
    form.set(`p${i + 1}_audio`, audio[i], `prompt-${i + 1}.wav`);
  });
  const response = await fetch("/api/process", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(
      body.error ??
        "Processing could not finish. Your recordings are still available on this page.",
    );
  return id!;
}
