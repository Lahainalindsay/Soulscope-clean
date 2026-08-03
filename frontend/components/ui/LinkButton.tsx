import Link from "next/link";
import styles from "./Button.module.css";

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function LinkButton({ href, children, variant = "secondary" }: LinkButtonProps) {
  return (
    <Link className={`${styles.button} ${styles[variant]}`} href={href}>
      {children}
    </Link>
  );
}
