from __future__ import annotations

import wave
from dataclasses import dataclass
from pathlib import Path

from ..config import EXTRACTOR_VERSION
from .formants import formant_measurements_unavailable
from .pitch import estimate_pitch_hz
from .registry import NON_CANONICAL_REGISTRY_VERSION, registry_version_for
from .spectral import estimate_spectral_centroid_hz
from .temporal import summarize_temporal_activity


@dataclass(frozen=True)
class WavData:
    sample_rate: int
    sample_width: int
    channel_count: int
    frames: int
    samples: list[float]

    @property
    def duration_seconds(self) -> float:
        if self.sample_rate <= 0:
            return 0.0
        return self.frames / self.sample_rate


def read_pcm_wav(path: Path) -> WavData:
    try:
        with wave.open(str(path), "rb") as wav:
            sample_rate = wav.getframerate()
            sample_width = wav.getsampwidth()
            channel_count = wav.getnchannels()
            frames = wav.getnframes()
            raw = wav.readframes(frames)
    except wave.Error as exc:
        raise ValueError(f"invalid WAV: {exc}") from exc

    if sample_width != 2:
        raise ValueError("only 16-bit PCM WAV is currently supported")
    if channel_count not in (1, 2):
        raise ValueError("only mono or stereo WAV is currently supported")

    integers: list[int] = []
    for index in range(0, len(raw), sample_width):
        integers.append(int.from_bytes(raw[index : index + sample_width], "little", signed=True))

    if channel_count == 2:
        mono: list[float] = []
        for index in range(0, len(integers), 2):
            pair = integers[index : index + 2]
            if len(pair) == 2:
                mono.append(sum(pair) / 2.0 / 32768.0)
        samples = mono
    else:
        samples = [value / 32768.0 for value in integers]

    return WavData(
        sample_rate=sample_rate,
        sample_width=sample_width,
        channel_count=channel_count,
        frames=frames,
        samples=samples,
    )


def extract_measurements(path: Path, capture_id: str, prompt_id: str, threshold: float) -> dict[str, object]:
    wav = read_pcm_wav(path)
    duration_ms = round(wav.duration_seconds * 1000)
    rms = (sum(value * value for value in wav.samples) / len(wav.samples)) ** 0.5 if wav.samples else 0.0
    peak = max((abs(value) for value in wav.samples), default=0.0)
    clipping_count = sum(1 for value in wav.samples if abs(value) >= 0.98)
    clipping_ratio = clipping_count / len(wav.samples) if wav.samples else 0.0
    temporal = summarize_temporal_activity(wav.samples, wav.sample_rate, threshold)

    response_onset_latency = _response_onset_latency_ms(wav.samples, wav.sample_rate, threshold)
    measurements: list[dict[str, object]] = [
        measurement("SS_RESPONSE_ONSET_LATENCY", response_onset_latency, "ms", capture_id, prompt_id, "energy_vad_first_speech_frame"),
        measurement("SS_PAUSE_LOAD", temporal.silence_ratio, "ratio", capture_id, prompt_id, "energy_vad_silence_ratio"),
        measurement("Q_CLIPPING_RATIO", clipping_ratio, "ratio", capture_id, prompt_id, "pcm_peak_count"),
        measurement("Q_VOICED_RATIO", temporal.speech_ratio, "ratio", capture_id, prompt_id, "energy_vad_voiced_ratio"),
        measurement("PROVISIONAL_DURATION_MS", duration_ms, "ms", capture_id, prompt_id, "wave_header"),
        measurement("PROVISIONAL_RMS_ENERGY", rms, "ratio", capture_id, prompt_id, "pcm_rms"),
        measurement("PROVISIONAL_PEAK_AMPLITUDE", peak, "ratio", capture_id, prompt_id, "pcm_peak"),
        measurement("PROVISIONAL_ENERGY_SPEECH_RATIO", temporal.speech_ratio, "ratio", capture_id, prompt_id, "energy_vad"),
        measurement("PROVISIONAL_ENERGY_SILENCE_RATIO", temporal.silence_ratio, "ratio", capture_id, prompt_id, "energy_vad"),
    ]

    pitch_hz = estimate_pitch_hz(wav.samples, wav.sample_rate)
    measurements.append(measurement("PROVISIONAL_PITCH_ZCR_HZ", pitch_hz, "Hz", capture_id, prompt_id, "zero_crossing"))

    centroid_hz = estimate_spectral_centroid_hz(wav.samples, wav.sample_rate)
    measurements.append(
        measurement("PROVISIONAL_SPECTRAL_CENTROID_HZ", centroid_hz, "Hz", capture_id, prompt_id, "naive_dft")
    )

    formants = formant_measurements_unavailable()
    formants.update(
        {
            "feature_version": "0.1",
            "feature_registry_version": NON_CANONICAL_REGISTRY_VERSION,
            "implementation_status": "PROVISIONAL_NON_CANONICAL",
            "source_capture_id": capture_id,
            "capture_kind": prompt_id,
            "segment_start_ms": 0,
            "segment_end_ms": None,
            "quality": "not_available",
            "confidence": None,
            "extractor": "soulscope_measurement_worker",
            "extractor_version": EXTRACTOR_VERSION,
            "parameters": {},
            "device_metadata": {},
        }
    )
    measurements.append(formants)

    return {
        "promptId": prompt_id,
        "captureId": capture_id,
        "sampleRate": wav.sample_rate,
        "durationMs": duration_ms,
        "measurements": measurements,
    }


def measurement(
    feature_id: str,
    value: float | None,
    unit: str,
    capture_id: str,
    prompt_id: str,
    method: str,
) -> dict[str, object]:
    feature_registry_version = registry_version_for(feature_id)
    implementation_status = (
        "PROVISIONAL_IMPLEMENTATION_OF_CANONICAL_PARAMETER"
        if feature_registry_version != NON_CANONICAL_REGISTRY_VERSION
        else "PROVISIONAL_NON_CANONICAL"
    )
    return {
        "feature_id": feature_id,
        "feature_version": "0.1",
        "feature_registry_version": feature_registry_version,
        "implementation_status": implementation_status,
        "value": value,
        "unit": unit,
        "method": method,
        "source_capture_id": capture_id,
        "capture_kind": prompt_id,
        "segment_start_ms": 0,
        "segment_end_ms": None,
        "quality": "descriptive",
        "confidence": None,
        "rejection_reason": None if value is not None else "MISSING_OR_UNSUPPORTED",
        "extractor": "soulscope_measurement_worker",
        "extractor_version": EXTRACTOR_VERSION,
        "parameters": {},
        "device_metadata": {},
    }


def _response_onset_latency_ms(samples: list[float], sample_rate: int, threshold: float) -> int | None:
    if not samples or sample_rate <= 0:
        return None
    frame_size = max(1, int(sample_rate * 0.03))
    for index in range(0, len(samples), frame_size):
        frame = samples[index : index + frame_size]
        if not frame:
            continue
        rms = (sum(value * value for value in frame) / len(frame)) ** 0.5
        if rms >= threshold:
            return round(index / sample_rate * 1000)
    return None
