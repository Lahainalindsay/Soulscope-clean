"""Known-signal verification of the deployed extractor, without audio persistence."""
from __future__ import annotations

from typing import Any

import numpy as np

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
    }
    return {"status": "PASS" if all(checks.values()) else "FAIL", "checks": checks,
            "nativeMethods": pitch["nativeMethods"], "input": "SYNTHETIC_KNOWN_SIGNALS",
            "audioStored": False, "userDataAccessed": False,
            "psychologicalValidation": "NOT_ESTABLISHED"}
