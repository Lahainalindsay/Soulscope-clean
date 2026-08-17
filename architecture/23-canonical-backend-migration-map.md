# Canonical Backend Migration Map

Status: INTERNAL IMPLEMENTATION MAP
Date: 2026-08-14

| Current file or concept | Current purpose | Current authority status | New canonical destination | Action |
| --- | --- | --- | --- | --- |
| `docs/SOULSCOPE_CANON.md` | Foundational Canon v1.0 transcription | Superseded by SoulScope Canon v1.3 | `docs/archive/superseded-2026-08-14/SOULSCOPE_CANON_v1.0.md` | archive |
| `docs/SoulScope_Canon_Foundational_Edition_v1.0.pdf` | Foundational Canon v1.0 source artifact | Superseded by SoulScope Canon v1.3 | `docs/archive/superseded-2026-08-14/SoulScope_Canon_Foundational_Edition_v1.0.pdf` | archive |
| `docs/CONSTELLATION_BIBLE.md` | Constellation Bible v0.1 transcription | Superseded where new registries govern backend science | `docs/archive/superseded-2026-08-14/CONSTELLATION_BIBLE_v0.1.md` | archive |
| `docs/source/SoulScope_Constellation_Bible_v0.1.docx` | Constellation Bible v0.1 source artifact | Historical provenance | `docs/archive/superseded-2026-08-14/source/SoulScope_Constellation_Bible_v0.1.docx` | archive |
| Uploaded Canon/Registry PDFs | Current source artifacts | Current authority | `docs/canonical/` | keep/add |
| Authority index | README authority bullets | Incomplete and superseded | `docs/CANONICAL_AUTHORITY_LEDGER.md` | create one current ledger and update README |
| `packages/canonical-contracts/src/provenance.ts` | Old source-document references | Points to superseded Canon/Bible | same file | update to current ledger and PDFs |
| Dimension/constellation IDs | Canonical ID constants | Compatible IDs, stale provenance | existing files | update provenance and add classes/abstentions |
| Seed state IDs | Old Bible seed states | Superseded as active state authority | `docs/archive/superseded-2026-08-14/seedStateIds.legacy.ts` and `docs/archive/superseded-2026-08-14/seed-states.v0.1.json` | archive |
| Prompt protocol in Supabase migration | Three-prompt persistence | Old semantic names and 60-second placeholders | existing migration and tests | update to Canon v1.3 prompt IDs, wording, and 30-second duration |
| Evidence records | Append-only evidence storage | Compatible foundation, lacks canonical marker/family vocabulary | existing migration plus contract registries | keep and add registry contract tests |
| Result version metadata | Immutable result version metadata | Compatible but incomplete version manifest | contract package | add immutable result/version manifest types |
| `architecture/RESONANCE_SIGNATURE.md` pre-migration | Semantic/dimension-driven renderer specification | Superseded where it routed Constellation or semantic geometry into renderer inputs | `docs/archive/superseded-2026-08-14/RESONANCE_SIGNATURE_legacy.md` | archive |
| `architecture/RESONANCE_SIGNATURE.md` current | Acoustic/time-resolved renderer boundary | Compatible with Canon v1.3 and authority ledger | `architecture/RESONANCE_SIGNATURE.md` | replace with current boundary |
| Frontend files | Product UI | Frozen | unchanged | no edit |
