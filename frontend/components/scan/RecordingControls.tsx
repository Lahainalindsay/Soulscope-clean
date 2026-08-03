import { Button } from "../ui/Button";
import styles from "./Scan.module.css";

export function RecordingControls() {
  return (
    <div className={styles.controls} aria-label="Recording presentation controls">
      <Button type="button" variant="primary">
        Start recording
      </Button>
      <Button type="button">Stop recording</Button>
      <Button type="button" variant="ghost">
        Retry recording
      </Button>
      <Button type="button">Continue</Button>
      <Button type="button" variant="ghost">
        Permission denied state
      </Button>
      <Button type="button" variant="ghost">
        Weak signal state
      </Button>
    </div>
  );
}
