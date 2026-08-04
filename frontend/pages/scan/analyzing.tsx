import Link from "next/link";
import { PROCESSING_STAGES } from "@soulscope/canonical-contracts";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";

const presentationSteps = [
  "Preparing the recordings",
  "Organizing evidence",
  "Comparing the three responses",
  "Preparing your reflection",
  "Composing the visual field",
];

function formatStageId(id: string) {
  return id
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function ScanAnalyzingPage() {
  return (
    <InstrumentLayout
      title="SoulScope — Demonstration Processing"
      description="SoulScope analyzing screen visual foundation"
      eyebrow="Demonstration processing state"
      heading="Holding the scan while the reflection prepares"
      meta={["Step-based progress", "No scientific logic active"]}
    >
      <section className="ss-scan-shell ss-analyzing-shell" aria-label="Analyzing demonstration">
        <aside className="ss-scan-progress">
          <p className="ss-technical-label">Bible stage labels</p>
          {PROCESSING_STAGES.map((stage) => (
            <div className="ss-scan-progress-row" key={stage.id}>
              <span>{stage.order}</span>
              <strong>{formatStageId(stage.id)}</strong>
              <small>Label only</small>
            </div>
          ))}
        </aside>

        <section className="ss-prompt-console ss-processing-console">
          <p className="ss-kicker">Demonstration processing state</p>
          <h2>Preparing your visual reflection</h2>
          <p>
            The sequence below is presentation-only. It does not imply that
            scientific scoring, selection, or story generation is active.
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
            View demo reflection
          </Link>
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Status</p>
          <div className="ss-status-stack">
            <span>Audio extraction inactive</span>
            <span>Evidence inactive</span>
            <span>Story inactive</span>
          </div>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
