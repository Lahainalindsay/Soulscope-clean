import { PROCESSING_STAGES } from "@soulscope/canonical-contracts";
import { InstrumentPanel } from "../../components/ui/InstrumentPanel";
import styles from "../Page.module.css";

const presentationSteps = [
  "Preparing the recordings",
  "Organizing evidence",
  "Comparing the three responses",
  "Preparing your reflection",
  "Composing the visual field",
] as const;

export default function AnalyzingPage() {
  return (
    <section className={styles.hero}>
      <p className="instrumentLabel">Demonstration processing state</p>
      <h1 className={styles.title}>Preparing a quiet visual transition.</h1>
      <p className="humanCopy">
        These labels are presentation states only. No scientific logic is executing in this visual foundation.
      </p>
      <InstrumentPanel>
        <div className={styles.grid}>
          <div>
            <h2>Visible progression</h2>
            <ol>
              {presentationSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <h2>Canonical stage labels</h2>
            <p className="humanCopy">
              {PROCESSING_STAGES.map((stage) => stage.id.replaceAll("_", " ")).join(" · ")}
            </p>
          </div>
        </div>
      </InstrumentPanel>
    </section>
  );
}
