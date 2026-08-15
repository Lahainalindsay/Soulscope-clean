from __future__ import annotations

import math


def estimate_spectral_centroid_hz(samples: list[float], sample_rate: int) -> float | None:
    if sample_rate <= 0 or not samples:
        return None

    window = samples[: min(len(samples), 1024)]
    if not window:
        return None

    bins = min(64, len(window) // 2)
    weighted_sum = 0.0
    magnitude_sum = 0.0
    for k in range(1, bins + 1):
        real = 0.0
        imag = 0.0
        for n, sample in enumerate(window):
            angle = 2.0 * math.pi * k * n / len(window)
            real += sample * math.cos(angle)
            imag -= sample * math.sin(angle)
        magnitude = (real * real + imag * imag) ** 0.5
        frequency = k * sample_rate / len(window)
        weighted_sum += frequency * magnitude
        magnitude_sum += magnitude

    if magnitude_sum == 0:
        return None
    return weighted_sum / magnitude_sum
