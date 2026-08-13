import Link from "next/link";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";

export default function ScanIntroPage() {
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
        <Link href="/scan/question/1" className="ss-button ss-button-primary">
          Begin scan
        </Link>
      </section>
    </InstrumentLayout>
  );
}
