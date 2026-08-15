# SoulScope Constellation Bible

Title: SoulScope Constellation Bible
Version: 0.1
Status: Research & Architecture Foundation
Source: docs/source/SoulScope_Constellation_Bible_v0.1.docx
Authority: Operational specification governed by the SoulScope Foundational Canon
Transcription note: Faithful Markdown transcription with formatting normalization only
Implementation readiness: NOT YET APPROVED — source audit identifies incomplete calibration, validation, and implementation contracts
Change control: Substantive changes require explicit owner approval
Source header: SOULSCOPE™ | CONSTELLATION BIBLE | V0.1
Source footer: Research & Architecture Foundation • July 28, 2026 • Internal Working Specification
Embedded title image note: source document contains a title-area image labeled "SOULSCOPE" and "SEE WITHIN. KNOW MORE."

> Authority note: The SoulScope Foundational Canon controls product truth, scientific boundaries, prohibited claims, visual laws, and governance. This Constellation Bible controls operational constellation specifications where it does not conflict with the Canon.

---

# Constellation Bible

*Research & Architecture Foundation • Version 0.1*

> NORTH STAR<br>Transform measurable vocal patterns into meaningful reflection while preserving traceability, uncertainty, context, and personal agency.

Your voice. Your pattern. Your signature.

| Document role | Status |
| --- | --- |
| Scientific boundary | Normative: must be obeyed |
| Engine architecture | Ready for schema and rules implementation |
| Dimensions and constellation geometry | Provisional v0.1; calibrate before production |
| Canonical states | Seed registry; IDs fixed when adopted |
| Clinical or diagnostic use | Out of scope |

## 1. Executive judgment

*What is strong, what changes, and what this edition commits to*

> VERDICT<br>The proposed pipeline is unusually strong because it makes evidence traceability—not a model label—the center of the product. The Evidence Ledger, unresolved-state behavior, permanent IDs, and post-hoc pattern names should remain non-negotiable.

SoulScope should not reproduce EmotionLogic’s proprietary scoring engine or inherit its most aggressive labels. The useful lesson from LVA is architectural: speaker calibration, segment-level evidence, temporal state, prompt aggregation, and structured reporting. The scientific lesson is equally important: acoustic measures are many-to-many cues. A single feature can change for several physical, linguistic, situational, and emotional reasons.

### Required corrections to the current direction

- Replace “every meaningful region receives a state” with a continuous geometry plus a compact canonical state grammar. Hand-writing every region creates brittle taxonomies and false precision.

- Treat dimensions as evidence-supported functional tendencies, not latent truths. Their names must stay close to what the signal can actually support.

- Separate within-scan baseline, personal Reference Signature, and population priors. Missing baseline is unknown—not average, neutral, or zero.

- Do not let a generative model calculate dimensions, select states, or invent causes. It may verbalize an already-completed ledger and must cite the reasoning records it uses.

- Do not market “151 biomarkers” as a goal. Feature count is not validity. A smaller, versioned, reproducible set is more defensible.

### The four proposed constellations

| Code | Constellation | Four points | Question answered |
| --- | --- | --- | --- |
| COG | Cognitive Form | Organization • Exploration • Focus Continuity • Processing Demand | How is mental work being organized and sustained? |
| REG | Regulatory Motion | Activation • Stability • Flexibility • Recovery | How is the system responding, adapting, and returning? |
| CAP | Available Capacity | Mobilization • Reserve • Effort Cost • Sustainability | What resources appear available, and what does current functioning seem to cost? |
| EXP | Expressive Interface | Range • Openness • Restraint • Relational Availability | How is inner activity being carried into outward expression? |

> IMPORTANT<br>These are not four emotions. They are four views of current vocal functioning. No constellation can independently diagnose a mood, condition, motive, personality, or physical illness.

## 2. Scientific boundary

*What voice acoustics can support—and what SoulScope must never claim*

### 2.1 Evidence hierarchy

| Tier | Meaning | Allowed engine behavior | Examples |
| --- | --- | --- | --- |
| A — Measurement | Directly computed, reproducible acoustic or timing quantity. | May enter the Evidence Ledger after quality gates. | Median F0, F0 range, HNR, jitter, voiced rate, pause ratio, spectral slope. |
| B — Functional evidence | Bounded interpretation supported by multiple Tier A measures and context. | May support a continuous dimension with confidence and alternatives. | Greater activation cueing; increased pause load; reduced prosodic variability; change from personal baseline. |
| C — Reflective hypothesis | Possible lived meaning generated from constellation and interaction geometry. | May appear only as probabilistic narrative with alternatives. | This may reflect sustained effort, protective restraint, or a transition toward recovery. |
| D — Prohibited inference | Diagnostic, deceptive, causal, identity, organ, or certainty claim unsupported by the evidence. | Suppress; log policy failure. | Depression detected; lying; trauma held in the voice; adrenal weakness; true personality. |

### 2.2 What the literature supports

- Standard acoustic sets such as eGeMAPS provide a reproducible vocabulary spanning frequency, energy/amplitude, spectral balance, voice quality, and temporal descriptors. They were designed for affective computing and related voice-research tasks—not as a universal emotion truth machine.

- Vocal emotion research consistently finds useful cues, especially for activation/arousal. Valence and discrete emotion are less stable and more dependent on speaker, language, task, context, acting versus spontaneous speech, and dataset.

- Stress can affect F0, intensity, speech rate, respiration-related timing, formants, and voice quality, but directions vary across people and stressors. Personal baselines and converging evidence are essential.

- Health-related vocal biomarkers are promising for research and monitoring, but reviews repeatedly identify dataset bias, small cohorts, inconsistent tasks, limited external validation, privacy risk, and lack of clinical translation.

- LVA research does not justify deception detection. Controlled and field studies have reported weak accuracy and substantial false-positive behavior.

### 2.3 Claims policy

| May say | May say with strong context | Must not say |
| --- | --- | --- |
| “Pitch variation was lower than this user’s established baseline.” | “Together, reduced variation and longer pauses may reflect greater processing demand.” | “The user is depressed.” |
| “The sample contains more intensity fluctuation.” | “This pattern may be consistent with stronger activation in this moment.” | “The user is anxious.” |
| “Recovery cues increased during the final prompt.” | “The scan may show movement toward easier regulation.” | “The nervous system healed.” |
| “Evidence is mixed; no clear constellation state was assigned.” | “Protective restraint is one plausible interpretation; vocal fatigue is another.” | “The user is hiding something.” |

## 3. Canonical processing contract

*Every abstraction remains traceable to measured evidence*

1. Raw Acoustic Features — immutable outputs from versioned extractors.

1. Evidence Engine — quality-gated, contextualized statements about observed change or structure.

1. Evidence Ledger — single source of truth with support, contradiction, provenance, reliability, and missingness.

1. Dimension Engine — continuous functional tendencies derived from multiple evidence families.

1. Constellation Engine — four-point geometry, state candidates, blends, and unresolved behavior.

1. Cross-Constellation Interaction Engine — typed relations among independently resolved constellation states.

1. Pattern Engine — descriptive summary label selected after reasoning, with winning and losing candidates recorded.

1. Narrative Engine — controlled verbalization of completed reasoning.

1. Resonance Signature — visual encoding of the same dimensions, confidence, geometry, and uncertainty.

> HARD RULE<br>Nothing bypasses the Evidence Ledger. The narrative and the visualization receive the same signed reasoning object; neither may independently reinterpret raw audio.

### 3.1 Minimum ledger record

| Field | Required content |
| --- | --- |
| evidence_id | Permanent unique ID |
| session / segment | Session ID, prompt ID, start and end time |
| source_features | Feature IDs, extractor and feature-definition versions |
| observation | Neutral evidence statement |
| direction / magnitude | Signed standardized deviation plus raw value/unit |
| quality | SNR/noise, clipping, voiced duration, tracking stability, task compliance |
| baseline | Reference type, trust status, compatibility, sample count |
| support / contradiction | Linked evidence IDs and relationship type |
| confounds | Detected or user-declared alternatives |
| confidence | Calibrated score and component breakdown |
| policy | Allowed inference tier and prohibited-use flags |
| timestamp | Creation time plus rule/model version |

### 3.2 Baseline hierarchy

| Priority | Reference | Use | Guardrail |
| --- | --- | --- | --- |
| 1 | Personal Reference Signature | Primary change-from-self interpretation. | Same user, feature version, unit, task family, and compatible capture conditions. |
| 2 | Within-session reference | Prompt-to-prompt and early-to-late comparison. | Never call it trait or long-term change. |
| 3 | Matched population prior | Feature scaling and anomaly checks. | Not a substitute for a personal baseline; stratify and audit bias. |
| 4 | No reference | Raw description only. | Suppress directional personal claims. |

## 4. Acoustic feature registry

*Recommended open, versioned measurement families*

| Family | Examples | Primary functional use | Major confounds |
| --- | --- | --- | --- |
| Frequency/prosody | F0 median, percentiles, range, slope, contour variability | Activation, expressive range, focus continuity | Sex/anatomy, age, language, intonation, question type, pitch tracker errors |
| Energy/amplitude | Loudness, RMS, intensity range, attack/release | Mobilization, range, effort variation | Mic distance, gain, compression, room, device |
| Voice quality | HNR, CPP, jitter, shimmer, spectral tilt, H1–H2 | Stability, strain/effort cues, breath/phonation variation | Vocal pathology, illness, dehydration, fatigue, creaky/breathy style, short segments |
| Spectral | Alpha ratio, Hammarberg index, spectral slope, flux, centroid, MFCC summaries | Timbre/energy distribution, change, articulation proxies | Codec, denoising, microphone response, phoneme content |
| Temporal | Voiced rate, articulation rate, pause count/duration, response latency | Processing demand, focus continuity, restraint, recovery | Prompt complexity, language, reading skill, interruption, deliberate pacing |
| Formant/articulation | F1/F2/F3, bandwidth, vowel-space and stability measures | Articulatory change, organization/effort support | Phonetic content, accent, anatomy, tracker failure |
| Rhythm | Syllabic timing, interval variability, phrase regularity | Organization, continuity, flexibility | Language rhythm class, prompt/task, ASR/VAD errors |
| Breath/onset proxies | Voicing onset, breath-group length, pause-breath timing | Mobilization, effort cost, recovery support | Asthma/respiratory state, posture, speech task, noise |

### 4.1 Extraction recommendation

- Adopt a commercial-compatible implementation of the eGeMAPS v02 concepts or obtain the appropriate openSMILE commercial license; do not assume the research license permits a commercial product.

- Use a validated Praat/Parselmouth pipeline for F0, formants, jitter, shimmer, HNR/CPP, with minimum voiced-duration and periodicity gates. Browser approximations must remain explicitly tagged as lower-reliability.

- Store low-level descriptors and session/prompt functionals separately. Do not collapse all time behavior into one session average.

- Retain canonical lossless audio only under explicit consent and retention policy; derived features should be independently deletable and privacy-classified.

## 5. Shared dimension model

*How evidence becomes a point without pretending one cue has one meaning*

### 5.1 Normalization

For feature f, compute a robust change score only when the reference is compatible and trusted: zᶠ = clamp((xᶠ − medianᶠ_ref) / max(1.4826·MADᶠ_ref, εᶠ), −3, 3). If MAD is zero, the reference is missing, or versions/units/tasks are incompatible, the personal deviation is unresolved.

### 5.2 Evidence-family aggregation

Each dimension requires at least two independent evidence families. Closely related measurements from the same algorithmic family count once for independence. A weighted robust mean may propose a score, but contradiction and quality gates determine whether the score is publishable.

| Component | Recommended v0.1 role |
| --- | --- |
| Direction score | Weighted signed evidence after baseline/context adjustment |
| Evidence coverage | Observed required families ÷ required families |
| Quality reliability | Minimum or conservative aggregate of signal-quality factors |
| Agreement | 1 minus normalized conflict among independent evidence families |
| Baseline trust | Established 1.0; provisional ≤0.7; within-session ≤0.6; absent 0 |
| Confidence | Calibrated function of coverage, quality, agreement, baseline trust, and boundary distance |

> DO NOT HARD-CODE 0.50 FOREVER<br>All numeric weights and thresholds in v0.1 are engineering priors, not scientific constants. They must be calibrated on SoulScope data with preregistered outcomes and frozen evaluation sets.

## 6. COG — Cognitive Form

*How current mental work appears organized, explored, sustained, and carried*

Cognitive Form describes the shape of processing visible in speech—not intelligence, thought content, truthfulness, or diagnosis. Its geometry distinguishes structured continuity from searching, demand, and adaptive exploration.

#### COG-P1 — Organization

> DEFINITION<br>Consistency and coherent temporal/prosodic structure across voiced segments and prompts.

| Field | Specification |
| --- | --- |
| High | More stable rhythm, contour organization, and phrase structure relative to compatible reference. |
| Low | Less consistent organization or insufficient stable structure. |
| Healthy possibilities | Clear sequencing, deliberate pacing, coherent construction. |
| Strained possibilities | Rigidity, over-control, or structure maintained through effort. |
| Supporting evidence families | Rhythm consistency; phrase timing; F0 contour continuity; formant stability; pause placement. |
| Contradictory evidence | High disfluency without task complexity; unstable tracking; strong prompt-to-prompt inconsistency. |
| Common confounds | Reading versus spontaneous speech; language rhythm; rehearsed material; ASR/VAD error. |
| Minimum evidence | Two families: temporal/rhythm plus prosodic or articulation evidence; ≥12 s valid voiced speech across ≥2 prompts. |
| Relationships | Reinforced by Focus Continuity; can oppose Exploration; may compensate for Processing Demand. |

#### COG-P2 — Exploration

> DEFINITION<br>Variation and search-like movement that may reflect trying alternatives, elaborating, or reorganizing.

| Field | Specification |
| --- | --- |
| High | Greater contour, timing, lexical-prosodic, or response-path variation without quality failure. |
| Low | Narrower variation or a more direct/repeated response path. |
| Healthy possibilities | Curiosity, flexibility, generative thought, adaptive searching. |
| Strained possibilities | Scattered searching, indecision, or difficulty settling. |
| Supporting evidence families | Prosodic variability; phrase-pattern variation; response latency distribution; pause placement shifts; spectral flux. |
| Contradictory evidence | Stable directness across prompts; variation explained by noise, topic, or expressive style. |
| Common confounds | Open-ended prompt; storytelling; multilingual speech; attention interruption; novelty. |
| Minimum evidence | Two families across ≥2 prompts; must separate within-prompt variability from between-prompt task effects. |
| Relationships | Can balance Organization; high Exploration with high Demand may indicate search cost. |

#### COG-P3 — Focus Continuity

> DEFINITION<br>Persistence of a coherent vocal-temporal pattern through a response.

| Field | Specification |
| --- | --- |
| High | Sustained rate, phrase structure, and prosodic direction with few unexplained breaks. |
| Low | More interruption, drift, or variable continuity. |
| Healthy possibilities | Steady attention, persistence, absorbed engagement. |
| Strained possibilities | Tunnel focus, perseveration, or fragile concentration. |
| Supporting evidence families | Rate continuity; pause topology; contour drift; within-response rhythm; prompt completion. |
| Contradictory evidence | High organization with short valid speech; deliberate contemplative pauses; external interruptions. |
| Common confounds | Prompt difficulty; reading; fatigue; speech/language disorder; environmental interruption. |
| Minimum evidence | Two temporal/prosodic families and ≥3 analyzable phrases; prompt completion metadata required. |
| Relationships | Reinforces Organization; high with low Flexibility elsewhere may become constraint. |

#### COG-P4 — Processing Demand

> DEFINITION<br>Evidence that producing and organizing the response currently requires additional work.

| Field | Specification |
| --- | --- |
| High | Convergent increases in pause/latency, effort or instability relative to self/task reference. |
| Low | Lower observable demand or unresolved demand. |
| Healthy possibilities | Careful thought, meaningful complexity, deliberate consideration. |
| Strained possibilities | Overload, friction, reduced efficiency, effortful compensation. |
| Supporting evidence families | Response latency; pause load; rate change; vocal-effort proxies; instability; segment-to-segment recovery. |
| Contradictory evidence | Fast fluent response with stable quality; demand explained by complex prompt or unfamiliar language. |
| Common confounds | Prompt complexity; sleep; illness; medication; pain; second language; vocal fatigue. |
| Minimum evidence | At least three families, one temporal and one voice-quality/effort family; compatible prompt reference strongly preferred. |
| Relationships | Can be buffered by Organization and Capacity; amplifies unstable Exploration. |

### 6.1 Cognitive geometry

| Geometry | Interpretation |
| --- | --- |
| Organization ↔ Exploration | A productive tension, not a binary opposite. Balance suggests structured flexibility; dominance describes method. |
| Focus Continuity ↔ Processing Demand | Continuity can remain high while demand rises, producing deliberate effort rather than disorganization. |
| Organization + Focus | Reinforcing structure; inspect whether Capacity shows ease or cost. |
| Exploration + Demand | Searching under load; distinguish generative exploration from fragmentation using continuity and contradiction. |
| All high | Complex, engaged, highly managed processing; confidence depends on Capacity and Regulation. |
| All low | Could reflect ease, disengagement, insufficient speech, flat task demand, or measurement failure; never label automatically. |

### 6.2 Seed state registry

#### COG-017 — Deliberate Builder

Thought appears to be assembled carefully, with structure carrying meaningful demand.

| State field | Canonical rule |
| --- | --- |
| Configuration | Organization high; Focus Continuity moderate–high; Processing Demand moderate–high; Exploration low–moderate. |
| Core meaning | A structured processing style is helping the person work through something that is not effortless. |
| Strengths | Care, persistence, sequencing, considered response. |
| Potential costs | Slowness, over-management, fatigue from holding the structure. |
| Daily-life expression | Taking time to choose words; building one point at a time; staying organized during a difficult topic. |
| Possible underneath | Complexity, responsibility, uncertainty, or the need to avoid mistakes. |
| Worth noticing | Whether the structure feels supportive or expensive. |
| Reflection prompts | What becomes easier if you do not have to get it exactly right? |
| Supporting evidence | Temporal organization + continuity + elevated demand evidence across ≥2 prompts. |
| Contradictions | Low quality; demand only from prompt complexity; strong spontaneous ease in other prompts. |
| Nearby / blends | COG-014 Structured Ease; COG-018 Focused Load; blend when demand sits near boundary. |
| Fingerprint behavior | Dense but smooth inward contours; directional flow; moderate asymmetry; no chaotic spikes. |
| Confidence limit | Do not assign if demand has fewer than three independent families or baseline is absent. |

#### COG-014 — Structured Ease

Processing appears organized and continuous without strong signs of extra effort.

| State field | Canonical rule |
| --- | --- |
| Configuration | Organization high; Focus high; Demand low; Exploration low–moderate. |
| Core meaning | Clear, efficient structure with available room. |
| Strengths | Clarity, reliability, follow-through. |
| Potential costs | Routine rigidity or under-exploration if repeated across contexts. |
| Daily-life expression | Direct answers, steady pacing, clean transitions. |
| Possible underneath | Familiarity, preparation, confidence in the task. |
| Worth noticing | Whether ease remains when the topic changes. |
| Reflection prompts | What becomes possible when you trust the structure that is already here? |
| Supporting evidence | High continuity/organization with no convergent demand evidence. |
| Contradictions | Short rehearsed sample; suppressed variability from task. |
| Nearby / blends | COG-017 Deliberate Builder; COG-011 Open Architect. |
| Fingerprint behavior | Smooth symmetric contours, lower density, stable center. |
| Confidence limit | Requires at least two prompts with different cognitive demands. |

#### COG-011 — Open Architect

Structure and exploration are working together rather than competing.

| State field | Canonical rule |
| --- | --- |
| Configuration | Organization moderate–high; Exploration moderate–high; Focus moderate; Demand low–moderate. |
| Core meaning | Flexible thought with enough structure to stay coherent. |
| Strengths | Creativity, reframing, synthesis. |
| Potential costs | Over-expansion or too many branches if focus drops. |
| Daily-life expression | Connecting ideas, adjusting language, finding multiple pathways. |
| Possible underneath | Curiosity or active integration. |
| Worth noticing | Which possibilities deserve structure now? |
| Reflection prompts | Where would one clear decision create more room? |
| Supporting evidence | Prosodic/rhythmic variety plus maintained organization across prompts. |
| Contradictions | Variation driven only by topic or noise. |
| Nearby / blends | COG-014 Structured Ease; COG-020 Searching Load. |
| Fingerprint behavior | Balanced multi-lobed contours with open spacing. |
| Confidence limit | Exploration must be replicated beyond one expressive prompt. |

#### COG-020 — Searching Load

The system appears to be exploring while carrying noticeable processing demand.

| State field | Canonical rule |
| --- | --- |
| Configuration | Exploration high; Demand high; Organization low–moderate; Focus variable. |
| Core meaning | Active search has not yet settled into a stable structure. |
| Strengths | Possibility generation, sensitivity to complexity. |
| Potential costs | Mental friction, indecision, fragmentation risk. |
| Daily-life expression | Revisions, pauses, changing pace, partial restarts. |
| Possible underneath | Novelty, unresolved choice, competing priorities. |
| Worth noticing | Whether the searching is useful discovery or repeated looping. |
| Reflection prompts | What would make the next step smaller and more concrete? |
| Supporting evidence | Multiple search cues plus demand cues and reduced continuity. |
| Contradictions | Second-language speech; difficult prompt; interruption. |
| Nearby / blends | COG-011 Open Architect; COG-017 Deliberate Builder. |
| Fingerprint behavior | Irregular branching contours; density rises with demand; reduced symmetry. |
| Confidence limit | Narrative must include at least one non-emotional alternative explanation. |

## 7. REG — Regulatory Motion

*How activation changes, steadies, adapts, and returns*

Regulatory Motion describes temporal dynamics. It does not claim direct access to the autonomic nervous system. The strongest interpretation comes from within-scan change and repeated personal scans, not a single static score.

#### REG-P1 — Activation

> DEFINITION<br>Degree of observable vocal mobilization or arousal-related cueing.

| Field | Specification |
| --- | --- |
| High | More energy, pitch/intensity movement, rate or onset mobilization relative to reference. |
| Low | Lower mobilization, quieter/narrower production, or unresolved activation. |
| Healthy possibilities | Engagement, readiness, enthusiasm, decisive momentum. |
| Strained possibilities | Agitation, urgency, strain, or over-mobilization. |
| Supporting evidence families | F0 level/range; loudness; rate; spectral energy; onset behavior. |
| Contradictory evidence | Low energy distribution; slower rate; downward within-scan movement. |
| Common confounds | Microphone gain; cultural style; hearing environment; stimulant; exercise; excitement. |
| Minimum evidence | Three families, including energy and prosody; mic-level calibration required. |
| Relationships | Balanced by Stability and Recovery; can amplify Expression. |

#### REG-P2 — Stability

> DEFINITION<br>Consistency of voice production and timing within comparable segments.

| Field | Specification |
| --- | --- |
| High | Lower unexplained perturbation and more consistent temporal/prosodic structure. |
| Low | Greater fluctuation or insufficient reliable periodic speech. |
| Healthy possibilities | Grounding, steadiness, tolerance of activation. |
| Strained possibilities | Rigidity, suppression, or fragile control if maintained through cost. |
| Supporting evidence families | CPP/HNR; jitter/shimmer with strict gates; intensity variability; timing consistency. |
| Contradictory evidence | Abrupt unprompted shifts; poor periodicity; instability across prompts. |
| Common confounds | Voice disorder; illness; dehydration; age; vocal fry; device processing. |
| Minimum evidence | Two independent families; sustained vowel plus connected speech preferred; adequate periodic frames. |
| Relationships | Buffers Activation; high Stability with low Flexibility can constrain adaptation. |

#### REG-P3 — Flexibility

> DEFINITION<br>Capacity for graded change across prompts or moments without loss of coherence.

| Field | Specification |
| --- | --- |
| High | Context-appropriate shifts in prosody, timing, and intensity with preserved quality. |
| Low | Restricted change, chaotic change, or insufficient task variation. |
| Healthy possibilities | Adaptation, responsiveness, emotional range. |
| Strained possibilities | Lability if change is large and incoherent; inflexibility if movement is absent. |
| Supporting evidence families | Prompt-to-prompt modulation; recovery slopes; contour/intensity range; preserved HNR/CPP. |
| Contradictory evidence | All shifts explained by prompt acoustics; change accompanied by quality collapse. |
| Common confounds | Prompt design; acting; code-switching; social masking; device gain. |
| Minimum evidence | At least three prompt contexts and two change families; coherence gate required. |
| Relationships | Transforms Activation; supports Recovery; can destabilize if Stability is low. |

#### REG-P4 — Recovery

> DEFINITION<br>Observable return toward a trusted reference or reduction of activation/effort after challenge.

| Field | Specification |
| --- | --- |
| High | Directional movement toward baseline across ordered segments or repeated scans. |
| Low | Little return, movement away, or no valid challenge/recovery contrast. |
| Healthy possibilities | Recalibration, release, adaptive settling. |
| Strained possibilities | Slow return or unresolved carryover. |
| Supporting evidence families | F0/intensity/rate recovery slopes; pause normalization; voice-quality stabilization. |
| Contradictory evidence | No initial perturbation; prompt order confound; fatigue worsening over time. |
| Common confounds | Habituation; practice; prompt difficulty; microphone drift; deliberate calming. |
| Minimum evidence | Ordered challenge and recovery prompts; ≥3 timepoints; baseline trust ≥ provisional. |
| Relationships | Reinforced by Flexibility and Capacity; can protect high Activation. |

### 7.1 Regulatory geometry

| Geometry | Interpretation |
| --- | --- |
| Activation + Stability | Mobilized but contained; may be focused energy rather than strain. |
| Activation + low Stability | Volatile mobilization; check quality, illness, and expression before interpreting. |
| Flexibility + Recovery | Adaptive movement and return; strongest evidence of regulatory responsiveness. |
| Stability + low Flexibility | Stillness that may be grounding or constraining; Capacity and Expression decide. |
| All high | Responsive mobilization with return; may reflect dynamic regulation. |
| All low | Low movement, depleted capacity, flat task, guarded production, or weak evidence. |

#### REG-022 — Adaptive Recovery

The scan shows movement through activation with evidence of return rather than simple stillness.

| State field | Canonical rule |
| --- | --- |
| Configuration | Activation moderate–high; Flexibility high; Recovery high; Stability moderate–high. |
| Core meaning | The system appears able to mobilize, adjust, and come back toward its reference. |
| Strengths | Responsiveness, resilience, usable range. |
| Potential costs | Recovery may still carry a resource cost; one successful return is not a trait. |
| Daily-life expression | Energy rises when needed and settles across later prompts. |
| Possible underneath | A challenge was met without remaining fully captured by it. |
| Worth noticing | What helped the shift occur. |
| Reflection prompts | What conditions make it easier to return to yourself? |
| Supporting evidence | Ordered multi-prompt slopes across ≥3 families with preserved quality. |
| Contradictions | Prompt-order habituation; microphone drift; scripted calming instruction. |
| Nearby / blends | REG-019 Steady Mobilization; REG-024 Returning Capacity. |
| Fingerprint behavior | Contours expand then resolve inward; cyan reappears; reduced edge roughness. |
| Confidence limit | Requires temporal evidence; never infer from one session average. |

#### REG-019 — Steady Mobilization

Activation is present while vocal organization remains comparatively steady.

| State field | Canonical rule |
| --- | --- |
| Configuration | Activation high; Stability high; Flexibility moderate; Recovery unknown or moderate. |
| Core meaning | Energy appears contained and directed. |
| Strengths | Readiness, focus, persistence. |
| Potential costs | Sustained tension if recovery remains absent. |
| Daily-life expression | Speaking with force or pace without major fragmentation. |
| Possible underneath | Engagement, urgency, or responsibility. |
| Worth noticing | Whether steadiness feels energized or effortful. |
| Reflection prompts | Where can you let intensity do less work? |
| Supporting evidence | Activation across ≥3 families plus stability across ≥2. |
| Contradictions | Mic gain; practiced performance; high demand from task. |
| Nearby / blends | REG-022 Adaptive Recovery; REG-026 Held Activation. |
| Fingerprint behavior | Expanded but regular rings; high luminosity; controlled asymmetry. |
| Confidence limit | If Capacity cost is high, narrative must name resource expense. |

#### REG-024 — Returning Capacity

The strongest signal is a gradual movement toward steadier production.

| State field | Canonical rule |
| --- | --- |
| Configuration | Recovery high; Activation decreasing; Stability increasing; Flexibility moderate. |
| Core meaning | Return is underway, even if the starting point was strained. |
| Strengths | Recalibration, responsiveness, regained room. |
| Potential costs | Temporary fragility; return may be incomplete. |
| Daily-life expression | Later responses become steadier, easier, or less effortful. |
| Possible underneath | Rest, safety, task familiarity, or release. |
| Worth noticing | The direction of movement, not just the endpoint. |
| Reflection prompts | What changed between the beginning and the end? |
| Supporting evidence | Reliable within-scan improvement across temporal and voice-quality families. |
| Contradictions | Practice effect; warm-up; initial mic adjustment. |
| Nearby / blends | REG-022 Adaptive Recovery; CAP-021 Rebuilding Reserve interaction. |
| Fingerprint behavior | Outer roughness softens toward center; increasing spacing and coherence. |
| Confidence limit | State is transitional and should decay unless repeated. |

#### REG-026 — Held Activation

Energy remains elevated while return cues are limited or uncertain.

| State field | Canonical rule |
| --- | --- |
| Configuration | Activation high; Recovery low; Stability moderate–high; Flexibility low–moderate. |
| Core meaning | Mobilization appears sustained and contained rather than resolved. |
| Strengths | Endurance, task commitment, controlled intensity. |
| Potential costs | Carryover, constraint, or delayed recovery. |
| Daily-life expression | Maintaining pace or tone across the scan without much release. |
| Possible underneath | Urgency, vigilance, performance demand, or excitement. |
| Worth noticing | Whether containment is chosen or costly. |
| Reflection prompts | What would signal that the task is complete? |
| Supporting evidence | Persistent activation evidence plus absent recovery across ordered prompts. |
| Contradictions | No recovery prompt; session too short; stimulant or recent exercise. |
| Nearby / blends | REG-019 Steady Mobilization; REG-022 Adaptive Recovery. |
| Fingerprint behavior | Bright outer contour remains expanded; narrow return gradient. |
| Confidence limit | Suppress if the protocol did not include a valid recovery opportunity. |

## 8. CAP — Available Capacity

*What appears available, what is being spent, and whether the current pattern looks sustainable*

Available Capacity is deliberately conservative. Voice cannot directly measure metabolic reserves, organ health, burnout, or physical vitality. This constellation describes observable mobilization and apparent effort economics within the scan.

#### CAP-P1 — Mobilization

> DEFINITION<br>Observable ability to bring vocal energy and engagement into the task.

| Field | Specification |
| --- | --- |
| High | Adequate or increased loudness/energy, voiced continuity, onset and prosodic engagement. |
| Low | Reduced mobilization or insufficient participation. |
| Healthy possibilities | Readiness, presence, usable energy. |
| Strained possibilities | Overdrive or compensatory push. |
| Supporting evidence families | Energy distribution; voiced proportion; onset; rate; prosodic engagement. |
| Contradictory evidence | Low voiced energy, long unfilled pauses, declining engagement. |
| Common confounds | Mic distance/gain; quiet environment; cultural style; vocal rest; illness. |
| Minimum evidence | Energy calibration plus two other families and task-compliance evidence. |
| Relationships | Must be read with Effort Cost and Sustainability. |

#### CAP-P2 — Reserve

> DEFINITION<br>Evidence of additional room beyond the immediate demand, inferred from response to varied task load.

| Field | Specification |
| --- | --- |
| High | Performance remains coherent as demand changes, without disproportionate quality or timing cost. |
| Low | Small demand changes produce marked cost, or reserve cannot be tested. |
| Healthy possibilities | Buffer, adaptability, spare room. |
| Strained possibilities | Thin margin, compensation, vulnerability to added demand. |
| Supporting evidence families | Task-response slopes; stability under increased complexity; recovery; variability capacity. |
| Contradictory evidence | Stable output only under one easy prompt; worsening quality with demand. |
| Common confounds | Prompt mismatch; motivation; unfamiliarity; language; pain; medication. |
| Minimum evidence | At least two task-demand levels and ≥3 evidence families; personal/task reference required. |
| Relationships | Buffers Processing Demand and Activation; supports Openness. |

#### CAP-P3 — Effort Cost

> DEFINITION<br>Apparent vocal and temporal cost required to produce the observed performance.

| Field | Specification |
| --- | --- |
| High | Convergent effort, pause, phonatory-strain, or compensation cues. |
| Low | Lower observable cost or unknown cost. |
| Healthy possibilities | Intentional investment, careful work, sustained commitment. |
| Strained possibilities | Strain, inefficiency, depletion risk, costly compensation. |
| Supporting evidence families | CPP/HNR and spectral tilt; intensity-pressure proxies; pause/latency; rate change; instability. |
| Contradictory evidence | Effort cues absent; changes explained by voice condition or prompt. |
| Common confounds | Vocal pathology; dehydration; asthma; recent talking/singing; emotion; room/noise. |
| Minimum evidence | Three families; voice-quality feature reliability gate; health/context self-report optional but valuable. |
| Relationships | Opposes Sustainability when persistent; may explain high Organization or Restraint. |

#### CAP-P4 — Sustainability

> DEFINITION<br>Whether output remains stable across time without accumulating cost.

| Field | Specification |
| --- | --- |
| High | Limited adverse drift in quality, timing, energy, and continuity across the session. |
| Low | Progressive worsening, or session too short to assess. |
| Healthy possibilities | Endurance, pacing, maintainable effort. |
| Strained possibilities | Unsustainable output, fatigue accumulation, diminishing return. |
| Supporting evidence families | Time-on-task slopes; late-versus-early quality; pause/rate drift; recovery. |
| Contradictory evidence | Warm-up improvement; topic change; mic movement. |
| Common confounds | Session length; prompt order; learning/warm-up; hydration; device gain drift; background noise change. |
| Minimum evidence | ≥45 s valid voiced speech, ≥3 ordered prompts, and no device drift. |
| Relationships | Reinforced by Reserve and Recovery; constrained by Effort Cost. |

### 8.1 Capacity geometry

| Geometry | Interpretation |
| --- | --- |
| Mobilization + Reserve | Available and deployable capacity. |
| Mobilization + high Effort Cost | Functioning through push; output may look strong while resources are expensive. |
| Reserve + Sustainability | Buffer and pacing; strongest capacity configuration. |
| High Sustainability + low Mobilization | Low-demand conservation or under-engagement; not automatically depletion. |
| All high | High output with high cost; Reserve and longitudinal recovery determine whether this is adaptive. |
| All low | Insufficient engagement, depleted/ill state, quiet style, poor capture, or invalid protocol—usually unresolved. |

#### CAP-012 — Available Reserve

Current output appears supported by room beyond the immediate task.

| State field | Canonical rule |
| --- | --- |
| Configuration | Reserve high; Sustainability high; Mobilization moderate–high; Effort Cost low–moderate. |
| Core meaning | The person appears able to engage without using all available room. |
| Strengths | Pacing, adaptability, capacity for added demand. |
| Potential costs | Reserve can be context-specific and temporary. |
| Daily-life expression | Responding with energy while remaining stable across prompts. |
| Possible underneath | Rest, preparation, familiarity, or supportive conditions. |
| Worth noticing | What currently protects this room. |
| Reflection prompts | What is worth doing while capacity is available—and what is worth preserving? |
| Supporting evidence | Demand-response and time-on-task evidence with stable quality. |
| Contradictions | Protocol too easy to test reserve; mic compression masking effort. |
| Nearby / blends | CAP-016 Efficient Engagement; CAP-021 Rebuilding Reserve. |
| Fingerprint behavior | Open contours, wider spacing, smooth outer boundary. |
| Confidence limit | Requires at least two demand levels; otherwise use CAP-016. |

#### CAP-016 — Efficient Engagement

The scan shows useful mobilization with comparatively low observable cost.

| State field | Canonical rule |
| --- | --- |
| Configuration | Mobilization high; Effort Cost low; Sustainability high; Reserve unknown–moderate. |
| Core meaning | Energy is reaching the task efficiently. |
| Strengths | Presence, momentum, clear deployment. |
| Potential costs | May be short-lived if reserve is untested. |
| Daily-life expression | Engaged speech with stable timing and voice quality. |
| Possible underneath | Interest, clarity, or a well-matched task. |
| Worth noticing | Efficiency is not the same as unlimited capacity. |
| Reflection prompts | Where does this ease come from? |
| Supporting evidence | Energy plus stable quality and low demand evidence. |
| Contradictions | Short sample; easy/rehearsed prompt. |
| Nearby / blends | CAP-012 Available Reserve; CAP-018 Costly Output. |
| Fingerprint behavior | Bright, clean outer contour; moderate density; low roughness. |
| Confidence limit | Do not claim reserve without demand-contrast evidence. |

#### CAP-018 — Costly Output

Functioning remains visible, but the way it is being produced appears comparatively expensive.

| State field | Canonical rule |
| --- | --- |
| Configuration | Mobilization moderate–high; Effort Cost high; Sustainability low–moderate; Reserve low/unknown. |
| Core meaning | Performance may be held through extra effort. |
| Strengths | Determination, commitment, capacity to compensate. |
| Potential costs | Fatigue, reduced margin, diminishing return. |
| Daily-life expression | Keeping pace or structure while pauses, strain, or drift increase. |
| Possible underneath | High demand, illness, vocal fatigue, emotional intensity, or limited rest. |
| Worth noticing | The difference between capability and cost. |
| Reflection prompts | What are you proving you can carry that you no longer need to carry alone? |
| Supporting evidence | Three cost families plus maintained output and late-session drift. |
| Contradictions | Voice condition or recording artifact; difficult prompt. |
| Nearby / blends | CAP-016 Efficient Engagement; CAP-021 Rebuilding Reserve. |
| Fingerprint behavior | Dense outer layers, compressed spacing, localized roughness. |
| Confidence limit | Narrative must present non-emotional confounds; never call burnout. |

#### CAP-021 — Rebuilding Reserve

Capacity appears limited but is moving in a more sustainable direction.

| State field | Canonical rule |
| --- | --- |
| Configuration | Reserve low–moderate; Sustainability improving; Effort Cost decreasing; Mobilization moderate. |
| Core meaning | The scan suggests return of room rather than full availability. |
| Strengths | Recalibration, pacing, responsiveness. |
| Potential costs | Still-limited margin; improvement may be fragile. |
| Daily-life expression | Later prompts require less effort or show steadier energy. |
| Possible underneath | Rest, familiarity, relief, or successful regulation. |
| Worth noticing | The direction of change deserves more weight than the absolute score. |
| Reflection prompts | What is helping you come back online? |
| Supporting evidence | Improving time slopes in cost, quality, and timing; REG recovery support. |
| Contradictions | Warm-up or mic adjustment. |
| Nearby / blends | CAP-012 Available Reserve; CAP-018 Costly Output. |
| Fingerprint behavior | Contours open progressively; center brightens; uncertainty remains at edge. |
| Confidence limit | Transitional state; requires replication or valid within-scan ordering. |

## 9. EXP — Expressive Interface

*How inner activity is carried into outward vocal expression*

Expressive Interface describes observable expressive behavior. It does not infer honesty, hidden emotion, attachment style, social intent, or personality. Openness and restraint can both be adaptive; context and cost decide the interpretation.

#### EXP-P1 — Range

> DEFINITION<br>Breadth of context-appropriate prosodic, intensity, timing, and timbral variation.

| Field | Specification |
| --- | --- |
| High | Wider usable modulation with preserved signal quality. |
| Low | Narrower modulation or insufficient varied prompts. |
| Healthy possibilities | Nuance, emotional/communicative bandwidth, responsiveness. |
| Strained possibilities | Volatility if incoherent; flattening if range is restricted. |
| Supporting evidence families | F0/intensity ranges; spectral flux; timing variation; prompt modulation. |
| Contradictory evidence | Change explained by mic, acting, or prompt alone. |
| Common confounds | Culture; language; gender norms; neurotype; masking; professional voice use. |
| Minimum evidence | Three prompt types and two variation families; coherence gate. |
| Relationships | Supports Openness and Flexibility; can coexist with Restraint. |

#### EXP-P2 — Openness

> DEFINITION<br>Observable willingness or ease in allowing variation and continuity into the response.

| Field | Specification |
| --- | --- |
| High | Sustained voiced participation, flexible modulation, lower protective interruption relative to self/task reference. |
| Low | More guarded, brief, interrupted, or constrained expression—or unknown. |
| Healthy possibilities | Authentic-seeming engagement, communication, access to range. |
| Strained possibilities | Overexposure or reduced boundaries if unregulated. |
| Supporting evidence families | Voiced continuity; response length; modulation; latency; pause topology. |
| Contradictory evidence | High restraint with clear purposeful structure; short task; privacy concern. |
| Common confounds | Prompt safety; relationship to recorder; culture; topic sensitivity; social desirability. |
| Minimum evidence | At least two prompts differing in personal relevance; task consent and completion metadata. |
| Relationships | May be supported by Capacity/Regulation; is not the opposite of Restraint. |

#### EXP-P3 — Restraint

> DEFINITION<br>Degree of selective containment, compression, or gating in vocal expression.

| Field | Specification |
| --- | --- |
| High | More narrowing, controlled timing, reduced range, or increased response gating relative to reference. |
| Low | Less containment or unresolved restraint. |
| Healthy possibilities | Boundaries, composure, privacy, deliberate communication. |
| Strained possibilities | Suppression, guardedness, inhibited access, costly control. |
| Supporting evidence families | Reduced range; pause before disclosure; controlled intensity; stable narrow prosody. |
| Contradictory evidence | Open range and spontaneous modulation; no cost evidence. |
| Common confounds | Culture; professionalism; public setting; trauma-sensitive topic; neurotype; recording discomfort. |
| Minimum evidence | Two containment families plus context contrast; never assign from flat pitch alone. |
| Relationships | Can coexist with Openness as selective disclosure; cost is determined cross-constellation. |

#### EXP-P4 — Relational Availability

> DEFINITION<br>Observable responsiveness to prompts and interactional structure.

| Field | Specification |
| --- | --- |
| High | Timely, modulated, contingent vocal response across relational prompts. |
| Low | Reduced contingency, delayed/brief response, or protocol cannot assess interaction. |
| Healthy possibilities | Presence, responsiveness, communicative connection. |
| Strained possibilities | Social effort, withdrawal, over-accommodation, or guarded distance. |
| Supporting evidence families | Latency; turn-response timing; prosodic entrainment if interlocutor exists; prompt modulation. |
| Contradictory evidence | Strong self-directed speech with low prompt contingency; missing interaction data. |
| Common confounds | Automated prompts; speech style; autism/neurotype; hearing; language; social anxiety; privacy. |
| Minimum evidence | Requires interactive or at least contingent prompt protocol; cannot be scored from monologue alone. |
| Relationships | Interacts with Openness and Regulation; may remain high under healthy Restraint. |

### 9.1 Expressive geometry

| Geometry | Interpretation |
| --- | --- |
| Openness + Restraint | Selective openness: access is present and boundaries remain active. |
| Range + Relational Availability | Responsive expressive bandwidth. |
| High Restraint + high Stability | Composure or protection; Effort Cost determines whether it is expensive. |
| High Openness + low Regulation | Expression may be available but poorly buffered. |
| All high | Rich selective expression; not contradictory if restraint is purposeful. |
| All low | Flat protocol, privacy discomfort, low capacity, limited evidence, or constrained expression. |

#### EXP-009 — Guarded Openness

Expression is available, but it is passing through active boundaries.

| State field | Canonical rule |
| --- | --- |
| Configuration | Openness moderate–high; Restraint high; Range moderate; Relational Availability moderate–high. |
| Core meaning | The person appears able to engage while choosing what and how much to reveal. |
| Strengths | Discernment, boundaries, deliberate communication. |
| Potential costs | Extra effort, partial withholding from self-protection, slower access. |
| Daily-life expression | Warmth or detail appears alongside pauses, narrowing, or careful phrasing. |
| Possible underneath | Privacy, uncertainty about safety, professionalism, or a sensitive topic. |
| Worth noticing | The boundary may be intelligent, costly, or both. |
| Reflection prompts | What would make expression feel both safe and less effortful? |
| Supporting evidence | Context contrast showing engagement plus containment across ≥2 families. |
| Contradictions | Flat pitch alone; reading task; short sample; cultural norm. |
| Nearby / blends | EXP-006 Selective Clarity; EXP-012 Constrained Access. |
| Fingerprint behavior | Outer contour remains open with one compressed quadrant; smooth rather than jagged boundary. |
| Confidence limit | Must not use “hiding,” “inauthentic,” or deception language. |

#### EXP-006 — Selective Clarity

Communication appears direct and bounded without strong evidence of costly constraint.

| State field | Canonical rule |
| --- | --- |
| Configuration | Openness moderate; Restraint moderate–high; Range low–moderate; Relational Availability high; Effort Cost low. |
| Core meaning | Expression is economical and intentional. |
| Strengths | Clarity, boundaries, efficient communication. |
| Potential costs | Nuance may remain private; range may be under-used. |
| Daily-life expression | Concise responses with stable timing and clear prompt engagement. |
| Possible underneath | Familiar boundaries, role clarity, or preference for directness. |
| Worth noticing | Whether concision is choice or adaptation. |
| Reflection prompts | Where would more range help—and where would it only add noise? |
| Supporting evidence | High contingency plus low cost and coherent restraint. |
| Contradictions | Protocol does not invite range; rehearsed script. |
| Nearby / blends | EXP-009 Guarded Openness; EXP-004 Open Range. |
| Fingerprint behavior | Clean narrow geometry with stable center and low edge density. |
| Confidence limit | Requires low-cost evidence; otherwise blend with EXP-009. |

#### EXP-004 — Open Range

A broad expressive palette appears available and easy to access.

| State field | Canonical rule |
| --- | --- |
| Configuration | Range high; Openness high; Relational Availability moderate–high; Restraint low–moderate. |
| Core meaning | Expression appears fluid, responsive, and varied. |
| Strengths | Nuance, communication, spontaneous access. |
| Potential costs | Overextension or reduced boundary if Regulation is strained. |
| Daily-life expression | Natural changes in pace, tone, and intensity across prompts. |
| Possible underneath | Safety, engagement, interest, or expressive style. |
| Worth noticing | Whether openness is supported by stable regulation. |
| Reflection prompts | What deserves this full range—and what deserves a boundary? |
| Supporting evidence | Coherent prompt-linked modulation across ≥3 families. |
| Contradictions | Acted prompts; microphone variation; topic alone. |
| Nearby / blends | EXP-006 Selective Clarity; EXP-015 Unbuffered Expression. |
| Fingerprint behavior | Wide luminous contours with varied but coherent lobes. |
| Confidence limit | Cross-check Regulation before positive or strained interpretation. |

#### EXP-012 — Constrained Access

Expression appears narrowed, with limited evidence that the boundary is effortless.

| State field | Canonical rule |
| --- | --- |
| Configuration | Restraint high; Openness low; Range low; Relational Availability low–moderate; Effort Cost moderate/high. |
| Core meaning | Access to outward expression may currently be restricted or expensive. |
| Strengths | Protection, composure, preservation of privacy. |
| Potential costs | Isolation, inhibited communication, or increased internal effort. |
| Daily-life expression | Brief or delayed responses, narrow modulation, careful containment. |
| Possible underneath | Low safety, fatigue, sensitive content, illness, social context, or personal style. |
| Worth noticing | The reason for the boundary cannot be known from voice alone. |
| Reflection prompts | What would allow one small piece of expression to have more room? |
| Supporting evidence | Convergent containment plus cost across prompts. |
| Contradictions | Quiet style; automated prompt mismatch; neurotype; voice condition. |
| Nearby / blends | EXP-009 Guarded Openness; CAP-018 Costly Output. |
| Fingerprint behavior | Compressed contour, muted luminosity, clearly marked uncertainty band. |
| Confidence limit | Narrative must include multiple alternatives and avoid causal language. |

## 10. Geometry engine

*Continuous shape first; state names second*

### 10.1 Point scale

Represent each point as a posterior distribution on 0–1, not a naked scalar. Store mean, interval, confidence, evidence coverage, and baseline trust. The visualization may use the mean for position and interval/confidence for opacity and edge softness.

| Band | Provisional interval | Meaning |
| --- | --- | --- |
| Low | 0.00–0.29 | Evidence leans toward the lower expression of the point. |
| Mid-low | 0.30–0.44 | Mild lower tendency; boundary-sensitive. |
| Balanced zone | 0.45–0.55 | Near reference or mixed evidence; not “perfect.” |
| Mid-high | 0.56–0.70 | Mild higher tendency; boundary-sensitive. |
| High | 0.71–1.00 | Evidence leans toward the higher expression of the point. |
| Unresolved | Any mean with wide interval / low confidence | Do not convert to low, neutral, or balanced. |

### 10.2 Shape descriptors

| Descriptor | Definition | Use |
| --- | --- | --- |
| Magnitude | Mean radial extent of resolved points. | Overall expression strength, not wellness. |
| Dominance | Largest point minus mean of other resolved points. | One-point leadership. |
| Symmetry | 1 minus normalized pairwise spread. | Balanced expression versus uneven geometry. |
| Tension | Weighted separation of predefined opposing/productive-tension pairs. | Internal pull; not pathology. |
| Coherence | Cross-evidence agreement and temporal consistency. | Whether shape is interpretable. |
| Compensation | High point offsets a low/strained point while cost evidence rises. | Functional appearance maintained through another resource. |
| Momentum | Reliable signed change across ordered segments or scans. | Transition and recovery. |
| Distortion | Localized extreme plus contradiction or low coherence. | Uncertain/unstable geometry; reduce confidence. |

### 10.3 Candidate-state selection

1. Compute distance from the point posterior to every eligible canonical state region.

1. Reject any state whose hard evidence requirements or policy constraints fail.

1. Calculate candidate fit from geometric distance, evidence coverage, contradiction penalty, baseline trust, and temporal support.

1. If the top two candidates are adjacent and their normalized fit gap is below the blend margin, return a boundary blend.

1. If no candidate exceeds the publish threshold, return the permanent unresolved state for that constellation.

1. Record the winning candidate, alternatives, lost-on reasons, and what evidence would change the outcome.

### 10.4 Unresolved behavior

| Condition | Engine behavior | Narrative / visual behavior |
| --- | --- | --- |
| Poor capture | Suppress affected features and dependent dimensions. | State “signal quality limited this view”; fade affected arcs. |
| Insufficient voiced speech | No state; request another scan if appropriate. | Show an incomplete signature, not a weak score. |
| Missing baseline | Use raw/session description only; reduce confidence. | Avoid “higher/lower than usual”; use neutral geometry. |
| Contradictory families | Preserve both; no averaging away disagreement. | Name mixed evidence; softened edge and split-tone segment. |
| Boundary tie | Return two-state blend. | Use blended essence; no winner-takes-all title. |
| Cross-constellation conflict | Keep both states and create typed contradiction relation. | Explain both; do not let narrative choose a favorite. |

## 11. Boundary blends

*Human states are gradients; the registry must preserve that*

| Blend type | Rule | Narrative adjustment |
| --- | --- | --- |
| Adjacent-state blend | Top two eligible adjacent candidates within calibrated fit margin. | “This scan sits between…” followed by shared essence and differentiator. |
| Transition blend | Momentum crosses a state boundary with temporal support. | Emphasize movement: “appears to be shifting from…toward…” |
| Compensated blend | One state fits output shape while another fits cost structure. | Name performance and cost separately. |
| Uncertain blend | Two non-adjacent candidates remain because key evidence is missing. | Do not fuse into a new state; report alternatives and missing evidence. |

Each blend requires its own permanent interaction ID only if it becomes analytically stable and repeatedly useful. Do not create IDs for every pair in advance. Registry growth should be evidence-driven.

## 12. Cross-constellation interaction engine

*Whole-person meaning emerges from typed relationships*

| Verb | Operational definition | Example |
| --- | --- | --- |
| Reinforces | Two states increase the same functional interpretation. | COG Deliberate Builder + REG Steady Mobilization → sustained directed effort. |
| Buffers | One state reduces the likely cost or volatility of another. | CAP Available Reserve buffers COG Processing Demand. |
| Amplifies | One state increases the intensity/cost of another. | REG Held Activation amplifies CAP Costly Output. |
| Masks | Observable output looks adaptive while another constellation reveals cost or constraint. | High Organization masks low Reserve. |
| Compensates | A strength maintains function despite another limitation. | Restraint compensates for low Stability. |
| Constrains | One state limits the expression of another. | Low Capacity constrains Expressive Range. |
| Protects | A boundary or stable process reduces exposure to strain. | Guarded Openness protects under high Processing Demand. |
| Redirects | Energy is moved into a different channel. | Activation redirects into Focus Continuity rather than Range. |
| Destabilizes | Interaction lowers coherence or increases volatility. | High Activation destabilizes low Stability. |
| Integrates | Multiple states align with low contradiction and manageable cost. | Open Architect + Adaptive Recovery + Available Reserve + Open Range. |
| Reveals | A second constellation clarifies the meaning of an ambiguous first. | Capacity reveals whether high Organization is ease or compensation. |
| Shifts | Temporal evidence shows movement from one interaction regime to another. | Held Activation shifts toward Adaptive Recovery. |

### 12.1 Relation record

| Field | Content |
| --- | --- |
| interaction_id | Permanent ID and rule version |
| subject / object | Source constellation-state IDs |
| verb | Controlled interaction vocabulary |
| evidence | Dimension and evidence IDs that justify the relation |
| conditions | Required thresholds, temporal order, exclusions |
| alternatives | Other plausible verbs/interpretations |
| confidence | Calibrated relation confidence |
| narrative clause | Approved observational clause template |

### 12.2 High-value interaction rules for v0.1

| Rule | Condition | Interpretation |
| --- | --- | --- |
| INT-001 Capacity reveals cognition | COG Organization high; compare CAP Reserve/Cost. | Organized cognition with reserve → supported structure; with high cost → compensatory structure. |
| INT-002 Regulation qualifies expression | EXP Openness/Range high; compare REG Stability/Recovery. | Open and regulated → grounded access; open and unstable → unbuffered expression. |
| INT-003 Restraint may protect | EXP Restraint high + REG activation high + CAP cost not extreme. | Selective restraint may be protective rather than blocked. |
| INT-004 Recovery restores capacity | REG Recovery high precedes CAP Sustainability improvement. | Regulatory return appears to support renewed room. |
| INT-005 Demand spends reserve | COG Demand high + CAP Reserve declining. | Cognitive work appears to draw down available capacity. |
| INT-006 Stability may mask cost | REG Stability high + CAP Cost high + Sustainability falling. | Steadiness is present, but it may be expensive to maintain. |
| INT-007 Exploration needs containment | COG Exploration high + REG Flexibility high + Stability adequate. | Exploration appears generative; if stability low, fragmentation risk rises. |
| INT-008 Low-evidence protection | Any two constellations unresolved. | Suppress global pattern name; report only supported local observations. |

## 13. Pattern engine

*The label describes the reasoning; it never creates it*

| Required field | Specification |
| --- | --- |
| pattern_id | Permanent; never reused |
| display_name | Versioned and editable without changing ID |
| reasoning_description | Internal precise description |
| required_states | Constellation state IDs and allowed blends |
| required_interactions | Typed relations and minimum confidences |
| exclusions | Contradictions, unresolved limits, quality failures |
| alternatives | Ranked candidates |
| why_won / why_lost | Machine-readable reason codes plus readable summary |
| confidence | No higher than the weakest essential dependency |
| lifecycle | Provisional, active, deprecated, research-only |

> PATTERN SUPPRESSION<br>A global pattern name should be suppressed when fewer than three constellations resolve, any essential interaction is below threshold, the top-two pattern gap is too small, or the pattern would imply a prohibited emotional/clinical/identity claim.

## 14. Narrative engine

*A controlled reflection, not an improvising oracle*

### 14.1 Approved structure

1. What feels most present

1. How this may show up in daily life

1. What may be happening underneath

1. Something worth noticing

1. A question to sit with

### 14.2 Narrative generation contract

- The deterministic engine supplies approved facts, candidate hypotheses, confidence, contradictions, confounds, and prohibited claims.

- Every sentence must cite at least one state, interaction, or evidence-ledger ID internally.

- The model may select among approved clause templates and adjust tone (Direct, Supportive, Insight); it may not add a new inference.

- Causal wording is blocked unless the source is user-reported context, and even then must be attributed: “You noted…”

- When evidence is mixed, the narrative must preserve the disagreement rather than smoothing it into coherence.

- Questions may invite reflection but must not smuggle in a claim: ask “Does this feel protective?” rather than “Why are you suppressing yourself?”

### 14.3 Example

> WHAT FEELS MOST PRESENT<br>Your scan shows a deliberate, organized way of working through the moment. That structure appears to be carrying more effort than usual, while your later responses show some movement toward steadier regulation.

> HOW THIS MAY SHOW UP<br>You may be getting things done by building carefully and staying contained, even when the process takes more energy than it appears to from the outside.

> UNDERNEATH / NOTICE<br>One possibility is that structure is helping you manage complexity. Another is that it has become the way you keep strain from becoming visible. The voice alone cannot decide between those explanations.

> QUESTION TO SIT WITH<br>What part of this moment genuinely needs your careful effort—and what part might be allowed to become easier?

## 15. Resonance Signature contract

*The visual must tell the same truth as the ledger*

| Visual property | Data source | Meaning |
| --- | --- | --- |
| Radial extent | Dimension posterior mean | Strength of current point expression |
| Edge softness | Posterior interval / confidence | Uncertainty |
| Line density | Evidence coverage | How much valid evidence supports the region |
| Roughness | Contradiction / low coherence | Mixed or unstable evidence |
| Luminosity | Signal reliability × confidence | Visibility of trustworthy structure |
| Color family | Constellation identity | COG blue; REG cyan; CAP pale/white; EXP violet |
| Inward/outward motion | Temporal momentum | Return, expansion, or transition |
| Missing arc | Unresolved dimension | Unknown—not zero |
| Reference ghost | Trusted personal Reference Signature | Comparison shape, visually secondary |

- The fingerprint is the hero; a waveform is supporting provenance only.

- No color may encode good/bad, healthy/unhealthy, or diagnosis.

- Uncertainty must be visible. A beautiful complete fingerprint generated from incomplete evidence is a lie.

- The written Reflection and Resonance Signature must consume the same immutable result object.

## 16. Validation program

*How this becomes evidence-based rather than merely evidence-inspired*

### 16.1 Phase gates

| Phase | Goal | Minimum work | Release effect |
| --- | --- | --- | --- |
| 0 — Measurement | Verify feature correctness. | Golden audio fixtures; Praat/openSMILE comparison; device/noise tests; extractor reproducibility. | Only raw/evidence views. |
| 1 — Reliability | Measure repeatability and baseline stability. | Test–retest; task effects; within-person variance; ICC/MDC; missingness analysis. | Personal change language remains conservative. |
| 2 — Construct | Test dimensions against preregistered observations. | Self-report/context anchors; convergent/discriminant validity; confound models. | Provisional constellation states. |
| 3 — Generalization | Evaluate across people and environments. | Held-out devices, languages, accents, ages, sex/gender, neurotypes; subgroup calibration. | Broader beta only after fairness gates. |
| 4 — Longitudinal | Test whether movement means what the UI says. | Repeated scans; ecological momentary context; transition/recovery analysis. | Timeline and momentum claims. |
| 5 — Outcome | Assess whether reflection helps without causing harm. | Comprehension, agency, distress, false-certainty, behavior and support outcomes. | Marketing claims limited to demonstrated outcomes. |

### 16.2 Ground-truth strategy

- Do not use one mood questionnaire as “truth.” Use multiple anchors: task condition, user reflection, repeated measurements, observer ratings where appropriate, and physiological measures only in properly governed studies.

- Separate expressed affect from felt affect. Speech can communicate an expression that differs from subjective experience.

- Pre-register primary hypotheses, feature families, thresholds, exclusions, and metrics before testing.

- Use nested participant-level splits. Never place the same speaker in train and test sets.

- Report calibration, uncertainty, subgroup performance, false-positive costs, and abstention—not only accuracy or AUC.

- Validate every display name with users for comprehension and unintended judgment.

### 16.3 Immediate engineering priorities

1. Reconnect validated server-side/Praat-grade feature extraction to production; tag browser approximations as low-reliability until proven.

1. Implement feature definitions, units, versions, task compatibility, and baseline trust as database-enforced fields.

1. Create immutable Evidence Ledger and Decision Ledger schemas before adding more result copy.

1. Build the four dimension registries and unresolved behavior before expanding the state library.

1. Implement the eight high-value cross-constellation rules and a trace viewer for debugging.

1. Create a gold-standard test corpus covering noise, clipping, quiet speech, vocal fry, illness, masks, mic changes, and deliberately varied prompts.

## 17. Machine-readable registry blueprint

*Suggested canonical objects*

### 17.1 Dimension definition

```json
{ "dimension_id": "COG-P1", "name": "Organization", "version": "0.1.0", "status": "provisional", "required_families": ["temporal_rhythm", "prosody_or_articulation"], "minimum_valid_voiced_seconds": 12, "baseline_policy": "compatible_personal_or_within_session", "support_rules": [], "contradiction_rules": [], "confound_rules": [], "prohibited_inferences": ["intelligence", "diagnosis", "truthfulness"] }
```

### 17.2 State definition

```json
{ "state_id": "COG-017", "display_name": "Deliberate Builder", "registry_version": "0.1.0", "lifecycle": "provisional", "region": { "organization": [0.70, 1.00], "exploration": [0.20, 0.60], "focus_continuity": [0.55, 1.00], "processing_demand": [0.55, 1.00] }, "minimum_confidence": 0.65, "required_evidence": [], "exclusions": [], "adjacent_states": ["COG-014", "COG-018"], "narrative_templates": {}, "visual_profile": {} }
```

### 17.3 Decision result

```json
{ "constellation": "COG", "point_posteriors": {}, "geometry": {}, "winner": "COG-017", "alternatives": [{"state_id": "COG-014", "fit": 0.61}], "boundary_blend": null, "supporting_evidence_ids": [], "contradicting_evidence_ids": [], "missing_evidence": [], "confounds": [], "why_won": [], "why_others_lost": [], "confidence": 0.71, "rule_version": "constellation-0.1.0" }
```

## 18. Registry governance

*How the Bible changes without breaking the product*

| Rule | Requirement |
| --- | --- |
| Permanent IDs | Never recycle or silently repurpose state, dimension, pattern, feature, or interaction IDs. |
| Display names | May change with a versioned alias history and migration note. |
| Semantic changes | Material meaning changes require a new ID. |
| Threshold changes | Version the rule set; preserve the exact version used for every historical scan. |
| Deprecation | Keep historical definitions readable; do not rewrite past results. |
| Research status | Every item is labeled research-only, provisional, active, deprecated, or prohibited. |
| Approval | Scientific, product, privacy, and narrative review required before activation. |
| Audit | Every production result must be reproducible from stored definitions and ledger evidence. |

## 19. Research synthesis

*Evidence used to set the v0.1 boundaries*

| Source area | What SoulScope adopts | What SoulScope rejects or limits |
| --- | --- | --- |
| eGeMAPS / acoustic standards | Small standardized, interpretable feature vocabulary and versioned extraction. | Treating benchmark performance as proof of individual emotion truth. |
| Vocal emotion research | Many-to-many acoustic cue patterns and dimensional activation/valence framing. | One cue → one emotion; acted-corpus accuracy as real-world certainty. |
| Stress acoustics | Convergent multi-feature change and personal baseline. | Universal direction, single-feature stress labels, deception inference. |
| Voice health biomarkers | Research potential, longitudinal methods, strict validation/fairness/privacy. | Clinical conclusions without prospective external validation. |
| Layered Voice Analysis | Calibration, segmentation, temporal state, dense telemetry, prompt/topic aggregation. | Proprietary score cloning, authenticity/truth claims, black-box authority. |
| Speech-emotion ML | Abstention, out-of-corpus tests, label uncertainty, speaker-level splits. | Closed-corpus headline accuracy and opaque embeddings as product explanation. |

## 20. Sources

*Primary and high-value review sources*

> Eyben et al. — The Geneva Minimalistic Acoustic Parameter Set (GeMAPS) for Voice Research and Affective Computing: https://ieeexplore.ieee.org/document/7160715/

> openSMILE documentation — current eGeMAPS feature-set versions and levels: https://audeering.github.io/opensmile-python/

> Scherer — Vocal communication of emotion: a review of research paradigms: https://www1.cs.columbia.edu/~julia/papers/2003_Scherer_SpeechComm.pdf

> Juslin & Laukka — Communication of emotions in vocal expression and music performance: https://pubmed.ncbi.nlm.nih.gov/12956543/

> Schewski et al. — Measuring negative emotions and stress through acoustic voice analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC12289014/

> Kirchhuebel et al. — Acoustic correlates of speech when under stress: https://pure.york.ac.uk/portal/en/publications/acoustic-correlates-of-speech-when-under-stress-research-methods-/

> de Lacerda Veiga et al. — Fundamental frequency as a potential stress biomarker: systematic review/meta-analysis: https://pubmed.ncbi.nlm.nih.gov/41102940/

> Fagherazzi et al. — Voice for Health: vocal biomarkers from research to clinical practice: https://pmc.ncbi.nlm.nih.gov/articles/PMC8138221/

> Jordan et al. — Speech Emotion Recognition in Mental Health: https://pmc.ncbi.nlm.nih.gov/articles/PMC12521853/

> Ahn et al. — Speech emotion recognition, labeling reliability, and out-of-corpus generalization: https://pmc.ncbi.nlm.nih.gov/articles/PMC11244487/

> Harnsberger et al. — Stress and deception in speech: evaluating LVA: https://pubmed.ncbi.nlm.nih.gov/19432740/

> Horvath et al. — Accuracy of auditors and LVA operators: https://pubmed.ncbi.nlm.nih.gov/23406506/

> Tani et al. 2024 — Organizational intervention using LVA: https://pmc.ncbi.nlm.nih.gov/articles/PMC11460070/

> Tani et al. 2025 — ESAS/LVA prospective occupational-health study: https://academic.oup.com/joh/article/67/1/uiaf060/8295633

> EmotionLogic — Developer and product documentation: https://emotionlogic.ai/developers

> EmotionLogic — Terms governing proprietary algorithms and report structures: https://emotionlogic.ai/terms

> EVIDENCE NOTE<br>Vendor descriptions are included to understand architecture and claimed outputs, not as independent validation. Where vendor claims and external evidence differ, SoulScope follows the external evidence and the narrower claim.

## 21. Decision log for v0.1

*What is fixed, provisional, and intentionally deferred*

| Decision | Status | Rationale |
| --- | --- | --- |
| Evidence Ledger is the only inference gateway. | FIXED | Core safety and explainability requirement. |
| Four constellations: COG, REG, CAP, EXP. | PROVISIONAL | Strong conceptual separation; empirical factor structure still required. |
| Sixteen point definitions in this edition. | PROVISIONAL | Engineering-ready semantics; weights and discriminant validity untested. |
| COG-017, EXP-009, REG-022 identifiers. | RESERVED/FIXED | User-designated canonical identifiers retained. |
| Seed state maps only, not exhaustive region catalog. | FIXED APPROACH | Avoids combinatorial taxonomy and false precision. |
| EmotionLogic backend cloning. | REJECTED | Unavailable proprietary engine, terms, and weak support for high-stakes labels. |
| LLM performs scoring or causation. | REJECTED | Narrative model is a constrained verbalizer only. |
| Clinical/diagnostic/deception claims. | PROHIBITED | Outside evidence and product category. |
| Thresholds shown in v0.1. | RESEARCH PRIORS | Must be calibrated and versioned before production. |

Recognition, not diagnosis.
