from __future__ import annotations

from copy import deepcopy
from typing import Any

from ..config import (
    DIMENSION_CALIBRATION_REGISTRY_VERSION,
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    DIMENSION_RESULT_SCHEMA_VERSION,
    DIMENSION_SCORING_VERSION,
)
from ..evidence.registry import marker_family
from .calibration import assess_dimension_scoring_eligibility, get_calibration_spec
from .models import DimensionResultSet, EvidenceLedgerInput
from .registry import D3_ABSTENTION_REASONS, DIMENSION_DEFINITIONS, DimensionDefinition


def evaluate_dimensions(ledger: EvidenceLedgerInput) -> DimensionResultSet:
    evidence_summary = _summarize_evidence(ledger.entries)
    dimensions = tuple(_dimension_result(definition, ledger, evidence_summary) for definition in DIMENSION_DEFINITIONS)
    status_counts = {"unresolved": len(dimensions), "resolved": 0, "invalid": 0}
    return DimensionResultSet(
        evidence_ledger_id=ledger.evidence_ledger_id,
        scan_id=ledger.scan_id,
        processing_run_id=ledger.processing_run_id,
        measurement_record_id=ledger.measurement_record_id,
        dimension_engine_version=DIMENSION_ENGINE_VERSION,
        dimension_registry_version=DIMENSION_REGISTRY_VERSION,
        dimension_scoring_version=DIMENSION_SCORING_VERSION,
        result_schema_version=DIMENSION_RESULT_SCHEMA_VERSION,
        status="unresolved_abstained",
        dimensions=dimensions,
        status_counts=status_counts,
        provenance={
            "source": "evidence_ledger",
            "evidence_ledger_id": ledger.evidence_ledger_id,
            "measurement_record_id": ledger.measurement_record_id,
            "evidence_engine_version": ledger.evidence_engine_version,
            "evidence_rule_version": ledger.evidence_rule_version,
            "evidence_registry_version": ledger.evidence_registry_version,
            "dimension_registry_version": DIMENSION_REGISTRY_VERSION,
            "dimension_calibration_registry_version": DIMENSION_CALIBRATION_REGISTRY_VERSION,
            "dimension_scoring_version": DIMENSION_SCORING_VERSION,
            "scoring_calibration_status": "CALIBRATION_REQUIRED",
            "raw_audio_consumed": False,
            "measurement_record_consumed_directly": False,
            "downstream_state_generated": False,
            "downstream_pattern_generated": False,
            "narrative_generated": False,
            "resonance_generated": False,
        },
    )


def _dimension_result(
    definition: DimensionDefinition,
    ledger: EvidenceLedgerInput,
    evidence_summary: dict[str, Any],
) -> dict[str, Any]:
    d3_reason = D3_ABSTENTION_REASONS.get(definition.dimension_id)
    calibration_spec = get_calibration_spec(definition.dimension_id)
    eligibility = assess_dimension_scoring_eligibility(ledger, calibration_spec)
    structural = _assess_structural_eligibility(definition, ledger.entries)
    reason = d3_reason or "CONSTRUCT_MODEL_NOT_VALIDATED"
    all_evidence_ids = evidence_summary["all_evidence_ids"]
    return {
        "dimensionId": definition.dimension_id,
        "label": definition.label,
        "constellationId": definition.constellation_id,
        "order": definition.order,
        "scientificClass": definition.scientific_class,
        "dimensionVersion": DIMENSION_REGISTRY_VERSION,
        "dimensionEngineVersion": DIMENSION_ENGINE_VERSION,
        "dimensionCalibrationVersion": calibration_spec.calibration_version,
        "dimensionScoringVersion": DIMENSION_SCORING_VERSION,
        "calibrationStatus": eligibility.calibration_status,
        "structuralMappingStatus": "STRUCTURAL_MAPPING_DEFINED",
        "structuralEligibility": structural["eligible"],
        "structuralEligibilityReason": structural["reason"],
        "requiredEvidenceFamilies": list(definition.required_evidence_families),
        "optionalEvidenceFamilies": list(definition.optional_evidence_families),
        "candidateEvidenceMarkerIds": list(definition.candidate_marker_ids),
        "requiredEvidenceMarkerIds": list(definition.required_marker_ids),
        "minimumIndependentFamilies": definition.minimum_independent_families,
        "qualifiedEvidenceFamilies": structural["qualified_families"],
        "missingRequiredEvidenceFamilies": structural["missing_required_families"],
        "familyQualification": structural["family_qualification"],
        "requiredPromptScopes": list(definition.required_prompt_scopes),
        "structuralPrerequisites": list(definition.structural_prerequisites),
        "resolutionStatus": "UNRESOLVED",
        "resolutionReason": reason,
        "posteriorMean": None,
        "posteriorLower": None,
        "posteriorUpper": None,
        "confidence": None,
        "evidenceCoverage": None,
        "baselineTrust": None,
        "contradiction": None,
        "coherence": None,
        "momentum": None,
        "scoreProduced": False,
        "confidenceProduced": False,
        "scoringPermitted": eligibility.scoring_permitted,
        "scoringBlockers": list(eligibility.blockers),
        "calibrationGaps": [
            {"category": gap.category, "status": gap.status, "reason": gap.reason}
            for gap in eligibility.gaps
        ],
        "relevantEvidenceIds": structural["relevant_evidence_ids"],
        "ignoredEvidenceIds": sorted(set(all_evidence_ids) - set(structural["relevant_evidence_ids"])),
        "ignoredEvidenceReason": "NOT_A_CANDIDATE_FOR_THIS_DIMENSION_OR_SCORING_CALIBRATION_REQUIRED",
        "evidenceStatusCounts": deepcopy(evidence_summary["status_counts"]),
        "supportedEvidenceIds": evidence_summary["supported_evidence_ids"],
        "contradictedEvidenceIds": evidence_summary["contradicted_evidence_ids"],
        "unavailableEvidenceIds": evidence_summary["unavailable_evidence_ids"],
        "rejectedEvidenceIds": evidence_summary["rejected_evidence_ids"],
        "insufficientEvidenceIds": evidence_summary["insufficient_evidence_ids"],
        "provenance": {
            "evidenceLedgerId": ledger.evidence_ledger_id,
            "evidenceEngineVersion": ledger.evidence_engine_version,
            "dimensionRegistryVersion": DIMENSION_REGISTRY_VERSION,
            "dimensionCalibrationVersion": calibration_spec.calibration_version,
            "dimensionEngineVersion": DIMENSION_ENGINE_VERSION,
            "scoringVersion": DIMENSION_SCORING_VERSION,
            "scoringEligibility": {
                "permitted": eligibility.scoring_permitted,
                "blockers": list(eligibility.blockers),
                "compatibleVersions": eligibility.compatible_versions,
            },
            "structuralEligibility": structural,
            "reason": reason,
        },
    }


def _summarize_evidence(entries: tuple[dict[str, Any], ...]) -> dict[str, Any]:
    by_status: dict[str, list[str]] = {
        "supported": [],
        "contradicted": [],
        "unavailable": [],
        "rejected": [],
        "insufficient": [],
    }
    all_ids: list[str] = []
    for entry in entries:
        evidence_id = str(entry.get("evidence_id", ""))
        if not evidence_id:
            continue
        all_ids.append(evidence_id)
        status = str(entry.get("evidence_status", "unavailable"))
        if status in by_status:
            by_status[status].append(evidence_id)
    return {
        "all_evidence_ids": sorted(all_ids),
        "status_counts": {status: len(ids) for status, ids in by_status.items()},
        "supported_evidence_ids": sorted(by_status["supported"]),
        "contradicted_evidence_ids": sorted(by_status["contradicted"]),
        "unavailable_evidence_ids": sorted(by_status["unavailable"]),
        "rejected_evidence_ids": sorted(by_status["rejected"]),
        "insufficient_evidence_ids": sorted(by_status["insufficient"]),
    }


def _assess_structural_eligibility(
    definition: DimensionDefinition,
    entries: tuple[dict[str, Any], ...],
) -> dict[str, Any]:
    if definition.dimension_id in D3_ABSTENTION_REASONS:
        return {
            "eligible": False,
            "reason": "PROTOCOL_UNOBSERVABLE",
            "qualified_families": [],
            "missing_required_families": [],
            "family_qualification": {},
            "relevant_evidence_ids": [],
        }

    candidate_ids = set(definition.candidate_marker_ids) | set(definition.required_marker_ids)
    relevant_entries = [entry for entry in entries if str(entry.get("marker_id")) in candidate_ids]
    supported_entries = [entry for entry in relevant_entries if entry.get("evidence_status") == "supported"]
    family_qualification = _family_qualification(relevant_entries)
    qualified_families = sorted(
        family for family, state in family_qualification.items() if state["qualification_status"] == "QUALIFIED"
    )
    missing_required_families = [
        family for family in definition.required_evidence_families if family not in qualified_families
    ]
    missing_required_markers = [
        marker_id
        for marker_id in definition.required_marker_ids
        if not any(entry.get("marker_id") == marker_id and entry.get("evidence_status") == "supported" for entry in relevant_entries)
    ]

    minimum = definition.minimum_independent_families
    enough_families = minimum is None or len(qualified_families) >= minimum
    required_families_present = not missing_required_families
    required_markers_present = not missing_required_markers
    enough_markers = len(supported_entries) >= 2 or definition.scientific_class.startswith("D2")
    eligible = enough_families and required_families_present and required_markers_present and enough_markers

    if eligible:
        reason = "STRUCTURAL_EVIDENCE_REQUIREMENTS_MET"
    elif missing_required_families:
        reason = "MISSING_REQUIRED_EVIDENCE_FAMILY"
    elif missing_required_markers:
        reason = "MISSING_REQUIRED_EVIDENCE_MARKER"
    elif not enough_families:
        reason = "INSUFFICIENT_INDEPENDENT_EVIDENCE_FAMILIES"
    else:
        reason = "INSUFFICIENT_COMPATIBLE_EVIDENCE_MARKERS"

    return {
        "eligible": eligible,
        "reason": reason,
        "qualified_families": qualified_families,
        "missing_required_families": missing_required_families,
        "missing_required_markers": missing_required_markers,
        "family_qualification": family_qualification,
        "relevant_evidence_ids": sorted(str(entry.get("evidence_id")) for entry in relevant_entries if entry.get("evidence_id")),
    }


def _family_qualification(entries: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    families: dict[str, dict[str, Any]] = {}
    for entry in entries:
        marker_id = str(entry.get("marker_id", ""))
        family = marker_family(marker_id)
        if family is None:
            continue
        summary = families.setdefault(
            family,
            {
                "qualified_marker_ids": [],
                "rejected_marker_ids": [],
                "missing_marker_ids": [],
                "insufficient_marker_ids": [],
                "qualification_status": "MISSING",
            },
        )
        status = str(entry.get("evidence_status"))
        if status == "supported":
            summary["qualified_marker_ids"].append(marker_id)
        elif status == "rejected":
            summary["rejected_marker_ids"].append(marker_id)
        elif status == "insufficient":
            summary["insufficient_marker_ids"].append(marker_id)
        else:
            summary["missing_marker_ids"].append(marker_id)

    for summary in families.values():
        for key in ("qualified_marker_ids", "rejected_marker_ids", "missing_marker_ids", "insufficient_marker_ids"):
            summary[key] = sorted(set(summary[key]))
        if summary["qualified_marker_ids"]:
            summary["qualification_status"] = "QUALIFIED"
        elif summary["rejected_marker_ids"]:
            summary["qualification_status"] = "REJECTED"
        elif summary["insufficient_marker_ids"]:
            summary["qualification_status"] = "INSUFFICIENT"
        else:
            summary["qualification_status"] = "MISSING"
    return families
