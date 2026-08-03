import { InstrumentPanel } from "../components/ui/InstrumentPanel";
import styles from "./Page.module.css";

export default function ProfilePage() {
  return (
    <>
      <section className={styles.hero}>
        <p className="instrumentLabel">Profile presentation</p>
        <h1 className={styles.title}>Reference settings, shown as visual controls.</h1>
      </section>
      <div className={styles.grid}>
        <InstrumentPanel>
          <h2>Personal reference status</h2>
          <p>
            Empty trusted-reference state. An opening prompt may serve as a within-session reference, but it is not
            automatically a trusted longitudinal personal reference.
          </p>
        </InstrumentPanel>
        <InstrumentPanel>
          <h2>Privacy controls presentation</h2>
          <p>Visual-only controls. No user data, audio, or preference is saved.</p>
        </InstrumentPanel>
        <InstrumentPanel>
          <h2>Preferred reflection depth</h2>
          <select className={styles.control} aria-label="Preferred reflection depth visual control">
            <option>Balanced</option>
            <option>Brief</option>
            <option>More spacious</option>
          </select>
        </InstrumentPanel>
        <InstrumentPanel>
          <h2>Accessibility preferences</h2>
          <label className={styles.setting}>
            <span>Reduced motion visual control</span>
            <input type="checkbox" />
          </label>
        </InstrumentPanel>
      </div>
    </>
  );
}
