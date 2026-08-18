import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { InstrumentLayout } from "../../components/instrument/InstrumentLayout";
import { StructuralResonanceSignature } from "../../components/resonance/StructuralResonanceSignature";
import {
  DimensionResultRow,
  currentSession,
  loadDimensionResult,
  loadMeasurementStatus,
} from "../../lib/soulscopeApi";

type MeasurementSummary = {
  id: string;
  measurement_status: string;
  extractor_version: string;
};

export default function ScanResultPage() {
  const router = useRouter();
  const scanId = String(router.query.scanId ?? "");
  const [dimensionResult, setDimensionResult] = useState<DimensionResultRow | null>(null);
  const [measurement, setMeasurement] = useState<MeasurementSummary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadResult() {
    if (!scanId || scanId === "undefined") return;
    const session = currentSession();
    if (!session) {
      await router.push("/login");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const [dimensions, measurementRow] = await Promise.all([
        loadDimensionResult(session, scanId),
        loadMeasurementStatus(session, scanId),
      ]);
      setDimensionResult(dimensions);
      setMeasurement(measurementRow);
      if (!dimensions) setError("No Dimension result is available for this scan yet.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load result.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanId]);

  return (
    <InstrumentLayout
      title="SoulScope — Scan Result"
      description="Completed SoulScope scan result"
      eyebrow="Completed analysis"
      heading="Structural analysis complete"
      meta={["Owner-only result", "CALIBRATION_REQUIRED"]}
    >
      <section className="ss-results-shell">
        <section className="ss-results-lead">
          <p className="ss-kicker">Canonical backend path</p>
          <h2>Analysis completed without numeric scoring.</h2>
          <p>
            This result reached the current verified pipeline: canonical
            acoustic measurements, immutable MeasurementRecord, canonical
            EV_* Evidence Ledger, and structural Dimension mapping. Numeric
            Dimension scoring remains unavailable.
          </p>
        </section>

        <section className="ss-pre-scan-panel" aria-label="Result status">
          <h2>Status</h2>
          {loading ? <p>Loading owner-only result...</p> : null}
          {error ? <p className="ss-auth-error">{error}</p> : null}
          <div className="ss-status-stack">
            <span>Measurement: {measurement?.measurement_status ?? "pending"}</span>
            <span>Extractor: {measurement?.extractor_version ?? "pending"}</span>
            <span>Dimension: {dimensionResult?.status ?? "pending"}</span>
            <span>Scoring: {dimensionResult?.dimension_scoring_version ?? "CALIBRATION_REQUIRED"}</span>
          </div>
          <div className="ss-measurement-actions">
            <button type="button" onClick={loadResult}>
              Refresh
            </button>
            <Link href="/scan">New scan</Link>
          </div>
        </section>

        {dimensionResult ? (
          <StructuralResonanceSignature dimensions={dimensionResult.dimensions} />
        ) : null}

        {dimensionResult ? (
          <section className="ss-pre-scan-panel" aria-label="Structural Dimension results">
            <h2>Structural Dimension status</h2>
            <div className="ss-processing-steps">
              {dimensionResult.dimensions.map((dimension) => (
                <div className="ss-processing-step" key={dimension.dimensionId}>
                  <span>{dimension.dimensionId}</span>
                  <strong>{dimension.label}</strong>
                  <small>
                    {dimension.structuralMappingStatus} /{" "}
                    {dimension.scoringPermitted ? "SCORING_AVAILABLE" : "CALIBRATION_REQUIRED"}
                  </small>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </InstrumentLayout>
  );
}
