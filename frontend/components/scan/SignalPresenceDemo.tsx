import styles from "./Scan.module.css";

export function SignalPresenceDemo() {
  return (
    <div className={styles.meter}>
      <div className="instrumentLabel">Microphone status · Visual demonstration only</div>
      <div className={styles.bars} aria-label="Visual demonstration only signal presence meter">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index} className={styles.bar} />
        ))}
      </div>
    </div>
  );
}
