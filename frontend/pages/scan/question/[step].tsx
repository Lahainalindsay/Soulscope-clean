import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { InstrumentLayout } from "../../../components/instrument/InstrumentLayout";
import { promptArc, scanPrompts } from "../../../mocks/visualFoundation";

type StepKey = keyof typeof scanPrompts;

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

export default function ScanQuestionPage({ step }: ScanQuestionProps) {
  const prompt = scanPrompts[step];
  const currentIndex = Number(step) - 1;
  const nextHref = step === "3" ? "/scan/analyzing" : `/scan/question/${Number(step) + 1}`;

  return (
    <InstrumentLayout
      title={`SoulScope — Prompt ${step}`}
      description="SoulScope prompt recording visual foundation"
      eyebrow={`Prompt ${step} of 3`}
      heading={prompt.category}
      meta={["30 second demonstration timer", "No recording active"]}
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
              <small>{index < currentIndex ? "Captured" : index === currentIndex ? "Ready" : "Next"}</small>
            </div>
          ))}
        </aside>

        <section className="ss-prompt-console ss-recording-console">
          <p className="ss-kicker">{prompt.category}</p>
          <h2>{prompt.title}</h2>
          <p>{prompt.body}</p>

          <div className="ss-timer" aria-label="30 second visual timer">
            <span>00:30</span>
            <i />
          </div>

          <div className="ss-recording-controls" aria-label="Recording controls demonstration">
            <button type="button">Start recording</button>
            <button type="button">Stop recording</button>
            <button type="button">Retry</button>
            <Link href={nextHref}>Continue</Link>
          </div>

          <p className="ss-visual-note">Visual demonstration only. Recording does not start automatically.</p>
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Microphone state</p>
          <div className="ss-status-stack">
            <span>Ready</span>
            <span>Recording</span>
            <span>Captured</span>
            <span>Permission denied</span>
            <span>Weak signal</span>
          </div>
          <div className="ss-signal-demo" aria-label="Visual demonstration only signal meter">
            <p>Visual demonstration only</p>
            <i />
            <i />
            <i />
            <i />
          </div>
          <p>
            No microphone permission is requested in this visual foundation.
          </p>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
