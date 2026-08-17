# Resonance Signature Backend Contract

Status: CURRENT COMPATIBLE BACKEND/RENDERER BOUNDARY
Authority: Subordinate to `docs/CANONICAL_AUTHORITY_LEDGER.md`

The Resonance Signature path is separate from the semantic Constellation path.

```text
Qualified Acoustic Measurements(t)
  -> Resonance Rendering Contract
  -> Deterministic Resonance Signature
```

The renderer may use qualified acoustic measurements over time, signal-quality metadata, reference provenance, extractor provenance, and renderer version metadata.

The renderer must not use:

- Constellation scores;
- State scores;
- Pattern scores;
- semantic interpretations;
- narrative claims;
- unresolved semantic values filled with midpoint defaults.

The Resonance Signature is not a literal cymatic photograph and does not measure identity, diagnosis, emotional truth, deception, spirituality, organ state, or hidden meaning.

## Backend Contract

Each rendering record must preserve:

- source measurement IDs;
- prompt IDs;
- time windows;
- quality eligibility;
- reference compatibility;
- extractor version;
- acoustic parameter registry version;
- renderer version;
- renderer configuration hash;
- deterministic seed inputs;
- missing/unqualified measurement flags.

Historical rendered outputs must remain interpretable under the renderer and registry versions that produced them.

## Relationship To Semantic Result

The semantic result and Resonance Signature may share measurement provenance, but neither may overwrite the other.

Semantic path:

```text
Measurement -> Evidence -> Dimension -> Constellation -> Interaction -> Pattern -> Narrative
```

Visual path:

```text
Qualified Acoustic Measurements(t) -> Resonance Signature
```

No backend adapter may route semantic geometry into Resonance Signature geometry.
