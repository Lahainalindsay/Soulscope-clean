import type { ReactNode } from "react";
import { MobileNavigation } from "./MobileNavigation";
import { TopNavigation } from "./TopNavigation";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main-content">
        Skip to content
      </a>
      <TopNavigation />
      <main id="main-content" className={styles.main}>
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
