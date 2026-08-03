# Migration Inventory

Source repository: `/home/lahainalindsay9111/soulscope`

Target repository: `/home/lahainalindsay9111/soulscope-clean`

Decision labels:

- COPY: copied now into the clean repository.
- REWRITE: concept is needed, but implementation must be rebuilt cleanly.
- REFERENCE ONLY: useful as research context, but not copied into active production structure.
- DO NOT COPY: excluded from the clean repository.

## Documentation Candidates

| Current path | Purpose | Active dependencies | Tests | Risks | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `SoulScope_Canon_Foundational_Edition_v1.0 (1).pdf` | SoulScope Foundational Canon v1.0 | Product truth, scientific boundaries, vocabulary, visual laws, governance | None | Markdown formatting may need later cleanup | COPY | Source PDF retained as `docs/SoulScope_Canon_Foundational_Edition_v1.0.pdf`; faithful Markdown transcription moved to `docs/SOULSCOPE_CANON.md`. |
| `SoulScope_Constellation_Bible_v0.1.docx` | Correct SoulScope Constellation Bible v0.1 | Operational constellation specifications | Documentation source audit | Source docx transcription may need human formatting review for images/tables | COPY | Source preserved as `docs/source/SoulScope_Constellation_Bible_v0.1.docx`; faithful Markdown transcription created at `docs/CONSTELLATION_BIBLE.md`. |
| `architecture/02-evidence-ledger.md` | Evidence Ledger contract | Canonical pipeline | Existing Phase B/E tests in old repo | Short spec; needs expansion during implementation | COPY | Copied as `architecture/EVIDENCE_LEDGER.md`. |
| `architecture/03-decision-ledger.md` | Decision Ledger contract | Canonical pipeline | Existing Phase B/E tests in old repo | Short spec; needs schema details during implementation | COPY | Copied as `architecture/DECISION_LEDGER.md`. |
| `docs/ResonanceSignatureRenderer.md` | Renderer downstream contract and visual truth constraints | Renderer package in old repo | Renderer tests in old repo | Old repo has multiple renderer files and review work; code not copied | COPY | Copied as `architecture/RESONANCE_SIGNATURE.md`; implementation will be rewritten or selectively reviewed later. |
| `docs/acoustic-measurement-layer.md` | Hosted Parselmouth boundary, feature contract, retention rules | Backend extractor | Backend acoustic tests in old repo | Mentions deployed constraints that require fresh validation | COPY | Copied as `architecture/ACOUSTIC_MEASUREMENT_LAYER.md`. |
| `architecture/05-scientific-audit-pipeline-map.md` | Phase E.5 actual pipeline audit | Audit context | Audit tests in old repo | Describes messy old state, not target state | COPY | Copied as audit reference for what not to recreate. |
| `architecture/06-acoustic-feature-audit.md` | Feature audit | Audit context | Audit tests in old repo | Some recommendations not implemented in clean code yet | COPY | Copied as Phase E.5 evidence. |
| `architecture/07-quality-confidence-audit.md` | Quality/confidence audit | Audit context | Audit tests in old repo | Requires implementation follow-through | COPY | Copied as Phase E.5 evidence. |
| `architecture/08-evidence-ledger-audit.md` | Evidence Ledger audit | Audit context | Audit tests in old repo | Describes old defects too | COPY | Copied as Phase E.5 evidence. |
| `architecture/09-story-narrative-audit.md` | Narrative audit | Audit context | Audit tests in old repo | Describes duplicate old systems | COPY | Copied as Phase E.5 evidence. |
| `architecture/10-performance-payload-audit.md` | Payload/performance audit | Audit context | Audit tests in old repo | Old-app payload details should not be recreated | COPY | Copied as Phase E.5 evidence. |
| `architecture/11-phase-e5-final-audit.md` | Final scientific audit verdict | Audit context | Audit tests in old repo | Includes recommendations, not implementation | COPY | Copied as Phase E.5 evidence. |
| `audit/phase-e5-audit-summary.json` | Machine-readable Phase E.5 audit summary | Audit context | None | Sample-size limitations | COPY | Copied for traceability. |
| `audit/phase-e6-blend-calibration.json` | Boundary/blend calibration measurement | Constellation threshold context | E.6 tests in old repo | Fixture-based, not population-based | COPY | Copied for threshold provenance. |
| `architecture/00-system-overview.md` | Old Phase A architecture overview | Old architecture | Old tests | Mentions frontend/backend split from research repo | REFERENCE ONLY | Rewritten into `architecture/CANONICAL_PIPELINE.md` instead of copied verbatim. |
| `architecture/01-engine-model.md` | Old engine boundary notes | Old architecture | Old tests | Refers to old package locations and compatibility tables | REFERENCE ONLY | Rewritten into clean pipeline plan. |
| `docs/ENGINE_MODEL.md` | Earlier broad engine model | Conceptual architecture | None | Uses old names such as Resonance Fingerprint and planned modalities | REFERENCE ONLY | Useful background, not copied because clean repo is voice-only and Canon-aligned. |
| `docs/design-reference/*` | Visual reference assets | Renderer design context | None | Binary assets and old dashboard reference should not enter initial clean foundation | REFERENCE ONLY | Do not copy until renderer phase review. |
| `docs/archive/*` | Legacy research and reference images | None | None | Archive material prohibited in clean repo | DO NOT COPY | Excluded. |
| `docs/growth-studio-agents.md` | Growth/marketing automation docs | Growth Studio code | Old deleted test | Not product runtime | DO NOT COPY | Excluded. |

## Backend Candidates

| Current path | Purpose | Active dependencies | Tests | Risks | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `backend/corescope/audio/acoustic_extractor.py` | Parselmouth extraction, quality semantics, feature availability | Backend route and tests | Backend acoustic tests | Needs dependency and route review before production copy | REWRITE | Required concept, but no app code is copied in initial deliverable. |
| `backend/corescope/engine/evidence.py` | Evidence records from measurements | Backend extractor | Backend tests | Needs clean contract alignment | REWRITE | Required later after schema contracts are created. |
| `backend/main.py` | Old FastAPI routes | Old frontend/backend integration | Backend route tests | Includes old routes and repo-specific concerns | DO NOT COPY | Clean backend will expose one canonical upload/extraction path. |
| `backend/corescope/core_frequency/*` | Core-frequency/organ resonance prototype | None in clean target | Old/unrelated | Prohibited scientific claims | DO NOT COPY | Legacy system. |
| `backend/corescope/physio/*` | Physiological prototype | None in clean target | Old/unrelated | Outside voice-first scope | DO NOT COPY | Legacy system. |
| `backend/corescope/engine/resonance/field.py.save` | Editor backup | None | None | Backup artifact | DO NOT COPY | Generated/editor artifact. |

## Frontend Candidates

| Current path | Purpose | Active dependencies | Tests | Risks | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `frontend/lib/canonicalResult.ts` | Old canonical aggregate builder | Many old frontend engines | Old frontend tests | Entangled with compatibility report and old app state | REWRITE | Use as reference only when implementing the clean `CanonicalScanResult` contract. |
| `frontend/lib/canonicalDimensionEngine.ts` | 16-point dimension engine | Evidence rules | Old Phase B/E tests | Needs clean named-family registry extraction | REWRITE | Required later, not copied initially. |
| `frontend/lib/canonicalConstellationEngine.ts` | Constellation geometry | Dimension engine | Old Phase B/E tests | Thresholds are useful but old dependencies remain | REWRITE | Use `phase-e6-blend-calibration.json` as provenance. |
| `frontend/lib/compositePattern.ts` | Deterministic composite pattern synthesis | Canonical result | Composite tests | New and useful, but still old frontend-shaped | REWRITE | Required later after clean contracts exist. |
| `frontend/lib/todaysStoryEngine.ts` | Single-story remediation | Canonical result | Story tests | Depends on old canonical result shape | REWRITE | Required later after clean result object exists. |
| `frontend/components/*Dashboard*` | Existing result dashboards | Old report path | UI tests | Duplicate/legacy surfaces | DO NOT COPY | Clean report will be rebuilt after canonical result exists. |
| `frontend/components/resonanceSignature/*` | Renderer UI wrappers | Old renderer package | Renderer tests | Multiple renderer paths and ongoing dirty renderer work | REWRITE | One renderer later, downstream only. |
| `frontend/components/Chakra*`, `frontend/lib/chakras.ts` | Chakra interpretation | Legacy UI | None for clean target | Prohibited system | DO NOT COPY | Excluded. |
| `frontend/components/Cymatic*`, `frontend/lib/cymatics.ts`, note tables | Cymatics/note interpretation | Legacy UI/assets | Old tests deleted | Prohibited legacy content | DO NOT COPY | Excluded. |
| `frontend/lib/growthStudio/*` | Marketing automation | Growth Studio docs/tests | Old deleted test | Not product runtime | DO NOT COPY | Excluded. |
| `frontend/pages/auth/*` | Auth pages | Supabase auth | Old app | Duplicate route/debug concerns | REWRITE | Auth requirements remain, implementation will be fresh. |
| `frontend/pages/scan/*` | Guided scan flow | Old app state | Scan tests | Some requirements proven, but app not clean | REWRITE | Stage 1 will rebuild product shell. |

## Supabase Candidates

| Current path | Purpose | Active dependencies | Tests | Risks | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/migrations/*` | Old cumulative schema history | Old app persistence | Migration contract tests | Contains compatibility/history and unvalidated migration warning | REWRITE | Clean schema will be authored from approved architecture. Do not apply old migrations to production. |

## Packages Candidates

| Current path | Purpose | Active dependencies | Tests | Risks | Decision | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `packages/resonance-renderer/*` | Deterministic renderer package | Old frontend signature | Renderer tests | Ongoing uncommitted Visual Truth work; multiple old renderer concerns | REWRITE | Required later as one renderer only, after canonical result contract stabilizes. |

## Initial Migration Decision

Application code is not copied in this first deliverable. Only reviewed documentation and audit artifacts are copied. Backend, frontend, Supabase, packages, and tests remain empty shells with README files until each stage is implemented and tested in order.
