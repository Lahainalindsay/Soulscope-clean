"use client";
import { useState } from "react";
import Link from "next/link";
import { FieldArt } from "./field-art";
import type { ResultBundle } from "../lib/contracts";
import { ReflectionOverview, ReflectionDetails } from "./reflection-narrative";
import { readReflectionNarrative } from "../lib/reflection-narrative";
import { storedReflection } from "../lib/result-presentation";
import type { DemoResultV1 } from "../lib/demo-result";
import { RecordingReflection } from "./recording-reflection";
import { readRecordingReflection } from "../lib/recording-reflection";
import type { RecordingReflectionV1 } from "../lib/recording-reflection";
import { PersonalReadingPreview } from "./personal-reading-preview";
import { TranscriptReflection } from "./reflection-v2";
import type { ReflectionV2 } from "../lib/reflection-v2";
import { accessToken } from "../lib/supabase";

export function ResultsView({ bundle = null, demoResult = null, recordingDemo = null, personalDemo = false, onRefresh }: {
  bundle?: ResultBundle | null; demoResult?: DemoResultV1 | null;
  recordingDemo?: { kind: "ILLUSTRATIVE_RECORDING_DEMO"; reflection: RecordingReflectionV1 } | null;
  personalDemo?: boolean; onRefresh?: () => void;
}) {
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");
  const [voiceConsent, setVoiceConsent] = useState(false);
  async function retryReading(scanId: string) {
    setRetrying(true);
    setRetryError("");
    try {
      const token = await accessToken();
      const response = await fetch(`/api/results/${encodeURIComponent(scanId)}/reflection`, {
        method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ voiceConsent }), signal: AbortSignal.timeout(280000),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "The reading could not be prepared.");
      onRefresh?.();
    } catch (error) {
      setRetryError(error instanceof Error ? error.message : "The reading could not be prepared.");
    } finally {
      setRetrying(false);
    }
  }
  const personalPreview = !bundle && personalDemo;
  const sample = !bundle && recordingDemo?.kind === "ILLUSTRATIVE_RECORDING_DEMO" ? recordingDemo.reflection : null;
  const preview = personalPreview || (!bundle && (demoResult?.kind === "ILLUSTRATIVE_DEMO" || !!sample));
  const narrative = bundle ? storedReflection(bundle.semantic, bundle.scan.id)
    : preview && demoResult ? readReflectionNarrative(demoResult.narrative, demoResult.source) : null;
  const recording = bundle?.semantic && bundle.measurement && bundle.evidence && bundle.scan.lifecycle_state === "finalized"
    ? readRecordingReflection(bundle.recordingReflection, { resultId: bundle.semantic.id, scanId: bundle.scan.id,
        measurementId: bundle.measurement.id, evidenceLedgerId: bundle.evidence.id })
    : sample ? readRecordingReflection(sample, { resultId: sample.sourceResultId, scanId: sample.scanId,
        measurementId: sample.sourceMeasurementId, evidenceLedgerId: sample.sourceEvidenceLedgerId }) : null;
  const reading = bundle?.recordingReflection && typeof bundle.recordingReflection === "object"
    && "kind" in bundle.recordingReflection && bundle.recordingReflection.kind === "TRANSCRIPT_REFLECTION_V2"
    ? bundle.recordingReflection as ReflectionV2 : null;
  const needsReading = !!bundle?.scan.transcription_consent && !reading;
  return <div className="results-page result-experience">
    <div className="results-toolbar">
      <Link className="text-link" href={preview ? "/" : "/history"}>← {preview ? "Home" : "Your history"}</Link>
      <Link className="text-link" href="/scan">New scan ↗</Link>
    </div>
    <div className="result-title">
      <p className="eyebrow">A MOMENT TO NOTICE</p>
      <h1>Your resonance <em>field.</em></h1>
      {bundle && <time dateTime={bundle.scan.created_at}>{new Date(bundle.scan.created_at).toLocaleString(undefined,
        { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}</time>}
    </div>
    {preview && <p className="preview-notice">This is a design preview. The artwork and reflections are illustrative and are not based on a recording.</p>}
    <div className="result-art"><FieldArt /><span className="art-caption">ILLUSTRATIVE ART · SIGNATURE IN DEVELOPMENT</span></div>
    {personalPreview ? <PersonalReadingPreview /> : reading ? <TranscriptReflection reading={reading} /> : needsReading ? null
      : narrative?.status !== "READY" && recording ? <RecordingReflection reflection={recording} />
      : <ReflectionOverview narrative={narrative} />}
    {bundle && needsReading && <section className="panel reflection-main" aria-label="Prepare your voice reading">
      <p className="eyebrow">YOUR VOICE READING</p>
      <h2>There is more to hear.</h2>
      <p>Your recordings are saved. Prepare a reading from how your voice sounds and what you shared, without recording again.</p>
      {onRefresh && <><label className="consent"><input type="checkbox" checked={voiceConsent} disabled={retrying}
        onChange={(event) => setVoiceConsent(event.target.checked)} />
        <span>I agree to send these saved recordings to OpenAI for direct voice analysis and a personal reflection. This experimental reading may miss how I feel.</span></label>
        <button className="button secondary" type="button" disabled={retrying || !voiceConsent}
          onClick={() => void retryReading(bundle.scan.id)}>{retrying ? "Listening and preparing your reading…" : "Prepare my voice reading"}</button></>}
      {retryError && <p role="alert">{retryError}</p>}
    </section>}
    {bundle?.recordingReflectionError && <p className="notice" role="alert">{bundle.recordingReflectionError}</p>}
    {narrative?.status === "READY" && <ReflectionDetails narrative={narrative} showReferences={false} />}
    {bundle && <Link className="text-link" href={`/results/${bundle.scan.id}/details`}>Explore recording details →</Link>}
  </div>;
}
