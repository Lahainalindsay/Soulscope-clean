import { CONSTELLATION_REGISTRY } from "@soulscope/canonical-contracts";
import { InstrumentPanel } from "../components/ui/InstrumentPanel";
import { LinkButton } from "../components/ui/LinkButton";
import { MetadataRow } from "../components/ui/MetadataRow";
import { SignaturePlaceholder } from "../components/resonance/SignaturePlaceholder";
import { demoSessions } from "../mocks/demoResultPresentation";
import styles from "./Page.module.css";

export default function HomePage() {
  return (
    <>
      <section className={styles.hero}>
        <p className={`${styles.eyebrow} instrumentLabel`}>Private visual foundation</p>
        <h1 className={styles.display}>A quiet place to begin listening.</h1>
        <p className="humanCopy">
          SoulScope presents voice reflection as bounded observation. This visual foundation contains no diagnosis,
          wellness score, streak, or claim to know hidden feelings.
        </p>
        <div className={styles.row}>
          <LinkButton href="/scan" variant="primary">Begin a new scan</LinkButton>
          <LinkButton href="/results/demo">View reflection</LinkButton>
        </div>
      </section>
      <section className={styles.grid}>
        <InstrumentPanel>
          <p className="instrumentLabel">Latest reflection preview · mock presentation data</p>
          <h2>Holding steady while looking ahead</h2>
          <MetadataRow
            items={[
              { label: "Date", value: "August 3, 2026" },
              { label: "Completion", value: "Three-prompt completion" },
              { label: "Source", value: "Visual fixture, not voice evidence" },
            ]}
          />
        </InstrumentPanel>
        <SignaturePlaceholder />
      </section>
      <section className={styles.section}>
        <p className="instrumentLabel">Recent-session timeline</p>
        {demoSessions.map((session) => (
          <div className={styles.sessionRow} key={session.id}>
            <div className={styles.thumb} aria-hidden="true" />
            <div>
              <h3>{session.date}</h3>
              <p>{session.status}</p>
            </div>
            <LinkButton href="/results/demo" variant="ghost">View</LinkButton>
          </div>
        ))}
      </section>
      <InstrumentPanel>
        <p className="instrumentLabel">Canonical labels imported from contracts</p>
        <p className="humanCopy">
          {CONSTELLATION_REGISTRY.map((entry) => `${entry.id}: ${entry.label}`).join(" · ")}
        </p>
      </InstrumentPanel>
    </>
  );
}
