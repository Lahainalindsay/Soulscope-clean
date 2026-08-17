from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from ..auth import ServiceAuth
from ..logging import safe_log_context
from .engine import evaluate_dimensions
from .models import EvidenceLedgerInput
from .writer import DimensionWriter

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class DimensionService:
    supabase_url: str
    auth: ServiceAuth
    writer: DimensionWriter

    def process_evidence_ledger(self, evidence_ledger_id: str) -> dict[str, Any]:
        ledger = self.load_evidence_ledger(evidence_ledger_id)
        result = evaluate_dimensions(ledger)
        persisted = self.writer.create_dimension_result(
            result,
            f"dimension-result:{result.evidence_ledger_id}:{result.dimension_engine_version}:{result.dimension_scoring_version}",
        )
        logger.info(
            "dimension_result_persisted",
            extra=safe_log_context(
                scan_id=result.scan_id,
                evidence_ledger_id=result.evidence_ledger_id,
                dimension_result_id=persisted.get("dimension_result_id"),
                dimension_engine_version=result.dimension_engine_version,
                result_status=result.status,
                score_produced=False,
                abstention_reason="CALIBRATION_REQUIRED",
            ),
        )
        return persisted

    def load_evidence_ledger(self, evidence_ledger_id: str) -> EvidenceLedgerInput:
        query = urlencode({"id": f"eq.{evidence_ledger_id}", "select": "*", "limit": "1"})
        request = Request(
            f"{self.supabase_url}/rest/v1/evidence_ledgers?{query}",
            headers=self.auth.headers(),
            method="GET",
        )
        with urlopen(request, timeout=30) as response:
            rows = json.loads(response.read().decode("utf-8"))
        if not rows:
            raise RuntimeError("evidence ledger not found")
        return EvidenceLedgerInput.from_row(rows[0])
