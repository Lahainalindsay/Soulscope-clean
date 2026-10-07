from __future__ import annotations

import unittest

from app.config import (
    CONSTELLATION_CALIBRATION_REGISTRY_VERSION,
    CONSTELLATION_ENGINE_VERSION,
    CONSTELLATION_GEOMETRY_VERSION,
    CONSTELLATION_RESULT_SCHEMA_VERSION,
)
from app.constellations.engine import evaluate_constellations
from app.dimensions.engine import evaluate_dimensions
from app.dimensions.models import EvidenceLedgerInput
from app.config import EVIDENCE_ENGINE_VERSION, EVIDENCE_RULE_VERSION


def empty_ledger() -> EvidenceLedgerInput:
    return EvidenceLedgerInput.from_row(
        {
            "id": "evidence-ledger-1",
            "scan_id": "scan-1",
            "processing_run_id": "run-1",
            "measurement_record_id": "measurement-record-1",
            "ledger_schema_version": "0.1",
            "evidence_engine_version": EVIDENCE_ENGINE_VERSION,
            "evidence_rule_version": EVIDENCE_RULE_VERSION,
            "evidence_registry_version": "0.1",
            "status": "complete",
            "entries": [],
            "status_counts": {
                "supported": 0,
                "contradicted": 0,
                "unavailable": 0,
                "rejected": 0,
                "insufficient": 0,
            },
            "provenance": {"source": "measurement_record", "raw_audio_consumed": False},
        }
    )


class ConstellationEngineTests(unittest.TestCase):
    def test_enumerates_exactly_four_canonical_constellations(self) -> None:
        dimensions = evaluate_dimensions(empty_ledger())
        result = evaluate_constellations(dimensions)

        self.assertEqual([item["constellationId"] for item in result.constellations], ["COG", "REG", "CAP", "EXP"])
        self.assertEqual(len(result.constellations), 4)

    def test_all_constellations_abstain_when_dimensions_are_uncalibrated(self) -> None:
        result = evaluate_constellations(evaluate_dimensions(empty_ledger()))

        for constellation in result.constellations:
            self.assertEqual(constellation["resolutionStatus"], "UNRESOLVED")
            self.assertEqual(constellation["geometryStatus"], "CALIBRATION_REQUIRED")
            self.assertFalse(constellation["geometryProduced"])
            self.assertFalse(constellation["stateSelectionProduced"])
            self.assertFalse(constellation["boundaryBlendProduced"])
            self.assertIsNone(constellation["confidence"])
            self.assertTrue(constellation["blockers"])

    def test_no_state_selection_can_bypass_dimension_calibration(self) -> None:
        result = evaluate_constellations(evaluate_dimensions(empty_ledger()))

        for constellation in result.constellations:
            self.assertEqual(constellation["stateIds"], [f"{constellation['constellationId']}-S01", f"{constellation['constellationId']}-S02"])
            self.assertFalse(constellation["stateSelectionProduced"])
            self.assertIn("CONSTELLATION_GEOMETRY_NOT_CALIBRATED", constellation["resolutionReason"])

    def test_provenance_records_hard_downstream_gates(self) -> None:
        result = evaluate_constellations(evaluate_dimensions(empty_ledger()))

        self.assertEqual(result.constellation_engine_version, CONSTELLATION_ENGINE_VERSION)
        self.assertEqual(result.constellation_result_schema_version, CONSTELLATION_RESULT_SCHEMA_VERSION)
        self.assertEqual(result.constellation_geometry_version, CONSTELLATION_GEOMETRY_VERSION)
        self.assertEqual(result.constellation_calibration_registry_version, CONSTELLATION_CALIBRATION_REGISTRY_VERSION)
        self.assertFalse(result.provenance["geometry_scoring_permitted"])
        self.assertFalse(result.provenance["state_selection_permitted"])
        self.assertFalse(result.provenance["boundary_blend_permitted"])

    def test_constellation_does_not_consume_raw_audio_or_mutate_dimensions(self) -> None:
        dimensions = evaluate_dimensions(empty_ledger())
        before = tuple(dict(item) for item in dimensions.dimensions)

        evaluate_constellations(dimensions)

        self.assertEqual([dict(item) for item in dimensions.dimensions], list(before))
