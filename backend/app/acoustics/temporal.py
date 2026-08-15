from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class TemporalSummary:
    speech_ratio: float
    silence_ratio: float
    frame_count: int
    speech_frame_count: int


def summarize_temporal_activity(samples: list[float], sample_rate: int, threshold: float) -> TemporalSummary:
    if not samples or sample_rate <= 0:
        return TemporalSummary(
            speech_ratio=0.0,
            silence_ratio=1.0,
            frame_count=0,
            speech_frame_count=0,
        )

    frame_size = max(1, int(sample_rate * 0.03))
    frames = [samples[index : index + frame_size] for index in range(0, len(samples), frame_size)]
    speech_frames = 0
    for frame in frames:
        if not frame:
            continue
        rms = (sum(value * value for value in frame) / len(frame)) ** 0.5
        if rms >= threshold:
            speech_frames += 1

    frame_count = len(frames)
    speech_ratio = speech_frames / frame_count if frame_count else 0.0
    return TemporalSummary(
        speech_ratio=speech_ratio,
        silence_ratio=1.0 - speech_ratio,
        frame_count=frame_count,
        speech_frame_count=speech_frames,
    )
