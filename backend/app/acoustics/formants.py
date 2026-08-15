from __future__ import annotations


def formant_measurements_unavailable() -> dict[str, object]:
    return {
        "feature_id": "AC_FORMANT_TRACKING",
        "value": None,
        "unit": None,
        "method": "PRAAT_PARSELmouth_DEFERRED",
        "rejection_reason": "CALIBRATION_REQUIRED",
    }
