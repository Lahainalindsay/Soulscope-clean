from __future__ import annotations

import unittest
from copy import deepcopy

from app.config import (
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    DIMENSION_RESULT_SCHEMA_VERSION,
    DIMENSION_SCORING_VERSION,
)
from app.dimensions.engine import evaluate_dimensions
from app.dimensions.models import EvidenceLedgerInput
from app.dimensions.registry import DIMENSION_DEFINITIONS


def evidence_entry(evidence_id: str, status: str) -> dict[str, object]:
    return {
        "evidence_id": evidence_id,
        "evidence_status": status,
        "marker_id": "OUTPUT_CONTINUITY",
        "source_measurement_ids": ["measurement-1"] if status == "supported" else [],
        "source_feature_families": ["DYN"],
    }


def ledger_with(entries: list[dict[str, object]]) -> EvidenceLedgerInput:
    counts = {key: 0 for key in ("supported", "contradicted", "unavailable", "rejected", "insufficient")}
    for entry in entries:
        counts[str(entry["evidence_status"])] += 1
    return EvidenceLedgerInput.from_row(
        {
            "id": "evidence-ledger-1",
            "scan_id": "scan-1",
            "processing_run_id": "run-1",
            "measurement_record_id": "measurement-record-1",
            "ledger_schema_version": "0.1",
            "evidence_engine_version": "soulscope-evidence-engine-0.1.0",
            "evidence_rule_version": "evidence-structural-v1",
            "evidence_registry_version": "0.1",
            "status": "complete",
            "entries": entries,
            "status_counts": counts,
            "provenance": {"source": "measurement_record", "raw_audio_consumed": False},
        }
    )


class DimensionEngineTests(unittest.TestCase):
    def test_deterministic_output_for_same_evidence_ledger_and_versions(self) -> None:
        ledger = ledger_with([evidence_entry("ev_supported", "supported")])

        first = evaluate_dimensions(ledger)
        second = evaluate_dimensions(ledger)

        self.assertEqual(first.dimensions, second.dimensions)
        self.assertEqual(first.status_counts, second.status_counts)
        self.assertEqual(first.dimension_engine_version, DIMENSION_ENGINE_VERSION)
        self.assertEqual(first.dimension_registry_version, DIMENSION_REGISTRY_VERSION)
        self.assertEqual(first.dimension_scoring_version, DIMENSION_SCORING_VERSION)
        self.assertEqual(first.result_schema_version, DIMENSION_RESULT_SCHEMA_VERSION)

    def test_canonical_dimension_enumeration_only(self) -> None:
        result = evaluate_dimensions(ledger_with([]))

        self.assertEqual([item["dimensionId"] for item in result.dimensions], [d.dimension_id for d in DIMENSION_DEFINITIONS])
        self.assertEqual(len(result.dimensions), 16)

    def test_missing_evidence_does_not_become_score_zero(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_missing", "unavailable")]))
        dimension = result.dimensions[0]

        self.assertEqual(dimension["resolutionStatus"], "UNRESOLVED")
        self.assertIsNone(dimension["posteriorMean"])
        self.assertIsNone(dimension["confidence"])
        self.assertIn("ev_missing", dimension["unavailableEvidenceIds"])

    def test_rejected_evidence_remains_rejected_not_negative_score(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_rejected", "rejected")]))
        dimension = result.dimensions[0]

        self.assertIsNone(dimension["posteriorMean"])
        self.assertEqual(dimension["contradictedEvidenceIds"], [])
        self.assertIn("ev_rejected", dimension["rejectedEvidenceIds"])

    def test_insufficient_and_contradicted_evidence_are_distinct(self) -> None:
        result = evaluate_dimensions(
            ledger_with(
                [
                    evidence_entry("ev_insufficient", "insufficient"),
                    evidence_entry("ev_contradicted", "contradicted"),
                ]
            )
        )
        dimension = result.dimensions[0]

        self.assertIn("ev_insufficient", dimension["insufficientEvidenceIds"])
        self.assertIn("ev_contradicted", dimension["contradictedEvidenceIds"])
        self.assertIsNone(dimension["confidence"])

    def test_mixed_evidence_is_preserved_in_qualification_summary(self) -> None:
        result = evaluate_dimensions(
            ledger_with(
                [
                    evidence_entry("ev_supported", "supported"),
                    evidence_entry("ev_unavailable", "unavailable"),
                    evidence_entry("ev_rejected", "rejected"),
                    evidence_entry("ev_insufficient", "insufficient"),
                ]
            )
        )
        dimension = result.dimensions[0]

        self.assertEqual(dimension["evidenceStatusCounts"]["supported"], 1)
        self.assertEqual(dimension["evidenceStatusCounts"]["unavailable"], 1)
        self.assertEqual(dimension["evidenceStatusCounts"]["rejected"], 1)
        self.assertEqual(dimension["evidenceStatusCounts"]["insufficient"], 1)

    def test_d3_hard_abstentions_are_preserved(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_supported", "supported")]))
        by_id = {item["dimensionId"]: item for item in result.dimensions}

        self.assertEqual(by_id["REG-P4"]["resolutionReason"], "NO_RECOVERY_COMPATIBLE_CONDITION")
        self.assertEqual(by_id["CAP-P2"]["resolutionReason"], "NO_RESERVE_COMPATIBLE_LOAD_PROTOCOL")
        self.assertEqual(by_id["EXP-P4"]["resolutionReason"], "NO_RELATIONAL_OBSERVATION")

    def test_non_d3_dimensions_abstain_because_scoring_is_not_calibrated(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_supported", "supported")]))
        dimension = next(item for item in result.dimensions if item["dimensionId"] == "COG-P1")

        self.assertEqual(dimension["resolutionReason"], "CONSTRUCT_MODEL_NOT_VALIDATED")
        self.assertEqual(dimension["dimensionScoringVersion"], "CALIBRATION_REQUIRED")
        self.assertEqual(dimension["calibrationStatus"], "CALIBRATION_REQUIRED")
        self.assertFalse(dimension["scoreProduced"])
        self.assertFalse(dimension["scoringPermitted"])
        self.assertIn("CALIBRATION_NOT_VALIDATED", dimension["scoringBlockers"])
        self.assertIn("EVIDENCE_TO_DIMENSION_MAPPING_NOT_DEFINED", dimension["scoringBlockers"])

    def test_all_dimensions_remain_unscored_when_calibration_is_required(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_supported", "supported")]))

        self.assertEqual(len(result.dimensions), 16)
        for dimension in result.dimensions:
            self.assertEqual(dimension["resolutionStatus"], "UNRESOLVED")
            self.assertIsNone(dimension["posteriorMean"])
            self.assertIsNone(dimension["posteriorLower"])
            self.assertIsNone(dimension["posteriorUpper"])
            self.assertIsNone(dimension["confidence"])
            self.assertFalse(dimension["scoreProduced"])
            self.assertFalse(dimension["confidenceProduced"])
            self.assertFalse(dimension["scoringPermitted"])
            self.assertIn("CALIBRATION_NOT_VALIDATED", dimension["scoringBlockers"])
            self.assertTrue(dimension["calibrationGaps"])

    def test_provenance_references_evidence_ledger_and_versions(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_supported", "supported")]))
        dimension = result.dimensions[0]

        self.assertEqual(dimension["provenance"]["evidenceLedgerId"], "evidence-ledger-1")
        self.assertEqual(dimension["provenance"]["dimensionEngineVersion"], DIMENSION_ENGINE_VERSION)
        self.assertFalse(dimension["provenance"]["scoringEligibility"]["permitted"])
        self.assertEqual(result.provenance["raw_audio_consumed"], False)
        self.assertEqual(result.provenance["measurement_record_consumed_directly"], False)

    def test_dimension_engine_does_not_mutate_evidence_input(self) -> None:
        ledger = ledger_with([evidence_entry("ev_supported", "supported")])
        before = deepcopy(ledger)

        evaluate_dimensions(ledger)

        self.assertEqual(ledger, before)

    def test_ordering_is_deterministic(self) -> None:
        result = evaluate_dimensions(ledger_with([evidence_entry("ev_supported", "supported")]))
        orders = [item["order"] for item in result.dimensions]

        self.assertEqual(orders, sorted(orders))


if __name__ == "__main__":
    unittest.main()
