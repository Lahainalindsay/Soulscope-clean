import styles from "./Ui.module.css";

export function MetadataRow({ items }: { items: ReadonlyArray<{ label: string; value: string }> }) {
  return (
    <dl className={styles.metadata}>
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
