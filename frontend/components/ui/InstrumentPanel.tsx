import type { ReactNode } from "react";
import styles from "./Ui.module.css";

export function InstrumentPanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`${styles.panel} ${className}`}>
      <div className={styles.panelInner}>{children}</div>
    </section>
  );
}
