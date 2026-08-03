# Phase E.5 Acoustic Feature Audit

Audit date: 2026-08-02

Primary extractor: `backend/corescope/audio/acoustic_extractor.py`

Compatibility extractor: `frontend/lib/voiceSpectrum.ts`

## Summary

The backend extractor emits approximately 56 measurement IDs. The active canonical dimension engine consumes 9 canonical feature IDs directly. The V2 observation framework consumes a broader set through aliases and client fallback. Several extracted features are traceability or debug only.

The largest proven defect is semantic, not raw extraction failure: unavailable task-specific features are encoded as poor zero-confidence feature failures with a generic `insufficient_reliable_signal` reason. This is especially visible for jitter and shimmer on connected speech.

## Feature Audit Records

| Feature | Extractor | Raw unit | Method | Input type | Connected speech | Sustained vowel | Quality gate | Normalization path | Evidence consumers | Dimension consumers | Active | Risks | Recommendation |
|---|---|---|---|---|---:|---:|---|---|---|---|---:|---|---|
| F0 mean | backend Praat | Hz | `To Pitch` mean | voiced frames | yes | yes | pitch frames present | raw feature `voice.f0.mean` | optional/provenance | none | partial | pitch floor 60/ceiling 400 can miss outliers | keep_with_new_gate |
| F0 median | backend Praat | Hz | `To Pitch` quantile | voiced frames | yes | yes | pitch frames present | canonical evidence | canonical dimensions | many | yes | no baseline normalization | keep_with_new_gate |
| F0 p20/p80 | backend Praat | Hz | quantiles | voiced frames | yes | yes | pitch frames present | evidence/provenance | limited | none | partial | no consumer beyond audit/compat | developer_only |
| F0 range Hz | backend Praat | Hz | max-min | voiced frames | yes | yes | pitch frames present | raw alias | expressive variability | none | yes | outlier-sensitive | keep_with_new_gate |
| F0 range semitones | backend Praat | semitones | log2 ratio | voiced frames | yes | yes | pitch frames present | canonical evidence | expressive/speech dynamics | canonical dimensions | yes | saturates through downstream clamps | keep_with_new_gate |
| Pitch stability | backend Praat | ratio | `1 - sd/mean` clamp | voiced frames | yes | yes | pitch frames present | canonical evidence | stability/consistency | canonical dimensions | yes | connected speech variation can be meaningful, not failure | keep_with_new_gate |
| Pitch clarity | backend Praat | ratio | voiced pitch frames / pitch frames | voiced frames | yes | yes | pitch frames present | canonical evidence | stability/consistency | canonical dimensions | yes | not independent from voiced ratio | keep |
| HNR | backend Praat | dB | Harmonicity mean | voiced audio | limited | yes | harmonicity present | raw alias `voice.hnr` | harmonic clarity/organization | none | yes | included in sustained-vowel set but computed for all captures | task_specific_only |
| CPP proxy | backend spectral | proxy | harmonic richness minus flatness proxy | spectral frames | limited | limited | enough frames | raw feature | mostly debug | none | partial | not true CPP; label says proxy | developer_only |
| Jitter local | backend Praat | ratio | PointProcess local jitter | stable cycles | no | yes | capture kind sustained vowel | raw alias percent | stability/consistency if present | none | conditional | unavailable on connected speech is marked poor/generic | task_specific_only |
| Jitter absolute/RAP/PPQ5/DDP | backend Praat | seconds/ratio | PointProcess variants | stable cycles | no | yes | sustained vowel | audit only | none | none | no | same as above plus no active consumers | developer_only |
| Shimmer local | backend Praat | ratio | PointProcess local shimmer | stable cycles/amplitude | no | yes | capture kind sustained vowel | raw alias percent | stability/consistency if present | none | conditional | unavailable on connected speech is marked poor/generic | task_specific_only |
| Shimmer dB/APQ3/APQ5/APQ11/DDA | backend Praat | dB/ratio | PointProcess variants | stable cycles | no | yes | sustained vowel | audit only | none | none | no | no active consumer; task-specific | developer_only |
| Formant medians F1-F3 | backend Praat | Hz | Burg median | voiced/formant frames | limited | yes | formant frames present | raw/provenance | spectral organization | none | partial | Burg assumptions not reliable for all voices/devices | keep_with_new_gate |
| Formant stability | backend derived | ratio | `1 - ((f1_sd+f2_sd)/900)` | formant frames | limited | yes | F1/F2 sd present | raw alias | stability/organization | none | yes | magic divisor, clipped 0..1 | keep_with_new_gate |
| Formant dynamics | backend derived | ratio | `(f1_sd+f2_sd)/650` | formant frames | limited | yes | F1/F2 sd present | raw alias | expressive/speech dynamics | none | yes | magic divisor, clipped 0..1 | keep_with_new_gate |
| RMS energy | backend spectral | linear | frame RMS average | signal frames | yes | yes | frames present | raw/compat | vocal energy | none | yes | device/mic gain sensitive | keep_with_new_gate |
| Harmonic richness | backend spectral | ratio | `1 - flatness` style | spectral frames | yes | yes | frames present | canonical evidence | harmonic/organization | canonical dimensions | yes | correlated with flatness | keep |
| Spectral flatness | backend spectral | ratio | geometric/arithmetic mean | spectral frames | yes | yes | frames present | canonical evidence | organization | canonical dimensions | yes | noise sensitive; correlated with richness | keep |
| Spectral centroid | backend spectral | Hz | weighted spectrum center | spectral frames | yes | yes | frames present | raw feature | expressivity/organization | none | yes | device and noise sensitivity | keep_with_new_gate |
| Spectral slope/tilt | backend spectral | slope | linear spectral trend | spectral frames | yes | yes | frames present | raw feature | no clear active rule | none | partial | not strongly documented | developer_only |
| Voiced duration | backend VAD | ms | voiced segment total | VAD frames | yes | yes | VAD confidence | raw alias | vocal activation | none | yes | VAD fallback confidence fixed | keep_with_new_gate |
| Phonation ratio | backend VAD | ratio | voiced/signal duration | VAD frames | yes | yes | VAD confidence | canonical evidence | activation/speech dynamics | canonical dimensions | yes | not independent from VAD voiced duration | keep |
| Pause count | backend VAD | count | unvoiced segments | VAD frames | yes | no | VAD segmentation | raw feature | processing pauses | none | yes | prompt length dependent | keep_with_new_gate |
| Pause density | backend VAD | count/min | pauses per analyzed minute | VAD frames | yes | no | VAD segmentation | raw feature | speech dynamics | none | yes | can punish reflective speech | keep_with_new_gate |
| Pause durations mean/median/max | backend VAD | ms | segment stats | VAD frames | yes | no | VAD segmentation | canonical evidence | processing pauses | canonical dimensions | yes | task and language dependent | keep_with_new_gate |
| Speaking-rate proxy | backend derived | count/min | syllable nuclei proxy | energy envelope | yes | no | envelope peaks | canonical evidence | speech dynamics | canonical dimensions | yes | not true words/min; may saturate | keep_with_new_gate |
| VAD segmentation | backend WebRTC/fallback | ms/ranges | WebRTC or energy fallback | PCM frames | yes | yes | duration and confidence | capture refs | all timing | indirect | yes | fallback quality fixed; no SNR component | keep_with_new_gate |
| Clipping | backend decode | ratio | clipped sample/frame ratio | waveform | yes | yes | threshold | raw feature | consistency | none | yes | computed before resampling/normalization | keep |
| Zero crossing | backend spectral | ratio | frame ZCR average | waveform | yes | yes | frames present | raw feature | compatibility only | none | partial | noise/sibilance sensitive | developer_only |
| Rhythm measures | backend timing | mixed | pauses, voiced runs, rate proxy | VAD/envelope | yes | no | VAD/envelope | raw/canonical | processing/speech dynamics | canonical dimensions | yes | prompt protocol not fully encoded | keep_with_new_gate |
| Client jitter/shimmer | `frontend/lib/voiceSpectrum.ts` | percent | local pitch/RMS deltas | browser decoded blob | no | limited | client capture quality | compatibility raw aliases | V2 evidence if server alias absent | compatibility engines | yes | task-incompatible for guided speech | task_specific_only |
| Client formant-like stats | `frontend/lib/voiceSpectrum.ts` | ratio | amplitude spectrum peak proxy | browser decoded blob | limited | limited | client frame count | compatibility raw aliases | V2 evidence | compatibility engines | yes | not true formants | developer_only |

## Direct Versus Derived

Direct measurements:

- Waveform duration, clipping ratio, RMS energy, zero crossing, spectral centroid, spectral flatness, VAD segments.
- Praat F0 and HNR are direct algorithm outputs, conditional on tracking quality.

Derived scores:

- Pitch stability, harmonic richness, CPP proxy, formant stability, formant dynamics, phonation ratio, pause density, speaking-rate proxy.
- Compatibility client jitter/shimmer and formant-like values are derived proxies.

## Boundedness And Saturation

Clamped 0..1 fields include pitch stability, formant stability, formant dynamics, harmonic richness, spectral flatness, phonation ratio, clipping ratio, and many downstream normalized rules. These can saturate and hide uncertainty. Semitone range and speaking-rate proxy are bounded only downstream by rule-specific magic numbers.

## Rejected Values And Missingness

Backend null measurements remain null, but `_measurement` sets quality `poor`, confidence `0`, and default rejection reason `insufficient_reliable_signal`. This correctly prevents those rows from becoming quality-approved raw features, but `frontend/lib/canonicalResult.ts` still includes them in canonical evidence missingness and confounds.

Required correction:

```ts
type QualitySemantics = {
  captureQuality: "excellent" | "good" | "fair" | "poor"
  featureQuality: "good" | "limited" | "unavailable"
  featureAvailability:
    | "available"
    | "insufficient_periodic_cycles"
    | "task_incompatible"
    | "tracking_failure"
    | "quality_gate_failed"
  affectsGlobalCaptureQuality: boolean
}
```

## Mandatory Jitter/Shimmer Investigation

Proven facts:

- Backend jitter/shimmer are calculated only inside `if capture_kind == "sustained_vowel"` in `_pitch_and_praat_features`.
- Non-sustained captures still receive null jitter/shimmer rows through `measurements.setdefault(feature_id, None)`.
- `_measurement` encodes those rows as poor/0/`insufficient_reliable_signal`.
- Frontend client analysis computes `jitterLocalPct` and `shimmerLocalPct` for connected speech and `mergeVoiceAnalyses` weights them.
- `buildRawFeatures` can add client `voice.jitter` and `voice.shimmer` if no approved server alias exists.

Root cause:

Task incompatibility is represented as signal failure. A good connected-speech recording can therefore contain poor perturbation rows and generic rejection reasons even when capture quality is good.

Regression fixture status:

- Added characterization tests in `frontend/tests/phaseE5ScientificAudit.test.ts` for connected speech perturbation unavailability, capture versus feature quality, feature-specific confidence, missingness propagation, retry-message gating, boundary-blend measurement, duplicate narrative surfaces, and technical-language filtering.
- Synthetic audio fixtures for clean sustained vowel, quiet speech, expressive speech, low voiced duration, clipped audio, noisy audio, and pitch outside range are still missing and should be generated before changing extraction behavior.

