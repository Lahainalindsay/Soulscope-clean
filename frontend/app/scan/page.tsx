"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PROMPTS } from "@/lib/prompts";
import { canonicalizeAudio, validateCanonicalWav } from "@/lib/audio";
import { sendScan } from "@/lib/scans";
import { getSupabase } from "@/lib/supabase";
import { Glyph } from "@/components/field-art";
type Clip = { blob: Blob; url: string; seconds: number };
export default function ScanPage() {
  const router = useRouter();
  const [step, setStep] = useState(0),
    [consent, setConsent] = useState(false),
    [recording, setRecording] = useState(false),
    [seconds, setSeconds] = useState(0),
    [clips, setClips] = useState<(Clip | null)[]>([null, null, null]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [scanId, setScanId] = useState<string | null>(null),
    [signedIn, setSignedIn] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    timer = useRef<ReturnType<typeof setInterval> | null>(null),
    urls = useRef<string[]>([]),
    mounted = useRef(true);
  const configured = !!getSupabase();
  const prompt = PROMPTS[Math.min(step, 2)];
  useEffect(() => {
    mounted.current = true;
    const db = getSupabase();
    db?.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const subscription = db?.auth.onAuthStateChange((_e, s) => setSignedIn(!!s))
      .data.subscription;
    return () => {
      mounted.current = false;
      subscription?.unsubscribe();
      if (timer.current) clearInterval(timer.current);
      if (recorder.current?.state === "recording") {
        recorder.current.onstop = null;
        recorder.current.stop();
      }
      stream.current?.getTracks().forEach((t) => t.stop());
      urls.current.forEach(URL.revokeObjectURL);
    };
  }, []);
  function stop() {
    setBusy(true);
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    if (recorder.current?.state === "recording") recorder.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }
  async function save(blob: Blob, index: number) {
    setBusy(true);
    try {
      const wav = await canonicalizeAudio(blob);
      const duration = validateCanonicalWav(await wav.arrayBuffer());
      if (!mounted.current) return;
      const url = URL.createObjectURL(wav);
      urls.current.push(url);
      setClips((prev) => {
        if (prev[index]) URL.revokeObjectURL(prev[index]!.url);
        return prev.map((c, i) =>
          i === index ? { blob: wav, url, seconds: duration } : c,
        );
      });
    } catch (e) {
      if (mounted.current)
        setError(
          e instanceof Error
            ? e.message
            : "This recording could not be prepared. Please try again.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  async function start() {
    setError("");
    setBusy(true);
    try {
      if (
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === "undefined"
      )
        throw new Error(
          "This browser cannot record here. Use a supported browser over HTTPS or upload a WAV recording.",
        );
      const audio = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      if (!mounted.current) {
        audio.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = audio;
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (t) => MediaRecorder.isTypeSupported(t),
      );
      const rec = new MediaRecorder(
        audio,
        mime ? { mimeType: mime } : undefined,
      );
      const chunks: Blob[] = [];
      recorder.current = rec;
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        void save(new Blob(chunks, { type: rec.mimeType }), step);
      };
      rec.start();
      setSeconds(0);
      setRecording(true);
      const began = Date.now();
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - began) / 1000);
        setSeconds(Math.min(30, elapsed));
        if (elapsed >= 30) stop();
      }, 200);
    } catch (e) {
      stream.current?.getTracks().forEach((t) => t.stop());
      setError(
        e instanceof Error
          ? e.message
          : "Microphone access was denied. Check browser permissions and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setError("");
    setBusy(true);
    try {
      const id = await sendScan(
        clips.map((c) => c!.blob),
        scanId,
        setScanId,
      );
      router.push(`/results/${id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The scan could not finish.");
      setBusy(false);
    }
  }
  return (
    <div className="scan-page">
      <div className="page-top">
        <div>
          <p className="eyebrow">GUIDED RESONANCE SCAN</p>
          <h1>
            A moment <em>for you.</em>
          </h1>
        </div>
        <Link className="text-link" href="/">
          Leave scan ×
        </Link>
      </div>
      <div className="scan-layout">
        <aside className="panel scan-guide">
          <p className="eyebrow">YOUR THREE RESPONSES</p>
          <ol>
            {PROMPTS.map((p, i) => (
              <li key={p.id} className={i === step ? "active" : ""}>
                <span className="step-dot">{clips[i] ? "✓" : `0${i + 1}`}</span>
                <div>
                  <h3>{p.label}</h3>
                  <p>About 30 seconds</p>
                </div>
              </li>
            ))}
          </ol>
          <hr />
          <p>Speak naturally. You can pause, listen back, or record again.</p>
          <p className="micro">
            The prompts do not assume how you feel. There is no right answer.
          </p>
          <Link href="/about#privacy" className="text-link">
            Your voice & privacy ↗
          </Link>
        </aside>
        <section className="panel recording-panel">
          {step < 3 ? (
            <>
              <div className="record-heading">
                <span className="eyebrow">RESPONSE 0{step + 1} / 03</span>
                <span className="tag">{prompt.label}</span>
              </div>
              <h2>{prompt.promptText}</h2>
              <p className="muted">Take a breath. Start when you are ready.</p>
              <div
                className={`record-orbit ${recording ? "is-recording" : ""}`}
              >
                <Glyph type={step} />
                <span>
                  {recording
                    ? `${String(seconds).padStart(2, "0")}:30`
                    : clips[step]
                      ? "✓"
                      : "30s"}
                </span>
              </div>
              <p className="record-status" aria-live="polite">
                {busy
                  ? "Preparing your recording…"
                  : recording
                    ? "Recording · speak in your own words"
                    : clips[step]
                      ? "Your response is ready. Listen back below."
                      : "Your microphone is off."}
              </p>
              {step === 0 && !clips[0] && (
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    disabled={recording || busy}
                  />
                  <span>
                    I agree to record and submit my voice for this staging test.
                    I have read{" "}
                    <Link href="/about#privacy">
                      how audio and derived records are stored
                    </Link>
                    .
                  </span>
                </label>
              )}
              <div className="actions centered">
                {recording ? (
                  <button
                    className="button primary"
                    disabled={seconds < 5}
                    onClick={stop}
                  >
                    Stop recording ■
                  </button>
                ) : (
                  <button
                    className="button primary"
                    disabled={busy || !consent || !!scanId}
                    onClick={start}
                  >
                    {clips[step] ? "Record again" : "Start recording"}{" "}
                    <span>●</span>
                  </button>
                )}
                {clips[step] && (
                  <button
                    className="button secondary"
                    disabled={busy || recording}
                    onClick={() => setStep(step + 1)}
                  >
                    Continue →
                  </button>
                )}
              </div>
              {clips[step] && (
                <audio
                  controls
                  src={clips[step]!.url}
                  aria-label={`Listen to ${prompt.label} recording`}
                />
              )}
              <details className="upload-option">
                <summary>Use a WAV recording instead</summary>
                <p className="micro">
                  5–35 seconds. Audio is converted to a mono, 16-bit WAV before
                  sending.
                </p>
                <label className="file-label">
                  Choose audio
                  <input
                    type="file"
                    accept="audio/wav,.wav"
                    disabled={!consent || busy || recording || !!scanId}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        if (f.size > 15_000_000)
                          setError("Choose a WAV smaller than 15 MB.");
                        else void save(f, step);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </details>
              {step > 0 && (
                <button
                  className="text-link back-link"
                  disabled={busy || recording}
                  onClick={() => setStep(step - 1)}
                >
                  ← Previous response
                </button>
              )}
            </>
          ) : (
            <>
              <p className="eyebrow">THREE RESPONSES. ONE MOMENT.</p>
              <h2>Ready to send?</h2>
              <p className="muted">
                Listen back before submitting. You can still revisit any
                response.
              </p>
              <div className="review-clips">
                {clips.map((c, i) => (
                  <div key={i}>
                    <div>
                      <h3>{PROMPTS[i].label}</h3>
                      <button
                        className="text-link"
                        disabled={busy || !!scanId}
                        onClick={() => setStep(i)}
                      >
                        Revisit
                      </button>
                    </div>
                    <audio
                      controls
                      src={c?.url}
                      aria-label={`Review ${PROMPTS[i].label}`}
                    />
                  </div>
                ))}
              </div>
              {!configured ? (
                <div className="notice">
                  The account connection has not been configured. Your
                  recordings remain on this page and have not been sent.
                  <Link className="text-link" href="/results">
                    Explore the results design →
                  </Link>
                </div>
              ) : !signedIn ? (
                <div className="notice">
                  Sign in in a separate tab to keep these recordings open.
                  <Link href="/account" target="_blank" className="text-link">
                    Open sign in ↗
                  </Link>
                </div>
              ) : (
                <button
                  className="button primary"
                  disabled={busy || clips.some((c) => !c) || !consent}
                  onClick={submit}
                >
                  {busy
                    ? "Sending & processing…"
                    : scanId
                      ? "Resume processing →"
                      : "Send my scan →"}
                </button>
              )}
              <p className="micro">
                This test returns recording measurements and evidence.
                Interpretations are still awaiting validated models.
              </p>
              {scanId && (
                <Link href={`/results/${scanId}`} className="text-link">
                  View saved scan →
                </Link>
              )}
            </>
          )}
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
