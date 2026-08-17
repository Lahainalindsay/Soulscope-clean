from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..database import SupabaseRpc
from .models import EvidenceLedger


@dataclass(frozen=True)
class EvidenceWriter:
    rpc: SupabaseRpc

    def create_evidence_ledger(self, ledger: EvidenceLedger, idempotency_key: str) -> dict[str, Any]:
        return self.rpc.call_rpc(
            "create_evidence_ledger",
            {
                "p_measurement_record_id": ledger.measurement_record_id,
                "p_idempotency_key": idempotency_key,
                "p_evidence_engine_version": ledger.evidence_engine_version,
                "p_evidence_rule_version": ledger.evidence_rule_version,
                "p_evidence_registry_version": ledger.evidence_registry_version,
                "p_ledger_schema_version": ledger.ledger_schema_version,
                "p_entries": list(ledger.entries),
                "p_status_counts": ledger.status_counts,
                "p_provenance": ledger.provenance,
            },
        )
