# Clean System Plan

## Mission

Build SoulScope Clean as the production instrument beside the preserved research archive.

The old repository remains untouched at `/home/lahainalindsay9111/soulscope`. It is not reset, cleaned, stashed, deleted, or rewritten.

## Repository Rule

Use only `main` until explicitly instructed otherwise. Do not push, deploy, or connect remotes before review.

## Target Structure

```text
soulscope-clean/
  README.md
  .gitignore
  architecture/
  audit/
  docs/
  frontend/
  backend/
  supabase/
  packages/
  tests/
```

No archive, compatibility, legacy, chakra, Growth Studio, renderer-review, or upload bundle directories are allowed.

## Build Sequence

### Stage 1: Product Shell

Implement only:

```text
Create account
  -> Create personal baseline recording
  -> Prompt 1
  -> Prompt 2
  -> Prompt 3
  -> Save captures
  -> Show completion receipt
```

Required before interpretation:

- visible countdown timer
- no repeated prompts
- no stuck saving state
- retry and failure handling
- prompt progress
- mobile Safari support
- deterministic state transitions

### Stage 2: Acoustic Extraction

Implement hosted backend extraction only. Every measurement must include feature ID, raw value, unit, extractor, extractor version, feature version, prompt ID, capture ID, segment range, feature quality, feature confidence, task compatibility, availability reason, and rejection reason.

Capture quality and feature availability remain separate.

### Stage 3: Evidence Ledger

Build immutable Evidence Ledger records. Missing remains missing. Rejected remains rejected. Prompt evidence remains separate. No direct emotion labels.

### Stage 4: Dimension Engine

Implement only the 16 Constellation Bible points with named evidence-family enforcement, task compatibility, baseline requirements, contradiction handling, confounds, abstention, and feature-specific confidence propagation.

Relational Availability remains unresolved for monologue-only prompts.

### Stage 5: Constellation Engine

Implement continuous four-point geometry, uncertainty, confidence, canonical seed states, adjacency, deterministic composites, unresolved behavior, and versioned thresholds.

Never expose `Between X and Y` as a final user pattern.

### Stage 6: Story Engine

Build one story engine only:

```ts
export type TodayStory = {
  title: string;
  reflection: string;
  howThisMayShowUp: string[];
  worthNoticing: string;
  gentleNextStep: string;
  currentResonance: string;
  trace: string[];
};
```

The report must not mention scan mechanics, candidates, neighboring states, geometry, ledgers, technical correlations, raw IDs, or retrying unless capture truly failed.

### Stage 7: Resonance Signature

Build one renderer only. It consumes `CanonicalScanResult.resonanceSignature`, does not analyze raw audio, does not select patterns, and does not create meaning.

## Data Retention

Historical scan data is not migrated. The old repository/database remains the archive. The clean database starts clean unless a later reviewed migration explicitly requests selected historical data.

## Supabase Plan

Do not copy old migration history. Author one clean schema for:

- users/profiles
- personal reference baseline
- scan sessions
- prompt captures
- acoustic measurements
- evidence ledger
- dimension results
- constellation decisions
- decision ledger
- canonical scan result
- user notes/context

Use one transactional canonical persistence path. Do not apply migrations to production during this phase.

## Required Tests Before Interpretation

- baseline completion
- Prompt 1 -> Prompt 2 -> Prompt 3 progression
- timer visibility
- save-state completion
- mobile recording
- audio decode
- prompt-level measurement separation
- quality semantics
- jitter/shimmer task compatibility
- missingness preservation
- evidence traceability
- transaction rollback
- canonical result determinism
