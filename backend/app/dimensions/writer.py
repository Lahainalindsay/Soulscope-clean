from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..database import SupabaseRpc
from .models import DimensionResultSet


@dataclass(frozen=True)
class DimensionWriter:
    rpc: SupabaseRpc

    def create_dimension_result(self, result: DimensionResultSet, idempotency_key: str) -> dict[str, Any]:
        return self.rpc.call_rpc(
            "create_dimension_result",
            {
                "p_evidence_ledger_id": result.evidence_ledger_id,
                "p_idempotency_key": idempotency_key,
                "p_dimension_engine_version": result.dimension_engine_version,
                "p_dimension_registry_version": result.dimension_registry_version,
                "p_dimension_scoring_version": result.dimension_scoring_version,
                "p_result_schema_version": result.result_schema_version,
                "p_dimensions": list(result.dimensions),
                "p_status_counts": result.status_counts,
                "p_provenance": result.provenance,
            },
        )
