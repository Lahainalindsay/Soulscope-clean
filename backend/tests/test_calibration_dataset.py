from __future__ import annotations

import unittest

from app.config import (
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    EVIDENCE_ENGINE_VERSION,
    EVIDENCE_REGISTRY_VERSION,
    EVIDENCE_RULE_VERSION,
)
from app.dimensions.calibration_dataset import (
    assess_calibration_dataset_row,
    build_calibration_dataset_manifest,
)


def eligible_kwargs() -> dict[str, object]:
    return {
        "scan_lifecycle_state": "finalized",
        "measurement_status": "qualified",
        "semantic_eligibility": True,
        "evidence_status": "complete",
        "dimension_status": "unresolved_abstained",
        "evidence_engine_version": EVIDENCE_ENGINE_VERSION,
        "evidence_rule_version": EVIDENCE_RULE_VERSION,
        "evidence_registry_version": EVIDENCE_REGISTRY_VERSION,
        "dimension_engine_version": DIMENSION_ENGINE_VERSION,
        "dimension_registry_version": DIMENSION_REGISTRY_VERSION,
    }


class CalibrationDatasetTests(unittest.TestCase):
    def test_current_finalized_row_can_enter_research_dataset(self) -> None:
        result = assess_calibration_dataset_row(**eligible_kwargs())
        self.assertTrue(result.eligible)
        self.assertEqual(result.blockers, ())

    def test_deleted_or_old_version_rows_are_blocked(self) -> None:
        kwargs = eligible_kwargs()
        kwargs["scan_lifecycle_state"] = "deleted"
        kwargs["evidence_engine_version"] = "legacy"
        result = assess_calibration_dataset_row(**kwargs)
        self.assertFalse(result.eligible)
        self.assertIn("SCAN_NOT_FINALIZED", result.blockers)
        self.assertIn("INCOMPATIBLE_EVIDENCE_ENGINE_VERSION", result.blockers)

    def test_manifest_is_explicitly_non_production_and_participant_separated(self) -> None:
        manifest = build_calibration_dataset_manifest(
            dataset_id="cal-v0",
            rows=[
                {"participant_id": "p1", "scan_id": "s1"},
                {"participant_id": "p1", "scan_id": "s2"},
                {"participant_id": "p2", "scan_id": "s3"},
            ],
        )
        self.assertEqual(manifest["participantCount"], 2)
        self.assertEqual(manifest["scanCount"], 3)
        self.assertFalse(manifest["productionScoringAuthorized"])
        self.assertFalse(manifest["labelsGenerated"])
        self.assertEqual(manifest["participantSplitPolicy"], "PARTICIPANT_SEPARATED_REQUIRED")


if __name__ == "__main__":
    unittest.main()
