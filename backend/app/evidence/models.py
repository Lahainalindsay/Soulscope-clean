from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Literal

EvidenceStatus = Literal["supported", "contradicted", "unavailable", "rejected", "insufficient"]


@dataclass(frozen=True)
class MeasurementInput:
    measurement_id: str
    feature_id: str
    feature_version: str
    value: int | float | str | bool | None
    unit: str | None
    method: str | None
    source_capture_id: str
    capture_kind: str
    segment_start_ms: int | float | None
    segment_end_ms: int | float | None
    quality: str | None
    confidence: int | float | None
    rejection_reason: str | None
    extractor: str | None
    extractor_version: str | None
    parameters: dict[str, Any]
    device_metadata: dict[str, Any]


@dataclass(frozen=True)
class MeasurementRecordInput:
    measurement_record_id: str
    scan_id: str
    processing_run_id: str
    measurement_schema_version: str
    protocol_version: str
    extractor_version: str
    quality_rules_version: str
    measurement_status: str
    prompt_measurements: list[dict[str, Any]]
    prompt_contrasts: list[dict[str, Any]]
    quality_summary: dict[str, Any]
    extractor_provenance: dict[str, Any]
    semantic_eligibility: bool
    renderer_eligibility: bool
    created_at: str | None = None

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> MeasurementRecordInput:
        return cls(
            measurement_record_id=str(row["id"]),
            scan_id=str(row["scan_id"]),
            processing_run_id=str(row["processing_run_id"]),
            measurement_schema_version=str(row["measurement_schema_version"]),
            protocol_version=str(row["protocol_version"]),
            extractor_version=str(row["extractor_version"]),
            quality_rules_version=str(row["quality_rules_version"]),
            measurement_status=str(row["measurement_status"]),
            prompt_measurements=deepcopy(list(row["prompt_measurements"])),
            prompt_contrasts=deepcopy(list(row["prompt_contrasts"])),
            quality_summary=deepcopy(dict(row["quality_summary"])),
            extractor_provenance=deepcopy(dict(row["extractor_provenance"])),
            semantic_eligibility=bool(row["semantic_eligibility"]),
            renderer_eligibility=bool(row["renderer_eligibility"]),
            created_at=None if row.get("created_at") is None else str(row["created_at"]),
        )


@dataclass(frozen=True)
class EvidenceLedger:
    measurement_record_id: str
    scan_id: str
    processing_run_id: str
    evidence_engine_version: str
    evidence_rule_version: str
    evidence_registry_version: str
    ledger_schema_version: str
    entries: tuple[dict[str, Any], ...]
    status_counts: dict[str, int]
    provenance: dict[str, Any]
