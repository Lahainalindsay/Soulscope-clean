import type { ObservationSentence, RecordingObservation, RecordingReflectionV1 } from "./recording-reflection";
import { describeRecording } from "./server-result-summary";
import { ProcessingError } from "./server-processing";

type Row = Record<string, unknown>;
const object = (v: unknown): v is Row => !!v && typeof v === "object" && !Array.isArray(v);
const numeric = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const ids = ["P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT"];
const labels = ["Self statement", "Difficult topic", "Future goal"];
const order = ["first", "second", "third"];
const seconds = (ms: number) => (ms / 1000).toFixed(1);
const sentence = (text: string, refs: readonly string[]): ObservationSentence => ({ text, observationRefs: [...refs] });

/** Engineering description only. No normative, emotional or significance cutoffs.
 * Changes are compared at displayed resolution, never converted into states.
 */
export function buildRecordingReflection(semantic: Row, measurement: Row, evidence: Row): RecordingReflectionV1 {
  if (typeof semantic.id !== "string" || typeof semantic.scan_id !== "string" || typeof measurement.id !== "string"
    || typeof evidence.id !== "string" || measurement.scan_id !== semantic.scan_id || evidence.scan_id !== semantic.scan_id
    || semantic.measurement_record_id !== measurement.id || semantic.evidence_ledger_id !== evidence.id
    || evidence.measurement_record_id !== measurement.id) throw new ProcessingError("The saved result sources do not match.", 409);
  const base = {
    schemaVersion: "recording-reflection.v1" as const, languageVersion: "recording-language.1.0.0" as const,
    canonVersion: "2.0" as const, sourceResultId: semantic.id, scanId: semantic.scan_id,
    sourceMeasurementId: measurement.id, sourceEvidenceLedgerId: evidence.id,
    scope: "RECORDING_OBSERVATION" as const,
  };
  const limited = (reason: string, quality = false): RecordingReflectionV1 => ({
    ...base, status: "LIMITED", title: quality ? "This recording needs a clearer signal." : "This moment is saved.",
    strongestObservation: sentence(quality
      ? "There is not enough reliable audio here for a recording reflection."
      : "A recording reflection is not available from these saved measurements.", []),
    overview: [sentence(quality
      ? "If you choose to try again, keep the microphone in one place and speak naturally in a quieter setting."
      : "Your saved details remain available, including which measurements could be used.", [])],
    prompts: [], invitations: [], questionToSitWith: null, observationLedger: [],
    limits: ["An unavailable measurement does not describe your feelings, ability, or wellbeing."],
    selection: { selected: [], withheld: [reason], psychologicalInference: false },
  });
  const quality = measurement.quality_summary;
  if (!["resolved", "unresolved_abstained"].includes(String(semantic.status)) || measurement.measurement_status !== "qualified"
    || !object(quality) || !Array.isArray(quality.warnings) || quality.warnings.length
    || !Array.isArray(quality.rejectionReasons) || quality.rejectionReasons.length) return limited("RECORDING_QUALITY_LIMIT", true);
  if (measurement.protocol_version !== "1.3" || evidence.status !== "complete"
    || !["soulscope-measurement-worker-0.2.0", "soulscope-measurement-worker-0.3.0"].includes(String(measurement.extractor_version)))
    return limited("INCOMPATIBLE_SOURCE_VERSION");
  const raw = measurement.prompt_measurements;
  if (!Array.isArray(raw) || raw.length !== 3 || !raw.every(object)) return limited("INCOMPLETE_PROTOCOL");
  const records = ids.map(id => raw.find(r => r.promptId === id));
  if (records.some(r => !r || typeof r.captureId !== "string" || !numeric(r.durationMs) || r.durationMs <= 0 || r.durationMs > 30000 || !Array.isArray(r.measurements))
    || new Set(records.map(r => r!.captureId)).size !== 3) return limited("INCOMPLETE_PROTOCOL");
  const rows = records as Row[];
  const ledger: RecordingObservation[] = [];
  const withheld: string[] = [];
  const feature = (r: Row, name: string, unit: string, method: string): Row | null => {
    const values = (r.measurements as unknown[]).filter(f => object(f) && f.feature_id === `PROVISIONAL_FRAME_${name}`);
    const f = values[0];
    if (values.length !== 1 || !object(f) || f.feature_version !== "1.0.0" || f.quality !== "research_only"
      || f.feature_registry_version !== "PROVISIONAL_NON_CANONICAL" || f.implementation_status !== "PROVISIONAL_NON_CANONICAL"
      || !numeric(f.value) || f.rejection_reason != null || f.method !== method || f.unit !== unit
      || f.source_capture_id !== r.captureId || f.capture_kind !== r.promptId
      || f.extractor_version !== measurement.extractor_version || f.segment_start_ms !== 0 || f.segment_end_ms !== r.durationMs
      || !object(f.parameters) || f.parameters.profileVersion !== "acoustic-profile.v1"
      || f.parameters.semanticUse !== false || !object(f.parameters.support)
      || !numeric(f.parameters.support.validFrameCount) || !Number.isInteger(f.parameters.support.validFrameCount)
      || f.parameters.support.validFrameCount < 1 || !numeric(f.parameters.support.frameCount)
      || !Number.isInteger(f.parameters.support.frameCount) || f.parameters.support.frameCount > Math.ceil(Number(r.durationMs) / 10) + 1
      || f.parameters.support.validFrameCount > f.parameters.support.frameCount) return null;
    return f;
  };
  const observation = (r: Row, family: string, features: string[], description: string, method: string) => {
    const id = `${measurement.id}:${r.captureId}:${family}`;
    ledger.push({ id, promptId: String(r.promptId), captureId: String(r.captureId), featureIds: features, description, method });
    return id;
  };
  const timings = measurement.extractor_version === "soulscope-measurement-worker-0.3.0" ? rows.map(r => {
    const f = feature(r, "SPEECH_DURATION", "ms", "webrtcvad_2.0.14_mode2");
    const profile = r.acousticProfile;
    if (!f || !object(profile) || profile.version !== "acoustic-profile.v1" || !object(profile.nativeMethods)
      || profile.nativeMethods.vad !== "webrtcvad-2.0.14-mode2-no-energy-fallback" || !Array.isArray(profile.segments)
      || profile.segments.length < 1 || profile.segments.length > 1000) return null;
    let end = 0, speech = 0, pause = 0, count = 0;
    const segments = profile.segments;
    for (let i = 0; i < segments.length; i++) {
      const s = segments[i];
      if (!object(s) || !numeric(s.start_ms) || !numeric(s.end_ms) || s.start_ms !== end || s.end_ms <= end
        || !Number.isInteger(s.start_ms) || !Number.isInteger(s.end_ms) || s.end_ms > Number(r.durationMs)
        || !["speech", "internal_pause", "leading_silence", "trailing_silence"].includes(String(s.kind))) return null;
      if (s.kind === "speech") speech += s.end_ms - s.start_ms;
      if (s.kind === "internal_pause") {
        if (i === 0 || i === segments.length - 1 || segments[i - 1]?.kind !== "speech" || segments[i + 1]?.kind !== "speech") return null;
        pause += s.end_ms - s.start_ms; count++;
      }
      if ((s.kind === "leading_silence" && i !== 0) || (s.kind === "trailing_silence" && i !== segments.length - 1)) return null;
      end = s.end_ms;
    }
    if (end !== r.durationMs || speech !== f.value || speech <= 0) return null;
    const ref = observation(r, "timing", ["PROVISIONAL_FRAME_SPEECH_DURATION"],
      `${seconds(speech)} seconds of detected speech; ${count} detected internal pauses totaling ${seconds(pause)} seconds.`,
      "webrtcvad-2.0.14-mode2; contiguous actual-duration segment coverage; leading/trailing silence excluded from internal pauses");
    return { speech, pause, count, ref, share: pause / Number(r.durationMs) };
  }) : [];
  const pitch = measurement.extractor_version === "soulscope-measurement-worker-0.3.0" ? rows.map(r => {
    const lo = feature(r, "F0_P20", "Hz", "praat_autocorrelation"), hi = feature(r, "F0_P80", "Hz", "praat_autocorrelation");
    if (!lo || !hi || !numeric(lo.value) || !numeric(hi.value) || lo.value < 60 || hi.value > 500 || hi.value < lo.value
      || !object(lo.parameters) || !object(lo.parameters.nativeMethods) || lo.parameters.nativeMethods.praat !== "0.4.6"
      || !object(hi.parameters) || !object(hi.parameters.nativeMethods) || hi.parameters.nativeMethods.praat !== "0.4.6"
      || !object(lo.parameters.support) || Number(lo.parameters.support.validFrameCount) < 2
      || !object(hi.parameters.support) || hi.parameters.support.validFrameCount !== lo.parameters.support.validFrameCount) return null;
    const span = Math.round(12 * Math.log2(hi.value / lo.value) * 10) / 10;
    const ref = observation(r, "pitch", ["PROVISIONAL_FRAME_F0_P20", "PROVISIONAL_FRAME_F0_P80"],
      `The middle 60% of detected pitch values spanned ${span.toFixed(1)} semitones.`, "praat-0.4.6 autocorrelation; p20–p80 voiced-frame span; not full vocal range");
    return { span, ref };
  }) : [];
  const timingAvailable = timings.length === 3 && timings.every(t => t !== null);
  const pitchAvailable = pitch.length === 3 && pitch.every(p => p !== null);
  if (!timingAvailable) withheld.push("COMPLETE_TIMING_OBSERVATIONS_UNAVAILABLE");
  if (!pitchAvailable) withheld.push("COMPLETE_PITCH_OBSERVATIONS_UNAVAILABLE");
  // Partial families cannot create a cross-prompt story. Preserve their absence.
  const selected = ledger.filter(o => (o.id.endsWith(":timing") && timingAvailable) || (o.id.endsWith(":pitch") && pitchAvailable));
  const selectedRefs = selected.map(o => o.id);
  const invitations = [
    { title: "In a conversation", text: "Before your next reply, notice whether you want a pause or whether the words come straight away." },
    { title: "Between activities", text: "As you move from one task to another, take a moment to notice any change in the way you speak." },
    { title: "With a thought that matters", text: "Say a thought aloud, then notice which part feels easiest to put into words." },
  ];
  const limits = [
    "This reflection describes detected patterns within these three recordings, not an emotion, personality, or personal baseline.",
    "Speech detection and pitch tracking are provisional; background sound, word choice, microphone position, and tracking errors can affect them.",
    "Pitch comparisons use only the voiced frames the tracker followed and may cover different portions of each response.",
  ];
  if (timingAvailable || pitchAvailable) {
    const timingRefs = timings.flatMap(t => t ? [t.ref] : []), pitchRefs = pitch.flatMap(p => p ? [p.ref] : []);
    let focus: number | null = null;
    let strongest: ObservationSentence;
    let title: string;
    const overview: ObservationSentence[] = [];
    if (timingAvailable) {
      const values = timings.map(t => Math.round(t!.share * 1000)); // 0.1 percentage-point display resolution, not significance.
      const max = Math.max(...values), min = Math.min(...values);
      const top = values.flatMap((v, i) => v === max ? [i] : []);
      focus = top.length === 1 && max > min ? top[0] : null;
      title = focus === null ? "The spacing in your responses." : `More space in your ${order[focus]} response.`;
      strongest = sentence(focus !== null
        ? `Your ${order[focus]} response had the largest share of detected pause time between stretches of speech.`
        : max === 0 ? "No pauses between stretches of speech were detected at the displayed resolution."
          : "Detected pause proportions did not single out one response at the displayed precision.", timingRefs);
      overview.push(sentence(`Across the first, second, and third responses, detected internal pauses added up to ${seconds(timings[0]!.pause)}, ${seconds(timings[1]!.pause)}, and ${seconds(timings[2]!.pause)} seconds respectively.`, timingRefs));
      const first = values[0], last = values[2];
      overview.push(sentence(last === first
        ? "The first and final responses had the same detected pause proportion at the displayed precision."
        : `The final response devoted a ${last > first ? "larger" : "smaller"} share of its recording to detected internal pauses than the first; the reason for that difference remains open.`, [timings[0]!.ref, timings[2]!.ref]));
    } else {
      title = "The movement in your voice.";
      strongest = sentence("Your recordings captured how pitch moved through each response.", pitchRefs);
    }
    if (pitchAvailable) {
      const spans = pitch.map(p => p!.span), broadest = Math.max(...spans);
      const widest = spans.flatMap((span, i) => span === broadest ? [order[i]] : []);
      overview.push(sentence(widest.length === 3
        ? "Your detected pitch span was the same across the three responses at the displayed precision."
        : `Your ${widest.join(" and ")} ${widest.length === 1 ? "response had" : "responses shared"} the widest detected pitch span in this recording.`, pitchRefs));
      if (!timingAvailable) overview.push(sentence("These spans describe pitch variation in the voiced stretches the tracker could follow.", pitchRefs));
    }
    overview.push(sentence("You can use these differences as a starting point for reflection, while deciding for yourself whether they connect to anything you experienced.", selectedRefs));
    const prompts = rows.map((r, i) => ({ promptId: String(r.promptId), label: labels[i], observations: [
      ...(timingAvailable ? [sentence(`In ${seconds(Number(r.durationMs))} seconds of recording, ${seconds(timings[i]!.speech)} seconds of speech and ${seconds(timings[i]!.pause)} seconds of internal pauses were detected.`, [timings[i]!.ref])] : []),
      ...(pitchAvailable ? [sentence(`Detected pitch span: ${pitch[i]!.span.toFixed(1)} semitones across the middle 60% of pitch values.`, [pitch[i]!.ref])] : []),
    ] }));
    return { ...base, status: "AVAILABLE", title, strongestObservation: strongest, overview, prompts, invitations,
      questionToSitWith: focus === null ? "What did you notice in yourself as you moved through the three responses?"
        : `What, if anything, felt different to you during your ${order[focus]} response?`,
      limits, observationLedger: selected,
      selection: { selected: selectedRefs, withheld: [...withheld, "PSYCHOLOGICAL_MEANING_CALIBRATION_REQUIRED"], psychologicalInference: false } };
  }
  // Older saved scans retain an explicitly different, energy-based description.
  // Quieter audio is never relabeled as a true pause or pitch measurement.
  const legacy = describeRecording(semantic, measurement, evidence);
  if (legacy.status !== "AVAILABLE") return limited("QUALIFIED_RECORDING_OBSERVATIONS_UNAVAILABLE");
  const legacyLedger = rows.map((r, i) => ({ id: legacy.evidenceRefs[i], promptId: ids[i], captureId: String(r.captureId),
    featureIds: ["SS_PAUSE_LOAD"], description: "Qualified energy-based quiet-audio proportion.", method: "energy_vad_silence_ratio; not speech segmentation" }));
  return { ...base, status: "AVAILABLE", title: "Where your recording grew quieter.",
    strongestObservation: sentence(legacy.strongestObservation, legacy.evidenceRefs),
    overview: [sentence(legacy.overview[0], legacy.evidenceRefs),
      sentence("Quieter stretches can come from a natural pause, softer speech, or the way the microphone picked up sound.", legacy.evidenceRefs),
      sentence("As you remember these responses, consider whether the differences connect to anything you noticed at the time.", legacy.evidenceRefs)],
    prompts: rows.map((r, i) => ({ promptId: ids[i], label: labels[i], observations: [sentence("This response contributed to the comparison of quieter audio.", [legacy.evidenceRefs[i]])] })),
    invitations, questionToSitWith: "What did you notice in yourself as you moved through the three responses?",
    limits: ["These saved recordings use an earlier sound-level detector; quieter audio is not a confirmed pause or an emotional reading."],
    observationLedger: legacyLedger,
    selection: { selected: legacy.evidenceRefs, withheld: [...withheld, "PSYCHOLOGICAL_MEANING_CALIBRATION_REQUIRED"], psychologicalInference: false } };
}
