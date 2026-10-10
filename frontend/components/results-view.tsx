"use client";
import Link from "next/link";
import { FieldArt, Glyph } from "./field-art";
import {
  CONSTELLATIONS,
  displayValue,
  type ResultBundle,
} from "@/lib/contracts";
import { ReflectionOverview, ReflectionDetails } from "./reflection-narrative";
import { readReflectionNarrative } from "../lib/reflection-narrative";
import { storedReflection, constellationOutcome } from "../lib/result-presentation";
import type { DemoResultV1 } from "../lib/demo-result";

export function ResultsView({
  bundle = null,
  demoResult = null,
}: {
  bundle?: ResultBundle | null;
  demoResult?: DemoResultV1 | null;
}) {
  const preview = !bundle && demoResult?.kind === "ILLUSTRATIVE_DEMO";
  const narrative = bundle
    ? storedReflection(bundle.semantic, bundle.scan.id)
    : preview && demoResult
      ? readReflectionNarrative(demoResult.narrative, demoResult.source)
      : null;
  const count = bundle?.measurement?.prompt_measurements.length ?? 0;
  const counts = bundle?.evidence?.status_counts;
  return (
    <div className="results-page">
      <div className="results-toolbar">
        <Link className="text-link" href={preview ? "/" : "/history"}>
          ← {preview ? "Home" : "Your history"}
        </Link>
        <span className={`tag ${preview ? "preview-tag" : ""}`}>
          {preview
            ? "DESIGN PREVIEW · ILLUSTRATIVE CONTENT"
            : "SAVED SCAN · MEASUREMENT TEST"}
        </span>
        <Link className="text-link" href="/scan">
          New scan ↗
        </Link>
      </div>
      <div className="result-title">
        <p className="eyebrow">A MOMENT TO NOTICE</p>
        <h1>
          Your resonance <em>field.</em>
        </h1>
        <p>
          {preview
            ? "Explore a quieter way to see and reflect."
            : "Your three responses, held in one place."}
        </p>
      </div>
      {preview && (
        <p className="preview-notice">
          This is a design preview. The artwork and reflections are illustrative
          and are not based on a recording.
        </p>
      )}
      <div className="results-grid">
        <aside className="result-left">
          <section className="panel">
            <h2 className="panel-title">
              {preview ? "THE GUIDED SCAN" : "SCAN OVERVIEW"}
            </h2>
            <dl className="overview">
              <div>
                <dt>RECORDING PROTOCOL</dt>
                <dd>Three guided responses</dd>
              </div>
              <div>
                <dt>{preview ? "SPEAKING TIME" : "RESPONSES MEASURED"}</dt>
                <dd>{preview ? "About 90 seconds" : `${count} / 3`}</dd>
              </div>
              <div>
                <dt>RECORDING QUALITY</dt>
                <dd>
                  {bundle?.measurement?.measurement_status ?? "Not measured"}
                </dd>
              </div>
              <div>
                <dt>INTERPRETATION</dt>
                <dd>
                  {preview ? "Illustrative preview" : narrative?.status === "READY" ? "Available" : "Not available"}
                </dd>
              </div>
            </dl>
            <p className="micro">
              A moment of speech is a moment of experience. It does not define
              you.
            </p>
          </section>
          <section className="panel">
            <h2 className="panel-title">FOUR CONSTELLATIONS</h2>
            {CONSTELLATIONS.map((c, i) => (
              <div className={`compact-constellation ${c.color}`} key={c.id}>
                <Glyph type={i} />
                <div>
                  <span>{c.id}</span>
                  <p>{c.name}</p>
                </div>
                <span className="micro">{preview ? "Illustrative only" : constellationOutcome(bundle?.semantic ?? null, c.id)}</span>
              </div>
            ))}
          </section>
          <section className="panel">
            <h2 className="panel-title">YOUR REFERENCE</h2>
            <p>
              These three responses belong to the same moment. A personal
              reference or change over time is not estimated in this release.
            </p>
            <Link className="text-link" href="/field">
              Visit your field →
            </Link>
          </section>
        </aside>
        <div className="result-center">
          <div className="result-art">
            <FieldArt />
            <span className="art-caption">
              DECORATIVE FIELD ART · NOT A MEASURED SIGNATURE
            </span>
          </div>
          <ReflectionOverview narrative={narrative} />
          {!preview && bundle?.measurement && (
            <Link className="text-link" href="#recording-details">
              Explore recording details ↓
            </Link>
          )}
        </div>
        <aside className="result-right">
          <section className="panel field-meta">
            <dl>
              <div>
                <dt>FIELD ID</dt>
                <dd>
                  {bundle
                    ? bundle.scan.id.slice(0, 8).toUpperCase()
                    : "PREVIEW"}
                </dd>
              </div>
              <div>
                <dt>RECORDED</dt>
                <dd>
                  {bundle
                    ? new Date(bundle.scan.created_at).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )
                    : "No recording submitted"}
                </dd>
              </div>
              <div>
                <dt>STATUS</dt>
                <dd>
                  {preview ? "Design exploration" : bundle?.scan.lifecycle_state.replaceAll("_", " ")}
                </dd>
              </div>
            </dl>
          </section>
          <section className="panel">
            <h2 className="panel-title">WHAT IS AVAILABLE</h2>
            <ul className="availability">
              <li>
                <span>Acoustic measurements</span>
                <b>{bundle?.measurement ? "Saved" : "Not measured"}</b>
              </li>
              <li>
                <span>Evidence record</span>
                <b>{bundle?.evidence ? "Saved" : "Not available"}</b>
              </li>
              <li>
                <span>Dimension record</span>
                <b>
                  {bundle?.dimensions ? bundle.dimensions.status.replaceAll("_", " ") : "Not available"}
                </b>
              </li>
              <li>
                <span>Personal interpretation</span>
                <b>{preview ? "Illustrative only" : narrative?.status === "READY" ? "Available" : "Not available"}</b>
              </li>
              <li>
                <span>Acoustic signature</span>
                <b>Not available</b>
              </li>
            </ul>
          </section>
          <section className="panel">
            <h2 className="panel-title">
              {preview ? "A GENTLE REMINDER" : "EVIDENCE COVERAGE"}
            </h2>
            {counts ? (
              <dl className="evidence-counts">
                {Object.entries(counts).map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p>
                {preview
                  ? "Keep what feels useful. Leave what does not. Your experience remains yours to interpret."
                  : "Evidence will appear here after processing. Unavailable evidence is kept separate from zero or contradiction."}
              </p>
            )}
          </section>
          <section className="panel">
            <h2 className="panel-title">RETURN WITH CURIOSITY</h2>
            <p>
              You can revisit this moment without needing to turn it into a
              conclusion.
            </p>
            <Link href="/scan" className="text-link">
              Take another moment ↗
            </Link>
          </section>
        </aside>
      </div>
      <ReflectionDetails narrative={narrative} />
      {!preview && typeof bundle?.semantic?.result_report?.reason === "string" && (
        <details className="panel measurement-detail">
          <summary>Result limits <span>View the saved reason</span></summary>
          <p>{bundle.semantic.result_report.reason}</p>
        </details>
      )}
      {bundle?.measurement && (
        <section id="recording-details" className="section recording-details">
          <p className="eyebrow">YOUR RECORDING DETAILS</p>
          <h2>The measurements behind this moment.</h2>
          <p className="muted">
            Descriptive acoustic values from the current provisional extractor.
            These are not psychological scores.
          </p>
          {bundle.measurement.quality_summary.warnings?.length ? (
            <p className="notice">
              Recording notes:{" "}
              {bundle.measurement.quality_summary.warnings.join(", ")}
            </p>
          ) : null}
          {bundle.measurement.quality_summary.rejectionReasons?.length ? (
            <p className="notice">
              Quality limits:{" "}
              {bundle.measurement.quality_summary.rejectionReasons.join(", ")}
            </p>
          ) : null}
          {bundle.measurement.prompt_measurements.map((p, i) => (
            <details className="panel measurement-detail" key={p.promptId}>
              <summary>
                0{i + 1} ·{" "}
                {p.promptId
                  .replace("P" + (i + 1) + "_", "")
                  .replaceAll("_", " ")
                  .toLowerCase()}{" "}
                <span>{(p.durationMs / 1000).toFixed(1)}s</span>
              </summary>
              <div className="table-scroll">
                <table>
                  <caption>Descriptive acoustic measurements</caption>
                  <thead>
                    <tr>
                      <th>Measurement</th>
                      <th>Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.measurements.map((m) => (
                      <tr key={m.feature_id}>
                        <td>{m.feature_id}</td>
                        <td>{displayValue(m.value, m.unit)}</td>
                        <td>
                          {m.implementation_status?.startsWith("PROVISIONAL")
                            ? "Provisional · "
                            : ""}
                          {m.quality}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
          <details className="panel measurement-detail">
            <summary>
              Evidence, dimensions & provenance <span>View saved records</span>
            </summary>
            <pre>
              {JSON.stringify(
                {
                  measurement_record_id: bundle.measurement.id,
                  evidence: bundle.evidence,
                  dimensions: bundle.dimensions,
                  semantic: bundle.semantic,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </section>
      )}
    </div>
  );
}
