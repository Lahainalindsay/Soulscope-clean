from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Literal

from ..config import (
    DIMENSION_CALIBRATION_CONTRACT_VERSION,
    DIMENSION_CALIBRATION_REGISTRY_VERSION,
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    EVIDENCE_ENGINE_VERSION,
    EVIDENCE_REGISTRY_VERSION,
    EVIDENCE_RULE_VERSION,
)
from .models import EvidenceLedgerInput
from .registry import DIMENSION_DEFINITIONS

CalibrationStatus = Literal[
    "CALIBRATION_REQUIRED",
    "CALIBRATION_DRAFT",
    "CALIBRATION_VALIDATED",
    "CALIBRATION_RETIRED",
]

CalibrationRequirementStatus = Literal["DEFINED", "PARTIALLY_DEFINED", "NOT_DEFINED"]


@dataclass(frozen=True)
class DimensionCalibrationSpec:
    calibration_id: str
    calibration_version: str
    dimension_id: str
    dimension_registry_version: str
    evidence_engine_version: str
    evidence_rule_version: str
    evidence_registry_version: str
    dimension_engine_version: str
    status: CalibrationStatus
    eligible_evidence_marker_ids: tuple[str, ...]
    required_evidence_marker_ids: tuple[str, ...]
    directionality: dict[str, Any] | None
    weights: dict[str, Any] | None
    normalization: dict[str, Any] | None
    thresholds: dict[str, Any] | None
    minimum_evidence_rule: dict[str, Any] | None
    score_range: dict[str, Any] | None
    confidence_model: dict[str, Any] | None
    posterior_model: dict[str, Any] | None
    reference_dataset: dict[str, Any] | None
    validation_criteria: dict[str, Any] | None
    validation_metrics: dict[str, Any] | None
    provenance: dict[str, Any]

    @classmethod
    def calibration_required(cls, dimension_id: str) -> DimensionCalibrationSpec:
        return cls(
            calibration_id=f"{dimension_id}:calibration-required",
            calibration_version=DIMENSION_CALIBRATION_REGISTRY_VERSION,
            dimension_id=dimension_id,
            dimension_registry_version=DIMENSION_REGISTRY_VERSION,
            evidence_engine_version=EVIDENCE_ENGINE_VERSION,
            evidence_rule_version=EVIDENCE_RULE_VERSION,
            evidence_registry_version=EVIDENCE_REGISTRY_VERSION,
            dimension_engine_version=DIMENSION_ENGINE_VERSION,
            status="CALIBRATION_REQUIRED",
            eligible_evidence_marker_ids=(),
            required_evidence_marker_ids=(),
            directionality=None,
            weights=None,
            normalization=None,
            thresholds=None,
            minimum_evidence_rule=None,
            score_range=None,
            confidence_model=None,
            posterior_model=None,
            reference_dataset=None,
            validation_criteria=None,
            validation_metrics=None,
            provenance={
                "source": "dimension_calibration_foundation",
                "contract_version": DIMENSION_CALIBRATION_CONTRACT_VERSION,
                "scientific_status": "CALIBRATION_REQUIRED",
                "note": "Canon-defined structural mappings may exist, but no repository-approved calibrated Dimension scoring specification exists.",
            },
        )


@dataclass(frozen=True)
class CalibrationGap:
    category: str
    status: CalibrationRequirementStatus
    reason: str


@dataclass(frozen=True)
class DimensionScoringEligibility:
    dimension_id: str
    calibration_id: str
    calibration_version: str
    calibration_status: CalibrationStatus
    scoring_permitted: bool
    blockers: tuple[str, ...]
    gaps: tuple[CalibrationGap, ...]
    compatible_versions: bool
    provenance: dict[str, Any]


CALIBRATION_GAP_CATEGORIES = (
    "evidence_to_dimension_mapping",
    "calibrated_scoring_mapping",
    "weights",
    "thresholds",
    "normalization",
    "score_range",
    "minimum_evidence",
    "confidence",
    "priors_posteriors",
    "reference_dataset",
    "validation_criteria",
)


CALIBRATION_REQUIRED_REGISTRY: tuple[DimensionCalibrationSpec, ...] = tuple(
    DimensionCalibrationSpec.calibration_required(definition.dimension_id) for definition in DIMENSION_DEFINITIONS
)

_BY_DIMENSION = {spec.dimension_id: spec for spec in CALIBRATION_REQUIRED_REGISTRY}


def get_calibration_spec(dimension_id: str) -> DimensionCalibrationSpec:
    try:
        return _BY_DIMENSION[dimension_id]
    except KeyError as exc:
        raise ValueError(f"unknown Dimension ID: {dimension_id}") from exc


def audit_calibration_gaps(spec: DimensionCalibrationSpec) -> tuple[CalibrationGap, ...]:
    return (
        CalibrationGap(
            "evidence_to_dimension_mapping",
            "PARTIALLY_DEFINED",
            "Canon v1.3 registries define structural Evidence-to-Dimension family and candidate-marker requirements.",
        ),
        CalibrationGap(
            "calibrated_scoring_mapping",
            "NOT_DEFINED",
            "No calibrated marker directionality, coefficients, or posterior mapping exists.",
        ),
        CalibrationGap("weights", "NOT_DEFINED" if spec.weights is None else "DEFINED", "No calibrated weights exist."),
        CalibrationGap(
            "thresholds",
            "NOT_DEFINED" if spec.thresholds is None else "DEFINED",
            "No calibrated thresholds or cutoffs exist.",
        ),
        CalibrationGap(
            "normalization",
            "NOT_DEFINED" if spec.normalization is None else "DEFINED",
            "No calibrated normalization specification exists.",
        ),
        CalibrationGap(
            "score_range",
            "NOT_DEFINED" if spec.score_range is None else "DEFINED",
            "No approved Dimension score range exists.",
        ),
        CalibrationGap(
            "minimum_evidence",
            "NOT_DEFINED" if spec.minimum_evidence_rule is None else "DEFINED",
            "No minimum evidence rule exists.",
        ),
        CalibrationGap(
            "confidence",
            "NOT_DEFINED" if spec.confidence_model is None else "DEFINED",
            "No confidence model exists.",
        ),
        CalibrationGap(
            "priors_posteriors",
            "NOT_DEFINED" if spec.posterior_model is None else "DEFINED",
            "No prior or posterior construction exists.",
        ),
        CalibrationGap(
            "reference_dataset",
            "NOT_DEFINED" if spec.reference_dataset is None else "DEFINED",
            "No calibration cohort or reference dataset exists.",
        ),
        CalibrationGap(
            "validation_criteria",
            "NOT_DEFINED" if spec.validation_criteria is None else "DEFINED",
            "No scientific acceptance or validation criteria exist.",
        ),
    )


def assess_dimension_scoring_eligibility(
    ledger: EvidenceLedgerInput,
    spec: DimensionCalibrationSpec,
) -> DimensionScoringEligibility:
    blockers: list[str] = []
    compatible_versions = True
    if ledger.evidence_engine_version != spec.evidence_engine_version:
        compatible_versions = False
        blockers.append("INCOMPATIBLE_EVIDENCE_ENGINE_VERSION")
    if ledger.evidence_rule_version != spec.evidence_rule_version:
        compatible_versions = False
        blockers.append("INCOMPATIBLE_EVIDENCE_RULE_VERSION")
    if ledger.evidence_registry_version != spec.evidence_registry_version:
        compatible_versions = False
        blockers.append("INCOMPATIBLE_EVIDENCE_REGISTRY_VERSION")
    if spec.dimension_registry_version != DIMENSION_REGISTRY_VERSION:
        compatible_versions = False
        blockers.append("INCOMPATIBLE_DIMENSION_REGISTRY_VERSION")

    gaps = audit_calibration_gaps(spec)
    if spec.status != "CALIBRATION_VALIDATED":
        blockers.append("CALIBRATION_NOT_VALIDATED")
    for gap in gaps:
        if gap.status != "DEFINED" and gap.category != "evidence_to_dimension_mapping":
            blockers.append(f"{gap.category.upper()}_NOT_DEFINED")

    if spec.required_evidence_marker_ids:
        entries_by_marker = {str(entry.get("marker_id", "")): entry for entry in ledger.entries}
        for marker_id in spec.required_evidence_marker_ids:
            entry = entries_by_marker.get(marker_id)
            if entry is None:
                blockers.append(f"REQUIRED_EVIDENCE_MISSING:{marker_id}")
            elif str(entry.get("evidence_status")) in {"unavailable", "rejected", "insufficient"}:
                blockers.append(f"REQUIRED_EVIDENCE_NOT_USABLE:{marker_id}")

    unique_blockers = tuple(sorted(set(blockers)))
    return DimensionScoringEligibility(
        dimension_id=spec.dimension_id,
        calibration_id=spec.calibration_id,
        calibration_version=spec.calibration_version,
        calibration_status=spec.status,
        scoring_permitted=compatible_versions and spec.status == "CALIBRATION_VALIDATED" and not unique_blockers,
        blockers=unique_blockers,
        gaps=gaps,
        compatible_versions=compatible_versions,
        provenance=deepcopy(spec.provenance),
    )
