"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ResultsView } from "@/components/results-view";
import { loadResult } from "@/lib/scans";
import type { ResultBundle } from "@/lib/contracts";
export default function SavedResult({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [bundle, setBundle] = useState<ResultBundle | null>(null),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setError("");
    setBundle(null);
    loadResult(id)
      .then((data) => {
        if (alive) setBundle(data);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [id, attempt]);
  if (error)
    return (
      <div className="empty-state panel">
        <h1>This moment is unavailable.</h1>
        <p role="alert">{error}</p>
        <div className="actions centered">
          <button
            className="button secondary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Try again
          </button>
          <Link className="button primary" href="/account">
            Sign in →
          </Link>
        </div>
      </div>
    );
  if (!bundle)
    return (
      <div className="empty-state" role="status">
        <p className="eyebrow">OPENING YOUR MOMENT</p>
        <h1>Gathering your saved records…</h1>
      </div>
    );
  return <ResultsView bundle={bundle} />;
}
