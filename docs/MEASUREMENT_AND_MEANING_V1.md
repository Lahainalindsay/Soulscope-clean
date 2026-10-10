# Measurement profile and meaning publication v1

Canon Set v2.0 controls. Original SoulScope main `dee71405` supplies coverage and presentation references, not scientific validation.

## Measurement release

Worker `soulscope-measurement-worker-0.3.0` appends `acoustic-profile.v1` to each existing prompt measurement object. The 12 legacy slots and their recording acceptance behavior remain unchanged. The 56 new slots have explicit units, full-response time scope, source capture, algorithm parameters, support counts, native-library version, original-name mapping and correlation group. They are all provisional, research-only, excluded from semantic and Signature use. The shared catalog is `packages/canonical-contracts/src/acousticProfile.ts`; the Python catalog is `backend/app/acoustics/profile.py`.

- F0: Praat autocorrelation contour with 10 ms step, 60–500 Hz search bounds; voiced-frame mean/median/SD/p20/p80/range/semitones, valid-frame ratio and coefficient of variation. The search bounds are algorithm settings, not emotional thresholds.
- Spectrum: Hann-window 40 ms frames, 20 ms hop, full response and all frequencies through Nyquist. Centroid, flatness, 85% rolloff, slope, low-band power share, normalized adjacent-frame flux and zero crossings. Low-band power share is not labeled actual harmonic richness.
- Amplitude: digital frame RMS in dBFS; explicitly not calibrated SPL, loudness, psychological energy or effort.
- Phonation: HNR at F0-voiced times with Praat silence sentinels removed; frame support and research status retained. Cepstral proxy is explicitly not validated CPP.
- Timing: WebRTC VAD mode 2 and 30 ms frames with no silent energy fallback. Saved speech/leading silence/internal pause/trailing silence segments, actual speech time, speech ratio, speech-to-silence ratio, internal-pause statistics. Speech detection is not phonation. Syllable nuclei remain a labeled envelope-peak proxy, not validated speech or articulation rate.
- Formants: Burg F1–F3 candidates at voiced times, median/SD/IQR and valid ratios; vowel/task compatibility remains unestablished, so no psychological or production formant inference.
- Jitter/shimmer: every original cycle-level slot remains explicit null with `TASK_INELIGIBLE_CONNECTED_SPEECH` under the existing three spoken prompts. No sustained-vowel capture is added.
- Original pitch clarity/stability and formant dynamics/stability transforms are retained as explicit unavailable slots. Their arbitrary 0–1 formulas are not copied as valid measurements. Search-bound settings are stored in parameters rather than treated as measured features.

Native dependency absence produces `NATIVE_DEPENDENCY_UNAVAILABLE`; analysis failure produces an explicit reason. It cannot be masked by fallback values. Zero denominators and absent pauses remain null where a statistic is undefined. Measured counts and ratios can legitimately be zero. Successful numerical extraction is not evidence of emotional accuracy.

The original's duration, digital RMS, peak and clipping coverage is supplied by legacy measurements; raw original names are mapped in the new catalog. No transcript/content classifier, external emotion provider, gender classifier or competing report builder is introduced.

## Evidence boundary

Existing canonical marker selection and Dimension/state rules are unchanged. New research IDs are not aliases for canonical candidate IDs and cannot increase eligible independent-family coverage. Features sharing spectra, F0 contours or VAD masks are not separate independent evidence sources. A future feature promotion requires an approved canonical mapping and a new Evidence rule version; current tests prove adding the profile does not change the scientific Evidence Ledger.

## Language boundary

At creation of a new canonical semantic result, the database seals `ReflectionNarrativeV1` into its report. Current publication is strictly `UNRESOLVED`, references the saved narrative decision, contains explicit reason codes and has no fabricated strongest observation, overview, daily-life examples or question. Existing sealed results are never rewritten.

The main results page only renders the supplied narrative, including when unresolved. Recording descriptions and their optional API request belong exclusively to the details view. Ready rendering already supports the requested original-style structure. No scores or acoustic measurements enter the narrative renderer. Prohibited-language and source-membership validation remain active.

This release does **not** create a validated emotion or psychological model. Future READY publication requires a separately reviewed calibrated meaning producer. The SQL guard does not permit enabling READY by changing an environment variable or accepting frontend prose.

## Required calibration work before personal results

No suitable reference dataset or validated publication rules were found in either runtime. These are unresolved scientific inputs, not implementation defaults:

1. Define each proposed claim, its intended use, its measurable construct and acceptable error before fitting a model. Separate direct recording descriptions from psychological hypotheses and from optional reflective questions.
2. Obtain consented participant recordings under the same tasks and device conditions, independent reference labels, confound annotations and documented exclusions. Do not infer labels from the very acoustics being validated. Current saved customer recordings are not automatically a labeled training dataset.
3. Split development, calibration and final held-out evaluation by participant; avoid prompt/device/history leakage. Establish device, language, task, noise and sample-support limitations. Retain the dataset and model versions and hashes.
4. Evaluate feature repeatability and error, independent Evidence mappings, score/uncertainty calibration and abstention performance. Record failures and unsupported regions. Determine publication cutoffs from a preregistered evaluation criterion rather than from desired result frequency.
5. Approve versioned meaning predicates and their counter-evidence/alternative requirements. Every substantive sentence needs actual supported evidence, a publication decision and selected meaning-unit references. Evaluate whether the explanation accurately describes the input; fluent writing alone does not qualify it.
6. Keep recovery, reserve and relational availability abstained until compatible protocols exist. Do not infer diagnosis, identity, deception, cause or hidden truth. Preserve old sealed results and append new scientific versions when the model changes.

A model cannot be declared accurate by adding more acoustic variables or by passing software tests. Native measurement checks and scientific validation are separate release gates.
