import { promptPresentation } from "../../mocks/demoResultPresentation";
import { InstrumentPanel } from "../ui/InstrumentPanel";
import { RecordingControls } from "./RecordingControls";
import { SignalPresenceDemo } from "./SignalPresenceDemo";
import styles from "./Scan.module.css";

type PromptPanelProps = {
  step: 1 | 2 | 3;
};

export function PromptPanel({ step }: PromptPanelProps) {
  const prompt = promptPresentation[step - 1];

  return (
    <InstrumentPanel>
      <div className={styles.prompt}>
        <div>
          <p className="instrumentLabel">Prompt {step} of 3 · {prompt.category}</p>
          <h1 className={styles.promptText}>{prompt.prompt}</h1>
        </div>
        <div className={styles.timer} aria-label="Thirty second visual timer">
          <div className={styles.timerInner}>0:30</div>
        </div>
        <SignalPresenceDemo />
        <RecordingControls />
        <p className="humanCopy">
          Recording controls are visual only in this foundation. Recording never starts automatically.
        </p>
      </div>
    </InstrumentPanel>
  );
}
