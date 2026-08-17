# Resonance Signature Renderer

## Architecture

The renderer is downstream of qualified acoustic measurements over time only:

Qualified Acoustic Measurements(t) -> Resonance Rendering Contract -> deterministic field parameters -> standing-wave field -> interference field -> convergence field -> contour and node extraction -> luminous SVG signature -> reproducibility manifest.

The SoulScope Resonance Engine is inspired by the mathematics of standing waves, interference patterns, and cymatics. It transforms measured vocal features into the parameters of a deterministic resonance simulation. The resulting Resonance Signature is not a recording of sound; it is a reproducible visual representation of the measured relationships within a person’s voice at that moment in time.

## Visual Truth Principle

The Resonance Signature is not intended to be a literal photograph of acoustic physics. It is a deterministic scientific visualization. Like an MRI color map, weather radar, or a topographic map, it uses carefully designed composition, hierarchy, color, and luminance to make measured relationships perceptible. Every visual decision must remain traceable to measured evidence, while presentation rules may clarify and emphasize that evidence without changing its meaning.

SoulScope does not claim that the Resonance Signature is a literal physical cymatic image produced directly by the user’s voice. It is a deterministic, physics-inspired visualization generated from qualified acoustic measurements over time. Constellation scores, State scores, Pattern scores, and semantic interpretations must not drive Resonance Signature geometry.

SoulScope permits deterministic visual composition rules that clarify measured structure, provided those rules do not alter, conceal, or invent the underlying evidence.

It does not inspect raw audio, recalculate evidence, alter dimensions, select patterns, write schemas, or reinterpret meaning. Any future backend renderer adapter must use qualified acoustic measurement provenance rather than semantic Constellation geometry.

Local references used during implementation:

- `docs/design-reference/SoulScope_Resonant_Signature_Rendering_Specification_v1.docx`
- `docs/design-reference/Neon SoulScope Resonance Dashboard.png`

The PNG is a visual-language reference only. It is not embedded in production rendering and does not drive geometry.

## Contract

The active frontend is frozen. Any future backend renderer contract must preserve the visual path from qualified acoustic measurements over time and avoid semantic Constellation-driven geometry.

## Coordinate System

SVG uses `viewBox="0 0 1200 1200"`, center `600,600`, maximum field radius `500`, and safe visual radius `455`.

Production contours must remain traceable to qualified acoustic measurement provenance. Debug views may inspect renderer internals, but they must not convert semantic Constellations into visual geometry.

## Visual Mappings

Visual mappings must be defined from qualified acoustic measurements, signal quality, and renderer provenance. Missing or unqualified acoustic measurements remain missing and may not be replaced with semantic midpoint values.

## Standing-Wave Basis

Renderer v3.0.0 composes a signed standing-wave field before deriving contour energy. Each of the 16 dimensions maps through `STANDING_WAVE_MODES`, a stable renderer-version registry defining angular order range, radial mode range, phase bias, radial and angular weighting, envelope type, and texture role.

The base mode is:

`Psi_m,n(r, theta) = J_m(k_m,n r) cos(m theta + phi)`

`J_m` is approximated in TypeScript using a finite Bessel series for smaller arguments and a bounded large-argument asymptotic approximation for browser stability. `k_m,n` comes from a deterministic lookup table of approximate roots for `J_m`, orders 0-12 and radial modes 1-8. The renderer does not treat `n * pi` as an exact Bessel root.

For each resolved dimension:

- `amplitude = mean^0.85 * (0.35 + 0.65 * confidence)`
- radial mode is interpolated from the dimension mean across the registry range
- angular order is rounded from the registry range and a stable dimension value
- uncertainty envelope is `0.05 + 0.20 * intervalWidth`
- luminance support is `0.16 + 0.84 * (signalReliability * confidence)^0.36`

Contradiction creates a localized counter-phase term. Unresolved dimensions do not receive midpoint semantic modes; they can only produce faint interrupted uncertainty traces.

## Unified Field

Renderer v3.0.0 then composes:

`F_total = F_core + F_COG + F_REG + F_CAP + F_EXP + F_pairwise + F_multiway + F_texture`

The signed field preserves constructive and destructive phase behavior. The production contour field is the robustly normalized energy of that single combined field. The renderer does not normalize each constellation independently for final output.

The v3 field adds:

- Circular-membrane-inspired standing-wave modes for all resolved dimensions.
- Broad constellation presence fields that reach the center and neighboring regions.
- A low-amplitude global support term weighted by coherence and coverage.
- Pairwise interference bridges for supported interactions.
- Multiway convergence from two-, three-, and four-source overlap.
- Deterministic robust normalization with p01, p50, p90, and p99 recorded in output JSON.
- Signed and energy field checksums recorded in the output manifest.

Acoustic inputs affect low-level simulation character only. They are normalized by `acoustic-visual-map-v3.0.0` before entering the simulation. Raw hertz, milliseconds, and percentages are not placed directly into drawing equations.

## Visual Truth Composition

Renderer v3.1.0 preserves the v3 standing-wave field and adds a deterministic post-contour composition layer:

`field -> contours -> semantic contour analysis -> flow reinforcement -> Visual Truth composition -> layered SVG`

The layer does not change the scalar field, evidence values, normalized input, or scan interpretation. It calculates how already-extracted contours should be presented so measured structure is readable.

Every contour records semantic metrics:

- normalized length and area
- continuity and curvature consistency
- center proximity
- per-constellation support
- multi-field support
- confidence, coverage, coherence, contradiction, and uncertainty
- nearby node/intersection count
- connected component size

Visual importance is calculated from length, continuity, evidence coverage, multi-field support, coherence, confidence, node support, and center or interaction relevance. Uncertainty and contradiction apply penalties separately; contradiction remains visible as localized disruption rather than being erased.

Hierarchy classes are versioned in `VISUAL_TRUTH_THRESHOLDS`:

- convergence spine
- primary ridge
- secondary ridge
- tertiary texture
- uncertainty ghost
- contradiction contour
- missingness boundary

The composition layer also records a small deterministic presentation translation, capped at 2.5% of the canvas, so the weighted visual center sits within the frame without rotating, scaling, or changing internal relationships.

## Palette

The renderer uses the SoulScope v3 instrument palette:

- background: `#01040A`
- COG: `#168CFF`
- REG: `#10DFDA`
- CAP: `#B8F5ED`
- EXP: `#9856FF`
- convergence: `#F7FFFF`

Color identifies constellation family only. It never means good, bad, healthy, or unhealthy.

Contours supported by multiple constellations blend palette colors by normalized support. Multiway convergence shifts toward near-white only when several constellation families provide meaningful support.

## Seed

`seed.ts` builds seed material from contract version, renderer version, the normalized 16-dimension vector, confidence, evidence coverage, contradiction, momentum, unresolved flags, and approved acoustic visual inputs. Scan ID only breaks ties when all dimensions are missing.

No `Math.random()`, current time, or device entropy is used.

## Contours

`scalarField.ts` samples a fixed grid. `marchingSquares.ts` extracts deterministic contour segments at hybrid renderer-version levels. `contours.ts` sorts paths stably and rounds coordinates to three decimals.

Renderer v3.0.0 computes hybrid contour levels from the unified normalized energy field.

Structural percentiles:

- `0.52`
- `0.60`
- `0.68`
- `0.75`
- `0.81`
- `0.86`
- `0.90`
- `0.94`
- `0.97`

Absolute normalized levels:

- `0.18`
- `0.26`
- `0.34`
- `0.42`
- `0.50`
- `0.60`
- `0.72`

Near-equal levels are deduplicated at fixed precision. A broader fallback schedule is used only when the level set would publish fewer than six active levels or a useful contour population.

Visible contours are deterministically selected into an instrument-grade range of 1500-3500 paths per scan. The target is 1800 visible contour paths. This prevents sparse debug plots and also prevents raw marching-squares noise.

Contours are ranked by confidence, evidence coverage, continuity, multi-field support, coherence, baseline persistence, level, and path length.

Renderer v3.0.0 renders scientific hierarchy classes:

- Convergence spine: emergent multi-source overlap, 2.0-4.0 px core strokes, restrained bloom.
- Primary constellation contour: high-support source or bridge structure, 1.0-1.8 px core strokes.
- Secondary contour: medium contour systems, 0.55-1.0 px core strokes.
- Microstructure: fine resonance texture, 0.3-0.65 px core strokes.
- Uncertainty trace: interrupted unresolved structure.
- Contradiction contour: localized counter-phase behavior.

Renderer v3.1.0 applies the Visual Truth luminance curve:

`trust = clamp(reliability * confidence * (0.45 + 0.55 * coverage), 0, 1)`

`visibleTrust = 0.14 + 0.86 * trust^0.34`

`luminance = visibleTrust * (0.28 + 0.72 * importance)`

Unresolved traces remain dim, contradiction contours remain controlled, and convergence structures may approach white only when multi-field support warrants it.

## Visual Health Metrics

The manifest includes deterministic visual health metrics:

- occupied area ratio
- center occupancy ratio
- largest connected component ratio
- connected component count
- macro, primary, secondary, and micro path counts
- node and convergence-node counts
- average luminance and p90 luminance
- color energy by constellation
- rotational dominance and quadrant balance
- visual center offset

Automated metrics are required but not sufficient. Product review must compare the approved reference, current renderer output, and Visual Truth output before a release is accepted.

This hierarchy is intended to reveal cymatic standing waves, fingerprint ridges, topographic contours, magnetic-field topology, and fluid-flow interference without turning the image into decorative artwork.

The target occupied area is 40-60% of the canvas for final review. Empty space is part of the scientific reading and should not be filled decoratively.

- Tier A convergence spine (brightest, thickest)
- Tier B primary constellation contours
- Tier C secondary contours
- Tier D uncertainty/background traces

## SVG Layers

Serialized SVG uses stable groups:

- `radial-guides`
- `outer-bloom`
- `contour-support`
- `contours`
- `convergence-nodes`
- `confidence-overlay`
- `missingness-overlay`

Each contour is rendered in three passes (bloom/support/core) to preserve crisp geometry with restrained glow.

Bloom is additive and low opacity. Luminance represents confidence, repeated support, and evidence density; saturation does not encode certainty.

## Manifest

`manifest.ts` records contract version, renderer version, canonical result version, seed, normalized parameters, contour thresholds, missing dimensions, warnings, SVG checksum, and visual mapping entries such as dimension radial extent and contour count.

## Longitudinal Plan

Ten-scan Resonance Field support should cluster equivalent contour structures rather than overlay full SVGs. Older scans become dimmer and thinner; repeated geometry becomes a stable bright spine; recent emerging patterns become bright but not thick; missing evidence remains missing.

## Accessibility

The component renders a single labeled SVG. Explanatory labels and dashboard copy remain outside the core renderer. Reveal animation respects reduced-motion CSS.

## Versioning

Renderer v3.0.0 replaces the contour-only field construction with a deterministic standing-wave and interference simulation. It preserves immutable input mappings and determinism while materially changing geometry, so prior visual checksums are expected to change.

Renderer v3.1.0 adds Visual Truth composition semantics: contour semantic metrics, flow reinforcement, luminance calibration, color mixing, node hierarchy, visual health metrics, and deterministic presentation translation. Historical exports must record the renderer version used to produce them.

Renderer changes must update `RENDERER_VERSION` in `registry.ts` when visual geometry or mappings change. Tests assert seed, scalar checksum, directional family separation, convergence behavior, missingness, contradiction, and sensitivity.
