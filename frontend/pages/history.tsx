import Link from "next/link";
import { InstrumentLayout } from "../components/instrument/InstrumentLayout";
import { historyRows } from "../mocks/visualFoundation";

export default function HistoryPage() {
  return (
    <InstrumentLayout
      title="SoulScope — History"
      description="SoulScope session history visual foundation"
      eyebrow="Session ledger"
      heading="Recent sessions"
      meta={["Presentation rows", "No longitudinal interpretation"]}
    >
      <section className="ss-ledger-page" aria-label="History ledger">
        <div className="ss-ledger-head">
          <p>
            No longitudinal interpretation is available in this visual foundation.
            Rows demonstrate density, rhythm, and review actions only.
          </p>
          <Link href="/scan" className="ss-button ss-button-primary">
            Begin scan
          </Link>
        </div>

        <div className="ss-ledger ss-ledger-large">
          {historyRows.map((row) => (
            <div className="ss-ledger-row" key={`${row.date}-${row.title}`}>
              <span className="ss-mini-signature" aria-hidden="true" />
              <span>{row.date}</span>
              <strong>{row.title}</strong>
              <span>{row.prompts}</span>
              <span>{row.status}</span>
              <Link href="/results/demo">View</Link>
            </div>
          ))}
        </div>

        <div className="ss-empty-state">
          <p className="ss-technical-label">Empty state</p>
          <h2>No saved sessions yet</h2>
          <p>When persistence is approved, completed sessions can appear in this ledger.</p>
        </div>
      </section>
    </InstrumentLayout>
  );
}
