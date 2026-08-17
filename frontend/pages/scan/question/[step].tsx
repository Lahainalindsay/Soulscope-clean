import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { InstrumentLayout } from "../../../components/instrument/InstrumentLayout";
import { recordPromptAudio } from "../../../lib/audioRecorder";
import {
  PROMPT_IDS,
  currentSession,
  loadScanState,
  savePromptCapture,
} from "../../../lib/soulscopeApi";
import { promptArc, scanPrompts } from "../../../mocks/visualFoundation";

type StepKey = keyof typeof scanPrompts;
type MeasurementStatus = "ready" | "measuring" | "saving" | "complete" | "error";

type ScanQuestionProps = {
  step: StepKey;
};

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(scanPrompts).map((step) => ({ params: { step } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<ScanQuestionProps> = async ({ params }) => {
  const step = String(params?.step ?? "1") as StepKey;
  return { props: { step } };
};

function getStatusCopy(status: MeasurementStatus) {
  switch (status) {
    case "measuring":
      return "Recording";
    case "saving":
      return "Saving";
    case "error":
      return "Retry needed";
    case "complete":
      return "Prompt complete";
    default:
      return "Ready";
  }
}

export default function ScanQuestionPage({ step }: ScanQuestionProps) {
  const router = useRouter();
  const prompt = scanPrompts[step];
  const currentIndex = Number(step) - 1;
  const nextHref = step === "3" ? "/scan/analyzing" : `/scan/question/${Number(step) + 1}`;
  const [status, setStatus] = useState<MeasurementStatus>("ready");
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(30);
  const isMeasuring = status === "measuring";
  const isComplete = status === "complete";
  const promptId = useMemo(() => PROMPT_IDS[currentIndex], [currentIndex]);

  useEffect(() => {
    if (!isMeasuring) {
      return undefined;
    }
    setRemaining(30);
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isMeasuring]);

  useEffect(() => {
    const state = loadScanState();
    if (state?.audioDataUrls[promptId]) {
      setStatus("complete");
      setMessage("Prompt complete. Audio is held locally until processing.");
    }
  }, [promptId]);

  async function beginPrompt() {
    const session = currentSession();
    const state = loadScanState();
    if (!session || !state) {
      await router.push("/scan");
      return;
    }
    setStatus("measuring");
    setMessage("Recording. SoulScope will stop automatically at 30 seconds.");
    try {
      const recording = await recordPromptAudio(30000);
      setStatus("saving");
      await savePromptCapture(session, state, promptId, recording.dataUrl, recording.durationMs);
      setStatus("complete");
      setMessage("Prompt complete. Audio is ready for private processing.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Recording failed.");
    }
  }

  return (
    <InstrumentLayout
      title={`SoulScope — Prompt ${step}`}
      description="SoulScope guided measurement prompt"
      heading={prompt.category}
      meta={["30 seconds", getStatusCopy(status)]}
      compactHeader
    >
      <section className="ss-scan-shell ss-question-shell" aria-label={`Prompt ${step}`}>
        <aside className="ss-scan-progress">
          <p className="ss-technical-label">Progress</p>
          {promptArc.map((item, index) => (
            <div
              className={`ss-scan-progress-row${index === currentIndex ? " ss-active-row" : ""}`}
              key={item.id}
            >
              <span>{item.number}</span>
              <strong>{item.label}</strong>
              <small>
                {index < currentIndex
                  ? "Complete"
                  : index === currentIndex
                    ? getStatusCopy(status)
                    : "Next"}
              </small>
            </div>
          ))}
        </aside>

        <section className="ss-prompt-console">
          <p className="ss-kicker">{prompt.category}</p>
          <h2>{prompt.title}</h2>
          <p>{prompt.body}</p>

          <div
            className={`ss-measurement-progress${isMeasuring ? " ss-measurement-active" : ""}${
              isComplete ? " ss-measurement-complete" : ""
            }`}
            aria-label="30 second guided measurement progress"
          >
            <div className="ss-measurement-progress-head">
              <span>Guided measurement</span>
              <small>
                {isComplete
                  ? "Complete"
                  : isMeasuring
                    ? `${remaining}s remaining`
                    : status === "saving"
                      ? "Saving"
                      : "Ready when you are"}
              </small>
            </div>
            <i />
          </div>

          <div className="ss-measurement-actions" aria-label="Measurement actions">
            {status === "ready" ? (
              <button type="button" onClick={beginPrompt}>
                Start recording
              </button>
            ) : null}
            {status === "error" ? (
              <button type="button" onClick={beginPrompt}>
                Retry recording
              </button>
            ) : null}
            {isComplete ? (
              <>
                <button type="button" onClick={() => {
                  setStatus("ready");
                  setMessage("");
                }}>
                  Try again
                </button>
                <Link href={nextHref}>Continue</Link>
              </>
            ) : null}
          </div>

          <p className="ss-visual-note" role="status" aria-live="polite">
            {message || "SoulScope will ask for microphone access when you start recording."}
          </p>
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Instrument state</p>
          <div className="ss-status-stack">
            <span>{getStatusCopy(status)}</span>
            <span>Private browser recording</span>
            <span>Prompt period: 30 seconds</span>
            <span>Canonical prompt: {promptId}</span>
            <span>No diagnosis</span>
          </div>
          <div className="ss-signal-demo" aria-label="Decorative signal meter preview">
            <p>Visual signal preview</p>
            <i />
            <i />
            <i />
            <i />
          </div>
          <p>
            Audio stays local until all three prompts are ready, then it is sent
            to the authenticated backend processing endpoint.
          </p>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
