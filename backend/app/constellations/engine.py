from __future__ import annotations

from typing import Any

from ..config import (
    CONSTELLATION_CALIBRATION_REGISTRY_VERSION,
    CONSTELLATION_ENGINE_VERSION,
    CONSTELLATION_GEOMETRY_VERSION,
    CONSTELLATION_RESULT_SCHEMA_VERSION,
)
from .models import ConstellationResultSet, DimensionResultSetInput
from .registry import CONSTELLATION_DEFINITIONS


def evaluate_constellations(dimension_result: Any) -> ConstellationResultSet:
    """Evaluate only structural readiness for Constellation inference.

    No geometry or State selection is produced until every required Dimension
    has a validated score. This is intentionally a hard downstream gate.
    """
    dimensions = DimensionResultSetInput.from_result(dimension_result)
    by_id = {dimension.dimension_id: dimension for dimension in dimensions.dimensions}

    constellations = tuple(
        _evaluate_constellation(definition, by_id)
        for definition in CONSTELLATION_DEFINITIONS
    )

    status_counts = {
        "unresolved": sum(item["resolutionStatus"] == "UNRESOLVED" for item in constellations),
        "resolved": 0,
        "boundary_blend": 0,
        "invalid": sum(item["resolutionStatus"] == "INVALID" for item in constellations),
    }

    return ConstellationResultSet(
        evidence_ledger_id=dimensions.evidence_ledger_id,
        scan_id=dimensions.scan_id,
        processing_run_id=dimensions.processing_run_id,
        measurement_record_id=dimensions.measurement_record_id,
        constellation_engine_version=CONSTELLATION_ENGINE_VERSION,
        constellation_result_schema_version=CONSTELLATION_RESULT_SCHEMA_VERSION,
        constellation_geometry_version=CONSTELLATION_GEOMETRY_VERSION,
        constellation_calibration_registry_version=CONSTELLATION_CALIBRATION_REGISTRY_VERSION,
        status="unresolved_abstained",
        constellations=constellations,
        status_counts=status_counts,
        provenance={
            "source": "dimension_result_set",
            "dimension_result_status": dimensions.status,
            "dimension_engine_version": dimensions.dimension_engine_version,
            "dimension_registry_version": dimensions.dimension_registry_version,
            "dimension_scoring_version": dimensions.dimension_scoring_version,
            "constellation_geometry_version": CONSTELLATION_GEOMETRY_VERSION,
            "constellation_calibration_registry_version": CONSTELLATION_CALIBRATION_REGISTRY_VERSION,
            "geometry_scoring_permitted": False,
            "state_selection_permitted": False,
            "boundary_blend_permitted": False,
            "raw_audio_consumed": False,
            "evidence_ledger_consumed_directly": False,
            "pattern_generated": False,
            "narrative_generated": False,
        },
    )


def _evaluate_constellation(definition: Any, dimensions: dict[str, Any]) -> dict[str, Any]:
    points: list[dict[str, Any]] = []
    blockers: set[str] = set()

    for dimension_id in definition.dimension_ids:
        dimension = dimensions.get(dimension_id)
        if dimension is None:
            blockers.add(f"REQUIRED_DIMENSION_MISSING:{dimension_id}")
            points.append(
                {
                    "dimensionId": dimension_id,
                    "pointStatus": "MISSING",
                    "resolutionStatus": "UNRESOLVED",
                    "reason": "REQUIRED_DIMENSION_MISSING",
                }
            )
            continue

        point = {
            "dimensionId": dimension.dimension_id,
            "pointStatus": "RESOLVED" if _dimension_is_geometry_ready(dimension) else "UNRESOLVED",
            "resolutionStatus": dimension.resolution_status,
            "reason": _dimension_readiness_reason(dimension),
            "scoreProduced": dimension.score_produced,
            "confidenceProduced": dimension.confidence_produced,
            "calibrationStatus": dimension.calibration_status,
        }
        points.append(point)

        if point["pointStatus"] != "RESOLVED":
            blockers.add(
                f"REQUIRED_DIMENSION_NOT_GEOMETRY_READY:{dimension.dimension_id}"
            )

    return {
        "constellationId": definition.constellation_id,
        "label": definition.label,
        "questionAnswered": definition.question_answered,
        "dimensionIds": list(definition.dimension_ids),
        "stateIds": list(definition.state_ids),
        "geometryStatus": "CALIBRATION_REQUIRED",
        "resolutionStatus": "UNRESOLVED",
        "resolutionReason": "CONSTELLATION_GEOMETRY_NOT_CALIBRATED",
        "geometryProduced": False,
        "stateSelectionProduced": False,
        "boundaryBlendProduced": False,
        "posteriorMean": None,
        "posteriorLower": None,
        "posteriorUpper": None,
        "confidence": None,
        "evidenceCoverage": None,
        "points": points,
        "blockers": sorted(blockers),
        "provenance": {
            "source": "dimension_result_set",
            "constellationId": definition.constellation_id,
            "requiredDimensions": list(definition.dimension_ids),
            "candidateStates": list(definition.state_ids),
            "geometryVersion": CONSTELLATION_GEOMETRY_VERSION,
            "calibrationRegistryVersion": CONSTELLATION_CALIBRATION_REGISTRY_VERSION,
            "geometryScoringPermitted": False,
            "stateSelectionPermitted": False,
            "boundaryBlendPermitted": False,
        },
    }


def _dimension_is_geometry_ready(dimension: Any) -> bool:
    return (
        dimension.resolution_status == "RESOLVED"
        and dimension.score_produced
        and dimension.confidence_produced
        and dimension.calibration_status == "CALIBRATION_VALIDATED"
        and dimension.posterior_mean is not None
        and dimension.confidence is not None
    )


def _dimension_readiness_reason(dimension: Any) -> str:
    if dimension.calibration_status != "CALIBRATION_VALIDATED":
        return "DIMENSION_CALIBRATION_NOT_VALIDATED"
    if dimension.resolution_status != "RESOLVED":
        return f"DIMENSION_{dimension.resolution_reason}"
    if not dimension.score_produced:
        return "DIMENSION_SCORE_NOT_PRODUCED"
    if not dimension.confidence_produced:
        return "DIMENSION_CONFIDENCE_NOT_PRODUCED"
    if dimension.posterior_mean is None or dimension.confidence is None:
        return "DIMENSION_POSTERIOR_OR_CONFIDENCE_MISSING"
    return "READY"
