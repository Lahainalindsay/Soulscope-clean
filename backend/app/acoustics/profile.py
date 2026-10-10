"""Versioned research measurement catalog; no psychological inference eligibility.

Original SoulScope names identify comparison coverage, not canonical membership.
Legacy feature IDs and recording quality rules are left unchanged.
"""
from __future__ import annotations

from dataclasses import dataclass

PROFILE_VERSION = "acoustic-profile.v1"
PROFILE_FEATURE_VERSION = "1.0.0"


@dataclass(frozen=True)
class ProfileFeature:
    name: str
    unit: str
    family: str
    method: str
    original_name: str | None = None

    @property
    def feature_id(self) -> str:
        return "PROVISIONAL_FRAME_" + self.name


FEATURES: tuple[ProfileFeature, ...] = (
    ProfileFeature("F0_MEAN", "Hz", "PRO", "praat_autocorrelation", "voice.f0.mean"),
    ProfileFeature("F0_MEDIAN", "Hz", "PRO", "praat_autocorrelation", "voice.f0.median"),
    ProfileFeature("F0_SD", "Hz", "PRO", "praat_autocorrelation", "voice.f0.sd"),
    ProfileFeature("F0_P20", "Hz", "PRO", "praat_autocorrelation", "voice.f0.p20"),
    ProfileFeature("F0_P80", "Hz", "PRO", "praat_autocorrelation", "voice.f0.p80"),
    ProfileFeature("F0_RANGE_HZ", "Hz", "PRO", "praat_autocorrelation", "voice.f0.range_hz"),
    ProfileFeature("F0_RANGE_ST", "semitones", "PRO", "praat_autocorrelation", "voice.f0.range_semitones"),
    ProfileFeature("F0_VALID_RATIO", "ratio", "PRO", "praat_autocorrelation", "voice.voiced_frame_ratio"),
    ProfileFeature("F0_CV", "ratio", "PRO", "praat_autocorrelation"),
    ProfileFeature("HNR_MEAN", "dB", "PHO", "praat_cc_voiced_frames", "voice.hnr.mean"),
    ProfileFeature("SPECTRAL_CENTROID", "Hz", "SPE", "hann_frame_power_spectrum", "voice.spectral_centroid"),
    ProfileFeature("SPECTRAL_FLATNESS", "ratio", "SPE", "hann_frame_power_spectrum", "voice.spectral_flatness"),
    ProfileFeature("SPECTRAL_ROLLOFF85", "Hz", "SPE", "hann_frame_power_spectrum", "voice.spectral_rolloff_85"),
    ProfileFeature("SPECTRAL_SLOPE", "dB_per_octave", "SPE", "hann_frame_power_spectrum", "voice.spectral_slope"),
    ProfileFeature("SPECTRAL_FLUX", "ratio", "SPE", "l2_normalized_frame_magnitude_difference"),
    ProfileFeature("LOW_BAND_POWER_RATIO", "ratio", "SPE", "hann_frame_power_spectrum", "voice.harmonic_richness"),
    ProfileFeature("ZCR", "ratio", "SPE", "whole_recording_sign_changes", "voice.zero_crossing_rate"),
    ProfileFeature("RMS_DBFS_MEAN", "dBFS", "ENG", "frame_pcm_rms"),
    ProfileFeature("RMS_DBFS_SD", "dBFS", "ENG", "frame_pcm_rms"),
    ProfileFeature("CPP_PROXY", "ratio", "PHO", "frame_cepstrum_peak_minus_median_not_validated_cpp", "voice.cepstral_peak_prominence_proxy"),
    ProfileFeature("SPEECH_DURATION", "ms", "TIM", "webrtcvad_2.0.14_mode2", "voice.voiced_duration_ms"),
    ProfileFeature("SPEECH_RATIO", "ratio", "TIM", "webrtcvad_2.0.14_mode2", "voice.phonation_time_ratio"),
    ProfileFeature("SPEECH_SILENCE_RATIO", "ratio", "TIM", "webrtcvad_2.0.14_mode2", "voice.speech_to_silence_ratio"),
    ProfileFeature("PAUSE_COUNT", "count", "TIM", "webrtcvad_2.0.14_mode2", "voice.pause.count"),
    ProfileFeature("PAUSE_MEAN", "ms", "TIM", "webrtcvad_2.0.14_mode2", "voice.pause.duration_mean"),
    ProfileFeature("PAUSE_MEDIAN", "ms", "TIM", "webrtcvad_2.0.14_mode2", "voice.pause.duration_median"),
    ProfileFeature("PAUSE_MAX", "ms", "TIM", "webrtcvad_2.0.14_mode2", "voice.pause.duration_max"),
    ProfileFeature("PAUSE_RATE", "per_min", "TIM", "webrtcvad_2.0.14_mode2", "voice.pause.density"),
    ProfileFeature("SYLLABLE_NUCLEI_PROXY", "per_min", "TIM", "energy_peaks_not_transcribed_speech_rate", "voice.syllable_nuclei_rate"),
    *(ProfileFeature(f"F{n}_{stat}", unit, "SPE", "praat_burg_research",
                     f"voice.formant.f{n}.{original}")
      for n in (1, 2, 3)
      for stat, unit, original in (("MEDIAN", "Hz", "median"), ("SD", "Hz", "sd"),
                                   ("IQR", "Hz", "iqr"), ("VALID_RATIO", "ratio", "valid_frame_ratio"))),
    *(ProfileFeature(name, unit, "PHO", "sustained_vowel_only", original)
      for name, unit, original in (
          ("JITTER_LOCAL", "fraction", "voice.jitter.local"),
          ("JITTER_ABSOLUTE", "seconds", "voice.jitter.local_absolute"),
          ("JITTER_RAP", "fraction", "voice.jitter.rap"),
          ("JITTER_PPQ5", "fraction", "voice.jitter.ppq5"),
          ("JITTER_DDP", "fraction", "voice.jitter.ddp"),
          ("SHIMMER_LOCAL", "fraction", "voice.shimmer.local"),
          ("SHIMMER_DB", "dB", "voice.shimmer.local_db"),
          ("SHIMMER_APQ3", "fraction", "voice.shimmer.apq3"),
          ("SHIMMER_APQ5", "fraction", "voice.shimmer.apq5"),
          ("SHIMMER_APQ11", "fraction", "voice.shimmer.apq11"),
          ("SHIMMER_DDA", "fraction", "voice.shimmer.dda"))),
    *(ProfileFeature(name, "ratio", family, "unvalidated_original_transform", original)
      for name, family, original in (
          ("PITCH_CLARITY", "PRO", "voice.pitch_clarity"),
          ("PITCH_STABILITY", "PRO", "voice.pitch_stability"),
          ("FORMANT_STABILITY", "SPE", "voice.formant_stability"),
          ("FORMANT_DYNAMICS", "SPE", "voice.formant_dynamics"))),
)
BY_ID = {feature.feature_id: feature for feature in FEATURES}
