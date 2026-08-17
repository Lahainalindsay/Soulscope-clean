import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";
import { currentSession, startScan } from "../../lib/soulscopeApi";

export default function ScanIntroPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(Boolean(currentSession()));
  }, []);

  async function beginScan() {
    const session = currentSession();
    if (!session) {
      await router.push("/login");
      return;
    }
    setError("");
    setStarting(true);
    try {
      await startScan(session);
      await router.push("/scan/question/1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start scan.");
      setStarting(false);
    }
  }

  return (
    <InstrumentLayout
      title="SoulScope — Begin Scan"
      description="SoulScope scan introduction"
      heading="Before you begin your scan"
      hideHeader
    >
      <section className="ss-pre-scan-panel" aria-labelledby="pre-scan-title">
        <h2 id="pre-scan-title">Before you begin your scan</h2>
        <ol>
          <li>Find a quiet place where you can speak comfortably.</li>
          <li>Set aside about three uninterrupted minutes.</li>
          <li>Respond naturally to each prompt. There are no right answers.</li>
          <li>
            You will have 30 seconds for each response. Please do your best to
            speak for the full time available.
          </li>
        </ol>
        <button type="button" className="ss-button ss-button-primary" onClick={beginScan} disabled={starting}>
          {starting ? "Starting scan" : "Begin scan"}
        </button>
        {signedIn ? null : (
          <p className="ss-recording-message">Sign in is required before a scan can be created.</p>
        )}
        {error ? <p className="ss-auth-error">{error}</p> : null}
      </section>
    </InstrumentLayout>
  );
}
