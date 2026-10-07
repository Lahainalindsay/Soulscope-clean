from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class DimensionResultInput:
    dimension_id: str
    constellation_id: str
    resolution_status: str
    resolution_reason: str
    score_produced: bool
    confidence_produced: bool
    posterior_mean: float | None
    confidence: float | None
    structural_eligibility: bool
    calibration_status: str

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> DimensionResultInput:
        return cls(
            dimension_id=str(row["dimensionId"]),
            constellation_id=str(row["constellationId"]),
            resolution_status=str(row["resolutionStatus"]),
            resolution_reason=str(row["resolutionReason"]),
            score_produced=bool(row["scoreProduced"]),
            confidence_produced=bool(row["confidenceProduced"]),
            posterior_mean=None if row.get("posteriorMean") is None else float(row["posteriorMean"]),
            confidence=None if row.get("confidence") is None else float(row["confidence"]),
            structural_eligibility=bool(row["structuralEligibility"]),
            calibration_status=str(row["calibrationStatus"]),
        )


@dataclass(frozen=True)
class DimensionResultSetInput:
    evidence_ledger_id: str
    scan_id: str
    processing_run_id: str
    measurement_record_id: str
    dimension_engine_version: str
    dimension_registry_version: str
    dimension_scoring_version: str
    result_schema_version: str
    status: str
    dimensions: tuple[DimensionResultInput, ...]
    provenance: dict[str, Any]

    @classmethod
    def from_result(cls, result: Any) -> DimensionResultSetInput:
        return cls(
            evidence_ledger_id=result.evidence_ledger_id,
            scan_id=result.scan_id,
            processing_run_id=result.processing_run_id,
            measurement_record_id=result.measurement_record_id,
            dimension_engine_version=result.dimension_engine_version,
            dimension_registry_version=result.dimension_registry_version,
            dimension_scoring_version=result.dimension_scoring_version,
            result_schema_version=result.result_schema_version,
            status=result.status,
            dimensions=tuple(DimensionResultInput.from_row(row) for row in result.dimensions),
            provenance=deepcopy(result.provenance),
        )


@dataclass(frozen=True)
class ConstellationResultSet:
    evidence_ledger_id: str
    scan_id: str
    processing_run_id: str
    measurement_record_id: str
    constellation_engine_version: str
    constellation_result_schema_version: str
    constellation_geometry_version: str
    constellation_calibration_registry_version: str
    status: str
    constellations: tuple[dict[str, Any], ...]
    status_counts: dict[str, int]
    provenance: dict[str, Any]
