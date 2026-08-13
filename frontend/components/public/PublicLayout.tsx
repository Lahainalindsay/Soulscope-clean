import Head from "next/head";
import Link from "next/link";
import type { ReactNode } from "react";

type PublicLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PublicLayout({ title, description, children }: PublicLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>

      <div className="ss-public-app">
        <header className="ss-public-topbar">
          <Link href="/" className="ss-public-brand" aria-label="SoulScope home">
            <span className="ss-public-mark" aria-hidden="true" />
            Soul<span>Scope</span>
          </Link>

          <nav className="ss-public-nav" aria-label="Public navigation">
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/login">Sign in</Link>
            <Link href="/signup" className="ss-public-nav-action">
              Begin a scan
            </Link>
          </nav>
        </header>

        <main className="ss-public-main">{children}</main>
      </div>
    </>
  );
}
