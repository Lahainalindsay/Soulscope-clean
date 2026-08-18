import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

type InstrumentLayoutProps = {
  title: string;
  description: string;
  eyebrow?: string;
  heading: string;
  meta?: string[];
  compactHeader?: boolean;
  hideHeader?: boolean;
  children: ReactNode;
};

export function InstrumentLayout({
  title,
  description,
  eyebrow = "Private resonance dashboard",
  heading,
  meta = ["Private reflection", "User controlled"],
  compactHeader = false,
  hideHeader = false,
  children,
}: InstrumentLayoutProps) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <div className="ss-app">
        <nav className="ss-topbar" aria-label="Primary navigation">
          <Link href="/" className="ss-wordmark" aria-label="SoulScope home">
            <Image src="/soulscope/soulscope-logo.jpeg" alt="" width={28} height={28} className="ss-wordmark-mark" />
            <span>Soul</span><span>Scope</span>
          </Link>

          <div className="ss-nav-links">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? router.pathname === "/"
                  : router.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="ss-system-status">
            <span className="ss-status-dot" />
            Private session
          </div>
        </nav>

        <main className="ss-main-shell">
          {hideHeader ? null : (
            <header className={`ss-session-header${compactHeader ? " ss-session-header-compact" : ""}`}>
              <div>
                {compactHeader ? null : <p className="ss-kicker">{eyebrow}</p>}
                <h1>{heading}</h1>
              </div>

              <div className="ss-header-meta" aria-label="Session metadata">
                {meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </header>
          )}

          {children}
        </main>
      </div>
    </>
  );
}
