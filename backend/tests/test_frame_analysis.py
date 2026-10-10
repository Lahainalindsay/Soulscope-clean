from __future__ import annotations

import importlib.util
import json
import math
import unittest
from pathlib import Path
from unittest.mock import patch

import numpy as np

from app.acoustics.extractor import extract_measurements
from app.acoustics.frame_analysis import analyze_frames, summarize_speech_segments
from app.acoustics.profile import FEATURES
from app.acoustics.verification import verify_measurement_runtime
from app.acoustics.registry import assert_known_runtime_feature, provisional_parameter
from app.evidence.engine import evaluate_evidence
from app.evidence.models import MeasurementRecordInput

from .support import fixture_path

SR = 16000
NATIVE = all(importlib.util.find_spec(name) for name in ("parselmouth", "webrtcvad"))


def tone(frequency: float, seconds: float = 2, amplitude: float = .2) -> list[float]:
    return (amplitude * np.sin(2 * np.pi * frequency * np.arange(round(SR * seconds))/SR)).tolist()


class FullResponseMeasurementTests(unittest.TestCase):
    def test_spectrum_covers_late_audio_and_frequencies_above_1khz(self) -> None:
        signal = tone(300, 1) + tone(3000, 1)
        result = analyze_frames(signal, SR)
        self.assertGreater(result["values"]["SPECTRAL_CENTROID"], 1400)
        self.assertLess(result["values"]["SPECTRAL_CENTROID"], 1900)
        self.assertGreater(result["support"]["SPECTRAL_CENTROID"]["validFrameCount"], 90)
        self.assertGreater(result["values"]["SPECTRAL_ROLLOFF85"], 1400)

    def test_known_frequency_gain_and_noise_behave_as_measurements(self) -> None:
        first = analyze_frames(tone(1000, amplitude=.2), SR)
        lower = analyze_frames(tone(1000, amplitude=.02), SR)
        self.assertAlmostEqual(first["values"]["SPECTRAL_CENTROID"], 1000, delta=10)
        self.assertAlmostEqual(first["values"]["SPECTRAL_CENTROID"], lower["values"]["SPECTRAL_CENTROID"], delta=.01)
        self.assertAlmostEqual(first["values"]["RMS_DBFS_MEAN"] - lower["values"]["RMS_DBFS_MEAN"], 20, delta=.01)
        noise = np.random.default_rng(12).normal(0, .1, SR*2).tolist()
        noisy = analyze_frames(noise, SR)
        self.assertGreater(noisy["values"]["SPECTRAL_FLATNESS"], first["values"]["SPECTRAL_FLATNESS"])
        self.assertGreater(noisy["values"]["SPECTRAL_FLUX"], first["values"]["SPECTRAL_FLUX"])

    def test_silence_empty_and_connected_speech_do_not_become_neutral_inference(self) -> None:
        for samples in ([], [0.0]*SR):
            result = analyze_frames(samples, SR)
            for name in ("F0_MEDIAN", "SPECTRAL_CENTROID", "HNR_MEAN", "CPP_PROXY"):
                self.assertIsNone(result["values"][name])
            for feature in FEATURES:
                if feature.method == "sustained_vowel_only" and samples:
                    self.assertIsNone(result["values"][feature.name])
                    self.assertEqual(result["reasons"][feature.name], "TASK_INELIGIBLE_CONNECTED_SPEECH")
            self.assertTrue(all(value is None or math.isfinite(value) for value in result["values"].values()))
            json.dumps(result, allow_nan=False)

    def test_internal_pauses_exclude_leading_and_trailing_silence(self) -> None:
        segments, pauses, speech_ms = summarize_speech_segments(
            [False, False, True, True, False, True, False], 3360, SR, 480)
        self.assertEqual([s["kind"] for s in segments],
                         ["leading_silence", "speech", "internal_pause", "speech", "trailing_silence"])
        self.assertEqual(pauses, [30])
        self.assertEqual(speech_ms, 90)
        self.assertEqual(segments[-1]["end_ms"], 210)

    def test_native_failure_is_explicit_without_energy_fallback(self) -> None:
        with patch("app.acoustics.frame_analysis.importlib.import_module", side_effect=ImportError):
            result = analyze_frames(tone(200), SR)
        self.assertIsNone(result["values"]["F0_MEDIAN"])
        self.assertIsNone(result["values"]["SPEECH_RATIO"])
        self.assertEqual(result["reasons"]["F0_MEDIAN"], "NATIVE_DEPENDENCY_UNAVAILABLE")
        self.assertEqual(result["segments"], [])
        self.assertIsNotNone(result["values"]["SPECTRAL_CENTROID"])

    def test_profile_and_contract_membership_match_without_canonical_promotion(self) -> None:
        source = (Path(__file__).parents[2]/"packages/canonical-contracts/src/acousticProfile.ts").read_text()
        for feature in FEATURES:
            self.assertIn('"id": "'+feature.feature_id+'"', source)
            parameter = provisional_parameter(feature.feature_id)
            self.assertIsNotNone(parameter)
            self.assertFalse(parameter.semantic_use)
            self.assertFalse(parameter.renderer_use)
            assert_known_runtime_feature(feature.feature_id, "PROVISIONAL_NON_CANONICAL")
            with self.assertRaises(ValueError):
                assert_known_runtime_feature(feature.feature_id, "0.1")

    def test_new_profile_does_not_change_existing_scientific_evidence(self) -> None:
        prompt = extract_measurements(fixture_path("P1_OPEN_REFERENCE.wav"), "capture", "P1_OPEN_REFERENCE", .01)
        fields = dict(measurement_record_id="record", scan_id="scan", processing_run_id="run",
                      measurement_schema_version="0.1", protocol_version="1.3", extractor_version="test",
                      quality_rules_version="0.1", measurement_status="qualified", prompt_contrasts=[],
                      quality_summary={}, extractor_provenance={}, semantic_eligibility=True, renderer_eligibility=True)
        richer = evaluate_evidence(MeasurementRecordInput(prompt_measurements=[prompt], **fields))
        legacy = {**prompt, "measurements": [m for m in prompt["measurements"]
                                            if not m["feature_id"].startswith("PROVISIONAL_FRAME_")]}
        previous = evaluate_evidence(MeasurementRecordInput(prompt_measurements=[legacy], **fields))
        self.assertEqual(richer, previous)

    def test_deployment_verification_does_not_claim_success_without_native_libraries(self) -> None:
        with patch("app.acoustics.frame_analysis.importlib.import_module", side_effect=ImportError):
            proof = verify_measurement_runtime()
        self.assertEqual(proof["status"], "FAIL")
        self.assertFalse(proof["audioStored"])
        self.assertFalse(proof["userDataAccessed"])
        self.assertEqual(proof["psychologicalValidation"], "NOT_ESTABLISHED")

    @unittest.skipUnless(NATIVE, "Native dependencies unavailable in this environment; required on CI/deployment")
    def test_native_f0_tracks_fundamental_in_harmonic_signal(self) -> None:
        t = np.arange(SR*2)/SR
        signal = (.08*np.sin(2*np.pi*180*t) + .2*np.sin(2*np.pi*360*t)).tolist()
        result = analyze_frames(signal, SR)
        self.assertAlmostEqual(result["values"]["F0_MEDIAN"], 180, delta=2)
        self.assertGreater(result["values"]["F0_VALID_RATIO"], .9)
        self.assertIsNotNone(result["values"]["HNR_MEAN"])
        self.assertEqual(result["nativeMethods"]["praat"], "0.4.6")
        self.assertNotIn("fallback", result["nativeMethods"]["vad"])
        self.assertEqual(verify_measurement_runtime()["status"], "PASS")
