export type SourceSpanV2 = Readonly<{ captureId: string; start: number; end: number; quote: string }>;
export type ReadingSentenceV2 = Readonly<{ text: string; sourceSpans: readonly SourceSpanV2[]; audioRefs?: readonly string[] }>;
export type VoiceObservation = Readonly<{ id: string; captureIds: readonly string[]; delivery: string; impression: string }>;
export type ReflectionV2 = Readonly<{
  kind: "TRANSCRIPT_REFLECTION_V2";
  reflectionId: string;
  mode: "WORDS" | "VOICE_AND_WORDS";
  status: "READY" | "UNRESOLVED";
  sections: Readonly<Record<"overview" | "cognition" | "relationships" | "expression" | "question", readonly ReadingSentenceV2[]>>;
  voiceObservations: readonly VoiceObservation[];
}>;
const names = ["overview", "cognition", "relationships", "expression", "question"] as const;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
/** Verify source membership and scan linkage. Neither proves emotional truth. */
export function readReflectionV2(row: unknown, transcripts: readonly unknown[], semanticId: string, voiceRecord?: unknown): ReflectionV2 | null {
  if (!record(row) || row.semantic_result_id !== semanticId || typeof row.id !== "string" || !record(row.narrative)) return null;
  const n = row.narrative;
  if (n.schemaVersion !== "reflection-narrative.v2" || n.status !== "READY" || row.status !== "READY" || !record(n.sections)
    || Object.keys(n.sections).sort().join() !== [...names].sort().join()) return null;
  const sources = new Map<string, string>();
  for (const t of transcripts) {
    if (!record(t) || typeof t.capture_id !== "string" || typeof t.text !== "string" || sources.has(t.capture_id)) return null;
    sources.set(t.capture_id, t.text);
  }
  if (sources.size !== 3) return null;
  const voice: VoiceObservation[] = [];
  const usesVoice = n.mode === "VOICE_AND_WORDS";
  if (n.mode !== undefined && !usesVoice) return null;
  if (usesVoice) {
    if (!record(voiceRecord) || n.voiceRecordId !== voiceRecord.id || voiceRecord.scan_id !== row.scan_id
      || !Array.isArray(voiceRecord.observations) || voiceRecord.observations.length < 3 || voiceRecord.observations.length > 6
      || !Array.isArray(voiceRecord.source_artifacts) || voiceRecord.source_artifacts.length !== 3) return null;
    const sourceIds = new Set<string>();
    for (const artifact of voiceRecord.source_artifacts) {
      if (!record(artifact) || typeof artifact.captureId !== "string" || !sources.has(artifact.captureId)
        || typeof artifact.artifactId !== "string" || typeof artifact.checksumSha256 !== "string"
        || !/^[a-f0-9]{64}$/i.test(artifact.checksumSha256) || typeof artifact.durationMs !== "number"
        || !Number.isInteger(artifact.durationMs) || artifact.durationMs < 25000 || artifact.durationMs > 35000) return null;
      sourceIds.add(artifact.captureId);
    }
    if (sourceIds.size !== 3) return null;
    const covered = new Set<string>();
    for (const item of voiceRecord.observations) {
      if (!record(item) || typeof item.id !== "string" || voice.some((v) => v.id === item.id)
        || !Array.isArray(item.captureIds) || !item.captureIds.length || item.captureIds.length > 3
        || item.captureIds.some((c: unknown) => typeof c !== "string" || !sources.has(c))
        || typeof item.delivery !== "string" || item.delivery.length < 12 || item.delivery.length > 800
        || typeof item.impression !== "string" || item.impression.length > 600) return null;
      const ids = item.captureIds as string[];
      ids.forEach((id) => covered.add(id));
      voice.push({ id: item.id, captureIds: [...ids], delivery: item.delivery, impression: item.impression });
    }
    if (covered.size !== 3) return null;
  }
  for (const name of names) {
    const lines = n.sections[name];
    if (!Array.isArray(lines) || lines.length > 5 || (name === "overview" && !lines.length)
      || (name === "question" && lines.length > 1)) return null;
    for (const line of lines) {
      if (!record(line) || typeof line.text !== "string" || Array.from(line.text).length < 8 || Array.from(line.text).length > 500
        || !Array.isArray(line.sourceSpans) || line.sourceSpans.length > 4) return null;
      const refs = line.audioRefs ?? [];
      if (!Array.isArray(refs) || refs.length > 4 || !line.sourceSpans.length && !refs.length
        || refs.some((ref: unknown) => typeof ref !== "string" || !voice.some((v) => v.id === ref))
        || !usesVoice && line.audioRefs !== undefined) return null;
      if (usesVoice && (name === "cognition" || name === "relationships") && !line.sourceSpans.length) return null;
      for (const span of line.sourceSpans) {
        if (!record(span) || typeof span.captureId !== "string" || !Number.isInteger(span.start) || !Number.isInteger(span.end)
          || typeof span.quote !== "string") return null;
        const source = sources.get(span.captureId);
        const start = span.start as number, end = span.end as number;
        if (!source || start < 0 || end <= start || end > Array.from(source).length
          || Array.from(source).slice(start, end).join("") !== span.quote) return null;
      }
    }
    if (usesVoice && (name === "overview" || name === "expression") && lines.length
      && !lines.some((line: ReadingSentenceV2) => line.audioRefs?.length)) return null;
  }
  return { kind: "TRANSCRIPT_REFLECTION_V2", reflectionId: row.id, mode: usesVoice ? "VOICE_AND_WORDS" : "WORDS",
    status: "READY", sections: structuredClone(n.sections) as ReflectionV2["sections"], voiceObservations: voice };
}
