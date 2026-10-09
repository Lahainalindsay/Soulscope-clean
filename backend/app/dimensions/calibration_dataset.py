from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..config import (
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    EVIDENCE_ENGINE_VERSION,
    EVIDENCE_REGISTRY_VERSION,
    EVIDENCE_RULE_VERSION,
)

CALIBRATION_DATASET_MANIFEST_VERSION = "0.1"


@dataclass(frozen=True)
class CalibrationDatasetEligibility:
    eligible: bool
    blockers: tuple[str, ...]


def assess_calibration_dataset_row(
    *,
    scan_lifecycle_state: str,
    measurement_status: str | None,
    semantic_eligibility: bool | None,
    evidence_status: str | None,
    dimension_status: str | None,
    evidence_engine_version: str | None,
    evidence_rule_version: str | None,
    evidence_registry_version: str | None,
    dimension_engine_version: str | None,
    dimension_registry_version: str | None,
) -> CalibrationDatasetEligibility:
    """Gate rows for research export without changing production inference."""
    blockers: list[str] = []
    if scan_lifecycle_state != "finalized":
        blockers.append("SCAN_NOT_FINALIZED")
    if measurement_status != "qualified":
        blockers.append("MEASUREMENT_NOT_QUALIFIED")
    if semantic_eligibility is not True:
        blockers.append("SEMANTIC_NOT_ELIGIBLE")
    if evidence_status != "complete":
        blockers.append("EVIDENCE_NOT_COMPLETE")
    if dimension_status not in {"unresolved_abstained", "complete"}:
        blockers.append("DIMENSION_RESULT_NOT_COMPLETE")

    expected = {
        "evidence_engine_version": EVIDENCE_ENGINE_VERSION,
        "evidence_rule_version": EVIDENCE_RULE_VERSION,
        "evidence_registry_version": EVIDENCE_REGISTRY_VERSION,
        "dimension_engine_version": DIMENSION_ENGINE_VERSION,
        "dimension_registry_version": DIMENSION_REGISTRY_VERSION,
    }
    actual = {
        "evidence_engine_version": evidence_engine_version,
        "evidence_rule_version": evidence_rule_version,
        "evidence_registry_version": evidence_registry_version,
        "dimension_engine_version": dimension_engine_version,
        "dimension_registry_version": dimension_registry_version,
    }
    for key, expected_value in expected.items():
        if actual[key] != expected_value:
            blockers.append(f"INCOMPATIBLE_{key.upper()}")

    unique = tuple(sorted(set(blockers)))
    return CalibrationDatasetEligibility(eligible=not unique, blockers=unique)


def build_calibration_dataset_manifest(
    *,
    dataset_id: str,
    rows: list[dict[str, Any]],
    inclusion_policy_version: str = "calibration-dataset-inclusion-v0.1",
) -> dict[str, Any]:
    """Create a provenance manifest only; never creates labels or scores."""
    participant_ids = sorted({str(row["participant_id"]) for row in rows if row.get("participant_id")})
    scan_ids = sorted({str(row["scan_id"]) for row in rows if row.get("scan_id")})
    return {
        "manifestVersion": CALIBRATION_DATASET_MANIFEST_VERSION,
        "datasetId": dataset_id,
        "scientificStatus": "RESEARCH_ONLY_UNVALIDATED",
        "productionScoringAuthorized": False,
        "labelsGenerated": False,
        "inclusionPolicyVersion": inclusion_policy_version,
        "participantCount": len(participant_ids),
        "scanCount": len(scan_ids),
        "participantIds": participant_ids,
        "scanIds": scan_ids,
        "participantSplitPolicy": "PARTICIPANT_SEPARATED_REQUIRED",
        "requiredSplits": ["train", "calibration", "final_evaluation"],
        "versionContract": {
            "evidenceEngineVersion": EVIDENCE_ENGINE_VERSION,
            "evidenceRuleVersion": EVIDENCE_RULE_VERSION,
            "evidenceRegistryVersion": EVIDENCE_REGISTRY_VERSION,
            "dimensionEngineVersion": DIMENSION_ENGINE_VERSION,
            "dimensionRegistryVersion": DIMENSION_REGISTRY_VERSION,
        },
        "provenancePolicy": "SOURCE_MEASUREMENT_TO_EVIDENCE_TO_DIMENSION_REQUIRED",
        "missingnessPolicy": "PRESERVE_DISTINCT_STATUSES",
        "notes": [
            "This manifest is a research dataset boundary, not a scoring model.",
            "No acoustic feature is interpreted as emotion, diagnosis, personality, deception, identity, or hidden state.",
            "D3 dimensions remain protocol-unobservable under the active three-prompt protocol.",
        ],
    }
