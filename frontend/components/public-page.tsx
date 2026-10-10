import Link from "next/link";
export function PublicPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="reading-page"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{children}
    <div className="footer-links"><Link href="/legal">Legal</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link></div>
  </div>;
}
