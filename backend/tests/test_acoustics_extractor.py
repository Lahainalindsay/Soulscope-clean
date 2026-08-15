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
        self.assertIn("AC_DURATION_MS", feature_ids)
        self.assertIn("AC_RMS_ENERGY", feature_ids)
        self.assertIn("AC_SPEECH_RATIO", feature_ids)
        self.assertIn("AC_PITCH_ZCR_HZ", feature_ids)
        self.assertIn("AC_FORMANT_TRACKING", feature_ids)

        formant = next(
            item for item in first["measurements"] if item["feature_id"] == "AC_FORMANT_TRACKING"  # type: ignore[index]
        )
        self.assertIsNone(formant["value"])  # type: ignore[index]
        self.assertEqual(formant["rejection_reason"], "CALIBRATION_REQUIRED")  # type: ignore[index]

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
