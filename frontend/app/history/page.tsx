"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory } from "@/lib/scans";
import type { Scan } from "@/lib/contracts";
import { Glyph } from "@/components/field-art";
export default function History() {
  const [scans, setScans] = useState<Scan[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    loadHistory()
      .then((s) => {
        if (alive) setScans(s);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [attempt]);
  return (
    <div className="history-page">
      <div className="page-top">
        <div>
          <p className="eyebrow">YOUR SCAN HISTORY</p>
          <h1>
            Moments <em>to return to.</em>
          </h1>
        </div>
        <Link href="/scan" className="button primary">
          New scan ↗
        </Link>
      </div>
      <p className="lead">
        Every response belongs to its own moment. Revisit the records you have
        saved.
      </p>
      {loading ? (
        <div className="empty-state panel" role="status">
          Loading your moments…
        </div>
      ) : error ? (
        <div className="empty-state panel">
          <Glyph />
          <h2>Your history is waiting.</h2>
          <p role="alert">{error}</p>
          <div className="actions centered">
            <Link className="button primary" href="/account">
              Sign in →
            </Link>
            <button
              className="button secondary"
              onClick={() => setAttempt((n) => n + 1)}
            >
              Try again
            </button>
            <Link className="text-link" href="/results">
              Explore a design preview →
            </Link>
          </div>
        </div>
      ) : !scans.length ? (
        <div className="empty-state panel">
          <Glyph />
          <h2>Your first moment starts here.</h2>
          <p>There are no saved scans yet.</p>
          <Link href="/scan" className="button primary">
            Begin your scan ↗
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {scans.map((s) => (
            <Link
              className="panel history-row"
              href={`/results/${s.id}`}
              key={s.id}
            >
              <Glyph />
              <div>
                <h2>
                  {new Date(s.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h2>
                <p>
                  {new Date(s.created_at).toLocaleTimeString(undefined, {
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · {s.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <span className="tag">
                {s.lifecycle_state.replaceAll("_", " ")}
              </span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
