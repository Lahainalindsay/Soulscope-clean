from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..auth import ServiceAuth
from ..database import SupabaseRpc
from ..dimensions.service import DimensionService
from ..dimensions.writer import DimensionWriter
from ..evidence.service import EvidenceService
from ..evidence.writer import EvidenceWriter


@dataclass(frozen=True)
class ResultService:
    supabase_url: str
    auth: ServiceAuth
    rpc: SupabaseRpc

    def finalize_dimensions(self, dimension_result_id: str) -> dict[str, Any]:
        # SQL loads and validates the immutable chain. No score/state/text payload
        # can enter through this boundary. Locking and lifecycle are atomic there.
        return self.rpc.call_rpc(
            "finalize_canonical_result", {"p_dimension_result_id": dimension_result_id}
        )

    def complete_measurement(self, measurement_record_id: str) -> dict[str, Any]:
        evidence = EvidenceService(self.supabase_url, self.auth, EvidenceWriter(self.rpc))
        dimensions = DimensionService(self.supabase_url, self.auth, DimensionWriter(self.rpc))
        ledger = evidence.process_measurement_record(measurement_record_id)
        result = dimensions.process_evidence_ledger(str(ledger["evidence_ledger_id"]))
        return self.finalize_dimensions(str(result["dimension_result_id"]))
