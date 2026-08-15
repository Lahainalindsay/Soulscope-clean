from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from ..auth import ServiceAuth
from ..logging import safe_log_context
from .engine import evaluate_evidence
from .models import MeasurementRecordInput
from .writer import EvidenceWriter

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class EvidenceService:
    supabase_url: str
    auth: ServiceAuth
    writer: EvidenceWriter

    def process_measurement_record(self, measurement_record_id: str) -> dict[str, Any]:
        record = self.load_measurement_record(measurement_record_id)
        ledger = evaluate_evidence(record)
        persisted = self.writer.create_evidence_ledger(
            ledger,
            f"evidence-ledger:{ledger.measurement_record_id}:{ledger.evidence_engine_version}:{ledger.evidence_rule_version}",
        )
        logger.info(
            "evidence_ledger_persisted",
            extra=safe_log_context(
                scan_id=ledger.scan_id,
                measurement_record_id=ledger.measurement_record_id,
                evidence_ledger_id=persisted.get("evidence_ledger_id"),
                evidence_engine_version=ledger.evidence_engine_version,
                supported_count=ledger.status_counts.get("supported"),
                unavailable_count=ledger.status_counts.get("unavailable"),
                rejected_count=ledger.status_counts.get("rejected"),
                insufficient_count=ledger.status_counts.get("insufficient"),
            ),
        )
        return persisted

    def load_measurement_record(self, measurement_record_id: str) -> MeasurementRecordInput:
        query = urlencode(
            {
                "id": f"eq.{measurement_record_id}",
                "select": "*",
                "limit": "1",
            }
        )
        request = Request(
            f"{self.supabase_url}/rest/v1/measurement_records?{query}",
            headers=self.auth.headers(),
            method="GET",
        )
        with urlopen(request, timeout=30) as response:
            rows = json.loads(response.read().decode("utf-8"))
        if not rows:
            raise RuntimeError("measurement record not found")
        return MeasurementRecordInput.from_row(rows[0])
