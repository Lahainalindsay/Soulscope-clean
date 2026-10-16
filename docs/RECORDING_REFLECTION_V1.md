# Recording reflection v1

Controlling authority: SoulScope Canon Set v2.0, read in full (33 pages), adopted
August 13, 2026. Relevant sections: 02.1, 07–07.2, 10.1 and 12.

## What the person receives

A completed scan can now show a readable account of its supported recording
observations instead of leading only with unavailable psychological meaning:

- One specific observation about the person's three responses.
- A short overview of within-recording similarities and differences.
- Optional response-level detail.
- An optional feeling word supplied by the person before or after the scan;
  the server places that word beside the recording observation in a human
  reading and asks one specific, open question. Without a chosen word, the
  result stays with a voice observation.
- A disclosure of the recording's limits and the distinction from personal
  psychological interpretation.

The feeling is explicitly user reported, never inferred by the voice features.
Prompt categories never establish feelings. Identical or nearly
identical measurements do not become neutral, healthy, stable or recovered states.
The older SoulScope repository informed the result's human writing structure;
its score bands, meaning graph and decision pipeline were not imported.

## Source and publication boundary

This is a versioned raw/evidence-view consumer projection under Canon §07's
bounded-description fallback and phase 0. It is **not** a READY
`ReflectionNarrativeV1`, a new Dimension model, or a second interpretation engine.
The calibrated meaning gate and current SQL abstention remain intact. A valid
READY narrative takes precedence if one becomes eligible in a future version.

`/api/results/[id]/reflection` verifies Supabase Auth, scan ownership, finalized
lifecycle and the exact immutable result/measurement/evidence links. It uses the
owner's JWT and RLS, not a service key. It does not read audio, transcribe words,
send data to an LLM/provider, or write database records. A POST accepts one
enumerated feeling word in its body; it never appears in the request URL.
The chosen word is saved in local browser storage for that scan and can be
changed. It is not durable across devices and is not added to the sealed result.

`recording-reflection.v1` / `recording-language.1.1.0` is reproducible from the
linked immutable sources and optional enumerated self-report. Each observation records its capture, prompt, feature
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
pitch comparisons use 0.1-semitone display resolution. Main prose only singles
out a timing difference of at least 2 percentage points or a pitch-span
difference of at least 1 semitone, so tiny tracker differences stay in details.
These are editorial salience rules, not statistical significance or scientific publication gates.
The capture protocol remains three 30-second windows; actual saved durations
are neither padded nor relabeled.

Language 1.1.0 keeps numerical estimates in expandable response details and
gives the person a concise reading when they provide a feeling word. It accepts
1.0.0 and 1.0.1 projections; observation selection has not changed.

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
