# Voice analysis and useful reflection: evidence review

Reviewed October 16, 2026 UTC (October 15 in Hawaiʻi). Canon Set v2.0 controls.
Purpose: improve the result users receive, while distinguishing measured vocal
behavior, an emotion hypothesis, and the person's own account of their experience.

## EmotionLogic / LVA

The name is **Layered Voice Analysis (LVA)**. EmotionLogic describes LVA as
proprietary deterministic acoustic analysis and its AEI offering as a combination
of that technology and generative AI. It advertises developer APIs and resources.
These are vendor descriptions, not independent accuracy estimates. No EmotionLogic
credential, licensed model or validated SoulScope-specific integration was found
in the current app; the Clean worker uses its own Praat/WebRTC-based extraction.

Vendor sources:

- [EmotionLogic: About](https://emotionlogic.ai/about/)
- [EmotionLogic: Developers](https://emotionlogic.ai/developers)
- [EmotionLogic: API upload documentation](https://app.emotionlogic.ai/documentation/analysis-request-upload-file)

Some vendor documentation returned only a minimal public page. The API's full
response contract, license, retention terms and applicable validation would need
review before implementation. No recordings were uploaded to the vendor.

## What the research supports, and what it does not

- [Pereira et al., 2021](https://doi.org/10.3389/fpsyg.2021.675721)
  studied commercial non-verbal signals during media-skills training. Its
  exploratory sample contained 33 participants and several modalities. Some
  LVA outputs correlated with ordinary acoustic features. That does not establish
  accurate inner-state readings for a person's 90-second SoulScope scan.
- [Tani et al., 2024](https://doi.org/10.1093/joccuh/uiae047)
  randomized 66 call-center workers to interventions including LVA-supported
  group sessions. Results suggest potential benefit from the intervention. The
  authors explicitly note the need to compare group sessions with and without
  LVA to isolate the technology's contribution. Intervention benefit is not an
  estimate of per-scan emotional accuracy.
- [Tani et al., 2025](https://doi.org/10.1093/joccuh/uiaf060)
  developed a prospective model in 62 call-center workers using accumulated
  work-call data and a defined symptom questionnaire. Reported AUC was 0.783
  (95% CI 0.691–0.875), with sensitivity 0.649. This is not 78.3% accuracy for
  arbitrary emotion labels. Its population, target, time window and model differ
  from SoulScope. No coefficients or cutoffs were ported.
- [NIJ field evaluation, 2008](https://nij.ojp.gov/topics/articles/voice-stress-analysis-only-15-percent-lies-about-drug-use-detected-field-test)
  found poor deception-detection performance for then-current LVA/CVSA tools.
  This older, different task does not settle modern emotion-analysis performance;
  it illustrates why a claim must be validated against its specific target.
- A [2026 LVA review](https://doi.org/10.1016/j.specom.2026.103415)
  was located, but only its abstract/highlights were accessible. No quantitative
  validity claim in this change relies on its inaccessible full text.

## Product decision

Use supported within-recording observations to give the user a specific starting
point, then invite them to supply the lived meaning. Avoid generic second-person
stories that only sound individualized. Preserve uncertainty without making an
unavailable psychological interpretation the whole result experience.

Current implementation: a deterministic, server-produced recording reflection,
response comparisons, optional noticing activities and one open question.
Psychological Dimensions/states remain abstained. The result is useful observation
and self-reflection, not an externally validated emotion reading.

LVA could be evaluated in a separately consented research comparison if desired.
Its outputs would be candidate measurements/model predictions, not ground truth.
Agreement with another model is not validation. Adoption would require relevant
task/device/language tests, independent reference measures, participant-separated
evaluation, calibrated uncertainty, and reviewed data-processing terms.
