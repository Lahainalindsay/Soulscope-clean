import styles from "./Ui.module.css";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className={styles.empty}>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
