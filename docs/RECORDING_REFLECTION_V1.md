# Recording reflection v1

Controlling authority: SoulScope Canon Set v2.0, read in full (33 pages), adopted
August 13, 2026. Relevant sections: 02.1, 07–07.2, 10.1 and 12.

## What the person receives

A completed scan can now show a readable account of its supported recording
observations instead of leading only with unavailable psychological meaning:

- One specific observation about the person's three responses.
- A short overview of within-recording similarities and differences.
- Optional response-level detail.
- Three clearly optional invitations for noticing one's own experience during
  the day, followed by one non-leading question.
- A disclosure of the recording's limits and the distinction from personal
  psychological interpretation.

The invitations are activities to try, not claims about the user's habits or
daily life. Prompt categories never establish feelings. Identical or nearly
identical measurements do not become neutral, healthy, stable or recovered states.

## Source and publication boundary

This is a versioned raw/evidence-view consumer projection under Canon §07's
bounded-description fallback and phase 0. It is **not** a READY
`ReflectionNarrativeV1`, a new Dimension model, or a second interpretation engine.
The calibrated meaning gate and current SQL abstention remain intact. A valid
READY narrative takes precedence if one becomes eligible in a future version.

`/api/results/[id]/reflection` verifies Supabase Auth, scan ownership, finalized
lifecycle and the exact immutable result/measurement/evidence links. It uses the
owner's JWT and RLS, not a service key. It does not read audio, transcribe words,
send data to an LLM/provider, or write database records.

`recording-reflection.v1` / `recording-language.1.0.1` is reproducible from the
linked immutable sources. Each observation records its capture, prompt, feature
IDs, method and selected citations. Failed families remain withheld. The browser
checks the projection's shape and source IDs and renders supplied text; no
comparison or scoring runs in the component. Regenerating a consumer projection
does not modify a sealed result (Canon §07.2).

## Measurement compatibility

Worker 0.3.0 supports descriptive views of native speech segmentation and
p20–p80 pitch spans. Speech segments must cover the actual recorded interval
without gaps/overlap; speech duration must match its saved feature; internal
pauses must lie between speech segments. Opening/closing silence is excluded.
Pitch requires matching source metadata and native Praat provenance. It remains
a provisional tracker estimate, not an emotion, effort, expressiveness or
full-vocal-range measurement. New research features remain excluded from
semantic and Signature use.

Cross-response pause ordering uses each capture's pause proportion, allowing
actual recorded durations to differ without comparing unequal totals as if
they were equal windows. Ordering uses 0.1 percentage-point display resolution;
pitch comparisons use 0.1-semitone display resolution. These are presentation
precision rules, not statistical significance or scientific publication gates.
The capture protocol remains three 30-second windows; actual saved durations
are neither padded nor relabeled.

Language 1.0.1 keeps numerical estimates in the expandable response details and
uses plain comparison language in the overview. The consumer also accepts 1.0.0
projections; the editorial change does not change observation selection.

Worker 0.2.0 saved scans retain their explicitly energy-based quiet-audio
description and source Evidence Ledger memberships. Quiet audio is not renamed
speech silence or a confirmed pause. Older scans are not re-extracted or
silently upgraded. Future or malformed source versions fail closed.

## Verification

Tests cover varied prompt ordering, ties/display precision, missing native data,
partial-family suppression, corrupt segments, source mismatches, quality limits,
forbidden prose, escaped rendering and unchanged scientific publication status.
The existing authorized-source tests cover missing/expired tokens, another
account and unfinished scans. A read-only check of an existing finalized
worker-0.2.0 scan produced an AVAILABLE legacy-compatible projection without
changing its saved inputs. No customer audio was downloaded or sent externally.
