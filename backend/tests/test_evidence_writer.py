from __future__ import annotations

import unittest

from app.evidence.engine import evaluate_evidence
from app.evidence.writer import EvidenceWriter

from .support import FakeRpc
from .test_evidence_engine import measurement, record_with


class EvidenceWriterTests(unittest.TestCase):
    def test_create_evidence_ledger_uses_service_rpc_payload(self) -> None:
        rpc = FakeRpc()
        ledger = evaluate_evidence(record_with([measurement("AC_RMS_ENERGY", 0.12)]))

        result = EvidenceWriter(rpc).create_evidence_ledger(ledger, "evidence:key")

        self.assertEqual(result["evidence_ledger_id"], "evidence-ledger-measurement-record-1")
        name, payload = rpc.calls[-1]
        self.assertEqual(name, "create_evidence_ledger")
        self.assertEqual(payload["p_measurement_record_id"], "measurement-record-1")
        self.assertEqual(payload["p_entries"], list(ledger.entries))
        self.assertEqual(payload["p_status_counts"], ledger.status_counts)


if __name__ == "__main__":
    unittest.main()
