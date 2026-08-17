import { SOURCE_DOCUMENTS, provenance, sourceReference } from "./provenance";

export const CURRENT_AUTHORITY_LEDGER_PATH = SOURCE_DOCUMENTS.authorityLedger;

export const CURRENT_CANONICAL_SOURCE_PATHS = Object.freeze([
  SOURCE_DOCUMENTS.canon,
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
  governingCanon: SOURCE_DOCUMENTS.canon,
  scientificBackendRegistries: CURRENT_CANONICAL_SOURCE_PATHS.slice(1),
  provenance: provenance(sourceReference("authorityLedger", "Authority Order", "CANON")),
});
