# Backend completion and remaining validation

The engineering pipeline can now finish a scan without inventing calibrated
interpretations. `finalized` means processing is complete; it does not mean
scientific findings were published.

| Stage | Implemented | Remaining work |
| --- | --- | --- |
| Acquisition and quality | Three private WAV captures, descriptive measurements, quality eligibility, immutable measurement records | Hosted microphone/device validation |
| Evidence | Canonical structural v2 ledger, distinct supported/contradicted/unavailable/rejected/insufficient statuses | Scientific validation of feature and evidence definitions |
| Dimensions | Sixteen versioned posterior objects, evidence lineage, calibration blockers, hard D3 abstentions | Reference datasets, models, directionality, normalization, thresholds, confidence/posterior calibration and held-out validation |
| Constellations and states | Four explicit unresolved geometry/state outcomes; all eight registered anchors retained as candidates | Validated dimension posteriors and state geometry/selection models |
| Interactions and patterns | No unearned interactions; seven rejected pattern candidates with required inputs and reasons | Validated relations, source independence, temporal models and publication thresholds |
| Semantic completion | Immutable source-linked result, version manifest, decision ledger, atomic audited finalization and retries | Scientific activation must be a new version; historic results stay immutable |
| Narrative | Five canonical sections with explicit availability and decision references; no invented personal sentences | Translate publishable findings into cited sentences, validate language and contradictions |
| Resonance rendering | Explicit unavailable status; semantic inputs prohibited | Implement the canonical temporal acoustic renderer separately; validate against its guide |

## Test and deployment order

1. Run contracts, Python tests, lint/type checks, and the PostgreSQL migration
   harness. CI runs the native PostgreSQL harness. Local verification also ran
   the same SQL runtime assertions on embedded PostgreSQL 18.3.
2. Apply the new migration to an isolated Supabase staging project, after the
   existing migrations. No live project was migrated during this implementation.
3. Configure the private audio bucket, server service key, and a nonempty worker
   token. Keep both service key and worker token off the client. Deploy the worker
   separately from the Next.js frontend.
4. Run the opt-in hosted suite with two staging users. It exercises private
   storage, real fixtures, concurrent evidence/dimension/finalization retries,
   owner isolation and denied client finalization. Test failure recovery using
   `/internal/complete-measurement` with the saved measurement ID.
5. Test microphone capture through the frontend. New upload processing now
   completes every supported stage. Frontend resume flows must call
   `/internal/process-result` after obtaining a dimension result ID. Read
   `semantic_result_records` by `dimension_result_id`; schema `0.2` distinguishes
   canonical completions from historical schema `0.1` measurement placeholders.
6. Establish the scientific validation prerequisites above before activating any
   numeric inference, personal narrative, longitudinal semantic field, or
   production acoustic renderer.

There are no staging credentials in this workspace, so hosted integration and
production deployment are not verified. These scientific and hosted checks are
outstanding work, not silently successful stages.
