import { InstrumentPanel } from "../components/ui/InstrumentPanel";
import styles from "./Page.module.css";

const sections = [
  "Privacy",
  "Audio retention preference",
  "Accessibility",
  "Reduced motion",
  "Reflection style",
  "Account actions",
] as const;

export default function SettingsPage() {
  return (
    <>
      <section className={styles.hero}>
        <p className="instrumentLabel">Settings presentation</p>
        <h1 className={styles.title}>Quiet controls for a future account surface.</h1>
        <p className="humanCopy">All controls are non-persistent visual-foundation controls.</p>
      </section>
      <InstrumentPanel>
        {sections.map((section) => (
          <label className={styles.setting} key={section}>
            <span>{section}</span>
            <select className={styles.control} aria-label={`${section} visual-foundation control`}>
              <option>Visual-foundation control</option>
              <option>Not saved</option>
            </select>
          </label>
        ))}
      </InstrumentPanel>
    </>
  );
}
