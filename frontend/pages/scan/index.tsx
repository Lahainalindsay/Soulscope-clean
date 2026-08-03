import { Button } from "../../components/ui/Button";
import { InstrumentPanel } from "../../components/ui/InstrumentPanel";
import { LinkButton } from "../../components/ui/LinkButton";
import styles from "../Page.module.css";

export default function ScanIntroPage() {
  return (
    <>
      <section className={styles.hero}>
        <p className="instrumentLabel">Scan introduction</p>
        <h1 className={styles.title}>Three spoken reflections, held with care.</h1>
        <p className="humanCopy">
          This presentation introduces three spoken prompts of about 30 seconds each: an opening response, an
          emotionally demanding reflection, and a future-oriented reflection. It is not diagnostic, does not score, and does not claim
          to know hidden feelings.
        </p>
        <div className={styles.row}>
          <LinkButton href="/scan/question/1" variant="primary">Begin the scan</LinkButton>
          <Button type="button">Review how it works</Button>
        </div>
      </section>
      <div className={styles.grid}>
        <InstrumentPanel>
          <h2>Microphone permission</h2>
          <p>
            A future recording flow will ask before using the microphone. This visual foundation does not capture
            audio and does not start recording automatically.
          </p>
        </InstrumentPanel>
        <InstrumentPanel>
          <h2>Product boundary</h2>
          <p>
            SoulScope supports reflection. It is not a clinical, diagnostic, deception-detection, or hidden-truth
            system.
          </p>
        </InstrumentPanel>
      </div>
    </>
  );
}
