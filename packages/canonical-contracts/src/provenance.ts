export const SOURCE_DOCUMENTS = Object.freeze({
  canon: "docs/SOULSCOPE_CANON.md",
  constellationBible: "docs/CONSTELLATION_BIBLE.md",
  sourceDocx: "docs/source/SoulScope_Constellation_Bible_v0.1.docx",
  fidelityAudit: "architecture/17-constellation-bible-fidelity-audit.md",
  readinessReview: "architecture/18-constellation-bible-implementation-readiness.md",
  ownerApproval: "owner decision: limited contract extraction",
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

export const CONTRACT_EXTRACTION_DATE = "2026-08-03" as const;

export function sourceReference(
  sourceDocument: SourceDocumentId,
  sourceSection: string,
  extractionStatus: SourceReference["extractionStatus"],
  sourceTable?: string,
): SourceReference {
  return Object.freeze({
    sourceDocument,
    sourcePath: SOURCE_DOCUMENTS[sourceDocument],
    sourceVersion: sourceDocument === "constellationBible" || sourceDocument === "sourceDocx" ? "0.1" : "1.0",
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
