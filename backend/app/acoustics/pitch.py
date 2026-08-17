from __future__ import annotations


def estimate_pitch_hz(samples: list[float], sample_rate: int) -> float | None:
    if sample_rate <= 0 or len(samples) < sample_rate // 20:
        return None

    crossings = 0
    previous = samples[0]
    for value in samples[1:]:
        if (previous <= 0 < value) or (previous >= 0 > value):
            crossings += 1
        previous = value

    duration_seconds = len(samples) / sample_rate
    if duration_seconds <= 0 or crossings < 2:
        return None

    return crossings / (2.0 * duration_seconds)
