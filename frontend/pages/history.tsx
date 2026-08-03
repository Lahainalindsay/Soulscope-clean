import Link from "next/link";
import { EmptyState } from "../components/ui/EmptyState";
import { InstrumentPanel } from "../components/ui/InstrumentPanel";
import { demoSessions } from "../mocks/demoResultPresentation";
import styles from "./Page.module.css";

export default function HistoryPage() {
  return (
    <>
      <section className={styles.hero}>
        <p className="instrumentLabel">History presentation</p>
        <h1 className={styles.title}>Recent sessions, without trend claims.</h1>
      </section>
      <InstrumentPanel>
        {demoSessions.map((session) => (
          <div className={styles.sessionRow} key={session.id}>
            <div className={styles.thumb} aria-label="Signature thumbnail placeholder" />
            <div>
              <h2>{session.date}</h2>
              <p>{session.status}</p>
            </div>
            <Link href="/results/demo">View</Link>
          </div>
        ))}
      </InstrumentPanel>
      <section className={styles.section}>
        <EmptyState
          title="No longitudinal interpretation is available"
          body="This visual foundation does not generate trends or personal change claims."
        />
      </section>
    </>
  );
}
