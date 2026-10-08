"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FieldArt } from "@/components/field-art";
import { loadHistory } from "@/lib/scans";
export default function Field() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    loadHistory()
      .then((s) => {
        if (alive) setCount(s.length);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return (
    <section className="field-page">
      <p className="eyebrow">YOUR RESONANCE FIELD</p>
      <h1>
        A living collection <em>of moments.</em>
      </h1>
      <p className="lead">
        Return to the responses you have saved. Let each moment be itself.
      </p>
      <div className="field-collection">
        <FieldArt />
        <span className="art-caption">
          DECORATIVE FIELD ART · DESIGN PREVIEW
        </span>
      </div>
      <div className="panel field-message">
        <p className="eyebrow">
          {count === null
            ? "YOUR SPACE TO RETURN"
            : `${count} RECENT SAVED ${count === 1 ? "MOMENT" : "MOMENTS"}`}
        </p>
        <h2>Your field begins with a moment.</h2>
        <p>
          You can browse individual scans now. An integrated field, personal
          baseline, and trends over time will become available when compatible
          longitudinal processing is ready.
        </p>
        <div className="actions centered">
          <Link href="/scan" className="button primary">
            Begin a scan ↗
          </Link>
          <Link href="/history" className="button secondary">
            View your history
          </Link>
        </div>
      </div>
    </section>
  );
}
