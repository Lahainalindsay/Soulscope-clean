from __future__ import annotations

import unittest
from dataclasses import replace

from app.config import (
    DIMENSION_CALIBRATION_CONTRACT_VERSION,
    DIMENSION_CALIBRATION_REGISTRY_VERSION,
    DIMENSION_ENGINE_VERSION,
    DIMENSION_REGISTRY_VERSION,
    EVIDENCE_ENGINE_VERSION,
    EVIDENCE_REGISTRY_VERSION,
    EVIDENCE_RULE_VERSION,
)
from app.dimensions.calibration import (
    CALIBRATION_GAP_CATEGORIES,
    CALIBRATION_REQUIRED_REGISTRY,
    DimensionCalibrationSpec,
    assess_dimension_scoring_eligibility,
    audit_calibration_gaps,
    get_calibration_spec,
)
from app.dimensions.registry import DIMENSION_DEFINITIONS

from .test_dimension_engine import evidence_entry, ledger_with


class DimensionCalibrationTests(unittest.TestCase):
    def test_registry_contains_one_calibration_required_spec_per_dimension(self) -> None:
        self.assertEqual(
            [spec.dimension_id for spec in CALIBRATION_REQUIRED_REGISTRY],
            [definition.dimension_id for definition in DIMENSION_DEFINITIONS],
        )
        self.assertTrue(all(spec.status == "CALIBRATION_REQUIRED" for spec in CALIBRATION_REQUIRED_REGISTRY))
        self.assertTrue(
            all(spec.calibration_version == DIMENSION_CALIBRATION_REGISTRY_VERSION for spec in CALIBRATION_REQUIRED_REGISTRY)
        )

    def test_unknown_dimension_rejected(self) -> None:
        with self.assertRaises(ValueError):
            get_calibration_spec("BAD-P1")

    def test_missing_calibration_blocks_scoring_with_exact_gaps(self) -> None:
        ledger = ledger_with([evidence_entry("ev_supported", "supported")])
        spec = get_calibration_spec("COG-P1")

        eligibility = assess_dimension_scoring_eligibility(ledger, spec)

        self.assertFalse(eligibility.scoring_permitted)
        self.assertIn("CALIBRATION_NOT_VALIDATED", eligibility.blockers)
        self.assertNotIn("EVIDENCE_TO_DIMENSION_MAPPING_NOT_DEFINED", eligibility.blockers)
        self.assertIn("CALIBRATED_SCORING_MAPPING_NOT_DEFINED", eligibility.blockers)
        self.assertEqual([gap.category for gap in eligibility.gaps], list(CALIBRATION_GAP_CATEGORIES))
        gaps = {gap.category: gap for gap in eligibility.gaps}
        self.assertEqual(gaps["evidence_to_dimension_mapping"].status, "PARTIALLY_DEFINED")
        self.assertEqual(gaps["calibrated_scoring_mapping"].status, "NOT_DEFINED")

    def test_incompatible_evidence_versions_block_scoring(self) -> None:
        row_ledger = ledger_with([evidence_entry("ev_supported", "supported")])
        incompatible = replace(row_ledger, evidence_engine_version="future-evidence-engine")

        eligibility = assess_dimension_scoring_eligibility(incompatible, get_calibration_spec("COG-P1"))

        self.assertFalse(eligibility.compatible_versions)
        self.assertIn("INCOMPATIBLE_EVIDENCE_ENGINE_VERSION", eligibility.blockers)

    def test_incomplete_calibration_reports_missing_weights_normalization_and_confidence(self) -> None:
        spec = DimensionCalibrationSpec.calibration_required("COG-P1")
        gaps = {gap.category: gap for gap in audit_calibration_gaps(spec)}

        self.assertEqual(gaps["weights"].status, "NOT_DEFINED")
        self.assertEqual(gaps["normalization"].status, "NOT_DEFINED")
        self.assertEqual(gaps["confidence"].status, "NOT_DEFINED")
        self.assertEqual(gaps["priors_posteriors"].status, "NOT_DEFINED")

    def test_declared_versions_are_deterministic_and_compatible_with_current_stack(self) -> None:
        spec = get_calibration_spec("COG-P1")

        self.assertEqual(spec.dimension_registry_version, DIMENSION_REGISTRY_VERSION)
        self.assertEqual(spec.dimension_engine_version, DIMENSION_ENGINE_VERSION)
        self.assertEqual(spec.evidence_engine_version, EVIDENCE_ENGINE_VERSION)
        self.assertEqual(spec.evidence_rule_version, EVIDENCE_RULE_VERSION)
        self.assertEqual(spec.evidence_registry_version, EVIDENCE_REGISTRY_VERSION)
        self.assertEqual(spec.provenance["contract_version"], DIMENSION_CALIBRATION_CONTRACT_VERSION)

    def test_eligibility_does_not_mutate_spec_or_ledger(self) -> None:
        ledger = ledger_with([evidence_entry("ev_supported", "supported")])
        spec = get_calibration_spec("COG-P1")
        before_spec = spec
        before_ledger = ledger

        assess_dimension_scoring_eligibility(ledger, spec)

        self.assertEqual(spec, before_spec)
        self.assertEqual(ledger, before_ledger)


if __name__ == "__main__":
    unittest.main()
