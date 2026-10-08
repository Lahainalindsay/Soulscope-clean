"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="empty-state">
      <h1>This page needs another moment.</h1>
      <p>Something interrupted the page. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
