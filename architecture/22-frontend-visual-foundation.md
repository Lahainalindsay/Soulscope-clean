# Frontend Visual Foundation

Status: visual foundation implemented
Branch: `feat/frontend-visual-foundation`

## Visual Principles

- Deep void background with restrained cyan, blue, mint, and violet accents.
- Scientific-instrument framing without clinical or diagnostic presentation.
- Editorial typography using local fallback stacks for EB Garamond, Inter, and JetBrains Mono.
- Luminous emphasis concentrated in the Resonance Signature placeholder.
- Quiet panels, thin boundaries, generous negative space, and compact metadata.

## Source References

- `docs/SOULSCOPE_CANON.md`
- `docs/CONSTELLATION_BIBLE.md`
- `architecture/19-constellation-bible-owner-approval.md`
- `architecture/20-canonical-contract-extraction.md`
- `architecture/21-canonical-contract-owner-review.md`
- `packages/canonical-contracts/`
- `docs/design-reference/Neon-SoulScope-Resonance-Dashboard.png`

## Approved Scope

This pass includes frontend project setup, design tokens, typography, spacing, responsive shell, navigation, visual scan screens, analyzing screen presentation, results layout, history/profile/settings presentation, loading/empty/error/unresolved state surfaces, canonical labels imported from contracts, and visual-only mock data.

## Excluded Scope

No acoustic scoring, feature weights, confidence formulas, state inference, state selection, interaction inference, pattern inference, narrative generation, production Resonance Signature mapping, Supabase integration, database integration, authentication, analytics, or deployment was added.

## Routes

- `/`
- `/scan`
- `/scan/question/1`
- `/scan/question/2`
- `/scan/question/3`
- `/scan/analyzing`
- `/results/demo`
- `/history`
- `/profile`
- `/settings`

## Component Architecture

- `components/app`: application shell and navigation.
- `components/ui`: base buttons, instrument panels, metadata rows, badges, empty states, and disclosures.
- `components/scan`: stepper, prompt panel, recording controls, and signal-presence demonstration.
- `components/resonance`: visual-only `SignaturePlaceholder`.
- `components/results`: prompt arc, reflection layout, evidence disclosure, and feedback demonstration.

## Design Tokens

Tokens live in `frontend/styles/tokens.css` and define color, borders, overlays, shadows, gradients, content widths, spacing, radii, typography scale, transitions, and z-index layers.

## Responsive Behavior

Desktop uses a quiet sticky top navigation and wide content rail. Mobile uses a simplified top bar plus bottom navigation with 44px-or-larger touch targets. The signature frame scales by viewport and avoids cropping at small widths.

## Accessibility Behavior

The shell includes semantic landmarks and a skip link. Controls use native buttons, inputs, selects, and labels. Focus styles are visible. Reduced motion disables non-essential contour drift. The signature placeholder includes accessible descriptive text and visible non-scientific warning copy.

## Placeholder-Data Rules

`frontend/mocks/demoResultPresentation.ts` is explicitly labeled as layout-only mock data. It is not generated from voice evidence and must not be used as a production result.

## Known Limitations

- No real microphone capture.
- No persistence or authentication.
- No production Resonance Signature renderer.
- No scientific calculation or evidence interpretation.
- The results page is a visual review surface only.

## Next Gate

Owner visual review is required before any application integration. Scientific, backend, database, auth, production renderer, and narrative work remain excluded.
