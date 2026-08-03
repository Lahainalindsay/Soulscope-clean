import Link from "next/link";
import { useRouter } from "next/router";
import { navItems } from "./navItems";
import styles from "./Navigation.module.css";

export function TopNavigation() {
  const router = useRouter();

  return (
    <header className={styles.top}>
      <div className={styles.topInner}>
        <Link className={styles.wordmark} href="/" aria-label="SoulScope home">
          Soul<span>Scope</span>
        </Link>
        <nav className={styles.links} aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={`${styles.link} ${router.pathname === item.href ? styles.active : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.meta}>Visual foundation</div>
      </div>
    </header>
  );
}
