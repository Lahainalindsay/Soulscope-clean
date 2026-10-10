"use client";
import Link from "next/link";
import { FieldArt } from "./field-art";
import type { ResultBundle } from "../lib/contracts";
import { ReflectionOverview, ReflectionDetails } from "./reflection-narrative";
import { readReflectionNarrative } from "../lib/reflection-narrative";
import { storedReflection } from "../lib/result-presentation";
import type { DemoResultV1 } from "../lib/demo-result";

export function ResultsView({ bundle = null, demoResult = null }: {
  bundle?: ResultBundle | null; demoResult?: DemoResultV1 | null;
}) {
  const preview = !bundle && demoResult?.kind === "ILLUSTRATIVE_DEMO";
  const narrative = bundle ? storedReflection(bundle.semantic, bundle.scan.id)
    : preview && demoResult ? readReflectionNarrative(demoResult.narrative, demoResult.source) : null;
  return <div className="results-page result-experience">
    <div className="results-toolbar">
      <Link className="text-link" href={preview ? "/" : "/history"}>← {preview ? "Home" : "Your history"}</Link>
      <Link className="text-link" href="/scan">New scan ↗</Link>
    </div>
    <div className="result-title">
      <p className="eyebrow">A MOMENT TO NOTICE</p>
      <h1>Your resonance <em>field.</em></h1>
      {bundle && <time dateTime={bundle.scan.created_at}>{new Date(bundle.scan.created_at).toLocaleString(undefined,
        { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}</time>}
    </div>
    {preview && <p className="preview-notice">This is a design preview. The artwork and reflections are illustrative and are not based on a recording.</p>}
    <div className="result-art"><FieldArt /><span className="art-caption">ILLUSTRATIVE ART · SIGNATURE IN DEVELOPMENT</span></div>
    <ReflectionOverview narrative={narrative} />
    {narrative?.status === "READY" && <ReflectionDetails narrative={narrative} showReferences={false} />}
    {bundle && <Link className="text-link" href={`/results/${bundle.scan.id}/details`}>Explore recording details →</Link>}
  </div>;
}
