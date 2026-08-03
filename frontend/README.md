# SoulScope Frontend Visual Foundation

This frontend is a visual foundation only. It does not perform voice analysis, scientific scoring, state inference, narrative generation, production Resonance Signature rendering, authentication, persistence, or database access.

It uses Next.js `14.2.35`, React `18.3.1`, TypeScript, CSS Modules, semantic HTML, and the local `@soulscope/canonical-contracts` package for approved labels and identifiers.

The original archived frontend used Next.js `14.2.5`; this clean shell pins the latest `14.2.x` patch because the `14.2.5` native compiler crashed during production build validation in this environment.

## Scope

Included:

- responsive application shell
- navigation
- design tokens
- scan-screen presentation
- analyzing-screen presentation
- results demo layout
- history, profile, and settings presentation
- visual-only Resonance Signature placeholder
- clearly labeled mock data
- accessibility and reduced-motion foundations

Excluded:

- audio capture
- acoustic analysis
- scoring
- state selection
- narrative generation
- Supabase
- database persistence
- authentication
- production renderer behavior
