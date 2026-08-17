import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";
import { currentSession, loadScanState, processScan } from "../../lib/soulscopeApi";

const presentationSteps = [
  "Closing the recording step",
  "Gathering the three prompts",
  "Preparing the reflection screen",
  "Drawing the sample field",
];

export default function ScanAnalyzingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "processing" | "complete" | "error">("idle");
  const [message, setMessage] = useState("Ready to process your scan.");

  async function runProcessing() {
    const session = currentSession();
    const state = loadScanState();
    if (!session || !state) {
      await router.push("/scan");
      return;
    }
    setStatus("processing");
    setMessage("Uploading private audio and running canonical processing.");
    try {
      await processScan(session, state);
      setStatus("complete");
      setMessage("Analysis completed. Structural Dimension results are ready.");
      await router.push(`/results/${state.scanId}`);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Processing failed.");
    }
  }

  useEffect(() => {
    void runProcessing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <InstrumentLayout
      title="SoulScope — Preparing Reflection"
      description="SoulScope reflection preparation"
      eyebrow="Preparing"
      heading="Holding the scan while the next screen opens"
      meta={["Private processing", "CALIBRATION_REQUIRED"]}
    >
      <section className="ss-scan-shell ss-analyzing-shell" aria-label="Preparing reflection">
        <aside className="ss-scan-progress">
          <p className="ss-technical-label">Progress</p>
          {presentationSteps.map((step, index) => (
            <div className="ss-scan-progress-row" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
              <small>{index === 0 ? "Done" : status === "error" ? "Retry" : status === "complete" ? "Done" : "Running"}</small>
            </div>
          ))}
        </aside>

        <section className="ss-prompt-console ss-processing-console">
          <p className="ss-kicker">Almost there</p>
          <h2>Preparing your reflection screen</h2>
          <p>
            SoulScope is processing the three recorded prompts through the
            canonical backend path. Numeric scores remain unavailable.
          </p>

          <div className="ss-processing-steps">
            {presentationSteps.map((step, index) => (
              <div className="ss-processing-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <p className="ss-recording-message" role="status" aria-live="polite">
            {message}
          </p>

          {status === "error" ? (
            <button type="button" className="ss-button ss-button-primary" onClick={runProcessing}>
              Retry processing
            </button>
          ) : null}
          {status === "complete" ? (
            <Link href={`/results/${loadScanState()?.scanId ?? "demo"}`} className="ss-button ss-button-primary">
              View completed analysis
            </Link>
          ) : null}
        </section>

        <aside className="ss-recording-rail">
          <p className="ss-technical-label">Status</p>
          <div className="ss-status-stack">
            <span>{status === "processing" ? "Processing" : status === "complete" ? "Complete" : "Ready"}</span>
            <span>No diagnosis</span>
            <span>No score</span>
            <span>CALIBRATION_REQUIRED</span>
          </div>
        </aside>
      </section>
    </InstrumentLayout>
  );
}
