"""Known-signal verification of the deployed extractor, without audio persistence."""
from __future__ import annotations

from typing import Any

import numpy as np
from scipy.signal import lfilter

from .frame_analysis import analyze_frames, summarize_speech_segments


def verify_measurement_runtime() -> dict[str, Any]:
    sr = 16000
    time = np.arange(sr*2)/sr
    harmonic = (.08*np.sin(2*np.pi*180*time) + .2*np.sin(2*np.pi*360*time)).tolist()
    pitch = analyze_frames(harmonic, sr)
    step = np.concatenate((.2*np.sin(2*np.pi*300*time[:sr]),
                           .2*np.sin(2*np.pi*3000*time[:sr]))).tolist()
    spectrum = analyze_frames(step, sr)
    silence = analyze_frames([0.0]*sr, sr)
    _, pauses, speech = summarize_speech_segments([False, True, False, True, False], 2400, sr, 480)
    f0 = pitch["values"]["F0_MEDIAN"]
    centroid = spectrum["values"]["SPECTRAL_CENTROID"]
    # Known all-pole resonances test Burg estimates without person/emotion labels.
    denominator = np.array([1.0])
    expected_formants = (500.0, 1500.0, 2500.0)
    for frequency, bandwidth in zip(expected_formants, (50.0, 80.0, 100.0)):
        radius = np.exp(-np.pi*bandwidth/sr)
        denominator = np.convolve(denominator, [1, -2*radius*np.cos(2*np.pi*frequency/sr), radius**2])
    pulses = np.zeros(sr*2)
    pulses[::160] = 1.0
    vowel = lfilter([1.0], denominator, pulses)
    vowel = .2*vowel/np.max(np.abs(vowel))
    formants = analyze_frames(vowel.tolist(), sr)
    formant_values = [formants["values"][f"F{n}_MEDIAN"] for n in (1, 2, 3)]
    checks = {
        "native_praat_present": pitch["nativeMethods"].get("praat") == "0.4.6",
        "native_vad_present": pitch["nativeMethods"].get("vad") == "webrtcvad-2.0.14-mode2-no-energy-fallback",
        "tracked_fundamental_not_loudest_harmonic": f0 is not None and abs(f0-180) < 2,
        "voiced_hnr_available": pitch["values"]["HNR_MEAN"] is not None,
        "whole_response_spectrum_above_1khz": centroid is not None and 1400 < centroid < 1900,
        "silent_pitch_missing": silence["values"]["F0_MEDIAN"] is None,
        "silent_spectrum_missing": silence["values"]["SPECTRAL_CENTROID"] is None,
        "connected_speech_cycle_metrics_ineligible": pitch["values"]["JITTER_LOCAL"] is None and
            pitch["reasons"].get("JITTER_LOCAL") == "TASK_INELIGIBLE_CONNECTED_SPEECH",
        "internal_pause_excludes_edges": pauses == [30] and speech == 60,
        "known_resonance_formant_candidates": all(value is not None and abs(value-expected)<200
            for value, expected in zip(formant_values, expected_formants)),
    }
    return {"status": "PASS" if all(checks.values()) else "FAIL", "checks": checks,
            "nativeMethods": pitch["nativeMethods"], "input": "SYNTHETIC_KNOWN_SIGNALS",
            "audioStored": False, "userDataAccessed": False,
            "psychologicalValidation": "NOT_ESTABLISHED",
            "syntheticDiagnostics": {"trackedF0Hz": f0, "formantCandidatesHz": formant_values}}
