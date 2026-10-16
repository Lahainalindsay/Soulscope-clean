"use client";
import { useEffect, useState } from "react";
import { accessToken } from "../lib/supabase";
import { FEELING_CHOICES, isFeelingChoice, readRecordingReflection,
  type FeelingChoice, type RecordingReflectionV1 } from "../lib/recording-reflection";

/** Displays server-authored prose. The emotional word comes from the person. */
export function RecordingReflection({ reflection, interactive = false }: {
  reflection: RecordingReflectionV1; interactive?: boolean;
}) {
  const [current, setCurrent] = useState(reflection);
  const [selected, setSelected] = useState<FeelingChoice | null>(reflection.feltReading?.reportedFeeling ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const key = `soulscope:feeling:v1:${reflection.scanId}`;
  useEffect(() => {
    if (!interactive || reflection.status !== "AVAILABLE") return;
    let stored: string | null = null;
    try { stored = localStorage.getItem(key); } catch { return; }
    if (isFeelingChoice(stored)) void openReading(stored, false);
    // The result component is keyed by scan identity at the call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive, key]);

  async function openReading(feeling: FeelingChoice, save = true) {
    setLoading(true); setError("");
    try {
      const token = await accessToken();
      const response = await fetch(`/api/results/${encodeURIComponent(reflection.scanId)}/reflection`,
        { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ feeling }), cache: "no-store" });
      if (!response.ok) throw new Error("The reading could not be opened. Please try again.");
      const read = readRecordingReflection(await response.json(), {
        resultId: reflection.sourceResultId, scanId: reflection.scanId,
        measurementId: reflection.sourceMeasurementId, evidenceLedgerId: reflection.sourceEvidenceLedgerId,
      });
      if (read?.feltReading?.reportedFeeling !== feeling) throw new Error("The reading could not be verified. Please try again.");
      setCurrent(read); setSelected(feeling);
      if (save) {
        try { localStorage.setItem(key, feeling); } catch { /* The reading remains available for this visit. */ }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The reading could not be opened. Please try again.");
    } finally { setLoading(false); }
  }

  const reading = current.feltReading;
  const available = current.status === "AVAILABLE";
  return <>
    <section className="panel reflection-main" aria-label="Your reflection">
      <p className="eyebrow">{reading ? "YOUR MOMENT, IN YOUR WORDS" : available ? "WHAT STOOD OUT IN YOUR VOICE" : "YOUR RECORDING"}</p>
      <h2>{reading?.title ?? current.title}</h2>
      {reading ? <>
        <p className="reflection-lead">{reading.opening}</p>
        <p className="reflection-copy">{reading.reflection}</p>
      </> : <>
        <p className="reflection-lead">{current.strongestObservation.text}</p>
        <p className="reflection-copy">{current.overview.map(s => s.text).join(" ")}</p>
      </>}
    </section>
    {available && <>
      {interactive ? <section className="panel feeling-checkin" aria-label="Your own feeling">
        <p className="eyebrow">THE PART ONLY YOU CAN NAME</p>
        <h2>What felt present as you spoke?</h2>
        <p>Your answer puts the voice pattern beside your own experience. It stays on this browser, and you can change it.</p>
        <div className="feeling-options">
          {FEELING_CHOICES.map(feeling => <button key={feeling} type="button" aria-pressed={selected === feeling}
            disabled={loading} onClick={() => void openReading(feeling)}>{feeling}</button>)}
        </div>
        {selected && <button className="text-link remove-feeling" type="button" disabled={loading} onClick={() => {
          try { localStorage.removeItem(key); } catch { /* The current reading can still be cleared. */ }
          setCurrent(reflection); setSelected(null); setError("");
        }}>Remove my word</button>}
        {loading && <p role="status" className="micro">Opening your reading…</p>}
        {error && <p role="alert" className="notice error">{error}</p>}
      </section> : reading && <p className="muted sample-context">This sample uses an illustrative answer of “{reading.reportedFeeling}.”</p>}
      {reading && <section className="panel reading-insight">
        <p className="eyebrow">WORTH NOTICING</p>
        <p>{reading.worthNoticing}</p>
      </section>}
      <details className="panel recording-chapters">
        <summary>What the recording actually showed <span>Explore the three responses</span></summary>
        <p className="reflection-copy">{current.strongestObservation.text} {current.overview.map(s => s.text).join(" ")}</p>
        <div className="reflection-chapters">
          {current.prompts.map((prompt, i) => <section key={prompt.promptId}>
            <p className="eyebrow">0{i + 1} · {prompt.label}</p>
            {prompt.observations.map((s, j) => <p key={j}>{s.text}</p>)}
          </section>)}
        </div>
      </details>
      <section className="question-card">
        <p className="eyebrow">A QUESTION TO SIT WITH</p>
        <h2>{reading?.question ?? current.questionToSitWith}</h2>
        <p>The meaning of this moment belongs to you.</p>
      </section>
    </>}
    <details className="panel reflection-limits">
      <summary>How this reading was made</summary>
      {current.limits.map(limit => <p key={limit}>{limit}</p>)}
      {reading && <p>The feeling in this reading came from your answer. SoulScope did not infer it from your voice.</p>}
      <p>Acoustic differences cannot identify a feeling on their own.</p>
    </details>
  </>;
}
