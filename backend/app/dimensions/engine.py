from __future__ import annotations

from copy import deepcopy
from typing import Any

from ..config import (
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    DIMENSION_RESULT_SCHEMA_VERSION,
    DIMENSION_SCORING_VERSION,
)
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
        "dimensionScoringVersion": DIMENSION_SCORING_VERSION,
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
        "relevantEvidenceIds": [],
        "ignoredEvidenceIds": all_evidence_ids,
        "ignoredEvidenceReason": "NO_CALIBRATED_DIMENSION_EVIDENCE_MAPPING",
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
            "dimensionEngineVersion": DIMENSION_ENGINE_VERSION,
            "scoringVersion": DIMENSION_SCORING_VERSION,
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
