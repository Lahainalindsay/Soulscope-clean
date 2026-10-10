"""Full-response descriptive analysis. All new features remain research-only.

Algorithm parameters govern extraction, never state/meaning publication. Native
analysis failure is explicit missingness, never a silent energy/neutral fallback.
"""
from __future__ import annotations

import importlib
import math
from typing import Any

import numpy as np
from scipy.signal import find_peaks

from .profile import FEATURES, PROFILE_FEATURE_VERSION, PROFILE_VERSION

PARAMETERS = {
    "spectral_frame_ms": 40, "spectral_hop_ms": 20,
    "pitch_step_seconds": 0.01, "pitch_floor_hz": 60.0, "pitch_ceiling_hz": 500.0,
    "formant_ceiling_hz": 5500.0, "formant_window_seconds": 0.025,
    "formant_max_number": 5, "formant_preemphasis_hz": 50.0,
    "vad_frame_ms": 30, "vad_mode": 2,
}


def _frames(samples: Any, width: int, hop: int) -> Any:
    # Include the end of the recording, even when it is a partial frame.
    starts = np.arange(0, len(samples), hop)
    padded = np.pad(samples, (0, width))
    return padded[starts[:, None] + np.arange(width)]


def analyze_frames(samples: list[float], sample_rate: int) -> dict[str, Any]:
    values: dict[str, float | None] = {f.name: None for f in FEATURES}
    reasons = {f.name: "INSUFFICIENT_SIGNAL_SUPPORT" for f in FEATURES}
    support: dict[str, dict[str, Any]] = {}
    x = np.asarray(samples, dtype=float)
    segments: list[dict[str, Any]] = []
    methods: dict[str, str] = {}
    if sample_rate <= 0 or len(x) == 0:
        return {"values": values, "reasons": reasons, "support": support,
                "segments": segments, "nativeMethods": methods}
    _spectral(x, sample_rate, values, reasons, support)
    _praat(x, sample_rate, values, reasons, support, methods)
    segments = _timing(x, sample_rate, values, reasons, support, methods)
    for f in FEATURES:
        if f.method == "sustained_vowel_only":
            reasons[f.name] = "TASK_INELIGIBLE_CONNECTED_SPEECH"
        elif f.method == "unvalidated_original_transform":
            reasons[f.name] = "UNVALIDATED_TRANSFORM_NOT_REPRODUCED"
    return {"values": values, "reasons": reasons, "support": support,
            "segments": segments, "nativeMethods": methods}


def _put(name: str, value: Any, values: dict[str, Any], reasons: dict[str, str],
         support: dict[str, Any], frames: int, valid: int, **extra: Any) -> None:
    numeric = None if value is None else float(value)
    values[name] = numeric if numeric is not None and math.isfinite(numeric) else None
    if values[name] is not None:
        reasons.pop(name, None)
    support[name] = {"frameCount": int(frames), "validFrameCount": int(valid), **extra}


def _spectral(x: Any, sr: int, values: dict[str, Any], reasons: dict[str, str],
              support: dict[str, Any]) -> None:
    width, hop = round(sr * 0.04), round(sr * 0.02)
    frames = _frames(x, width, hop)
    # A partial end frame contributes its actual support, not fabricated audio.
    valid_lengths = np.minimum(width, len(x) - np.arange(0, len(x), hop))
    rms = np.sqrt(np.sum(frames ** 2, axis=1) / valid_lengths)
    active = rms > 0
    db = 20 * np.log10(rms[active])
    for name, stat in (("RMS_DBFS_MEAN", np.mean), ("RMS_DBFS_SD", np.std)):
        _put(name, stat(db) if len(db) else None, values, reasons, support,
             len(frames), len(db), amplitudeReference="digital_full_scale_not_SPL")
    _put("ZCR", np.mean(np.diff(np.signbit(x))) if len(x) > 1 else None,
         values, reasons, support, len(x), max(0, len(x) - 1))
    magnitude = np.abs(np.fft.rfft(frames * np.hanning(width), axis=1))
    power = magnitude ** 2
    totals = np.sum(power, axis=1)
    eligible = totals > 0
    power = power[eligible]
    magnitude = magnitude[eligible]
    totals = totals[eligible]
    freqs = np.fft.rfftfreq(width, 1 / sr)
    if not len(totals):
        return
    stats = {
        "SPECTRAL_CENTROID": np.sum(power * freqs, axis=1) / totals,
        "SPECTRAL_FLATNESS": np.exp(np.mean(np.log(np.maximum(power, np.finfo(float).tiny)), axis=1)) / np.mean(power, axis=1),
        "SPECTRAL_ROLLOFF85": freqs[np.argmax(np.cumsum(power, axis=1) >= totals[:, None] * .85, axis=1)],
        "LOW_BAND_POWER_RATIO": np.sum(power[:, (freqs >= 100) & (freqs <= 1200)], axis=1) / totals,
    }
    for name, array in stats.items():
        _put(name, np.mean(array), values, reasons, support, len(frames), len(array))
    band = (freqs >= 100) & (freqs <= min(5000, sr / 2))
    if np.count_nonzero(band) > 8:
        slopes = np.polyfit(np.log2(freqs[band]),
                            (10 * np.log10(np.maximum(power[:, band], np.finfo(float).tiny))).T, 1)[0]
        _put("SPECTRAL_SLOPE", np.mean(slopes), values, reasons, support, len(frames), len(slopes))
    # Flux only between adjacent eligible frames; never bridge a silent gap.
    all_normalized = np.zeros((len(frames), len(freqs)))
    all_normalized[eligible] = magnitude / np.linalg.norm(magnitude, axis=1)[:, None]
    adjacent = eligible[1:] & eligible[:-1]
    flux = np.linalg.norm(np.diff(all_normalized, axis=0)[adjacent], axis=1)
    _put("SPECTRAL_FLUX", np.mean(flux) if len(flux) else None,
         values, reasons, support, max(0, len(frames) - 1), len(flux))
    cepstrum = np.fft.irfft(np.log(np.maximum(magnitude, np.finfo(float).tiny)), n=width, axis=1)
    lo, hi = math.ceil(sr / 500), min(width // 2, math.floor(sr / 60))
    region = cepstrum[:, lo:hi + 1]
    if region.shape[1]:
        proxy = np.max(region, axis=1) - np.median(region, axis=1)
        _put("CPP_PROXY", np.mean(proxy), values, reasons, support, len(frames), len(proxy),
             validatedCPP=False)


def _nearest_indices(source: Any, target: Any) -> Any:
    right = np.clip(np.searchsorted(source, target), 0, len(source)-1)
    left = np.maximum(0, right-1)
    return np.where(np.abs(source[left]-target) <= np.abs(source[right]-target), left, right)


def _praat(x: Any, sr: int, values: dict[str, Any], reasons: dict[str, str],
           support: dict[str, Any], methods: dict[str, str]) -> None:
    names = [f.name for f in FEATURES if f.method.startswith("praat")]
    try:
        pm = importlib.import_module("parselmouth")
    except ImportError:
        reasons.update({name: "NATIVE_DEPENDENCY_UNAVAILABLE" for name in names})
        methods["praat"] = "UNAVAILABLE"
        return
    methods["praat"] = str(pm.__version__)
    sound = pm.Sound(x, sampling_frequency=sr)
    floor, ceiling = PARAMETERS["pitch_floor_hz"], PARAMETERS["pitch_ceiling_hz"]
    try:
        pitch = sound.to_pitch_ac(time_step=.01, pitch_floor=floor, pitch_ceiling=ceiling)
        contour = np.asarray(pitch.selected_array["frequency"])
        voiced = contour[(contour > 0) & np.isfinite(contour)]
        stats: dict[str, Any] = {"F0_VALID_RATIO": len(voiced) / len(contour) if len(contour) else None}
        if len(voiced):
            p20, p80 = np.percentile(voiced, [20, 80])
            stats.update(F0_MEAN=np.mean(voiced), F0_MEDIAN=np.median(voiced), F0_SD=np.std(voiced),
                         F0_P20=p20, F0_P80=p80, F0_RANGE_HZ=p80-p20,
                         F0_RANGE_ST=12*np.log2(p80/p20), F0_CV=np.std(voiced)/np.mean(voiced))
        for name, value in stats.items():
            _put(name, value, values, reasons, support, len(contour), len(voiced))
        harmonicity = sound.to_harmonicity_cc(time_step=.01, minimum_pitch=floor)
        hn = np.asarray(harmonicity.values)[0]
        # HNR only at F0-voiced times; -200 is Praat's silence sentinel.
        times = harmonicity.xs()
        pitch_times = pitch.xs()
        idx = _nearest_indices(pitch_times, times)
        mask = (contour[idx] > 0) & np.isfinite(hn) & (hn > -200)
        _put("HNR_MEAN", np.mean(hn[mask]) if np.any(mask) else None,
             values, reasons, support, len(hn), np.count_nonzero(mask), scope="F0_VOICED_FRAMES")
        formant = sound.to_formant_burg(time_step=.01, max_number_of_formants=5,
                                      maximum_formant=min(5500.0, sr / 2), window_length=.025)
        for n in (1, 2, 3):
            ft = formant.xs()
            fi = _nearest_indices(pitch_times, ft)
            candidates = np.array([formant.get_value_at_time(n, float(t)) for t in ft])
            valid = candidates[(contour[fi] > 0) & np.isfinite(candidates) & (candidates > 0) & (candidates < sr / 2)]
            for suffix, value in (("MEDIAN", np.median(valid) if len(valid) else None),
                                  ("SD", np.std(valid) if len(valid) else None),
                                  ("IQR", np.diff(np.percentile(valid, [25, 75]))[0] if len(valid) else None),
                                  ("VALID_RATIO", len(valid)/len(ft) if len(ft) else None)):
                _put(f"F{n}_{suffix}", value, values, reasons, support, len(ft), len(valid),
                     researchOnly=True, vowelCompatibility="NOT_ESTABLISHED_CONNECTED_SPEECH")
    except (RuntimeError, ValueError) as exc:
        # Preserve successful features, expose the failing method without audio.
        for name in names:
            if values[name] is None:
                reasons[name] = "NATIVE_ANALYSIS_FAILED"
        methods["praatError"] = type(exc).__name__


def summarize_speech_segments(mask: list[bool], sample_count: int, sr: int,
                              frame_length: int) -> tuple[list[dict[str, Any]], list[int], int]:
    segments: list[dict[str, Any]] = []
    if not mask:
        return segments, [], 0
    first = next((i for i, flag in enumerate(mask) if flag), None)
    last = next((len(mask)-1-i for i, flag in enumerate(reversed(mask)) if flag), None)
    start = 0
    for end in range(1, len(mask) + 1):
        if end < len(mask) and mask[end] == mask[start]:
            continue
        kind = "speech" if mask[start] else (
            "leading_silence" if first is None or start < first else
            "trailing_silence" if last is None or start > last else "internal_pause")
        segments.append({"kind": kind, "start_ms": round(start*frame_length/sr*1000),
                         "end_ms": round(min(end*frame_length, sample_count)/sr*1000)})
        start = end
    pauses = [s["end_ms"] - s["start_ms"] for s in segments if s["kind"] == "internal_pause"]
    speech_ms = sum(s["end_ms"] - s["start_ms"] for s in segments if s["kind"] == "speech")
    return segments, pauses, speech_ms


def _timing(x: Any, sr: int, values: dict[str, Any], reasons: dict[str, str],
            support: dict[str, Any], methods: dict[str, str]) -> list[dict[str, Any]]:
    names = [f.name for f in FEATURES if f.method.startswith("webrtc") or f.name == "SYLLABLE_NUCLEI_PROXY"]
    try:
        vad = importlib.import_module("webrtcvad")
    except ImportError:
        reasons.update({name: "NATIVE_DEPENDENCY_UNAVAILABLE" for name in names})
        methods["vad"] = "UNAVAILABLE"
        return []
    if sr not in (8000, 16000, 32000, 48000):
        reasons.update({name: "UNSUPPORTED_SAMPLE_RATE" for name in names})
        return []
    width = round(sr*.03)
    frames = _frames(x, width, width)
    pcm = np.clip(frames*32768, -32768, 32767).astype("<i2")
    detector = vad.Vad(2)
    mask = [detector.is_speech(frame.tobytes(), sr) for frame in pcm]
    methods["vad"] = "webrtcvad-2.0.14-mode2-no-energy-fallback"
    segments, pauses, speech_ms = summarize_speech_segments(mask, len(x), sr, width)
    duration_ms = len(x)/sr*1000
    silence_ms = duration_ms - speech_ms
    stats = {"SPEECH_DURATION": speech_ms, "SPEECH_RATIO": speech_ms/duration_ms,
             "SPEECH_SILENCE_RATIO": speech_ms/silence_ms if silence_ms > 0 else None,
             "PAUSE_COUNT": len(pauses) if speech_ms else None,
             "PAUSE_MEAN": np.mean(pauses) if pauses else None,
             "PAUSE_MEDIAN": np.median(pauses) if pauses else None,
             "PAUSE_MAX": max(pauses) if pauses else None,
             "PAUSE_RATE": len(pauses)/(duration_ms/60000) if speech_ms else None}
    for name, value in stats.items():
        _put(name, value, values, reasons, support, len(mask), sum(mask),
             internalPauseCount=len(pauses), speechDetectionNotPhonation=True)
    if silence_ms <= 0:
        reasons["SPEECH_SILENCE_RATIO"] = "ZERO_DENOMINATOR_NO_SILENCE"
    # Count envelope peaks per actual speech time without joining separated runs.
    count = 0
    for segment in segments:
        if segment["kind"] != "speech":
            continue
        speech = x[round(segment["start_ms"]*sr/1000):round(segment["end_ms"]*sr/1000)]
        if len(speech) < round(sr*.12):
            continue
        f = _frames(speech, round(sr*.04), round(sr*.04))
        envelope = np.sqrt(np.mean(f**2, axis=1))
        peaks, _ = find_peaks(envelope, height=max(np.percentile(envelope, 55), np.max(envelope)*.18), distance=3)
        count += len(peaks)
    _put("SYLLABLE_NUCLEI_PROXY", count/(speech_ms/60000) if speech_ms >= 1000 else None,
         values, reasons, support, len(mask), sum(mask), validatedSpeechRate=False)
    return segments


def profile_measurements(samples: list[float], sr: int, capture_id: str, prompt_id: str,
                         extractor_version: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    analysis = analyze_frames(samples, sr)
    duration = round(len(samples)/sr*1000) if sr > 0 else 0
    result = []
    for feature in FEATURES:
        value = analysis["values"][feature.name]
        result.append({
            "feature_id": feature.feature_id, "feature_version": PROFILE_FEATURE_VERSION,
            "feature_registry_version": "PROVISIONAL_NON_CANONICAL",
            "implementation_status": "PROVISIONAL_NON_CANONICAL", "value": value,
            "unit": feature.unit, "method": feature.method,
            "source_capture_id": capture_id, "capture_kind": prompt_id,
            "segment_start_ms": 0, "segment_end_ms": duration,
            "quality": "research_only" if value is not None else "not_available",
            "confidence": None, "rejection_reason": analysis["reasons"].get(feature.name),
            "extractor": "soulscope_measurement_worker", "extractor_version": extractor_version,
            "parameters": {**PARAMETERS, "profileVersion": PROFILE_VERSION,
                           "originalFeatureName": feature.original_name,
                           "sourceFeatureFamily": feature.family,
                           "correlationGroup": feature.method,
                           "semanticUse": False, "rendererUse": False,
                           "support": analysis["support"].get(feature.name, {}),
                           "nativeMethods": analysis["nativeMethods"]}, "device_metadata": {},
        })
    return result, {"version": PROFILE_VERSION, "segments": analysis["segments"],
                    "nativeMethods": analysis["nativeMethods"], "parameters": dict(PARAMETERS)}
