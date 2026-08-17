from __future__ import annotations

import unittest

from app.acoustics.extractor import extract_measurements

from .support import fixture_path


class AcousticExtractorTests(unittest.TestCase):
    def test_fixture_measurements_are_deterministic_and_descriptive(self) -> None:
        first = extract_measurements(
            fixture_path("P1_OPEN_REFERENCE.wav"),
            "capture-p1",
            "P1_OPEN_REFERENCE",
            threshold=0.01,
        )
        second = extract_measurements(
            fixture_path("P1_OPEN_REFERENCE.wav"),
            "capture-p1",
            "P1_OPEN_REFERENCE",
            threshold=0.01,
        )

        self.assertEqual(first, second)
        feature_ids = {item["feature_id"] for item in first["measurements"]}  # type: ignore[index]
        self.assertIn("SS_RESPONSE_ONSET_LATENCY", feature_ids)
        self.assertIn("SS_PAUSE_LOAD", feature_ids)
        self.assertIn("Q_CLIPPING_RATIO", feature_ids)
        self.assertIn("Q_VOICED_RATIO", feature_ids)
        self.assertIn("PROVISIONAL_DURATION_MS", feature_ids)
        self.assertIn("PROVISIONAL_RMS_ENERGY", feature_ids)
        self.assertIn("PROVISIONAL_PITCH_ZCR_HZ", feature_ids)
        self.assertIn("PROVISIONAL_FORMANT_TRACKING", feature_ids)
        self.assertNotIn("AC_DURATION_MS", feature_ids)
        self.assertNotIn("AC_RMS_ENERGY", feature_ids)

        formant = next(
            item for item in first["measurements"] if item["feature_id"] == "PROVISIONAL_FORMANT_TRACKING"  # type: ignore[index]
        )
        self.assertIsNone(formant["value"])  # type: ignore[index]
        self.assertEqual(formant["rejection_reason"], "CALIBRATION_REQUIRED")  # type: ignore[index]

        canonical = [
            item for item in first["measurements"] if item.get("feature_registry_version") == "0.1"  # type: ignore[union-attr]
        ]
        provisional = [
            item
            for item in first["measurements"]
            if item.get("feature_registry_version") == "PROVISIONAL_NON_CANONICAL"  # type: ignore[union-attr]
        ]
        self.assertTrue(canonical)
        self.assertTrue(provisional)
        self.assertTrue(all(str(item["feature_id"]).startswith(("SS_", "Q_")) for item in canonical))  # type: ignore[index]
        self.assertTrue(all(str(item["feature_id"]).startswith("PROVISIONAL_") for item in provisional))  # type: ignore[index]

    def test_missing_values_remain_null_not_zero(self) -> None:
        result = extract_measurements(
            fixture_path("P2_TROUBLING_CONTEXT.wav"),
            "capture-p2",
            "P2_TROUBLING_CONTEXT",
            threshold=0.01,
        )
        missing = [item for item in result["measurements"] if item.get("value") is None]  # type: ignore[union-attr]
        self.assertTrue(missing)
        self.assertTrue(all(item.get("value") is None for item in missing))


if __name__ == "__main__":
    unittest.main()
