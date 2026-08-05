# Backend Foundation Proposal

Status: PROPOSED ARCHITECTURE
Authority: Planning document only
Canonical status: NOT CANON
Implementation status: NOT YET IMPLEMENTED

This document proposes a backend foundation for SoulScope scan ownership, capture, evidence persistence, result versioning, privacy, and auditability. It is not Canon, does not amend the Canon, and does not approve production scientific inference, scoring, narrative interpretation, or Resonance Signature rendering.

This proposal also does not adopt exploratory rendering contracts or visual-renderer persistence. Any future backend implementation must continue to obey the SoulScope Foundational Canon, the Constellation Bible where approved, and the approved `@soulscope/canonical-contracts` package boundaries.

## 1. Purpose and scope

The backend foundation should support:

- authenticated user ownership
- scan creation
- account-level Terms of Service and Privacy Policy acceptance history
- three-prompt capture workflow
- private audio handling
- processing jobs
- evidence and provenance
- immutable result versions
- history and optional baseline
- deletion and auditability

Explicitly excluded:

- production scientific inference
- production scoring
- production narrative generation
- production Resonance Signature rendering
- adoption of exploratory rendering contracts

The first backend foundation is a persistence, lifecycle, privacy, and audit layer. It may store canonical identifiers, approved structural contracts, provenance, and version metadata. It must not implement or imply unapproved measurement formulas, dimension scoring, constellation-state selection, pattern inference, generated personal claims, or renderer mappings.

Users accept the current Terms of Service and Privacy Policy when creating their account. A scan does not require repeated legal consent, a separate approval record, or a consent lifecycle transition. Browser or operating-system microphone permission is a technical device permission and is not represented as SoulScope legal policy acceptance.

## 2. Canonical boundaries

The backend may reference only the four canonical constellations approved for contract-level use:

| Code | Constellation |
| --- | --- |
| `COG` | Cognitive Form |
| `REG` | Regulatory Motion |
| `CAP` | Available Capacity |
| `EXP` | Expressive Interface |

The launch scan uses the fixed three-prompt arc:

1. Opening / within-session reference
2. Emotionally demanding reflection
3. Hope / future orientation

Prompt wording and prompt order are versioned. A prompt set is an explicit versioned contract, and captures must record the prompt definition and order used at capture time.

The backend must preserve the foundational principle:

> The instrument provides evidence. The individual provides meaning.

The backend must not claim diagnosis, deception detection, hidden truth, personality identification, spiritual interpretation, organ interpretation, or biometric authentication.

## 3. Scan lifecycle

Scan state is server-controlled and append-only-audited.

Primary lifecycle:

```text
created
capturing
capture_complete
queued
extracting
evidence_ready
finalizing
finalized
```

Terminal or exceptional states:

```text
failed
cancelled
deleted
```

Rules:

- clients request transitions but cannot assign states directly
- transitions are validated server-side
- scans move from `created` directly to `capturing`
- finalized results are immutable
- reprocessing creates a new result version
- failed or cancelled scans cannot appear finalized
- every transition creates an append-only audit event

The lifecycle is not the canonical processing-stage registry. It is a backend orchestration state machine for ownership, capture, processing, finalization, deletion, and audit.

## 4. Audio lifecycle and privacy

Audio artifact state is separate from scan state:

```text
not_created
uploading
stored_private
processing
deletion_pending
deleted
deletion_failed
```

Rules:

- raw audio is not retained by default
- audio storage is private
- public audio URLs are prohibited
- access uses short-lived signed authorization
- result payloads never expose storage paths
- deletion is idempotent and auditable
- failed deletion attempts are retryable
- finalized evidence may remain after raw audio deletion

Audio paths, bucket names, object keys, and signed authorization internals are operational details. They must not be exposed through user-facing result payloads or narrative payloads.

## 5. Prompt capture model

The initial scan uses one versioned prompt set with three required prompts. Each prompt definition has stable identity, version metadata, an order, and a purpose aligned to the launch prompt arc.

Each capture should track:

- capture ID
- scan ID
- prompt definition ID
- prompt order
- capture status
- duration
- upload status
- signal-quality status
- creation and completion timestamps

Suggested capture statuses:

```text
pending
recording
uploaded
processed
rejected
failed
cancelled
```

Rejected captures must retain a reason. Capture rejection is not the same as scan failure; a scan may remain incomplete, allow retry, or move to an exceptional state according to server-side transition rules.

## 6. Evidence Ledger

Evidence records are append-only records of measured or derived evidence, provenance, quality, and missingness. They do not by themselves approve publication, scoring, narrative interpretation, or visual rendering.

An evidence record contains:

- evidence ID
- scan ID
- capture ID
- feature ID
- raw value
- normalized value
- unit
- confidence
- coverage
- quality
- rejection reason
- extractor version
- normalization version
- provenance
- creation timestamp

Rules:

- missing evidence is null, not zero
- rejected evidence retains its reason
- finalized evidence is append-only
- results reference supporting evidence
- provenance is required before result finalization

Evidence records should preserve the approved Evidence Ledger principle: nothing downstream bypasses evidence, and missing or rejected evidence remains explicit.

## 7. Result immutability and versioning

Each scan may have zero or more result versions. A result version is an immutable measurement-result object once finalized. Rendering is separate from the measurement result.

Each result version should track:

- result ID
- scan ID
- version number
- status
- prompt-set version
- extractor version
- normalization version
- dimension-engine version
- narrative version
- contract version
- creation timestamp
- finalization timestamp
- superseded-result reference

Rules:

- finalized result versions cannot be edited
- reprocessing creates a new version
- old versions remain available for audit
- a newer version may supersede but never overwrite an older version
- rendering is separate from the measurement result

Result versioning does not approve the engines named in version fields. Those fields are compatibility and audit metadata only until the relevant engines are separately approved and implemented.

## 8. Baseline and history

Personal baseline is optional. No baseline remains no baseline. A population reference is not a personal baseline.

Compatibility decisions are explicit and versioned. Historical comparisons record included scans, excluded scans, prompt-set versions, extractor versions, normalization versions, and compatibility decisions.

Change does not automatically mean improvement or decline. Historical views may show measured difference, compatibility, missingness, and uncertainty, but they must not convert change into a value judgment without an approved interpretation contract.

## 9. Security boundaries

Users may access only their own records.

Clients may not:

- finalize evidence
- finalize results
- edit provenance
- alter finalized records
- assign arbitrary lifecycle states
- bypass retention policy
- access another user's data

Privileged workers may:

- read private captures for processing
- write evidence
- write provenance
- create result versions
- request audio deletion
- append audit events

Row-level security must be tested. Tests must cover direct table access, API access, storage access, signed authorization paths, ownership checks, worker privileges, and denial cases.

## 10. Idempotency

Idempotency is required for:

- completing captures
- enqueueing extraction
- writing evidence
- finalizing evidence
- finalizing results
- deleting audio
- requesting scan deletion

Retries must not duplicate jobs, evidence, result versions, or destructive actions.

Idempotency keys should be scoped to the user, scan, capture, operation, and relevant version inputs. Server-side uniqueness must enforce the idempotency contract rather than relying only on client behavior.

## 11. Proposed initial tables

Proposed tables:

- `profiles`
- `policy_acceptances`
- `prompt_sets`
- `prompt_definitions`
- `scan_sessions`
- `scan_prompt_captures`
- `capture_artifacts`
- `processing_jobs`
- `evidence_records`
- `scan_result_versions`
- `result_manifests`
- `personal_baselines`
- `baseline_scan_members`
- `audit_events`

Visual-renderer tables are excluded. No Resonance Signature renderer tables, exploratory rendering contract tables, visual parameter tables, or visual asset persistence tables are part of this backend foundation proposal.

This table list is not a migration plan. Database migrations remain deferred until the backend foundation is approved for implementation.

## 12. First backend milestone

The first backend milestone is complete when:

- authenticated user can create a scan
- account-level Terms of Service and Privacy Policy acceptance history can be recorded
- three-prompt set is versioned
- captures belong to the correct prompts
- audio remains private
- jobs are idempotent
- evidence includes provenance
- missing and rejected evidence remain explicit
- finalized results cannot be overwritten
- raw-audio deletion is tracked
- users can access only their own records
- no unapproved scientific or rendering logic is implemented

Completion of this milestone establishes backend safety, ownership, provenance, immutability, and privacy foundations only. It does not authorize production inference, production scoring, production narrative generation, production Resonance Signature rendering, or exploratory renderer adoption.
