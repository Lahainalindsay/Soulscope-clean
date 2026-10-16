export type SourceSpanV2 = Readonly<{ captureId: string; start: number; end: number; quote: string }>;
export type ReadingSentenceV2 = Readonly<{ text: string; sourceSpans: readonly SourceSpanV2[] }>;
export type ReflectionV2 = Readonly<{
  kind: "TRANSCRIPT_REFLECTION_V2";
  reflectionId: string;
  status: "READY" | "UNRESOLVED";
  sections: Readonly<Record<"overview" | "cognition" | "relationships" | "expression" | "question", readonly ReadingSentenceV2[]>>;
}>;
const names = ["overview", "cognition", "relationships", "expression", "question"] as const;
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
/** Verification at the consumer boundary, independent of the database trigger. */
export function readReflectionV2(row: unknown, transcripts: readonly unknown[], semanticId: string): ReflectionV2 | null {
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
  for (const name of names) {
    const lines = n.sections[name];
    if (!Array.isArray(lines) || lines.length > 5 || (name === "overview" && !lines.length)
      || (name === "question" && lines.length > 1)) return null;
    for (const line of lines) {
      if (!record(line) || typeof line.text !== "string" || line.text.length < 8 || line.text.length > 500
        || !Array.isArray(line.sourceSpans) || !line.sourceSpans.length || line.sourceSpans.length > 4) return null;
      for (const span of line.sourceSpans) {
        if (!record(span) || typeof span.captureId !== "string" || !Number.isInteger(span.start) || !Number.isInteger(span.end)
          || typeof span.quote !== "string") return null;
        const source = sources.get(span.captureId);
        const start = span.start as number, end = span.end as number;
        // JS indexes UTF-16 units; the producer and SQL use Unicode code points.
        if (!source || start < 0 || end <= start ||
          Array.from(source).slice(start, end).join("") !== span.quote) return null;
      }
    }
  }
  return { kind: "TRANSCRIPT_REFLECTION_V2", reflectionId: row.id,
    status: "READY", sections: structuredClone(n.sections) as ReflectionV2["sections"] };
}
