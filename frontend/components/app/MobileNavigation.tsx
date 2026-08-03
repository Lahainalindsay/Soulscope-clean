import Link from "next/link";
import { useRouter } from "next/router";
import { navItems } from "./navItems";
import styles from "./Navigation.module.css";

export function MobileNavigation() {
  const router = useRouter();

  return (
    <nav className={styles.mobile} aria-label="Mobile navigation">
      {navItems.map((item) => (
        <Link
          key={item.href}
          className={`${styles.mobileLink} ${router.pathname === item.href ? styles.mobileActive : ""}`}
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
