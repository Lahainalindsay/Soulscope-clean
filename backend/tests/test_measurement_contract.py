from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from app.acoustics.extractor import extract_measurements
from app.config import EXTRACTOR_VERSION
from app.processing.quality import evaluate_prompt_quality

from .support import fixture_path, write_wav


class MeasurementRecordV1ContractTests(unittest.TestCase):
    def test_measurements_have_units_nullability_and_provenance(self) -> None:
        result = extract_measurements(
            fixture_path("P3_FUTURE_CONTEXT.wav"),
            "capture-p3",
            "P3_FUTURE_CONTEXT",
            threshold=0.01,
        )
        measurements = result["measurements"]
        self.assertIsInstance(measurements, list)

        by_feature = {item["feature_id"]: item for item in measurements}  # type: ignore[index]
        self.assertEqual(by_feature["SS_RESPONSE_ONSET_LATENCY"]["unit"], "ms")
        self.assertEqual(by_feature["SS_PAUSE_LOAD"]["unit"], "ratio")
        self.assertEqual(by_feature["Q_CLIPPING_RATIO"]["unit"], "ratio")
        self.assertEqual(by_feature["Q_VOICED_RATIO"]["unit"], "ratio")
        self.assertEqual(by_feature["PROVISIONAL_DURATION_MS"]["unit"], "ms")
        self.assertEqual(by_feature["PROVISIONAL_RMS_ENERGY"]["unit"], "ratio")
        self.assertEqual(by_feature["PROVISIONAL_PITCH_ZCR_HZ"]["unit"], "Hz")
        self.assertEqual(by_feature["PROVISIONAL_SPECTRAL_CENTROID_HZ"]["unit"], "Hz")
        self.assertIsNone(by_feature["PROVISIONAL_FORMANT_TRACKING"]["value"])
        self.assertEqual(by_feature["PROVISIONAL_FORMANT_TRACKING"]["rejection_reason"], "CALIBRATION_REQUIRED")

        for measurement in measurements:  # type: ignore[assignment]
            self.assertEqual(measurement.get("source_capture_id"), "capture-p3")
            self.assertEqual(measurement.get("capture_kind"), "P3_FUTURE_CONTEXT")
            self.assertTrue(measurement.get("feature_version"))
            self.assertTrue(measurement.get("method"))
            if measurement.get("extractor_version") is not None:
                self.assertEqual(measurement.get("extractor_version"), EXTRACTOR_VERSION)

    def test_rejected_silence_remains_null_or_measured_not_semantic_zero(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "silent.wav"
            write_wav(path, [0.0] * 16_000)
            result = extract_measurements(path, "capture-silent", "P1_OPEN_REFERENCE", threshold=0.01)
            quality = evaluate_prompt_quality(
                result,
                type(
                    "Settings",
                    (),
                    {
                        "max_duration_seconds": 90.0,
                        "min_speech_ratio": 0.05,
                        "clipping_ratio_threshold": 0.01,
                        "silence_rms_threshold": 0.01,
                    },
                )(),
            )

        self.assertEqual(quality.status, "rejected")
        self.assertIn("NO_SPEECH_OR_MOSTLY_SILENCE", quality.rejection_reasons)
        formant = next(
            item for item in result["measurements"] if item["feature_id"] == "PROVISIONAL_FORMANT_TRACKING"  # type: ignore[index]
        )
        self.assertIsNone(formant["value"])  # type: ignore[index]

    def test_extractor_version_can_change_without_mutating_prior_payload(self) -> None:
        result = extract_measurements(
            fixture_path("P1_OPEN_REFERENCE.wav"),
            "capture-p1",
            "P1_OPEN_REFERENCE",
            threshold=0.01,
        )
        original_versions = [
            item.get("extractor_version") for item in result["measurements"] if isinstance(item, dict)
        ]
        copied_versions = list(original_versions)
        self.assertEqual(original_versions, copied_versions)
        self.assertIn(EXTRACTOR_VERSION, copied_versions)


if __name__ == "__main__":
    unittest.main()
