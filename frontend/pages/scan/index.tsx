import Link from "next/link";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";
import { promptArc, visualFoundationNotice } from "../../mocks/visualFoundation";

export default function ScanIntroPage() {
  return (
    <InstrumentLayout
      title="SoulScope — Begin Scan"
      description="SoulScope scan introduction visual foundation"
      eyebrow="Guided scan"
      heading="Three spoken reflections, held in one quiet structure"
      meta={["About 90 seconds", "Microphone required later"]}
    >
      <section className="ss-scan-shell" aria-label="Scan introduction">
        <aside className="ss-scan-progress">
          <p className="ss-technical-label">Protocol</p>
          {promptArc.map((prompt) => (
            <div className="ss-scan-progress-row" key={prompt.id}>
              <span>{prompt.number}</span>
              <strong>{prompt.label}</strong>
              <small>{prompt.duration}</small>
            </div>
          ))}
        </aside>

        <section className="ss-prompt-console">
          <p className="ss-kicker">Private and reflective</p>
          <h2>Speak naturally. The scan does not claim to know hidden feelings.</h2>
          <p>
            This visual foundation presents the recording flow only. Audio
            capture, analysis, persistence, and interpretation are not active.
          </p>
          <div className="ss-action-row">
            <Link href="/scan/question/1" className="ss-button ss-button-primary">
              Begin the scan
            </Link>
            <Link href="/results/demo" className="ss-button ss-button-secondary">
              Review visual result
            </Link>
          </div>
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Boundary</p>
          <p>{visualFoundationNotice}</p>
          <div className="ss-status-stack">
            <span>No diagnosis</span>
            <span>No inference</span>
            <span>No auto recording</span>
          </div>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
