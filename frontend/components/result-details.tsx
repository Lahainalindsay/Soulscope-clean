import Link from "next/link";
import { displayValue, type ResultBundle } from "../lib/contracts";
import { ReflectionDetails } from "./reflection-narrative";
import { storedReflection } from "../lib/result-presentation";
export function ResultDetails({ bundle }: { bundle: ResultBundle }) {
  return <div className="results-page">
    <Link className="text-link" href={`/results/${bundle.scan.id}`}>← Your moment</Link>
    <h1>Recording details</h1>
    <p>Saved technical records. Provisional acoustic measurements do not establish psychological meaning.</p>
    <ReflectionDetails narrative={storedReflection(bundle.semantic, bundle.scan.id)} />
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

    <details className="panel measurement-detail"><summary>Recording summary provenance</summary><pre>{JSON.stringify(bundle.recordingSummary, null, 2)}</pre></details>
  </div>;
}
