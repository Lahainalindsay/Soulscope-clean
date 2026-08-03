# Baseline and Prompt Protocol

## Reference Signature

The first account recording is a personal Reference Signature.

Prompt:

> Tell me a little about yourself--something you enjoy, something familiar, or anything that feels easy and natural to talk about.

The Reference Signature is used internally for measurement continuity and identity compatibility. User-facing reports should not repeatedly say "compared with your baseline." Surface baseline comparison only when it adds meaningful context.

Users must be able to re-record the Reference Signature later. Baseline version history is preserved.

## Guided Scan Prompts

Prompt 1: Current moment / open reflection.

Prompt 2: Challenge or demand.

Prompt 3: Future orientation / recovery.

Each prompt must have distinct text and purpose. Prompt 1 must not repeat the Reference Signature question.

## Stage 1 Acceptance Requirements

Before interpretation work begins, the product shell must pass tests for:

- baseline completion
- Prompt 1 -> Prompt 2 -> Prompt 3 progression
- visible countdown timer
- save-state completion
- retry and failure handling
- mobile Safari recording support
- deterministic state transitions
