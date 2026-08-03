import { Button } from "../ui/Button";
import styles from "./Results.module.css";

export function FeedbackDemo() {
  return (
    <section aria-labelledby="feedback-title">
      <p className="instrumentLabel">Feedback demonstration — not saved</p>
      <h2 id="feedback-title">How does this presentation land?</h2>
      <div className={styles.feedback}>
        <Button type="button">This feels true</Button>
        <Button type="button">Partly</Button>
        <Button type="button">Not today</Button>
        <Button type="button">Unsure</Button>
      </div>
    </section>
  );
}
