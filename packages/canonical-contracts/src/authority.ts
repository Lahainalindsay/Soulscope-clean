import { SOURCE_DOCUMENTS, provenance, sourceReference } from "./provenance";

export const CURRENT_AUTHORITY_LEDGER_PATH = SOURCE_DOCUMENTS.authorityLedger;

export const CURRENT_CANON_SET = Object.freeze({
  title: "SoulScope Canon Set v2.0",
  version: "2.0",
  sourceFilename: "SoulScope_Canon_Set_v2.0_CURRENT_2026-08-13.pdf",
});

// Preserve extraction-era source identity; this is provenance, not current authority.
export const LEGACY_IMPLEMENTATION_CANON_PATH = SOURCE_DOCUMENTS.canon;

export const CURRENT_CANONICAL_SOURCE_PATHS = Object.freeze([
  CURRENT_CANON_SET.sourceFilename,
  SOURCE_DOCUMENTS.acousticParameterRegistry,
  SOURCE_DOCUMENTS.evidenceMarkerRegistry,
  SOURCE_DOCUMENTS.dimensionRegistry,
  SOURCE_DOCUMENTS.inferenceRuleRegistry,
  SOURCE_DOCUMENTS.stateRegistry,
  SOURCE_DOCUMENTS.interactionRegistry,
  SOURCE_DOCUMENTS.narrativeRegistry,
] as const);

export const CURRENT_AUTHORITY_CHAIN = Object.freeze({
  authorityLedger: CURRENT_AUTHORITY_LEDGER_PATH,
  governingCanon: CURRENT_CANON_SET.sourceFilename,
  governingCanonVersion: CURRENT_CANON_SET.version,
  scientificBackendRegistries: CURRENT_CANONICAL_SOURCE_PATHS.slice(1),
  provenance: provenance(sourceReference("authorityLedger", "Authority Order", "CANON")),
});
