import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-state">
      <p className="eyebrow">A DIFFERENT PATH</p>
      <h1>This page is not here.</h1>
      <Link className="button primary" href="/">
        Return home →
      </Link>
    </section>
  );
}
