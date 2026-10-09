"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const db = getSupabase();
    if (!db) return;
    db.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = db.auth.onAuthStateChange((_event, session) =>
      setSignedIn(!!session),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className={`site-header${path === "/" ? " landing-header" : ""}`}>
        <Link href="/" className="brand" aria-label="SoulScope home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span className="brand-name">SOULSCOPE</span>
        </Link>
        {path === "/" ? (
          <>
            <nav aria-label="Main navigation">
              <Link href="/#how-it-works">HOW IT WORKS</Link>
              <Link href="/about#privacy">PRIVACY</Link>
            </nav>
            <div className="header-actions">
              <Link className="account-link" href="/account">
                {signedIn ? "Account" : "Sign In"}
              </Link>
              <Link className="header-cta" href={signedIn ? "/scan" : "/account"}>
                Begin Scan
              </Link>
            </div>
          </>
        ) : (
          <>
            <nav aria-label="Main navigation">
              {[
                ["/scan", "New scan"],
                ["/field", "Your field"],
                ["/history", "History"],
                ["/about", "About"],
              ].map(([url, label]) => (
                <Link
                  key={url}
                  href={url}
                  aria-current={path === url ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <Link className="account-link" href="/account">
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </>
        )}
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer">
        <p>
          YOUR VOICE LEAVES A PATTERN. <span>MAKE ROOM TO NOTICE.</span>
        </p>
        <div>
          <span>A moment of reflection. A little more perspective.</span>
          <Link href="/about#privacy">Privacy & your voice</Link>
        </div>
      </footer>
    </>
  );
}
