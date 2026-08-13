import Link from "next/link";
import { InstrumentLayout } from "../components/instrument/InstrumentLayout";
import { historyRows } from "../mocks/visualFoundation";

export default function HistoryPage() {
  return (
    <InstrumentLayout
      title="SoulScope — History"
      description="SoulScope session history"
      eyebrow="History"
      heading="Past reflections"
      meta={["Local build", "Sample sessions"]}
    >
      <section className="ss-ledger-page" aria-label="History">
        <div className="ss-ledger-head">
          <p>
            Saved history is not active in this local build. These sample rows
            show how completed reflections can be reviewed.
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
          <p className="ss-technical-label">Saved history</p>
          <h2>No saved sessions yet</h2>
          <p>Completed sessions are not stored in this build.</p>
        </div>
      </section>
    </InstrumentLayout>
  );
}
