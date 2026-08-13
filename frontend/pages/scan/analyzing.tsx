import Link from "next/link";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";

const presentationSteps = [
  "Closing the recording step",
  "Gathering the three prompts",
  "Preparing the reflection screen",
  "Drawing the sample field",
];

export default function ScanAnalyzingPage() {
  return (
    <InstrumentLayout
      title="SoulScope — Preparing Reflection"
      description="SoulScope reflection preparation"
      eyebrow="Preparing"
      heading="Holding the scan while the next screen opens"
      meta={["Local session", "No diagnosis"]}
    >
      <section className="ss-scan-shell ss-analyzing-shell" aria-label="Preparing reflection">
        <aside className="ss-scan-progress">
          <p className="ss-technical-label">Progress</p>
          {presentationSteps.map((step, index) => (
            <div className="ss-scan-progress-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              <small>{index === 0 ? "Done" : "Next"}</small>
            </div>
          ))}
        </aside>

        <section className="ss-prompt-console ss-processing-console">
          <p className="ss-kicker">Almost there</p>
          <h2>Preparing your reflection screen</h2>
          <p>
            This moment is a pause between recording and the sample reflection.
            SoulScope does not produce a diagnosis, score, or hidden-trait reading.
          </p>

          <div className="ss-processing-steps">
            {presentationSteps.map((step, index) => (
              <div className="ss-processing-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <Link href="/results/demo" className="ss-button ss-button-primary">
            View sample reflection
          </Link>
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Status</p>
          <div className="ss-status-stack">
            <span>Recording preview only</span>
            <span>No diagnosis</span>
            <span>No score</span>
          </div>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
