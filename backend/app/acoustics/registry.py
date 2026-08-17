from __future__ import annotations

from dataclasses import dataclass

ACOUSTIC_REGISTRY_VERSION = "0.1"
NON_CANONICAL_REGISTRY_VERSION = "PROVISIONAL_NON_CANONICAL"


@dataclass(frozen=True)
class AcousticParameter:
    feature_id: str
    unit: str | None
    tier: str
    semantic_use: bool
    renderer_use: bool


CANONICAL_PARAMETERS: tuple[AcousticParameter, ...] = (
    AcousticParameter("SS_RESPONSE_ONSET_LATENCY", "ms", "C", True, False),
    AcousticParameter("SS_PAUSE_LOAD", "ratio", "C", True, False),
    AcousticParameter("Q_CLIPPING_RATIO", "ratio", "Q", False, False),
    AcousticParameter("Q_VOICED_RATIO", "ratio", "Q", False, False),
)

PROVISIONAL_PARAMETERS: tuple[AcousticParameter, ...] = (
    AcousticParameter("PROVISIONAL_DURATION_MS", "ms", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_RMS_ENERGY", "ratio", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_PEAK_AMPLITUDE", "ratio", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_ENERGY_SPEECH_RATIO", "ratio", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_ENERGY_SILENCE_RATIO", "ratio", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_PITCH_ZCR_HZ", "Hz", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_SPECTRAL_CENTROID_HZ", "Hz", "PROVISIONAL", False, False),
    AcousticParameter("PROVISIONAL_FORMANT_TRACKING", None, "PROVISIONAL", False, False),
)

_CANONICAL_BY_ID = {parameter.feature_id: parameter for parameter in CANONICAL_PARAMETERS}
_PROVISIONAL_BY_ID = {parameter.feature_id: parameter for parameter in PROVISIONAL_PARAMETERS}


HISTORICAL_ALIASES = {
    "AC_DURATION_MS": "PROVISIONAL_DURATION_MS",
    "AC_RMS_ENERGY": "PROVISIONAL_RMS_ENERGY",
    "AC_PEAK_AMPLITUDE": "PROVISIONAL_PEAK_AMPLITUDE",
    "AC_CLIPPING_RATIO": "Q_CLIPPING_RATIO",
    "AC_SPEECH_RATIO": "PROVISIONAL_ENERGY_SPEECH_RATIO",
    "AC_SILENCE_RATIO": "PROVISIONAL_ENERGY_SILENCE_RATIO",
    "AC_PITCH_ZCR_HZ": "PROVISIONAL_PITCH_ZCR_HZ",
    "AC_SPECTRAL_CENTROID_HZ": "PROVISIONAL_SPECTRAL_CENTROID_HZ",
    "AC_FORMANT_TRACKING": "PROVISIONAL_FORMANT_TRACKING",
}


def canonical_parameter(feature_id: str) -> AcousticParameter | None:
    return _CANONICAL_BY_ID.get(feature_id)


def provisional_parameter(feature_id: str) -> AcousticParameter | None:
    return _PROVISIONAL_BY_ID.get(feature_id)


def registry_version_for(feature_id: str) -> str:
    if feature_id in _CANONICAL_BY_ID:
        return ACOUSTIC_REGISTRY_VERSION
    if feature_id in _PROVISIONAL_BY_ID:
        return NON_CANONICAL_REGISTRY_VERSION
    raise ValueError(f"unknown acoustic parameter ID: {feature_id}")


def assert_known_runtime_feature(feature_id: str, feature_registry_version: str) -> None:
    if feature_id in _CANONICAL_BY_ID:
        if feature_registry_version != ACOUSTIC_REGISTRY_VERSION:
            raise ValueError(f"canonical feature {feature_id} must declare registry {ACOUSTIC_REGISTRY_VERSION}")
        return
    if feature_id in _PROVISIONAL_BY_ID:
        if feature_registry_version != NON_CANONICAL_REGISTRY_VERSION:
            raise ValueError(f"provisional feature {feature_id} may not claim canonical registry membership")
        return
    raise ValueError(f"unknown runtime feature ID: {feature_id}")
