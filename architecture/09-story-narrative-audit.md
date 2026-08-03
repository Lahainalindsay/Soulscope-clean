# Phase E.5 Story And Narrative Audit

Audit date: 2026-08-02

## Sentence Sources

| Source | File | User-facing? | Notes |
|---|---|---:|---|
| Today's Story | `frontend/lib/todaysStoryEngine.ts` | yes | Primary visible storyline in dashboard and reflection overview |
| Human reflection overview | `frontend/components/HumanReflectionOverview.tsx` | yes | Reuses Today's Story and Phase C insight synthesis |
| Results dashboard hero | `frontend/components/ResonanceResultsDashboard.tsx` | yes | Renders Today's Story title, essence, reflection |
| Story candidates | `frontend/lib/buildSoulScopeReport.ts` and compatibility personalization | yes, in details | Direct/Supportive/Insight variants can compete with Today's Story |
| Canonical narrative | `frontend/lib/canonicalResult.ts` and `canonicalNarrativeEngine.ts` | mostly payload/diagnostic | Can contain internal state language; not primary visible story |
| Resonance narrative V3 | `frontend/lib/resonanceNarrativeEngineV3.ts` | compatibility | Feeds compatibility report and diagnostics |
| Insight synthesis | `frontend/lib/insightSynthesisEngine.ts` | yes | Visible discoveries; filters acoustic terms |
| Phase C insight engine | `frontend/lib/phaseCInsightEngine.ts` | yes/diagnostic | Provides headline candidates and relationships |
| Relationship intelligence | `frontend/lib/relationshipIntelligence.ts` | mostly synthesized | Technical relationships should stay audit-side |
| Longitudinal intelligence | `frontend/lib/longitudinalIntelligence.ts` | partial | Baseline/history copy can surface |
| Fallback/UI copy | `frontend/pages/results/[id].tsx`, `frontend/pages/scan/analyzing.tsx`, components | yes | Retry and status language |
| Compatibility report | `frontend/lib/resonancePatterns.ts`, `patternPersonalization.ts`, `patternAtlas.ts` | yes/diagnostic | Still contributes details and variants |

## Proven Narrative Findings

1. The primary visible story is coherent and filtered.
   - Source: `frontend/lib/todaysStoryEngine.ts`.
   - Input: canonical result plus Phase C intelligence.
   - Output: title, essence, reflection, "How This May Show Up", "Worth Noticing", "Gentle Next Step".
   - Evidence: existing and new tests assert blocked technical terms are absent from Today's Story.
   - Safe correction: keep as the single visible story source.

2. Multiple visible surfaces repeat or compete.
   - Source: `frontend/components/ResonanceResultsDashboard.tsx` and `frontend/components/HumanReflectionOverview.tsx`.
   - Input: same `story.reflection`.
   - Output: reflection appears in hero and overview.
   - Downstream effect: report can feel repetitive.
   - Recommended correction: dashboard hero should introduce; overview should expand without repeating.
   - Safe now: needs UI approval.

3. Compatibility story candidates remain visible.
   - Source: `frontend/components/ResonanceResultsDashboard.tsx`.
   - Input: `report.storyCandidates`.
   - Output: selectable/reflection variant details.
   - Problem: user can see multiple story systems.
   - Recommended correction: keep variants only as preference mechanism or audit detail, not competing report sections.

4. Retry language is route-level and broad.
   - Source: `frontend/pages/results/[id].tsx`.
   - Input: `completeness.invalidRecordings > 0`.
   - Output: clearer scan/repeat copy.
   - Problem: retry language should appear only when capture quality is unusable.
   - Recommended correction: gate on capture-quality unusable status and invalid captures, not feature-level missingness.

## User-Facing Story Requirements

Current status:

- What feels most present: covered by Today's Story title/essence/reflection.
- Everyday life examples: covered by `howThisMayShowUp`, but examples should be periodically reviewed for concreteness.
- What may be happening underneath: covered in reflection/worth noticing, but should not expose confidence machinery.
- Worth noticing: explicit field exists.
- Gentle next step: explicit field exists and is usually reflective rather than another scan request.

Blocked language rules:

- User-facing report must not explain candidate selection, geometry, boundary logic, scan-history mechanics, confidence machinery, relationship IDs, state IDs, or evidence IDs.
- New characterization tests cover the active Today's Story output and current duplicate surfaces.

## Longitudinal And Baseline Audit

Sources:

- `frontend/lib/data/v2/persistSoulScopeV2Result.ts`
- `frontend/lib/data/v2/acousticBaselineRepository.ts`
- `frontend/lib/data/v2/baselineRepository.ts`
- `frontend/lib/longitudinalIntelligence.ts`
- `frontend/lib/buildSoulScopeReport.ts`

Findings:

- Baseline creation and refresh happen after completed scans.
- Acoustic baseline keys include units/capture kinds/prompts in V2 tests.
- Missing baseline does not always block resolved dimensions because canonical dimensions currently use absolute feature values.
- User-facing baseline copy is partially tested to avoid repeated "compared to your baseline" language.
- Baselines should primarily tune measurement and personalization internally; visible comparisons should be surfaced only when they add meaning.

Recommendation: add a baseline trust component to confidence and a visible baseline-copy gate requiring enough compatible observations and meaningful delta.

## Relationship And Insight Audit

Sources:

- `frontend/lib/relationshipIntelligence.ts`
- `frontend/lib/phaseCInsightEngine.ts`
- `frontend/lib/insightSynthesisEngine.ts`

Findings:

- Existing tests require enough history before relationship discoveries.
- Technical acoustic correlations are synthesized into human wording by `insightSynthesisEngine.ts`.
- Visible discoveries are limited, but dashboard can show both Today's Story and Phase C cards.
- Causal language is mostly blocked by current copy style, but repeated ideas can still appear across sections.

Recommendation: one human insight should be emitted once, then referenced by trace in audit/debug only.

