import { promptPresentation } from "../../mocks/demoResultPresentation";
import styles from "./Results.module.css";

export function PromptArc() {
  return (
    <section aria-labelledby="prompt-arc-title">
      <p className="instrumentLabel">Three-prompt arc · visual states only</p>
      <h2 id="prompt-arc-title">Opening to demand to future orientation</h2>
      <div className={styles.arc}>
        {promptPresentation.map((prompt) => (
          <article className={styles.station} key={prompt.id}>
            <span className={styles.dot} aria-hidden="true" />
            <h3>{prompt.category}</h3>
            <p className="humanCopy">30 second presentation station. No numeric emotional score is encoded.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
