from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class MarkerRule:
    marker_id: str
    family: str
    feature_ids: tuple[str, ...]


MARKER_VERSION = "0.1"

PROMPT_IDS = ("P1_OPEN_REFERENCE", "P2_TROUBLING_CONTEXT", "P3_FUTURE_CONTEXT")

EXPECTED_FEATURE_IDS = (
    "AC_DURATION_MS",
    "AC_RMS_ENERGY",
    "AC_PEAK_AMPLITUDE",
    "AC_CLIPPING_RATIO",
    "AC_SPEECH_RATIO",
    "AC_SILENCE_RATIO",
    "AC_PITCH_ZCR_HZ",
    "AC_SPECTRAL_CENTROID_HZ",
    "AC_FORMANT_TRACKING",
)

MARKER_RULES = (
    MarkerRule("OUTPUT_CONTINUITY", "DYN", ("AC_DURATION_MS", "AC_SPEECH_RATIO", "AC_SILENCE_RATIO")),
    MarkerRule("MODULATION_BREADTH", "ENG", ("AC_RMS_ENERGY", "AC_PEAK_AMPLITUDE", "AC_CLIPPING_RATIO")),
    MarkerRule("PROSODIC_EXPANSION", "PRO", ("AC_PITCH_ZCR_HZ",)),
    MarkerRule("PHONATORY_STABILITY", "PHO", ("AC_FORMANT_TRACKING",)),
    MarkerRule("TEMPORAL_FRAGMENTATION", "TIM", ("AC_SPEECH_RATIO", "AC_SILENCE_RATIO")),
    MarkerRule("CONTEXT_CONSISTENCY", "DYN", ("AC_SPECTRAL_CENTROID_HZ",)),
)

_RULE_BY_FEATURE = {
    feature_id: rule
    for rule in MARKER_RULES
    for feature_id in rule.feature_ids
}


def marker_for_feature(feature_id: str) -> MarkerRule:
    return _RULE_BY_FEATURE.get(feature_id, MarkerRule("OUTPUT_CONTINUITY", "DYN", (feature_id,)))
