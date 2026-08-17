export type SoulScopeSession = {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  email?: string;
};

export type PromptDefinition = {
  id: string;
  canonical_key: string;
  prompt_order: number;
};

export type ScanRuntimeState = {
  scanId: string;
  promptDefinitions: PromptDefinition[];
  captures: Record<string, string>;
  audioDataUrls: Record<string, string>;
  processResult?: ProcessScanResult;
};

export type ProcessScanResult = {
  scan_id: string;
  processing_run_id: string;
  measurement_record_id: string;
  semantic_result_id: string;
  measurement_status: string;
  semantic_status: string;
  evidence_ledger_id: string;
  evidence_status: string;
  dimension_result_id: string;
  dimension_status: string;
};

export type DimensionResultRow = {
  id: string;
  status: string;
  status_counts: Record<string, number>;
  dimensions: DimensionDisplay[];
  dimension_scoring_version: string;
  dimension_engine_version: string;
  created_at: string;
};

export type DimensionDisplay = {
  dimensionId: string;
  label: string;
  constellationId: string;
  scientificClass: string;
  resolutionStatus: string;
  resolutionReason: string;
  structuralMappingStatus: string;
  structuralEligible: boolean;
  scoringPermitted: boolean;
  scoringBlockers: string[];
  posteriorMean: number | null;
  confidence: number | null;
};

const SESSION_KEY = "soulscope.session.v1";
const SCAN_KEY = "soulscope.activeScan.v1";

export const PROMPT_IDS = [
  "P1_OPEN_REFERENCE",
  "P2_TROUBLING_CONTEXT",
  "P3_FUTURE_CONTEXT",
] as const;

function supabaseUrl() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  return value.replace(/\/$/, "");
}

function anonKey() {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.");
  return value;
}

export function backendUrl() {
  const value = process.env.NEXT_PUBLIC_SOULSCOPE_BACKEND_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SOULSCOPE_BACKEND_URL is not configured.");
  return value.replace(/\/$/, "");
}

function authHeaders(session?: SoulScopeSession) {
  const key = anonKey();
  return {
    apikey: key,
    authorization: `Bearer ${session?.accessToken ?? key}`,
    "content-type": "application/json",
  };
}

async function requestJson<T>(
  route: string,
  init: RequestInit,
  session?: SoulScopeSession,
): Promise<T> {
  const response = await fetch(`${supabaseUrl()}/${route}`, {
    ...init,
    headers: {
      ...authHeaders(session),
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function signInWithPassword(email: string, password: string): Promise<SoulScopeSession> {
  const payload = await requestJson<{
    access_token: string;
    refresh_token?: string;
    user: { id: string; email?: string };
  }>("auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return persistSession({
    userId: payload.user.id,
    email: payload.user.email,
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  });
}

export async function signUpWithPassword(email: string, password: string): Promise<SoulScopeSession | null> {
  const payload = await requestJson<{
    access_token?: string;
    refresh_token?: string;
    user: { id: string; email?: string } | null;
  }>("auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!payload.access_token || !payload.user) return null;
  return persistSession({
    userId: payload.user.id,
    email: payload.user.email,
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  });
}

export function persistSession(session: SoulScopeSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function currentSession(): SoulScopeSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SoulScopeSession;
  } catch {
    window.localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function saveScanState(state: ScanRuntimeState) {
  window.sessionStorage.setItem(SCAN_KEY, JSON.stringify(state));
}

export function loadScanState(): ScanRuntimeState | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SCAN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ScanRuntimeState;
  } catch {
    window.sessionStorage.removeItem(SCAN_KEY);
    return null;
  }
}

export async function startScan(session: SoulScopeSession): Promise<ScanRuntimeState> {
  const promptSets = await requestJson<Array<{ id: string; version: string }>>(
    "rest/v1/prompt_sets?status=eq.active&select=id,version&limit=1",
    { method: "GET" },
    session,
  );
  if (!promptSets[0]) throw new Error("No active SoulScope prompt set is available.");
  const promptSetId = promptSets[0].id;
  const promptDefinitions = await requestJson<PromptDefinition[]>(
    `rest/v1/prompt_definitions?prompt_set_id=eq.${promptSetId}&select=id,canonical_key,prompt_order&order=prompt_order.asc`,
    { method: "GET" },
    session,
  );
  if (promptDefinitions.map((item) => item.canonical_key).join("|") !== PROMPT_IDS.join("|")) {
    throw new Error("The active prompt set does not match Canon v1.3.");
  }
  const scans = await requestJson<Array<{ id: string }>>(
    "rest/v1/scan_sessions",
    {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify({ user_id: session.userId, prompt_set_id: promptSetId }),
    },
    session,
  );
  const scanId = scans[0]?.id;
  if (!scanId) throw new Error("Scan creation did not return an id.");
  await transitionScan(session, scanId, "capturing");
  const state: ScanRuntimeState = {
    scanId,
    promptDefinitions,
    captures: {},
    audioDataUrls: {},
  };
  saveScanState(state);
  return state;
}

export async function savePromptCapture(
  session: SoulScopeSession,
  state: ScanRuntimeState,
  promptId: string,
  wavDataUrl: string,
  durationMs: number,
) {
  const definition = state.promptDefinitions.find((item) => item.canonical_key === promptId);
  if (!definition) throw new Error(`Missing prompt definition for ${promptId}.`);
  const existingCaptureId = state.captures[promptId];
  if (!existingCaptureId) {
    const captures = await requestJson<Array<{ id: string }>>(
      "rest/v1/scan_prompt_captures",
      {
        method: "POST",
        headers: { prefer: "return=representation" },
        body: JSON.stringify({
          scan_id: state.scanId,
          prompt_definition_id: definition.id,
          prompt_order: definition.prompt_order,
          capture_status: "uploaded",
          duration_ms: durationMs,
          upload_status: "uploaded",
          completed_at: new Date().toISOString(),
        }),
      },
      session,
    );
    state.captures[promptId] = captures[0].id;
  }
  state.audioDataUrls[promptId] = wavDataUrl;
  saveScanState(state);
}

export async function transitionScan(session: SoulScopeSession, scanId: string, nextState: string) {
  await requestJson("rest/v1/rpc/transition_scan_lifecycle", {
    method: "POST",
    body: JSON.stringify({
      requested_scan_id: scanId,
      requested_next_state: nextState,
      transition_details: { source: "frontend" },
    }),
  }, session);
}

export async function processScan(session: SoulScopeSession, state: ScanRuntimeState) {
  for (const promptId of PROMPT_IDS) {
    if (!state.captures[promptId] || !state.audioDataUrls[promptId]) {
      throw new Error(`Prompt ${promptId} is missing recorded audio.`);
    }
  }
  await transitionScan(session, state.scanId, "capture_complete");
  await transitionScan(session, state.scanId, "queued");

  const form = new FormData();
  form.append("scan_id", state.scanId);
  form.append("p1_capture_id", state.captures.P1_OPEN_REFERENCE);
  form.append("p2_capture_id", state.captures.P2_TROUBLING_CONTEXT);
  form.append("p3_capture_id", state.captures.P3_FUTURE_CONTEXT);
  form.append("p1_audio", dataUrlToBlob(state.audioDataUrls.P1_OPEN_REFERENCE), "P1_OPEN_REFERENCE.wav");
  form.append("p2_audio", dataUrlToBlob(state.audioDataUrls.P2_TROUBLING_CONTEXT), "P2_TROUBLING_CONTEXT.wav");
  form.append("p3_audio", dataUrlToBlob(state.audioDataUrls.P3_FUTURE_CONTEXT), "P3_FUTURE_CONTEXT.wav");

  const response = await fetch(`${backendUrl()}/process-scan`, {
    method: "POST",
    headers: { authorization: `Bearer ${session.accessToken}` },
    body: form,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }
  const result = (await response.json()) as ProcessScanResult;
  state.processResult = result;
  saveScanState(state);
  return result;
}

export async function loadDimensionResult(session: SoulScopeSession, scanId: string) {
  const rows = await requestJson<DimensionResultRow[]>(
    `rest/v1/dimension_results?scan_id=eq.${scanId}&select=id,status,status_counts,dimensions,dimension_scoring_version,dimension_engine_version,created_at&order=created_at.desc&limit=1`,
    { method: "GET" },
    session,
  );
  return rows[0] ?? null;
}

export async function loadMeasurementStatus(session: SoulScopeSession, scanId: string) {
  const rows = await requestJson<Array<{ id: string; measurement_status: string; extractor_version: string }>>(
    `rest/v1/measurement_records?scan_id=eq.${scanId}&select=id,measurement_status,extractor_version&order=created_at.desc&limit=1`,
    { method: "GET" },
    session,
  );
  return rows[0] ?? null;
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "audio/wav";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime });
}
