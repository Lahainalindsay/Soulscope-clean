from __future__ import annotations

from copy import deepcopy
from dataclasses import dataclass
from typing import Any, Literal

DimensionResultStatus = Literal["unresolved", "abstained", "invalid"]


@dataclass(frozen=True)
class EvidenceLedgerInput:
    evidence_ledger_id: str
    scan_id: str
    processing_run_id: str
    measurement_record_id: str
    ledger_schema_version: str
    evidence_engine_version: str
    evidence_rule_version: str
    evidence_registry_version: str
    status: str
    entries: tuple[dict[str, Any], ...]
    status_counts: dict[str, int]
    provenance: dict[str, Any]
    created_at: str | None = None

    @classmethod
    def from_row(cls, row: dict[str, Any]) -> EvidenceLedgerInput:
        return cls(
            evidence_ledger_id=str(row["id"]),
            scan_id=str(row["scan_id"]),
            processing_run_id=str(row["processing_run_id"]),
            measurement_record_id=str(row["measurement_record_id"]),
            ledger_schema_version=str(row["ledger_schema_version"]),
            evidence_engine_version=str(row["evidence_engine_version"]),
            evidence_rule_version=str(row["evidence_rule_version"]),
            evidence_registry_version=str(row["evidence_registry_version"]),
            status=str(row["status"]),
            entries=tuple(deepcopy(list(row["entries"]))),
            status_counts={str(key): int(value) for key, value in dict(row["status_counts"]).items()},
            provenance=deepcopy(dict(row["provenance"])),
            created_at=None if row.get("created_at") is None else str(row["created_at"]),
        )


@dataclass(frozen=True)
class DimensionResultSet:
    evidence_ledger_id: str
    scan_id: str
    processing_run_id: str
    measurement_record_id: str
    dimension_engine_version: str
    dimension_registry_version: str
    dimension_scoring_version: str
    result_schema_version: str
    status: str
    dimensions: tuple[dict[str, Any], ...]
    status_counts: dict[str, int]
    provenance: dict[str, Any]
