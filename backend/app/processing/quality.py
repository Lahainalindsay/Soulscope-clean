from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..config import Settings


@dataclass(frozen=True)
class QualityResult:
    status: str
    semantic_eligibility: bool
    renderer_eligibility: bool
    rejection_reasons: tuple[str, ...]
    warnings: tuple[str, ...]


def evaluate_prompt_quality(prompt_measurement: dict[str, object], settings: Settings) -> QualityResult:
    duration_ms = _number(prompt_measurement.get("durationMs"))
    raw_measurements = prompt_measurement.get("measurements", [])
    measurements = raw_measurements if isinstance(raw_measurements, list) else []
    lookup = {
        str(item["feature_id"]): item.get("value")
        for item in measurements
        if isinstance(item, dict) and "feature_id" in item
    }
    speech_ratio = float(lookup.get("AC_SPEECH_RATIO") or 0.0)
    clipping_ratio = float(lookup.get("AC_CLIPPING_RATIO") or 0.0)
    rms = float(lookup.get("AC_RMS_ENERGY") or 0.0)

    rejection_reasons: list[str] = []
    warnings: list[str] = []

    if duration_ms <= 0:
        rejection_reasons.append("ZERO_DURATION")
    if duration_ms > settings.max_duration_seconds * 1000:
        rejection_reasons.append("DURATION_EXCEEDS_90_SECONDS")
    if speech_ratio < settings.min_speech_ratio:
        rejection_reasons.append("NO_SPEECH_OR_MOSTLY_SILENCE")
    if clipping_ratio > settings.clipping_ratio_threshold:
        warnings.append("CLIPPING_DETECTED")
    if rms < settings.silence_rms_threshold:
        warnings.append("LOW_RMS_ENERGY")

    if rejection_reasons:
        return QualityResult("rejected", False, False, tuple(rejection_reasons), tuple(warnings))
    if warnings:
        return QualityResult("limited", False, True, (), tuple(warnings))
    return QualityResult("qualified", True, True, (), ())


def aggregate_quality(results: list[QualityResult]) -> QualityResult:
    rejection_reasons = tuple(reason for result in results for reason in result.rejection_reasons)
    warnings = tuple(warning for result in results for warning in result.warnings)
    if rejection_reasons:
        return QualityResult("rejected", False, False, rejection_reasons, warnings)
    if warnings or any(result.status == "limited" for result in results):
        return QualityResult("limited", False, True, (), warnings)
    return QualityResult("qualified", True, True, (), ())


def _number(value: Any) -> float:
    if isinstance(value, int | float):
        return float(value)
    return 0.0
