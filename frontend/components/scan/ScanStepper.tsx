import { promptPresentation } from "../../mocks/demoResultPresentation";
import styles from "./Scan.module.css";

export function ScanStepper({ activeStep }: { activeStep: number }) {
  return (
    <ol className={styles.stepper} aria-label="Scan progress">
      {promptPresentation.map((prompt, index) => (
        <li key={prompt.id} className={`${styles.step} ${index + 1 === activeStep ? styles.active : ""}`}>
          <span className="instrumentLabel">
            {index + 1} of {promptPresentation.length}
          </span>
          <div>{prompt.category}</div>
        </li>
      ))}
    </ol>
  );
}
