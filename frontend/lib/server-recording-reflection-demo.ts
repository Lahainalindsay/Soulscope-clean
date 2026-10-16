import { buildRecordingReflection } from "./server-recording-reflection";
import { freezeJson } from "./reflection-narrative";

/** Synthetic source records, never user data. Server-only sample of the actual
 * descriptive path; the illustrative feeling is explicitly supplied by the fictional speaker.
 */
const ids = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];
const worker = "soulscope-measurement-worker-0.3.0";
const measurement = {
  id: "demo-recording-measurement", scan_id: "demo-recording", protocol_version: "1.3", extractor_version: worker,
  measurement_status: "qualified", quality_summary: { warnings: [], rejectionReasons: [] },
  prompt_measurements: ids.map((promptId, i) => {
    const captureId = `demo-capture-${i}`, pause = [1000, 6000, 3000][i];
    const feature = (name: string, value: number, unit: string, method: string) => ({
      feature_id: `PROVISIONAL_FRAME_${name}`, feature_version: "1.0.0", value, unit, method,
      feature_registry_version: "PROVISIONAL_NON_CANONICAL", implementation_status: "PROVISIONAL_NON_CANONICAL",
      quality: "research_only", rejection_reason: null, source_capture_id: captureId, capture_kind: promptId,
      extractor_version: worker, segment_start_ms: 0, segment_end_ms: 30000,
      parameters: { profileVersion: "acoustic-profile.v1", semanticUse: false, nativeMethods: { praat: "0.4.6" },
        support: { frameCount: 3000, validFrameCount: 1000 } },
    });
    return { promptId, captureId, durationMs: 30000,
      measurements: [feature("SPEECH_DURATION", 25000 - pause, "ms", "webrtcvad_2.0.14_mode2"),
        feature("F0_P20", 100, "Hz", "praat_autocorrelation"), feature("F0_P80", [120, 150, 130][i], "Hz", "praat_autocorrelation")],
      acousticProfile: { version: "acoustic-profile.v1", nativeMethods: { vad: "webrtcvad-2.0.14-mode2-no-energy-fallback" },
        segments: [
          { kind: "leading_silence", start_ms: 0, end_ms: 1000 },
          { kind: "speech", start_ms: 1000, end_ms: 8000 },
          { kind: "internal_pause", start_ms: 8000, end_ms: 8000 + pause },
          { kind: "speech", start_ms: 8000 + pause, end_ms: 26000 },
          { kind: "trailing_silence", start_ms: 26000, end_ms: 30000 },
        ] },
    };
  }),
};
const evidence = { id: "demo-recording-evidence", scan_id: "demo-recording", measurement_record_id: measurement.id, status: "complete" };
const semantic = { id: "demo-recording-result", scan_id: "demo-recording", measurement_record_id: measurement.id,
  evidence_ledger_id: evidence.id, status: "unresolved_abstained" };

export const DEMO_RECORDING_REFLECTION = freezeJson({
  kind: "ILLUSTRATIVE_RECORDING_DEMO" as const,
  reflection: buildRecordingReflection(semantic, measurement, evidence, "uneasy"),
});
