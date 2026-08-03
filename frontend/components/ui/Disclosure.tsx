import type { ReactNode } from "react";
import styles from "./Ui.module.css";

export function Disclosure({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className={styles.disclosure}>
      <summary className={styles.summary}>{title}</summary>
      {children}
    </details>
  );
}
