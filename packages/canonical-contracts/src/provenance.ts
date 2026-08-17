export const SOURCE_DOCUMENTS = Object.freeze({
  authorityLedger: "docs/CANONICAL_AUTHORITY_LEDGER.md",
  canon: "docs/canonical/The SoulScope Canon v1.3.pdf",
  acousticParameterRegistry: "docs/canonical/SoulScope Acoustic Parameter Registry v0.1.pdf",
  evidenceMarkerRegistry: "docs/canonical/SoulScope Evidence Marker Registry.pdf",
  dimensionRegistry: "docs/canonical/SoulScope Constellation Dimension Registry v0.1.pdf",
  inferenceRuleRegistry: "docs/canonical/SoulScope Inference Rule Registry v0.1.pdf",
  stateRegistry: "docs/canonical/SoulScope Constellation State Registry v0.1.pdf",
  interactionRegistry: "docs/canonical/SoulScope Cross-Constellation Interaction Registry v0.1.pdf",
  patternRegistry: "docs/canonical/SoulScope Whole-Scan Pattern Registry v0.1.pdf",
  narrativeRegistry: "docs/canonical/SoulScope Narrative Registry.pdf",
  ownerApproval: "owner decision: canonical backend integration",
} as const);

export type SourceDocumentId = keyof typeof SOURCE_DOCUMENTS;

export type SourceReference = Readonly<{
  sourceDocument: SourceDocumentId;
  sourcePath: string;
  sourceVersion: string;
  sourceSection: string;
  sourceTable?: string;
  extractionStatus: "BIBLE" | "CANON" | "DERIVED" | "OWNER_APPROVED";
}>;

export type Provenance = Readonly<{
  source: SourceReference;
  extractedBy: "canonical-contracts-v0";
  extractionDate: string;
}>;

export const CONTRACT_EXTRACTION_DATE = "2026-08-14" as const;

export const SOURCE_DOCUMENT_VERSIONS: Readonly<Record<SourceDocumentId, string>> = Object.freeze({
  authorityLedger: "2026-08-14",
  canon: "1.3",
  acousticParameterRegistry: "0.1",
  evidenceMarkerRegistry: "0.1",
  dimensionRegistry: "0.1",
  inferenceRuleRegistry: "0.1",
  stateRegistry: "0.1",
  interactionRegistry: "0.1",
  patternRegistry: "0.1",
  narrativeRegistry: "0.1",
  ownerApproval: "2026-08-14",
});

export function sourceReference(
  sourceDocument: SourceDocumentId,
  sourceSection: string,
  extractionStatus: SourceReference["extractionStatus"],
  sourceTable?: string,
): SourceReference {
  return Object.freeze({
    sourceDocument,
    sourcePath: SOURCE_DOCUMENTS[sourceDocument],
    sourceVersion: SOURCE_DOCUMENT_VERSIONS[sourceDocument],
    sourceSection,
    ...(sourceTable ? { sourceTable } : {}),
    extractionStatus,
  });
}

export function provenance(source: SourceReference): Provenance {
  return Object.freeze({
    source,
    extractedBy: "canonical-contracts-v0",
    extractionDate: CONTRACT_EXTRACTION_DATE,
  });
}
