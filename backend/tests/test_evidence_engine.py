from __future__ import annotations

import unittest
from copy import deepcopy

from app.config import (
    EVIDENCE_ENGINE_VERSION,
    EVIDENCE_LEDGER_SCHEMA_VERSION,
    EVIDENCE_REGISTRY_VERSION,
    EVIDENCE_RULE_VERSION,
)
from app.evidence.engine import evaluate_evidence
from app.evidence.models import MeasurementRecordInput


def measurement(feature_id: str, value: object, quality: str = "descriptive", reason: str | None = None) -> dict[str, object]:
    return {
        "feature_id": feature_id,
        "feature_version": "0.1",
        "value": value,
        "unit": "ratio",
        "method": "fixture",
        "source_capture_id": "capture-p1",
        "capture_kind": "P1_OPEN_REFERENCE",
        "segment_start_ms": 0,
        "segment_end_ms": None,
        "quality": quality,
        "confidence": None,
        "rejection_reason": reason,
        "extractor": "soulscope_measurement_worker",
        "extractor_version": "extractor-test",
        "parameters": {},
        "device_metadata": {},
    }


def record_with(measurements: list[dict[str, object]]) -> MeasurementRecordInput:
    return MeasurementRecordInput.from_row(
        {
            "id": "measurement-record-1",
            "scan_id": "scan-1",
            "processing_run_id": "run-1",
            "measurement_schema_version": "0.1",
            "protocol_version": "1.3",
            "extractor_version": "extractor-test",
            "quality_rules_version": "0.1",
            "measurement_status": "qualified",
            "prompt_measurements": [
                {
                    "promptId": "P1_OPEN_REFERENCE",
                    "captureId": "capture-p1",
                    "measurements": measurements,
                }
            ],
            "prompt_contrasts": [],
            "quality_summary": {"status": "qualified"},
            "extractor_provenance": {"extractor": "fixture"},
            "semantic_eligibility": True,
            "renderer_eligibility": True,
        }
    )


class EvidenceEngineTests(unittest.TestCase):
    def test_deterministic_output_for_same_measurement_record_and_versions(self) -> None:
        record = record_with([measurement("AC_RMS_ENERGY", 0.12)])

        first = evaluate_evidence(record)
        second = evaluate_evidence(record)

        self.assertEqual(first.entries, second.entries)
        self.assertEqual(first.status_counts, second.status_counts)
        self.assertEqual(first.evidence_engine_version, EVIDENCE_ENGINE_VERSION)
        self.assertEqual(first.evidence_rule_version, EVIDENCE_RULE_VERSION)
        self.assertEqual(first.evidence_registry_version, EVIDENCE_REGISTRY_VERSION)
        self.assertEqual(first.ledger_schema_version, EVIDENCE_LEDGER_SCHEMA_VERSION)

    def test_available_valid_measurement_is_structural_support_not_semantic_claim(self) -> None:
        ledger = evaluate_evidence(record_with([measurement("AC_RMS_ENERGY", 0.12)]))
        entry = next(
            item
            for item in ledger.entries
            if item["source_feature_id"] == "AC_RMS_ENERGY" and item["prompt_scope"] == ["P1_OPEN_REFERENCE"]
        )

        self.assertEqual(entry["evidence_status"], "supported")
        self.assertEqual(entry["direction"], "NONE")
        self.assertEqual(entry["supporting_components"], ["AC_RMS_ENERGY"])
        self.assertEqual(entry["contradicting_components"], [])
        self.assertNotIn("emotion", str(entry).lower())

    def test_missing_measurement_is_explicit_unavailable_and_not_zero(self) -> None:
        ledger = evaluate_evidence(record_with([]))
        entry = next(
            item
            for item in ledger.entries
            if item["prompt_scope"] == ["P1_OPEN_REFERENCE"] and item["source_feature_id"] == "AC_RMS_ENERGY"
        )

        self.assertEqual(entry["evidence_status"], "unavailable")
        self.assertIsNone(entry["value"])
        self.assertIn("AC_RMS_ENERGY", entry["missing_components"])

    def test_rejected_null_measurement_remains_rejected(self) -> None:
        ledger = evaluate_evidence(
            record_with([measurement("AC_FORMANT_TRACKING", None, "not_available", "CALIBRATION_REQUIRED")])
        )
        entry = next(
            item
            for item in ledger.entries
            if item["source_feature_id"] == "AC_FORMANT_TRACKING" and item["prompt_scope"] == ["P1_OPEN_REFERENCE"]
        )

        self.assertEqual(entry["evidence_status"], "rejected")
        self.assertEqual(entry["resolution_reason"], "QUALITY_GATE_FAILED")
        self.assertIn("AC_FORMANT_TRACKING", entry["rejected_components"])

    def test_null_without_rejection_is_unavailable(self) -> None:
        ledger = evaluate_evidence(record_with([measurement("AC_PITCH_ZCR_HZ", None)]))
        entry = next(
            item
            for item in ledger.entries
            if item["source_feature_id"] == "AC_PITCH_ZCR_HZ" and item["prompt_scope"] == ["P1_OPEN_REFERENCE"]
        )

        self.assertEqual(entry["evidence_status"], "unavailable")
        self.assertEqual(entry["resolution_reason"], "MISSING_REQUIRED_EVIDENCE")

    def test_poor_quality_is_insufficient_not_contradicted(self) -> None:
        ledger = evaluate_evidence(record_with([measurement("AC_CLIPPING_RATIO", 0.2, "limited")]))
        entry = next(
            item
            for item in ledger.entries
            if item["source_feature_id"] == "AC_CLIPPING_RATIO" and item["prompt_scope"] == ["P1_OPEN_REFERENCE"]
        )

        self.assertEqual(entry["evidence_status"], "insufficient")
        self.assertEqual(entry["contradicting_components"], [])

    def test_mixed_inputs_preserve_each_input_state(self) -> None:
        ledger = evaluate_evidence(
            record_with(
                [
                    measurement("AC_RMS_ENERGY", 0.12),
                    measurement("AC_FORMANT_TRACKING", None, "not_available", "CALIBRATION_REQUIRED"),
                    measurement("AC_CLIPPING_RATIO", 0.2, "limited"),
                ]
            )
        )

        self.assertGreaterEqual(ledger.status_counts["supported"], 1)
        self.assertGreaterEqual(ledger.status_counts["rejected"], 1)
        self.assertGreaterEqual(ledger.status_counts["insufficient"], 1)
        self.assertGreaterEqual(ledger.status_counts["unavailable"], 1)

    def test_provenance_references_source_measurement_identity_and_versions(self) -> None:
        ledger = evaluate_evidence(record_with([measurement("AC_RMS_ENERGY", 0.12)]))
        entry = next(
            item
            for item in ledger.entries
            if item["source_feature_id"] == "AC_RMS_ENERGY" and item["prompt_scope"] == ["P1_OPEN_REFERENCE"]
        )

        self.assertEqual(entry["provenance"]["measurement_record_id"], "measurement-record-1")
        self.assertEqual(entry["provenance"]["processing_run_id"], "run-1")
        self.assertEqual(entry["provenance"]["raw_audio_consumed"], False)
        self.assertEqual(entry["version"]["evidenceRegistry"], "0.1")
        self.assertTrue(entry["source_measurement_ids"])

    def test_evaluation_does_not_mutate_measurement_record_input(self) -> None:
        record = record_with([measurement("AC_RMS_ENERGY", 0.12)])
        before = deepcopy(record)

        evaluate_evidence(record)

        self.assertEqual(record, before)

    def test_output_ordering_is_deterministic(self) -> None:
        ledger = evaluate_evidence(
            record_with(
                [
                    measurement("AC_SPEECH_RATIO", 0.8),
                    measurement("AC_RMS_ENERGY", 0.12),
                    measurement("AC_DURATION_MS", 1000),
                ]
            )
        )
        evidence_ids = [entry["evidence_id"] for entry in ledger.entries]

        self.assertEqual(evidence_ids, sorted(evidence_ids))


if __name__ == "__main__":
    unittest.main()
