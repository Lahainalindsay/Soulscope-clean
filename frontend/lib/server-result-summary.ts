import type { RecordingSummaryV1 } from "./recording-summary";
import { ProcessingError } from "./server-processing";

type Row = Record<string, unknown>;
const object = (v: unknown): v is Row => !!v && typeof v === "object" && !Array.isArray(v);
const prompts = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];
const names = ["first", "second", "third"];

/** Canon v2.0 §§02,07,12: raw bounded description only. No Dimension/state inputs. */
export function describeRecording(semantic: Row, measurement: Row, evidence: Row): RecordingSummaryV1 {
  const sourceResultId = String(semantic.id), scanId = String(semantic.scan_id);
  if (measurement.scan_id !== scanId || evidence.scan_id !== scanId
    || semantic.measurement_record_id !== measurement.id || semantic.evidence_ledger_id !== evidence.id
    || evidence.measurement_record_id !== measurement.id) throw new ProcessingError("The saved result sources do not match.", 409);
  const base = {
    schemaVersion: "recording-summary.v1" as const, ruleVersion: "quiet-audio-description.v1" as const,
    sourceResultId, scanId,
    energy: { status: "UNAVAILABLE" as const, explanation: "A reliable voice-energy reading is not available for this recording." },
  };
  const unavailable = (reason: string): RecordingSummaryV1 => ({ ...base, status: "UNAVAILABLE",
    strongestObservation: "Your recordings are saved.",
    overview: ["There is not enough supported recording detail to describe this moment yet."],
    questionToSitWith: null, alternatives: [], evidenceRefs: [],
    decision: { kind: "RAW_RECORDING_DESCRIPTION", psychologicalInference: false, reason },
  });
  if (!["resolved", "unresolved_abstained"].includes(String(semantic.status)) || measurement.measurement_status !== "qualified"
    || measurement.extractor_version !== "soulscope-measurement-worker-0.2.0"
    || measurement.protocol_version !== "1.3" || evidence.status !== "complete") return unavailable("SOURCE_NOT_QUALIFIED_OR_COMPATIBLE");
  const quality = measurement.quality_summary;
  if (!object(quality) || !Array.isArray(quality.rejectionReasons) || quality.rejectionReasons.length
    || !Array.isArray(quality.warnings) || quality.warnings.length) return unavailable("RECORDING_QUALITY_LIMIT");
  const records = measurement.prompt_measurements, entries = semantic.evidence_ledger;
  if (!Array.isArray(records) || records.length !== 3 || !Array.isArray(entries)) return unavailable("INCOMPLETE_SOURCE");
  const selected = prompts.map(prompt => {
    const record = records.find((p: unknown) => object(p) && p.promptId === prompt);
    if (!object(record) || typeof record.captureId !== "string" || !Array.isArray(record.measurements)) return null;
    const feature = record.measurements.find((f: unknown) => object(f) && f.feature_id === "SS_PAUSE_LOAD");
    const entry = entries.find((e: unknown) => object(e) && e.marker_id === "EV_TIM_008" && e.status === "RESOLVED" && e.evidence_status === "supported"
      && Array.isArray(e.prompt_scope) && e.prompt_scope.length === 1 && e.prompt_scope[0] === prompt
      && Array.isArray(e.supporting_components) && e.supporting_components.includes("SS_PAUSE_LOAD")
      && Array.isArray(e.source_measurement_ids) && e.source_measurement_ids.length > 0
      && Array.isArray(e.confound_flags) && e.confound_flags.length === 0
      && object(e.provenance) && e.provenance.measurement_record_id === measurement.id
      && e.provenance.source_capture_id === record.captureId);
    if (!object(feature) || !object(entry) || typeof entry.evidence_id !== "string"
      || feature.source_capture_id !== record.captureId || feature.capture_kind !== prompt
      || feature.quality !== "descriptive" || feature.rejection_reason != null || feature.unit !== "ratio"
      || feature.method !== "energy_vad_silence_ratio"
      || feature.implementation_status !== "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER"
      || typeof feature.value !== "number" || !Number.isFinite(feature.value) || feature.value < 0 || feature.value > 1) return null;
    return { value: feature.value, evidenceId: entry.evidence_id };
  });
  if (selected.some(p => !p)) return unavailable("QUALIFIED_TIMING_EVIDENCE_UNAVAILABLE");
  const values = selected.map(p => p!.value), max = Math.max(...values), min = Math.min(...values);
  const top = values.flatMap((value, i) => value === max ? [names[i]] : []);
  const observation = max === min
    ? "The same proportion of quieter audio was detected in all three responses."
    : top.length === 1
      ? `The ${top[0]} response contained the largest share of quieter audio in this recording.`
      : `The ${top.join(" and ")} responses shared the largest proportion of quieter audio in this recording.`;
  return { ...base, status: "AVAILABLE", strongestObservation: observation,
    overview: [
      values[2] > values[0] ? "The third response contained more quiet audio than the first."
        : values[2] < values[0] ? "The third response contained less quiet audio than the first."
          : "The first and third responses had the same detected proportion of quieter audio.",
      "These observations describe sound levels in this recording, rather than assigning an emotion or a personal trait.",
      "A quieter stretch can include a natural pause, softer speech, or a change in microphone distance.",
    ],
    questionToSitWith: "What did you notice as you moved from one response to the next?",
    alternatives: ["Microphone position and background sound can affect which stretches seem quieter.",
      "This recording alone cannot explain why your speaking pattern changed."],
    evidenceRefs: selected.map(p => p!.evidenceId),
    decision: { kind: "RAW_RECORDING_DESCRIPTION", psychologicalInference: false, reason: "THREE_QUALIFIED_TIMING_RECORDS;PROVISIONAL_AUDIO_ACTIVITY_PROXY;NO_STATE_OR_PERSONAL_MEANING_SELECTED" },
  };
}

export async function loadAuthorizedSummary(request: Request, scanId: string, config: { supabaseUrl: string; publicKey: string }, fetcher: typeof fetch = fetch) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scanId)) throw new ProcessingError("Invalid scan.");
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new ProcessingError("Please sign in to view your result.", 401);
  const read = async (path: string) => {
    const response = await fetcher(`${config.supabaseUrl}${path}`, { headers: { apikey: config.publicKey, Authorization: authorization }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new ProcessingError("Your result could not be opened.", response.status === 401 ? 401 : 502);
    return response.json();
  };
  const user = await read("/auth/v1/user");
  if (typeof user.id !== "string") throw new ProcessingError("Please sign in again.", 401);
  const scans = await read(`/rest/v1/scan_sessions?id=eq.${scanId}&user_id=eq.${encodeURIComponent(user.id)}&select=id,lifecycle_state`);
  if (scans.length !== 1) throw new ProcessingError("This scan is unavailable.", 404);
  if (scans[0].lifecycle_state !== "finalized") throw new ProcessingError("This scan is still processing.", 409);
  const results = await read(`/rest/v1/semantic_result_records?scan_id=eq.${scanId}&select=*&order=created_at.desc&limit=1`);
  const result = results[0];
  if (!object(result) || typeof result.measurement_record_id !== "string" || typeof result.evidence_ledger_id !== "string") throw new ProcessingError("The completed result is unavailable.", 409);
  const [measurements, ledgers] = await Promise.all([
    read(`/rest/v1/measurement_records?id=eq.${encodeURIComponent(result.measurement_record_id)}&scan_id=eq.${scanId}&select=*`),
    read(`/rest/v1/evidence_ledgers?id=eq.${encodeURIComponent(result.evidence_ledger_id)}&scan_id=eq.${scanId}&select=*`),
  ]);
  if (!object(measurements[0]) || !object(ledgers[0])) throw new ProcessingError("The saved result sources are unavailable.", 409);
  return describeRecording(result, measurements[0], ledgers[0]);
}
