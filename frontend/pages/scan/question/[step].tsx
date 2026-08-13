import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { InstrumentLayout } from "../../../components/instrument/InstrumentLayout";
import { promptArc, scanPrompts } from "../../../mocks/visualFoundation";

type StepKey = keyof typeof scanPrompts;
type MeasurementStatus = "ready" | "measuring" | "complete";

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
      return "Measuring";
    case "complete":
      return "Prompt complete";
    default:
      return "Ready";
  }
}

export default function ScanQuestionPage({ step }: ScanQuestionProps) {
  const prompt = scanPrompts[step];
  const currentIndex = Number(step) - 1;
  const nextHref = step === "3" ? "/scan/analyzing" : `/scan/question/${Number(step) + 1}`;
  const [status, setStatus] = useState<MeasurementStatus>("ready");
  const isMeasuring = status === "measuring";
  const isComplete = status === "complete";

  useEffect(() => {
    if (!isMeasuring) {
      return undefined;
    }

    const completionTimer = window.setTimeout(() => {
      setStatus("complete");
    }, 30000);

    return () => window.clearTimeout(completionTimer);
  }, [isMeasuring]);

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
              <small>{isComplete ? "Complete" : isMeasuring ? "Observing signal" : "Ready when you are"}</small>
            </div>
            <i />
          </div>

          <div className="ss-measurement-actions" aria-label="Measurement actions">
            {status === "ready" ? (
              <button type="button" onClick={() => setStatus("measuring")}>
                Begin prompt
              </button>
            ) : null}
            {isComplete ? (
              <>
                <button type="button" onClick={() => setStatus("ready")}>
                  Try again
                </button>
                <Link href={nextHref}>Continue</Link>
              </>
            ) : null}
          </div>

          <p className="ss-visual-note" role="status" aria-live="polite">
            {status === "measuring"
              ? "Presentation only. SoulScope is visualizing a guided measurement period without microphone access."
              : status === "complete"
                ? "Prompt complete. No audio was recorded or saved."
                : "Presentation only. The active visual branch does not access your microphone."}
          </p>
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Instrument state</p>
          <div className="ss-status-stack">
            <span>{getStatusCopy(status)}</span>
            <span>Signal observation preview</span>
            <span>Prompt period: 30 seconds</span>
            <span>Automatic completion</span>
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
            This screen demonstrates the intended scan interface only. It does
            not request microphone permission or capture audio.
          </p>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
