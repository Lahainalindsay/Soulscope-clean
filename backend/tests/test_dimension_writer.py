from __future__ import annotations

import unittest

from app.dimensions.engine import evaluate_dimensions
from app.dimensions.writer import DimensionWriter

from .support import FakeRpc
from .test_dimension_engine import evidence_entry, ledger_with


class DimensionWriterTests(unittest.TestCase):
    def test_create_dimension_result_uses_service_rpc_payload(self) -> None:
        rpc = FakeRpc()
        result_set = evaluate_dimensions(ledger_with([evidence_entry("ev_supported", "supported")]))

        result = DimensionWriter(rpc).create_dimension_result(result_set, "dimension:key")

        self.assertEqual(result["dimension_result_id"], "dimension-result-evidence-ledger-1")
        name, payload = rpc.calls[-1]
        self.assertEqual(name, "create_dimension_result")
        self.assertEqual(payload["p_evidence_ledger_id"], "evidence-ledger-1")
        self.assertEqual(payload["p_dimensions"], list(result_set.dimensions))
        self.assertEqual(payload["p_status_counts"], result_set.status_counts)


if __name__ == "__main__":
    unittest.main()
